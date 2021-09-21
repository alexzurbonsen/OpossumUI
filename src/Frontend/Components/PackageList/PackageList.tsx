// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ReactElement } from 'react';
import {
  AttributionIdWithCount,
  Attributions,
  PackageInfo,
} from '../../../shared/shared-types';
import { getAlphabeticalComparer } from '../../util/get-alphabetical-comparer';
import { List } from '../List/List';
import { PackagePanelCard } from '../PackagePanelCard/PackagePanelCard';
import { ListCardConfig } from '../../types/types';

interface PackageListProps {
  attributionIdsWithCount?: Array<AttributionIdWithCount>;
  attributions: Attributions;
  selectedAttributionId: string | null;
  resolvedAttributionIds: Set<string>;
  onCardClick(attributionId: string): void;
  onAddAttributionClick(attributionId: string): void;
  sorted?: boolean;
  isExternalAttribution: boolean;
  preSelectedExternalAttributionIdsForSelectedResource: Array<string>;
  isAddToPackageEnabled: boolean;
}

export function PackageList(props: PackageListProps): ReactElement {
  const attributionIdsWithCount = props.attributionIdsWithCount || [];

  function getSortedAttributionIds(): Array<string> {
    if (!attributionIdsWithCount.length) {
      return [];
    }

    const attributionIds = attributionIdsWithCount.map(
      (attributionIdWithCount) => attributionIdWithCount.attributionId
    );

    return props.sorted
      ? attributionIds.sort(getAlphabeticalComparer(props.attributions))
      : attributionIds;
  }

  const sortedAttributionIds = getSortedAttributionIds();

  function getPackagePanelCard(index: number): ReactElement {
    const attributionId: string = sortedAttributionIds[index];
    const packageInfo: PackageInfo = props.attributions[attributionId];
    const packageCount = attributionIdsWithCount.filter(
      (attributionIdWithCount) =>
        attributionIdWithCount.attributionId === attributionId
    )[0].childrenWithAttributionCount;
    const cardConfig: ListCardConfig = {
      isSelected: attributionId === props.selectedAttributionId,
      isPreSelected:
        props.preSelectedExternalAttributionIdsForSelectedResource.includes(
          attributionId
        ),
      isResolved: props.resolvedAttributionIds.has(attributionId),
      isExternalAttribution: props.isExternalAttribution,
      firstParty: packageInfo.firstParty,
      excludeFromNotice: packageInfo.excludeFromNotice,
    };

    function onIconClick(): void {
      props.onAddAttributionClick(attributionId);
    }

    return (
      <PackagePanelCard
        onClick={(): void => props.onCardClick(attributionId)}
        onIconClick={props.isAddToPackageEnabled ? onIconClick : undefined}
        key={`PackageCard-${packageInfo.packageName}-${index}`}
        packageCount={packageCount}
        cardContent={{
          name: packageInfo.packageName,
          packageVersion: packageInfo.packageVersion,
          copyright: packageInfo.copyright,
          licenseText: packageInfo.licenseText,
          comment: packageInfo.comment,
          url: packageInfo.url,
          licenseName: packageInfo.licenseName,
        }}
        attributionId={attributionId}
        cardConfig={cardConfig}
      />
    );
  }

  return (
    <List
      getListItem={getPackagePanelCard}
      max={{ numberOfDisplayedItems: 15 }}
      length={attributionIdsWithCount.length}
      cardVerticalDistance={41}
    />
  );
}
