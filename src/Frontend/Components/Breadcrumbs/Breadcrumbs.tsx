// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MuiListItemButton from '@mui/material/ListItemButton';
import MuiTypography from '@mui/material/Typography';
import { SxProps } from '@mui/system';
import { ReactElement } from 'react';

import { OpossumColors } from '../../shared-styles';

const classes = {
  breadcrumbs: {
    color: OpossumColors.black,
    '.MuiBreadcrumbs-separator': {
      margin: '0 2px',
    },
  },
  breadcrumbsButton: {
    padding: '1px 4px',
    backgroundColor: OpossumColors.lightestBlue,
    '&:loading': {
      backgroundColor: OpossumColors.lightestBlue,
    },
    '&.Mui-selected': {
      '&:hover': {
        backgroundColor: OpossumColors.lightestBlue,
      },
      backgroundColor: OpossumColors.lightestBlue,
    },
    '&.Mui-disabled': {
      opacity: 1,
    },
  },
  breadcrumbsSelected: {
    fontWeight: 'bold',
  },
};

interface BreadcrumbsProps {
  selectedId?: string;
  onClick: (id: string) => void;
  idsToDisplayValues: Array<[string, string]>;
  sx?: SxProps;
  maxItems?: number;
  separator?: React.ReactNode;
}

export function Breadcrumbs(props: BreadcrumbsProps): ReactElement {
  const ids: Array<string> = props.idsToDisplayValues.map(
    (idToDisplayValue) => idToDisplayValue[0],
  );

  return (
    <MuiBreadcrumbs
      sx={{ ...classes.breadcrumbs, ...props.sx }}
      separator={props.separator}
      maxItems={props.maxItems}
      itemsAfterCollapse={3}
    >
      {ids.map((id, index) => (
        <MuiListItemButton
          key={`breadcrumbs-${id}`}
          sx={classes.breadcrumbsButton}
          selected={props.selectedId === id}
          onClick={(): void => props.onClick(id)}
          disableRipple={true}
          disabled={
            !!props.selectedId && index >= ids.indexOf(props.selectedId)
          }
        >
          <MuiTypography
            sx={props.selectedId === id ? classes.breadcrumbsSelected : null}
          >
            {props.idsToDisplayValues[index][1]}
          </MuiTypography>
        </MuiListItemButton>
      ))}
    </MuiBreadcrumbs>
  );
}
