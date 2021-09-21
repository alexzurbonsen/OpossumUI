// SPDX-FileCopyrightText: Facebook, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import {
  createTestAppStore,
  renderComponentWithStore,
} from '../../../test-helpers/render-component-with-store';
import { FileSearchPopup } from '../FileSearchPopup';
import { Resources } from '../../../../shared/shared-types';
import { loadFromFile } from '../../../state/actions/resource-actions/load-actions';
import { getParsedInputFile } from '../../../test-helpers/test-helpers';
import { act } from 'react-dom/test-utils';
import each from 'jest-each';

describe('FileSearch popup ', () => {
  const testResources: Resources = {
    thirdParty: {
      'package_1.tr.gz': 1,
      'package_2.tr.gz': 1,
      'test.js': 1,
    },
    eagleBlu: {
      src: {
        'test.js': 1,
      },
      'readme.md': 1,
    },
  };

  const debounceWaitTimeInMs = 200;

  jest.useFakeTimers('modern');

  test('renders', () => {
    renderComponentWithStore(<FileSearchPopup />);
    expect(
      screen.queryByText('Search for Files and Directories', { exact: false })
    ).toBeTruthy();
  });

  each([
    ['eagleBlu', 4],
    ['test.js', 2],
    ['non-existing-file', 0],
    ['eagleblu', 4],
  ]).test(
    'search for %s results in %s results',
    (search: string, expected_results: number) => {
      const store = createTestAppStore();
      store.dispatch(loadFromFile(getParsedInputFile(testResources)));

      renderComponentWithStore(<FileSearchPopup />, { store });

      act(() => {
        jest.advanceTimersByTime(debounceWaitTimeInMs);
      });

      expect(screen.queryAllByText('/', { exact: false })).toHaveLength(9);

      act(() => {
        fireEvent.change(screen.getByRole('searchbox'), {
          target: { value: search },
        });
      });

      act(() => {
        jest.advanceTimersByTime(debounceWaitTimeInMs);
      });

      expect(screen.queryAllByText(search, { exact: false })).toHaveLength(
        expected_results
      );
      expect(screen.queryAllByText('/', { exact: false })).toHaveLength(
        expected_results
      );
    }
  );

  test('has debounced search', () => {
    const store = createTestAppStore();
    store.dispatch(loadFromFile(getParsedInputFile(testResources)));

    const smallWaitTimeInMs = 50;

    renderComponentWithStore(<FileSearchPopup />, { store });

    act(() => {
      jest.advanceTimersByTime(debounceWaitTimeInMs);
    });

    act(() => {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: '31231' },
      });
    });

    act(() => {
      jest.advanceTimersByTime(smallWaitTimeInMs);
    });

    expect(screen.queryAllByText('/', { exact: false })).toHaveLength(9);

    act(() => {
      jest.advanceTimersByTime(debounceWaitTimeInMs - smallWaitTimeInMs);
    });

    expect(screen.queryAllByText('/', { exact: false })).toHaveLength(0);
  });

  test('has search with state', () => {
    const store = createTestAppStore();
    store.dispatch(loadFromFile(getParsedInputFile(testResources)));

    renderComponentWithStore(<FileSearchPopup />, { store });

    act(() => {
      fireEvent.change(screen.getByRole('searchbox'), {
        target: { value: '/eagleBlu/' },
      });
    });
    cleanup();

    renderComponentWithStore(<FileSearchPopup />, { store });

    act(() => {
      jest.advanceTimersByTime(debounceWaitTimeInMs);
    });

    expect(screen.queryAllByText('/', { exact: false })).toHaveLength(4);
    expect(screen.queryAllByText('/eagleBlu/', { exact: false })).toHaveLength(
      4
    );
  });
});
