// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiTypography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { ReactElement, useMemo, useState } from 'react';
import { PackagePanel } from '../PackagePanel/PackagePanel';
import { PanelData } from '../../types/types';
import { isEmpty } from 'lodash';

const classes = {
  expansionPanelExpanded: {
    margin: '0px !important',
  },
  expansionPanelSummary: {
    minHeight: '24px !important',
    '& div.MuiAccordionSummary-content': {
      margin: '0px',
    },
    '& div.MuiAccordionSummary-expandIcon': {
      padding: '6px 12px',
    },
    padding: '0 12px',
  },
  expansionPanelDetails: {
    height: '100%',
    padding: '0 12px 16px',
  },
  expansionPanelTransition: {
    '& div.MuiCollapse-root': { transition: 'none' },
  },
};

interface AccordionPanelProps {
  panelData: PanelData;
  isAddToPackageEnabled: boolean;
}

export function AccordionPanel(props: AccordionPanelProps): ReactElement {
  const [expanded, setExpanded] = useState<boolean>(false);

  useMemo(() => {
    setExpanded(!isEmpty(props.panelData.displayPackageInfosWithCount));
  }, [props.panelData.displayPackageInfosWithCount]);

  function handleExpansionChange(
    event: React.ChangeEvent<unknown>,
    targetExpansionState: boolean,
  ): void {
    setExpanded(targetExpansionState);
  }

  return (
    <MuiAccordion
      sx={{
        ...classes.expansionPanelExpanded,
        '&.MuiAccordion-root': classes.expansionPanelTransition,
      }}
      elevation={0}
      square={true}
      key={`PackagePanel-${props.panelData.title}`}
      expanded={expanded}
      onChange={handleExpansionChange}
      disabled={isEmpty(props.panelData.displayPackageInfosWithCount)}
    >
      <MuiAccordionSummary
        sx={{
          '&.MuiAccordionSummary-root': classes.expansionPanelSummary,
        }}
        expandIcon={<ExpandMoreIcon />}
      >
        <MuiTypography>{props.panelData.title}</MuiTypography>
      </MuiAccordionSummary>
      <MuiAccordionDetails
        sx={{
          '&.MuiAccordionDetails-root': classes.expansionPanelDetails,
        }}
      >
        <PackagePanel
          title={props.panelData.title}
          displayPackageInfosWithCount={
            props.panelData.displayPackageInfosWithCount
          }
          sortedPackageCardIds={props.panelData.sortedPackageCardIds}
          isAddToPackageEnabled={props.isAddToPackageEnabled}
        />
      </MuiAccordionDetails>
    </MuiAccordion>
  );
}
