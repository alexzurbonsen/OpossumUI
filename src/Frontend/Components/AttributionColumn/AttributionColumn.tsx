// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent, ReactElement } from 'react';

import { DisplayPackageInfo } from '../../../shared/shared-types';
import { setTemporaryDisplayPackageInfo } from '../../state/actions/resource-actions/all-views-simple-actions';
import {
  getAttributionIdMarkedForReplacement,
  getIsSavingDisabled,
  getDisplayPackageInfoOfSelected,
  getTemporaryDisplayPackageInfo,
  wereTemporaryDisplayPackageInfoModified,
} from '../../state/selectors/all-views-resource-selectors';
import { getSelectedView } from '../../state/selectors/view-selector';
import {
  getDisplayedPackage,
  getResolvedExternalAttributions,
} from '../../state/selectors/audit-view-resource-selectors';
import { IpcRendererEvent } from 'electron';
import { useIpcRenderer } from '../../util/use-ipc-renderer';
import { AllowedFrontendChannels } from '../../../shared/ipc-channels';
import {
  getDiscreteConfidenceChangeHandler,
  getDisplayTexts,
  getExcludeFromNoticeChangeHandler,
  getFirstPartyChangeHandler,
  getFollowUpChangeHandler,
  getNeedsReviewChangeHandler,
  getMergeButtonsDisplayState,
  getResolvedToggleHandler,
  selectedPackagesAreResolved,
  usePurl,
  useRows,
} from './attribution-column-helpers';
import { PackageSubPanel } from './PackageSubPanel';
import { CopyrightSubPanel } from './CopyrightSubPanel';
import { LicenseSubPanel } from './LicenseSubPanel';
import { AuditingSubPanel } from './AuditingSubPanel';
import { ButtonRow } from './ButtonRow';
import { setAttributionIdMarkedForReplacement } from '../../state/actions/resource-actions/attribution-view-simple-actions';
import { getSelectedAttributionId } from '../../state/selectors/attribution-view-resource-selectors';
import { openPopup } from '../../state/actions/view-actions/view-actions';
import { ButtonText, PopupType, View } from '../../enums/enums';
import { MainButtonConfig } from '../ButtonGroup/ButtonGroup';
import { ContextMenuItem } from '../ContextMenu/ContextMenu';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import MuiBox from '@mui/material/Box';
import { EMPTY_DISPLAY_PACKAGE_INFO } from '../../shared-constants';
import { isEqual } from 'lodash';

const classes = {
  root: {
    flex: 1,
    height: '100%',
  },
};

interface AttributionColumnProps {
  isEditable: boolean;
  areButtonsHidden?: boolean;
  showSaveGloballyButton?: boolean;
  hideDeleteButtons?: boolean;
  showParentAttributions?: boolean;
  showManualAttributionData: boolean;
  resetViewIfThisIdChanges?: string;
  setUpdateTemporaryDisplayPackageInfoFor(
    propertyToUpdate: string
  ): (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSaveButtonClick?(): void;
  onSaveGloballyButtonClick?(): void;
  onDeleteButtonClick?(): void;
  onDeleteGloballyButtonClick?(): void;
  saveFileRequestListener(): void;
  setTemporaryDisplayPackageInfo(displayPackageInfo: DisplayPackageInfo): void;
  smallerLicenseTextOrCommentField?: boolean;
  addMarginForNeedsReviewCheckbox?: boolean;
}

export function AttributionColumn(props: AttributionColumnProps): ReactElement {
  const dispatch = useAppDispatch();
  const initialDisplayPackageInfo =
    useAppSelector(getDisplayPackageInfoOfSelected, isEqual) ||
    EMPTY_DISPLAY_PACKAGE_INFO;
  const selectedPackage = useAppSelector(getDisplayedPackage);
  const resolvedExternalAttributions = useAppSelector(
    getResolvedExternalAttributions
  );
  const temporaryDisplayPackageInfo = useAppSelector(
    getTemporaryDisplayPackageInfo
  );
  const packageInfoWereModified = useAppSelector(
    wereTemporaryDisplayPackageInfoModified
  );
  const isSavingDisabled = useAppSelector(getIsSavingDisabled);
  const selectedAttributionIdInAttributionView = useAppSelector(
    getSelectedAttributionId
  );
  const attributionIdMarkedForReplacement = useAppSelector(
    getAttributionIdMarkedForReplacement
  );
  const view = useAppSelector(getSelectedView);

  const selectedAttributionIdInAuditView = selectedPackage
    ? selectedPackage.attributionId
    : '';
  const {
    isLicenseTextShown,
    setIsLicenseTextShown,
    licenseTextRows,
    copyrightRows,
    commentBoxHeight,
  } = useRows(
    view,
    props.resetViewIfThisIdChanges,
    props.smallerLicenseTextOrCommentField
  );
  const { temporaryPurl, isDisplayedPurlValid, handlePurlChange, updatePurl } =
    usePurl(
      dispatch,
      packageInfoWereModified,
      temporaryDisplayPackageInfo,
      selectedPackage,
      selectedAttributionIdInAttributionView
    );
  const nameAndVersionAreEditable = props.isEditable && temporaryPurl === '';
  const selectedAttributionIdInCurrentView =
    view === View.Attribution
      ? selectedAttributionIdInAttributionView
      : selectedAttributionIdInAuditView;

  const mergeButtonDisplayState = getMergeButtonsDisplayState({
    attributionIdMarkedForReplacement,
    targetAttributionId: selectedAttributionIdInCurrentView,
    selectedAttributionId: selectedAttributionIdInCurrentView,
    packageInfoWereModified,
    targetAttributionIsPreSelected: Boolean(
      temporaryDisplayPackageInfo.preSelected
    ),
    targetAttributionIsExternalAttribution: false,
  });

  const mainButtonConfigs: Array<MainButtonConfig> = [];

  if (props.onSaveButtonClick) {
    mainButtonConfigs.push({
      buttonText: temporaryDisplayPackageInfo.preSelected
        ? ButtonText.Confirm
        : ButtonText.Save,
      disabled: isSavingDisabled,
      onClick: () => {
        updatePurl(temporaryDisplayPackageInfo);
        props.onSaveButtonClick && props.onSaveButtonClick();
      },
      hidden: false,
    });
  }

  if (props.onSaveGloballyButtonClick) {
    mainButtonConfigs.push({
      buttonText: temporaryDisplayPackageInfo.preSelected
        ? ButtonText.ConfirmGlobally
        : ButtonText.SaveGlobally,
      disabled: isSavingDisabled,
      onClick: () => {
        updatePurl(temporaryDisplayPackageInfo);
        props.onSaveGloballyButtonClick && props.onSaveGloballyButtonClick();
      },
      hidden: !Boolean(props.showSaveGloballyButton),
    });
  }

  const hamburgerMenuButtonConfigs: Array<ContextMenuItem> = [
    {
      buttonText: ButtonText.Undo,
      disabled: !packageInfoWereModified,
      onClick: (): void => {
        updatePurl(initialDisplayPackageInfo);
        dispatch(setTemporaryDisplayPackageInfo(initialDisplayPackageInfo));
      },
    },
    {
      buttonText: ButtonText.MarkForReplacement,
      onClick: (): void => {
        dispatch(
          setAttributionIdMarkedForReplacement(
            selectedAttributionIdInCurrentView
          )
        );
      },
      hidden: mergeButtonDisplayState.hideMarkForReplacementButton,
    },
    {
      buttonText: ButtonText.UnmarkForReplacement,
      onClick: (): void => {
        dispatch(setAttributionIdMarkedForReplacement(''));
      },
      hidden: mergeButtonDisplayState.hideUnmarkForReplacementButton,
    },
    {
      buttonText: ButtonText.ReplaceMarked,
      disabled: mergeButtonDisplayState.deactivateReplaceMarkedByButton,
      onClick: (): void => {
        dispatch(
          openPopup(
            PopupType.ReplaceAttributionPopup,
            selectedAttributionIdInCurrentView
          )
        );
      },
      hidden: mergeButtonDisplayState.hideReplaceMarkedByButton,
    },
  ];

  if (props.onDeleteButtonClick) {
    hamburgerMenuButtonConfigs.push({
      buttonText: ButtonText.Delete,
      onClick: props.onDeleteButtonClick,
      hidden: Boolean(props.hideDeleteButtons),
    });
  }

  if (props.onDeleteGloballyButtonClick) {
    hamburgerMenuButtonConfigs.push({
      buttonText: ButtonText.DeleteGlobally,
      onClick: props.onDeleteGloballyButtonClick,
      hidden:
        Boolean(props.hideDeleteButtons) ||
        !Boolean(props.showSaveGloballyButton),
    });
  }

  const displayTexts = getDisplayTexts(
    temporaryDisplayPackageInfo,
    selectedAttributionIdInAttributionView,
    attributionIdMarkedForReplacement,
    view
  );

  function listener(event: IpcRendererEvent, resetState: boolean): void {
    if (resetState) {
      props.saveFileRequestListener();
    }
  }
  useIpcRenderer(AllowedFrontendChannels.SaveFileRequest, listener, [
    props.saveFileRequestListener,
  ]);

  const showHighlight =
    view === View.Attribution &&
    !temporaryDisplayPackageInfo.firstParty &&
    !temporaryDisplayPackageInfo.excludeFromNotice;

  const attributionIdsToResolveOrUnresolve =
    temporaryDisplayPackageInfo.attributionIds;

  return (
    <MuiBox sx={classes.root}>
      <PackageSubPanel
        displayPackageInfo={temporaryDisplayPackageInfo}
        handlePurlChange={handlePurlChange}
        isDisplayedPurlValid={isDisplayedPurlValid}
        isEditable={props.isEditable}
        nameAndVersionAreEditable={nameAndVersionAreEditable}
        setUpdateTemporaryDisplayPackageInfoFor={
          props.setUpdateTemporaryDisplayPackageInfoFor
        }
        temporaryPurl={temporaryPurl}
        openPackageSearchPopup={(): void => {
          dispatch(openPopup(PopupType.PackageSearchPopup));
        }}
        showHighlight={showHighlight}
      />
      <CopyrightSubPanel
        setUpdateTemporaryDisplayPackageInfoFor={
          props.setUpdateTemporaryDisplayPackageInfoFor
        }
        isEditable={props.isEditable}
        displayPackageInfo={temporaryDisplayPackageInfo}
        copyrightRows={copyrightRows}
        showHighlight={showHighlight}
      />
      <LicenseSubPanel
        isLicenseTextShown={isLicenseTextShown}
        displayPackageInfo={temporaryDisplayPackageInfo}
        isEditable={props.isEditable}
        setUpdateTemporaryDisplayPackageInfoFor={
          props.setUpdateTemporaryDisplayPackageInfoFor
        }
        licenseTextRows={licenseTextRows}
        setIsLicenseTextShown={setIsLicenseTextShown}
        showHighlight={showHighlight}
      />
      <AuditingSubPanel
        commentBoxHeight={commentBoxHeight}
        isCommentsBoxCollapsed={isLicenseTextShown}
        setUpdateTemporaryDisplayPackageInfoFor={
          props.setUpdateTemporaryDisplayPackageInfoFor
        }
        isEditable={props.isEditable}
        displayPackageInfo={temporaryDisplayPackageInfo}
        firstPartyChangeHandler={getFirstPartyChangeHandler(
          temporaryDisplayPackageInfo,
          dispatch
        )}
        discreteConfidenceChangeHandler={getDiscreteConfidenceChangeHandler(
          temporaryDisplayPackageInfo,
          dispatch
        )}
        followUpChangeHandler={getFollowUpChangeHandler(
          temporaryDisplayPackageInfo,
          dispatch
        )}
        excludeFromNoticeChangeHandler={getExcludeFromNoticeChangeHandler(
          temporaryDisplayPackageInfo,
          dispatch
        )}
        showManualAttributionData={props.showManualAttributionData}
        showHighlight={showHighlight}
      />
      <ButtonRow
        showButtonGroup={props.showManualAttributionData}
        resolvedToggleHandler={getResolvedToggleHandler(
          attributionIdsToResolveOrUnresolve,
          resolvedExternalAttributions,
          dispatch
        )}
        selectedPackageIsResolved={selectedPackagesAreResolved(
          attributionIdsToResolveOrUnresolve,
          resolvedExternalAttributions
        )}
        areButtonsHidden={props.areButtonsHidden}
        mainButtonConfigs={mainButtonConfigs}
        hamburgerMenuButtonConfigs={hamburgerMenuButtonConfigs}
        displayTexts={displayTexts}
        isEditable={props.isEditable}
        displayPackageInfo={temporaryDisplayPackageInfo}
        needsReviewChangeHandler={getNeedsReviewChangeHandler(
          temporaryDisplayPackageInfo,
          dispatch
        )}
        addMarginForNeedsReviewCheckbox={props.addMarginForNeedsReviewCheckbox}
      />
    </MuiBox>
  );
}
