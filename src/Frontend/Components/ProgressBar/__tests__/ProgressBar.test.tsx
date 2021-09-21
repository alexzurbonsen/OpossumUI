// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { fireEvent } from '@testing-library/dom';
import React from 'react';
import {
  Attributions,
  PackageInfo,
  Resources,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import { renderComponentWithStore } from '../../../test-helpers/render-component-with-store';
import { ProgressBar } from '../ProgressBar';
import { setProgressBarData } from '../../../state/actions/resource-actions/all-views-simple-actions';
import { act } from '@testing-library/react';

describe('ProgressBar', () => {
  jest.useFakeTimers();
  test('ProgressBar renders', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).document.createRange = (): unknown => ({
      setStart: (): void => {},
      setEnd: (): void => {},
      commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
      },
    });

    const testResources: Resources = {
      folder1: { file1: 1, file2: 1 },
      folder2: { file1: 1, file2: 1 },
      file1: 1,
      file2: 1,
    };

    const testManualAttributionUuid_1 = '4d9f0b16-fbff-11ea-adc1-0242ac120002';
    const testManualAttributionUuid_2 = 'b5da73d4-f400-11ea-adc1-0242ac120002';
    const testExternalAttributionUuid = 'b5da73d4-f400-11ea-adc1-0242ac120003';
    const testTemporaryPackageInfo: PackageInfo = {
      attributionConfidence: 80,
      packageVersion: '1.0',
      packageName: 'test Package',
      licenseText: ' test License text',
    };
    const secondTestTemporaryPackageInfo: PackageInfo = {
      packageVersion: '2.0',
      packageName: 'not assigned test Package',
      licenseText: ' test not assigned License text',
      preSelected: true,
    };
    const testManualAttributions: Attributions = {
      [testManualAttributionUuid_1]: testTemporaryPackageInfo,
      [testManualAttributionUuid_2]: secondTestTemporaryPackageInfo,
    };

    const testResourcesToManualAttributions: ResourcesToAttributions = {
      '/folder1/': [testManualAttributionUuid_1],
      '/folder2/file1': [testManualAttributionUuid_1],
      '/file1': [testManualAttributionUuid_2],
    };
    const testResourcesToExternalAttributions: ResourcesToAttributions = {
      '/folder1/file2': [testExternalAttributionUuid],
      '/folder2/file2': [testExternalAttributionUuid],
    };

    const { getByLabelText, getByText, store } = renderComponentWithStore(
      <ProgressBar />
    );
    store.dispatch(
      setProgressBarData(
        testResources,
        testManualAttributions,
        testResourcesToManualAttributions,
        testResourcesToExternalAttributions,
        new Set<string>().add('resolved')
      )
    );

    const progressBar = getByLabelText('ProgressBar');
    fireEvent.mouseOver(progressBar);
    act(() => {
      jest.runAllTimers();
    });
    expect(getByText(/Number of files: 6/)).toBeDefined();
    expect(
      getByText(/Files with attributions: 3/) &&
        getByText(/Files with only pre-selected attributions: 1/) &&
        getByText(/Files with only signals: 1/)
    ).toBeDefined();
  });

  test('ProgressBar renders without progress data', () => {
    const { queryByLabelText } = renderComponentWithStore(<ProgressBar />);
    expect(queryByLabelText('ProgressBar')).toBeFalsy();
  });
});
