/**
 * @fileoverview Basic Rendering, Expansion, and Selection Tests for HandyTreeView
 *
 * This test suite covers the fundamental features of HandyTreeView:
 *
 * Basic Rendering:
 *   - should render tree view with items
 *   - should render empty state when no items
 *   - should render children when parent is expanded
 *   - should not render children when parent is collapsed
 *
 * Expansion:
 *   - should expand item when clicked
 *   - should collapse item when clicked again
 *   - should call onExpandedItemsChange when expansion changes
 *   - should support controlled expansion
 *
 * Selection:
 *   - should select item when clicked in single-select mode
 *   - should support multi-selection
 *   - should show checkboxes when checkboxSelection is enabled
 *   - should support controlled selection
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { HandyTreeView, TreeViewItem } from '../src/components/HandyTreeView';
import { renderWithTheme, mockItems, theme } from './HandyTreeView.test-utils';

describe('HandyTreeView - Basic Features', () => {
  describe('Basic Rendering', () => {
    it('should render tree view with items', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Pictures')).toBeInTheDocument();
    });

    it('should render empty state when no items', () => {
      renderWithTheme(<HandyTreeView items={[]} />);

      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('should render children when parent is expanded', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('should not render children when parent is collapsed', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
      expect(screen.queryByText('file2.txt')).not.toBeInTheDocument();
    });
  });

  describe('Expansion', () => {
    it('should expand item when clicked', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('should collapse item when clicked again', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });

    it('should call onExpandedItemsChange when expansion changes', () => {
      const handleExpandedChange = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onExpandedItemsChange={handleExpandedChange}
        />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(handleExpandedChange).toHaveBeenCalled();
      const lastCall = handleExpandedChange.mock.calls[handleExpandedChange.mock.calls.length - 1];
      expect(lastCall[1]).toContain('1');
    });

    it('should support controlled expansion', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeView items={mockItems} expandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeView items={mockItems} expandedItems={[]} />
        </ThemeProvider>
      );

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should select item when clicked in single-select mode', () => {
      // Use items without children for selection tests, since clicking items with children
      // expands/collapses them when expansionTrigger='content' (default)
      const leafItems: TreeViewItem[] = [
        { id: '1', label: 'File1.txt' },
        { id: '2', label: 'File2.txt' },
      ];

      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={leafItems}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const file1Item = screen.getByText('File1.txt');
      fireEvent.click(file1Item);

      expect(handleSelectionChange).toHaveBeenCalled();
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      expect(lastCall[1]).toBe('1');
    });

    it('should support multi-selection', () => {
      // Use items without children for selection tests, since clicking items with children
      // expands/collapses them when expansionTrigger='content' (default)
      const leafItems: TreeViewItem[] = [
        { id: '1', label: 'File1.txt' },
        { id: '2', label: 'File2.txt' },
      ];

      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={leafItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const file1Item = screen.getByText('File1.txt');
      const file2Item = screen.getByText('File2.txt');

      fireEvent.click(file1Item);
      fireEvent.click(file2Item);

      expect(handleSelectionChange).toHaveBeenCalledTimes(2);
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      expect(Array.isArray(lastCall[1])).toBe(true);
      expect((lastCall[1] as string[]).length).toBe(2);
    });

    it('should show checkboxes when checkboxSelection is enabled', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} checkboxSelection multiSelect />
      );

      // Checkboxes should be rendered (Material-UI Checkbox components)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should support controlled selection', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');

      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeView items={mockItems} selectedItems={[]} />
        </ThemeProvider>
      );

      expect(documentsItem).toHaveAttribute('aria-selected', 'false');
    });
  });
});
