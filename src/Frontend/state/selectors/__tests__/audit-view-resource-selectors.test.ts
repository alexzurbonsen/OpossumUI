// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import {
  Attributions,
  PackageInfo,
  ResourcesToAttributions,
} from '../../../../shared/shared-types';
import { createTestAppStore } from '../../../test-helpers/render-component-with-store';
import { PanelPackage } from '../../../types/types';
import { getPackageInfoOfSelected } from '../all-views-resource-selectors';
import { setManualData } from '../../actions/resource-actions/all-views-simple-actions';
import {
  setDisplayedPackage,
  setResolvedExternalAttributions,
  setSelectedResourceId,
} from '../../actions/resource-actions/audit-view-simple-actions';
import { loadFromFile } from '../../actions/resource-actions/load-actions';
import { getParsedInputFile } from '../../../test-helpers/test-helpers';
import {
  getAttributionIdOfDisplayedPackageInManualPanel,
  getAttributionIdsOfSelectedResource,
  getAttributionsOfSelectedResourceOrClosestParent,
  getResolvedExternalAttributions,
} from '../audit-view-resource-selectors';
import { PackagePanelTitle } from '../../../enums/enums';

describe('The audit view resource selectors', () => {
  const testManualAttributionUuid_1 = '4d9f0b16-fbff-11ea-adc1-0242ac120002';
  const testManualAttributionUuid_2 = 'b5da73d4-f400-11ea-adc1-0242ac120002';
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
  };
  const testManualAttributions: Attributions = {
    [testManualAttributionUuid_1]: testTemporaryPackageInfo,
    [testManualAttributionUuid_2]: secondTestTemporaryPackageInfo,
  };
  const testResourcesToManualAttributions: ResourcesToAttributions = {
    '/root/src/something.js': [testManualAttributionUuid_1],
  };

  test('sets Attributions and getsAttribution for a ResourceId', () => {
    const testStore = createTestAppStore();
    const expectedPackageInfo: PackageInfo = {
      attributionConfidence: 80,
      packageVersion: '1.0',
      packageName: 'test Package',
      licenseText: ' test License text',
    };
    expect(getPackageInfoOfSelected(testStore.getState())).toMatchObject({});

    testStore.dispatch(
      setManualData(testManualAttributions, testResourcesToManualAttributions)
    );
    testStore.dispatch(setSelectedResourceId('/root/src/something.js'));
    expect(getPackageInfoOfSelected(testStore.getState())).toEqual(
      expectedPackageInfo
    );
  });

  test('gets attributions and attribution ids for the selected resource', () => {
    const testStore = createTestAppStore();
    const reactPackage: PackageInfo = { packageName: 'React' };
    testStore.dispatch(
      loadFromFile(
        getParsedInputFile(
          { file: 1 },
          { uuid1: reactPackage, uuid2: { packageName: 'Angular' } },
          { '/file': ['uuid1'] }
        )
      )
    );

    testStore.dispatch(setSelectedResourceId('/file'));
    expect(getAttributionIdsOfSelectedResource(testStore.getState())).toEqual([
      'uuid1',
    ]);
    expect(
      getAttributionsOfSelectedResourceOrClosestParent(testStore.getState())
    ).toEqual({
      uuid1: reactPackage,
    });
  });

  test('gets getSelectedPackageAttributionIdIfManualPackagePanel', () => {
    const manualPackagesSelectedPackage: PanelPackage = {
      panel: PackagePanelTitle.ManualPackages,
      attributionId: 'uuid1',
    };
    const manualPackagesDefaultSelectedPackage: PanelPackage = {
      panel: PackagePanelTitle.ManualPackages,
      attributionId: '',
    };
    const containedSelectedPackage: PanelPackage = {
      panel: PackagePanelTitle.ContainedManualPackages,
      attributionId: '',
    };

    const testStore = createTestAppStore();
    expect(
      getAttributionIdOfDisplayedPackageInManualPanel(testStore.getState())
    ).toBeNull();

    testStore.dispatch(setDisplayedPackage(manualPackagesSelectedPackage));
    expect(
      getAttributionIdOfDisplayedPackageInManualPanel(testStore.getState())
    ).toBe('uuid1');

    testStore.dispatch(
      setDisplayedPackage(manualPackagesDefaultSelectedPackage)
    );
    expect(
      getAttributionIdOfDisplayedPackageInManualPanel(testStore.getState())
    ).toBe('');

    testStore.dispatch(setDisplayedPackage(containedSelectedPackage));
    expect(
      getAttributionIdOfDisplayedPackageInManualPanel(testStore.getState())
    ).toBeNull();
  });

  test('sets and gets resolvedExternalAttributions', () => {
    const testStore = createTestAppStore();
    const testResolvedExternalAttributions: Set<string> = new Set();
    testResolvedExternalAttributions
      .add('d3a753c0-5100-11eb-ae93-0242ac130002')
      .add('d3a7565e-5100-11eb-ae93-0242ac130002');

    expect(getResolvedExternalAttributions(testStore.getState())).toMatchObject(
      new Set()
    );

    testStore.dispatch(
      setResolvedExternalAttributions(testResolvedExternalAttributions)
    );
    expect(getResolvedExternalAttributions(testStore.getState())).toMatchObject(
      testResolvedExternalAttributions
    );
  });
});
