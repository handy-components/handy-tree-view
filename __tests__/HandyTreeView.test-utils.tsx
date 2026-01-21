/**
 * @fileoverview Shared test utilities for HandyTreeView tests
 *
 * Common helpers and mocks used across all HandyTreeView test files.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { TreeViewItem } from '../src/components/HandyTreeView';

export const theme = createTheme();

export const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Helper to create dataTransfer mock for jsdom
export function createDataTransfer() {
  const data: Record<string, string> = {};
  return {
    effectAllowed: 'move',
    dropEffect: 'move',
    data: data,
    setData: function(type: string, value: string) {
      data[type] = value;
    },
    getData: function(type: string) {
      return data[type] || '';
    },
    clearData: function() {
      Object.keys(data).forEach(key => delete data[key]);
    },
    files: [],
    items: [],
    types: [],
  };
}

// Common mock items for testing
export const mockItems: TreeViewItem[] = [
  {
    id: '1',
    label: 'Documents',
    children: [
      { id: '1-1', label: 'file1.txt' },
      { id: '1-2', label: 'file2.txt' },
    ],
  },
  {
    id: '2',
    label: 'Pictures',
    children: [
      { id: '2-1', label: 'photo1.jpg' },
      { id: '2-2', label: 'photo2.jpg' },
    ],
  },
];
