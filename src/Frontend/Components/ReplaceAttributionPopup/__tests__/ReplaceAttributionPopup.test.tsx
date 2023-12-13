// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
// SPDX-FileCopyrightText: Nico Carl <nicocarl@protonmail.com>
//
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, screen } from '@testing-library/react';

import {
  Attributions,
  DiscreteConfidence,
  Resources,
} from '../../../../shared/shared-types';
import { ButtonText, PopupType } from '../../../enums/enums';
import {
  setAttributionIdMarkedForReplacement,
  setMultiSelectSelectedAttributionIds,
  setSelectedAttributionId,
} from '../../../state/actions/resource-actions/attribution-view-simple-actions';
import { loadFromFile } from '../../../state/actions/resource-actions/load-actions';
import { openPopup } from '../../../state/actions/view-actions/view-actions';
import { getOpenPopup } from '../../../state/selectors/view-selector';
import { getParsedInputFileEnrichedWithTestData } from '../../../test-helpers/general-test-helpers';
import { renderComponent } from '../../../test-helpers/render';
import { ReplaceAttributionPopup } from '../ReplaceAttributionPopup';

function getActions() {
  const testResources: Resources = {
    thirdParty: {
      'package_1.tr.gz': 1,
      'package_2.tr.gz': 1,
    },
  };
  const testAttributions: Attributions = {
    test_selected_id: {
      packageName: 'React',
      attributionConfidence: DiscreteConfidence.High,
    },
    test_marked_id: { packageName: 'Vue' },
  };
  const testResourcesToManualAttributions = {
    'package_1.tr.gz': ['test_selected_id'],
    'package_2.tr.gz': ['test_marked_id'],
  };

  return [
    setSelectedAttributionId('test_selected_id'),
    setAttributionIdMarkedForReplacement('test_marked_id'),
    openPopup(PopupType.ReplaceAttributionPopup, 'test_selected_id'),
    loadFromFile(
      getParsedInputFileEnrichedWithTestData({
        resources: testResources,
        manualAttributions: testAttributions,
        resourcesToManualAttributions: testResourcesToManualAttributions,
      }),
    ),
  ];
}

describe('ReplaceAttributionPopup and do not change view', () => {
  it('renders a ReplaceAttributionPopup and click cancel', () => {
    const { store } = renderComponent(<ReplaceAttributionPopup />, {
      actions: getActions(),
    });

    expect(screen.getByText('Replacing an attribution')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();

    fireEvent.click(screen.queryByText(ButtonText.Cancel) as Element);
    expect(getOpenPopup(store.getState())).toBeNull();
  });

  it('does not show ContextMenu for attributions', () => {
    renderComponent(<ReplaceAttributionPopup />, {
      actions: getActions(),
    });

    expect(screen.getByText('Replacing an attribution')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();

    fireEvent.contextMenu(screen.queryByText('React') as Element);
    expect(screen.queryByText(ButtonText.Delete)).not.toBeInTheDocument();
    expect(screen.queryByText(ButtonText.Hide)).not.toBeInTheDocument();
    expect(
      screen.queryByText(ButtonText.ShowResources),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(ButtonText.Confirm)).not.toBeInTheDocument();
    expect(
      screen.queryByText(ButtonText.ConfirmGlobally),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(ButtonText.DeleteGlobally),
    ).not.toBeInTheDocument();
  });

  it('does not show multi-select checkbox for attributions', () => {
    renderComponent(<ReplaceAttributionPopup />, {
      actions: [
        ...getActions(),
        setMultiSelectSelectedAttributionIds(['test_marked_id']),
      ],
    });

    expect(screen.getByText('Replacing an attribution')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
    expect(screen.queryByText('checkbox')).not.toBeInTheDocument();
  });

  it('renders a ReplaceAttributionPopup and click replace', () => {
    const { store } = renderComponent(<ReplaceAttributionPopup />, {
      actions: getActions(),
    });

    expect(screen.getByText('Replacing an attribution')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();

    fireEvent.click(screen.queryByText(ButtonText.Replace) as Element);
    expect(getOpenPopup(store.getState())).toBeNull();

    expect(window.electronAPI.saveFile).toHaveBeenCalledWith({
      manualAttributions: {
        test_selected_id: {
          packageName: 'React',
          attributionConfidence: DiscreteConfidence.High,
        },
      },
      resolvedExternalAttributions: new Set(),
      resourcesToAttributions: {
        'package_1.tr.gz': ['test_selected_id'],
        'package_2.tr.gz': ['test_selected_id'],
      },
    });
  });
});
