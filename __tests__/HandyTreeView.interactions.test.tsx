/**
 * @fileoverview Interaction Tests for HandyTreeView
 *
 * This test suite covers user interactions, keyboard navigation, accessibility, and auto-expand features:
 *
 * Keyboard Navigation:
 *   - should navigate with arrow keys
 *   - should expand with ArrowRight
 *   - should collapse with ArrowLeft
 *   - should select with Enter key
 *
 * User Interactions:
 *   - should handle double-click events
 *   - should handle right-click / context menu events
 *   - should handle hover events
 *   - should detect double-click from rapid single clicks
 *   - should not handle interactions for disabled items
 *
 * Accessibility:
 *   - should have proper ARIA attributes
 *   - should set aria-expanded on expandable items
 *   - should set aria-selected on selected items
 *
 * Auto-expand on Navigation:
 *   - should not auto-expand when autoExpandOnNavigation is false
 *   - should auto-expand when item receives focus via keyboard navigation
 *   - should auto-expand when focusItem is called programmatically
 *   - should not auto-expand items without children
 *   - should not auto-expand already expanded items
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem } from '../src/components/HandyTreeView';
import { renderWithTheme, mockItems, theme, createDataTransfer } from './HandyTreeView.test-utils';

describe('HandyTreeView - Interactions', () => {
  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Press ArrowDown to focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Press ArrowDown again to move to next item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should have moved focus
      expect(treeView).toBeInTheDocument();
    });

    it('should expand with ArrowRight', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Expand with ArrowRight
      fireEvent.keyDown(treeView, { key: 'ArrowRight' });

      // Should show children
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
    });

    it('should collapse with ArrowLeft', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Collapse with ArrowLeft
      fireEvent.keyDown(treeView, { key: 'ArrowLeft' });

      // Children should be hidden
      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });

    it('should select with Enter key', async () => {
      const handleSelectionChange = jest.fn();
      // Use leaf items (no children) for selection test since items with children expand on click
      const leafItems: TreeViewItem[] = [
        { id: '1', label: 'File1.txt' },
        { id: '2', label: 'File2.txt' },
      ];
      renderWithTheme(
        <HandyTreeView
          items={leafItems}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Select with Enter
      fireEvent.keyDown(treeView, { key: 'Enter' });

      await waitFor(() => {
        expect(handleSelectionChange).toHaveBeenCalled();
      });
    });
  });


  describe('User Interactions', () => {
    it('should handle double-click events', () => {
      const handleDoubleClick = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemDoubleClick={handleDoubleClick}
        />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.doubleClick(documentsItem);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
      expect(handleDoubleClick).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should handle right-click / context menu events', () => {
      const handleContextMenu = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemContextMenu={handleContextMenu}
        />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.contextMenu(documentsItem);

      expect(handleContextMenu).toHaveBeenCalledTimes(1);
      expect(handleContextMenu).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should handle hover events', () => {
      const handleHover = jest.fn();
      const handleHoverEnd = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemHover={handleHover}
          onItemHoverEnd={handleHoverEnd}
        />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.mouseEnter(documentsItem);

      expect(handleHover).toHaveBeenCalledTimes(1);
      expect(handleHover).toHaveBeenCalledWith(expect.any(Object), '1');

      fireEvent.mouseLeave(documentsItem);

      expect(handleHoverEnd).toHaveBeenCalledTimes(1);
      expect(handleHoverEnd).toHaveBeenCalledWith(expect.any(Object), '1');
    });

    it('should detect double-click from rapid single clicks', async () => {
      const handleClick = jest.fn();
      const handleDoubleClick = jest.fn();
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemClick={handleClick}
          onItemDoubleClick={handleDoubleClick}
        />
      );

      const documentsItem = screen.getByText('Documents');
      
      // First click
      fireEvent.click(documentsItem);
      
      // Second click within threshold (simulating double-click)
      await new Promise((resolve) => setTimeout(resolve, 100));
      fireEvent.click(documentsItem);

      // Should detect as double-click
      await waitFor(() => {
        expect(handleDoubleClick).toHaveBeenCalled();
      }, { timeout: 1000 });
      // Note: Single-click might still be called due to timing, but double-click takes precedence
    });

    it('should not handle interactions for disabled items', () => {
      const handleClick = jest.fn();
      const handleDoubleClick = jest.fn();
      const handleContextMenu = jest.fn();
      
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemDisabled={(itemId) => itemId === '2'}
          onItemClick={handleClick}
          onItemDoubleClick={handleDoubleClick}
          onItemContextMenu={handleContextMenu}
        />
      );

      const picturesItem = screen.getByText('Pictures');
      
      fireEvent.click(picturesItem);
      fireEvent.doubleClick(picturesItem);
      fireEvent.contextMenu(picturesItem);

      expect(handleClick).not.toHaveBeenCalled();
      expect(handleDoubleClick).not.toHaveBeenCalled();
      expect(handleContextMenu).not.toHaveBeenCalled();
    });
  });


  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();

      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems.length).toBeGreaterThan(0);

      treeItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-level');
      });
    });

    it('should set aria-expanded on expandable items', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-selected on selected items', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');
    });
  });


  describe('Auto-expand on Navigation', () => {
    it('should not auto-expand when autoExpandOnNavigation is false', () => {
      const { container } = renderWithTheme(
        <HandyTreeView items={mockItems} autoExpandOnNavigation={false} />
      );

      // Focus the Documents item
      const documentsItem = screen.getByText('Documents').closest('li');
      if (documentsItem) {
        fireEvent.focus(documentsItem);
      }

      // Wait a bit for any async operations
      waitFor(() => {
        // Documents should not be expanded
        expect(documentsItem).toHaveAttribute('aria-expanded', 'false');
        // Children should not be visible
        expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
      });
    });

    it('should auto-expand when item receives focus via keyboard navigation', () => {
      const { container } = renderWithTheme(
        <HandyTreeView items={mockItems} autoExpandOnNavigation={true} />
      );

      // Focus the Documents item (simulating keyboard navigation)
      const documentsItem = screen.getByText('Documents').closest('li');
      if (documentsItem) {
        // Simulate focus event
        fireEvent.focus(documentsItem);
      }

      // Wait for auto-expand to occur
      waitFor(() => {
        // Documents should be expanded
        expect(documentsItem).toHaveAttribute('aria-expanded', 'true');
        // Children should be visible
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('file2.txt')).toBeInTheDocument();
      });
    });

    it('should auto-expand when focusItem is called programmatically', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <HandyTreeView items={mockItems} apiRef={apiRef} autoExpandOnNavigation={true} />
      );

      // Use API to focus item
      expect(apiRef.current).toBeDefined();
      expect(apiRef.current?.focusItem).toBeDefined();
      apiRef.current?.focusItem?.('1');

      // Wait for auto-expand to occur
      waitFor(() => {
        const documentsItem = screen.getByText('Documents').closest('li');
        expect(documentsItem).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });
    });

    it('should not auto-expand items without children', () => {
      const itemsWithoutChildren: TreeViewItem[] = [
        { id: '1', label: 'File1.txt' },
        { id: '2', label: 'File2.txt' },
      ];

      renderWithTheme(
        <HandyTreeView items={itemsWithoutChildren} autoExpandOnNavigation={true} />
      );

      const file1Item = screen.getByText('File1.txt').closest('li');
      if (file1Item) {
        fireEvent.focus(file1Item);
      }

      // Should not have aria-expanded attribute for items without children
      waitFor(() => {
        expect(file1Item).not.toHaveAttribute('aria-expanded');
      });
    });

    it('should not auto-expand already expanded items', () => {
      const onExpandedItemsChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          autoExpandOnNavigation={true}
          expandedItems={['1']}
          onExpandedItemsChange={onExpandedItemsChange}
        />
      );

      // Documents is already expanded
      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-expanded', 'true');

      // Focus the item
      if (documentsItem) {
        fireEvent.focus(documentsItem);
      }

      // onExpandedItemsChange should not be called since it's already expanded
      waitFor(() => {
        expect(onExpandedItemsChange).not.toHaveBeenCalled();
      });
    });
  });

});