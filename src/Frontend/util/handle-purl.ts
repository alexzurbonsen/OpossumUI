// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import { PackageURL } from 'packageurl-js';
import { PackageInfo } from '../../shared/shared-types';

export interface ParsedPurl {
  isValid: boolean;
  purl: Partial<PackageInfo> | undefined;
}

export function parsePurl(potentialPurl: string): ParsedPurl {
  try {
    let packageURL;
    let packagePURLAppendix;
    if (potentialPurl) {
      packageURL = PackageURL.fromString(potentialPurl);
      packagePURLAppendix = generatePurlAppendix(packageURL);
    }

    return {
      isValid: true,
      purl: {
        packageName: packageURL ? packageURL.name : undefined,
        packageVersion:
          packageURL && packageURL.version ? packageURL.version : undefined,
        packageNamespace:
          packageURL && packageURL.namespace ? packageURL.namespace : undefined,
        packageType: packageURL ? packageURL.type : undefined,
        packagePURLAppendix: packagePURLAppendix,
      },
    };
  } catch {
    return { isValid: false, purl: undefined };
  }
}

export function generatePurlFromPackageInfo(packageInfo: PackageInfo): string {
  return packageInfo.packageType && packageInfo.packageName
    ? new PackageURL(
        packageInfo.packageType,
        packageInfo?.packageNamespace,
        packageInfo.packageName,
        packageInfo?.packageVersion,
        undefined,
        undefined
      ).toString() + (packageInfo.packagePURLAppendix || '')
    : '';
}

export function generatePurlAppendix(purl: PackageURL): string {
  const purlWithoutQualifiersAndSubpath = new PackageURL(
    purl.type,
    purl.namespace,
    purl.name,
    purl.version,
    undefined,
    undefined
  );
  const purlWithoutAppendix: string =
    purlWithoutQualifiersAndSubpath.toString();

  return purl.toString().split(purlWithoutAppendix)[1];
}
