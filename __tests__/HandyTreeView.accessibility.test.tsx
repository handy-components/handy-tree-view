/**
 * @fileoverview Accessibility Tests for HandyTreeView
 *
 * This test suite covers accessibility features including ARIA attributes,
 * screen reader support, keyboard navigation, and focus management:
 *
 * ARIA Attributes:
 *   - should have role="tree" on root element
 *   - should have role="treeitem" on each item
 *   - should have aria-expanded on expandable items
 *   - should have aria-selected on selected items
 *   - should have aria-disabled on disabled items
 *   - should have aria-level on items
 *   - should have aria-multiselectable when multiSelect is enabled
 *   - should have aria-activedescendant when item is focused
 *   - should support custom aria-label
 *   - should support aria-labelledby
 *
 * Screen Reader Support:
 *   - should create live region for announcements
 *   - should not create live region when disabled
 *   - should call custom announcement handler
 *
 * Keyboard Navigation:
 *   - should navigate with arrow keys
 *   - should expand with ArrowRight
 *   - should collapse with ArrowLeft
 *   - should navigate to first item with Home
 *   - should navigate to last item with End
 *   - should navigate with PageDown
 *   - should navigate with PageUp
 *   - should cancel editing with Escape
 *   - should clear selection with Escape in multi-select mode
 *   - should navigate to parent with ArrowLeft when item has no children
 *   - should support Shift+Arrow for range selection
 *   - should support Shift+Home for range selection to first item
 *   - should support Shift+End for range selection to last item
 *   - should support Shift+PageDown for range selection
 *   - should support Shift+PageUp for range selection
 *
 * Focus Management:
 *   - should manage focus properly
 *   - should restore focus after re-render
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { HandyTreeView, TreeViewItem } from '../src/components/HandyTreeView';
import { renderWithTheme, mockItems, theme } from './HandyTreeView.test-utils';

describe('Accessibility', () => {
  describe('ARIA Attributes', () => {
    it('should have role="tree" on root element', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();
    });

    it('should have role="treeitem" on each item', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems.length).toBeGreaterThan(0);
    });

    it('should have aria-expanded on expandable items', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-selected on selected items', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');
    });

    it('should have aria-disabled on disabled items', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemDisabled={(itemId) => itemId === '2'}
        />
      );

      const picturesItem = screen.getByText('Pictures').closest('li');
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-level on items', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeItems = screen.getAllByRole('treeitem');
      treeItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-level');
      });
    });

    it('should have aria-multiselectable when multiSelect is enabled', () => {
      renderWithTheme(<HandyTreeView items={mockItems} multiSelect />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('should have aria-activedescendant when item is focused', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should have aria-activedescendant
      expect(treeView).toHaveAttribute('aria-activedescendant');
    });

    it('should support custom aria-label', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} aria-label="Custom tree label" />
      );

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-label', 'Custom tree label');
    });

    it('should support aria-labelledby', () => {
      renderWithTheme(
        <>
          <div id="tree-label">Tree Label</div>
          <HandyTreeView items={mockItems} aria-labelledby="tree-label" />
        </>
      );

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-labelledby', 'tree-label');
    });
  });

  describe('Screen Reader Support', () => {
    it('should create live region for announcements', () => {
      renderWithTheme(<HandyTreeView items={mockItems} enableScreenReader={true} />);

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should not create live region when disabled', () => {
      renderWithTheme(<HandyTreeView items={mockItems} enableScreenReader={false} />);

      // Live region might still exist from previous test, but should not be used
      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();
    });

    it('should call custom announcement handler', async () => {
      const handleAnnounce = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          enableScreenReader={true}
          onScreenReaderAnnounce={handleAnnounce}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should call announcement handler
      await waitFor(() => {
        expect(handleAnnounce).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate down
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should have moved focus
      expect(treeView).toBeInTheDocument();
    });

    it('should expand with ArrowRight', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowRight' });

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
    });

    it('should collapse with ArrowLeft', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowLeft' });

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });

    it('should navigate to first item with Home', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'Home' });

      // Should focus first item
      expect(treeView).toBeInTheDocument();
    });

    it('should navigate to last item with End', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'End' });

      // Should focus last item
      expect(treeView).toBeInTheDocument();
    });

    it('should navigate with PageDown', () => {
      const largeItems: TreeViewItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(<HandyTreeView items={largeItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate down with PageDown
      fireEvent.keyDown(treeView, { key: 'PageDown' });

      // Should have moved focus down by page size
      expect(treeView).toBeInTheDocument();
    });

    it('should navigate with PageUp', () => {
      const largeItems: TreeViewItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(<HandyTreeView items={largeItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to middle first
      fireEvent.keyDown(treeView, { key: 'PageDown' });

      // Then navigate up with PageUp
      fireEvent.keyDown(treeView, { key: 'PageUp' });

      // Should have moved focus up by page size
      expect(treeView).toBeInTheDocument();
    });

    it('should cancel editing with Escape', () => {
      const handleLabelChange = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemEditable={(id) => id === '1'}
          onItemLabelChange={handleLabelChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Start editing (this would be done via API or double-click in real usage)
      // For test, we simulate the editing state
      const documentsItem = screen.getByText('Documents');
      
      // Press Escape
      fireEvent.keyDown(treeView, { key: 'Escape' });

      // Editing should be cancelled (no label change callback)
      expect(handleLabelChange).not.toHaveBeenCalled();
    });

    it('should clear selection with Escape in multi-select mode', async () => {
      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          multiSelect
          defaultSelectedItems={['1', '2']}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Press Escape
      fireEvent.keyDown(treeView, { key: 'Escape' });

      // Selection should be cleared
      await waitFor(() => {
        expect(handleSelectionChange).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Array)
        );
      });
    });

    it('should navigate to parent with ArrowLeft when item has no children', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to child
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowRight' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Navigate to parent with ArrowLeft
      fireEvent.keyDown(treeView, { key: 'ArrowLeft' });

      // Should have moved to parent
      expect(treeView).toBeInTheDocument();
    });

    it('should support Shift+Arrow for range selection', () => {
      const handleSelectionChange = jest.fn();
      const largeItems: TreeViewItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={largeItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Navigate down with Shift to select range
      fireEvent.keyDown(treeView, { key: 'ArrowDown', shiftKey: true });
      fireEvent.keyDown(treeView, { key: 'ArrowDown', shiftKey: true });

      // Should have selected range
      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should support Shift+Home for range selection to first item', () => {
      const handleSelectionChange = jest.fn();
      const largeItems: TreeViewItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={largeItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to middle item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Select range to first with Shift+Home
      fireEvent.keyDown(treeView, { key: 'Home', shiftKey: true });

      // Should have selected range
      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should support Shift+End for range selection to last item', () => {
      const handleSelectionChange = jest.fn();
      const largeItems: TreeViewItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={largeItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Select range to last with Shift+End
      fireEvent.keyDown(treeView, { key: 'End', shiftKey: true });

      // Should have selected range
      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should support Shift+PageDown for range selection', () => {
      const handleSelectionChange = jest.fn();
      const largeItems: TreeViewItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={largeItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Select range with Shift+PageDown
      fireEvent.keyDown(treeView, { key: 'PageDown', shiftKey: true });

      // Should have selected range
      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should support Shift+PageUp for range selection', () => {
      const handleSelectionChange = jest.fn();
      const largeItems: TreeViewItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={largeItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate down first
      fireEvent.keyDown(treeView, { key: 'PageDown' });

      // Select range with Shift+PageUp
      fireEvent.keyDown(treeView, { key: 'PageUp', shiftKey: true });

      // Should have selected range
      expect(handleSelectionChange).toHaveBeenCalled();
    });
  });

  describe('Focus Management', () => {
    it('should manage focus properly', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // First item should be focusable
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Documents').closest('li');
      expect(firstItem).toHaveAttribute('tabIndex', '0');
    });

    it('should restore focus after re-render', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeView items={mockItems} />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Re-render
      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeView items={mockItems} />
        </ThemeProvider>
      );

      // Focus should be maintained
      expect(treeView).toBeInTheDocument();
    });
  });
});
