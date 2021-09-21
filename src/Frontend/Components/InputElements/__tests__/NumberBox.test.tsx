// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent } from 'react';
import { render } from '@testing-library/react';
import { NumberBox } from '../NumberBox';
import { doNothing } from '../../../util/do-nothing';

describe('The NumberBox', () => {
  test('renders value and label', () => {
    const { queryAllByText, getByDisplayValue } = render(
      <NumberBox
        title={'Test Title'}
        value={13}
        handleChange={
          doNothing as unknown as (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => void
        }
      />
    );

    expect(queryAllByText('Test Title')).toHaveLength(2);
    expect(getByDisplayValue('13'));
  });
});
