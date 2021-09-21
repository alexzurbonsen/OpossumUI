// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { PackagePanelTitle, View } from '../../../enums/enums';
import { State } from '../../../types/types';
import {
  getAttributionIdToSaveTo,
  getManualAttributions,
  getPackageInfoOfSelected,
  getTemporaryPackageInfo,
  wereTemporaryPackageInfoModified,
} from '../../selectors/all-views-resource-selectors';
import { getTargetView } from '../../selectors/view-selector';
import {
  setDisplayedPackageAndResetTemporaryPackageInfo,
  openResourceInResourceBrowser,
  setSelectedResourceOrAttributionIdToTargetValue,
} from '../resource-actions/navigation-actions';
import { SimpleThunkAction, SimpleThunkDispatch } from '../types';
import {
  closePopup,
  openNotSavedPopup,
  setTargetView,
  navigateToView,
} from '../view-actions/view-actions';
import {
  savePackageInfo,
  unlinkAttributionAndSavePackageInfo,
} from '../resource-actions/save-actions';
import {
  setSelectedAttributionId,
  setTargetSelectedAttributionId,
} from '../resource-actions/attribution-view-simple-actions';
import {
  setSelectedResourceId,
  setTargetSelectedResourceId,
} from '../resource-actions/audit-view-simple-actions';
import { setTemporaryPackageInfo } from '../resource-actions/all-views-simple-actions';
import { getSelectedResourceId } from '../../selectors/audit-view-resource-selectors';

export function navigateToSelectedPathOrOpenUnsavedPopup(
  resourcePath: string
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(setTargetSelectedResourceId(resourcePath));
      dispatch(setTargetView(View.Audit));
      dispatch(openNotSavedPopup());
    } else {
      dispatch(openResourceInResourceBrowser(resourcePath));
    }
  };
}

export function changeSelectedAttributionIdOrOpenUnsavedPopup(
  attributionId: string
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    const manualAttributions = getManualAttributions(getState());
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(setTargetSelectedAttributionId(attributionId));
      dispatch(openNotSavedPopup());
    } else {
      dispatch(setSelectedAttributionId(attributionId));
      dispatch(setTemporaryPackageInfo(manualAttributions[attributionId]));
    }
  };
}

export function setViewOrOpenUnsavedPopup(
  selectedView: View
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(setTargetView(selectedView));
      dispatch(setTargetSelectedResourceId(getSelectedResourceId(getState())));
      dispatch(openNotSavedPopup());
    } else {
      dispatch(navigateToView(selectedView));
    }
  };
}

export function setSelectedResourceIdOrOpenUnsavedPopup(
  resourceId: string
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(setTargetSelectedResourceId(resourceId));
      dispatch(openNotSavedPopup());
    } else {
      dispatch(setSelectedResourceId(resourceId));
    }
  };
}

export function selectAttributionInAccordionPanelOrOpenUnsavedPopup(
  packagePanelTitle: PackagePanelTitle,
  attributionId: string
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(openNotSavedPopup());
    } else {
      dispatch(
        setDisplayedPackageAndResetTemporaryPackageInfo({
          panel: packagePanelTitle,
          attributionId: attributionId,
        })
      );
    }
  };
}

export function selectAttributionInManualPackagePanelOrOpenUnsavedPopup(
  packagePanelTitle: PackagePanelTitle,
  attributionId: string
): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    if (wereTemporaryPackageInfoModified(getState())) {
      dispatch(openNotSavedPopup());
    } else {
      dispatch(
        setDisplayedPackageAndResetTemporaryPackageInfo({
          panel: packagePanelTitle,
          attributionId: attributionId,
        })
      );
    }
  };
}

export function unlinkAttributionAndSavePackageInfoAndNavigateToTargetView(): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    const selectedResourceId = getSelectedResourceId(getState());
    const attributionId = getAttributionIdToSaveTo(getState()) as string;
    const temporaryPackageInfo = getTemporaryPackageInfo(getState());

    dispatch(
      unlinkAttributionAndSavePackageInfo(
        selectedResourceId,
        attributionId,
        temporaryPackageInfo
      )
    );
    dispatch(navigateToTargetResourceOrAttribution());
  };
}

export function saveTemporaryPackageInfoAndNavigateToTargetView(): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    const selectedResourceId = getSelectedResourceId(getState());
    const attributionId = getAttributionIdToSaveTo(getState());
    const temporaryPackageInfo = getTemporaryPackageInfo(getState());

    dispatch(
      savePackageInfo(selectedResourceId, attributionId, temporaryPackageInfo)
    );
    dispatch(navigateToTargetResourceOrAttribution());
  };
}

export function navigateToTargetResourceOrAttribution(): SimpleThunkAction {
  return (dispatch: SimpleThunkDispatch, getState: () => State): void => {
    const targetView = getTargetView(getState());

    dispatch(setSelectedResourceOrAttributionIdToTargetValue());
    if (targetView) {
      dispatch(navigateToView(targetView));
    }
    dispatch(setTemporaryPackageInfo(getPackageInfoOfSelected(getState())));

    dispatch(closePopup());
  };
}
