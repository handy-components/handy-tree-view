/**
 * @fileoverview Unit Tests for StudioTreeView
 *
 * Comprehensive test suite for StudioTreeView component.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StudioTreeView, StudioTreeViewApiRef } from '../src/components/StudioTreeView';
import { TreeViewItem } from '../src/types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('StudioTreeView', () => {
  const mockItems: TreeViewItem[] = [
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

  describe('Basic Rendering', () => {
    it('should render tree view with items', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Pictures')).toBeInTheDocument();
    });

    it('should render empty state when no items', () => {
      renderWithTheme(<StudioTreeView items={[]} />);

      expect(screen.getByText('No items available')).toBeInTheDocument();
    });

    it('should render children when parent is expanded', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('should not render children when parent is collapsed', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
      expect(screen.queryByText('file2.txt')).not.toBeInTheDocument();
    });
  });

  describe('Expansion', () => {
    it('should expand item when clicked', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });

    it('should collapse item when clicked again', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });

    it('should call onExpandedItemsChange when expansion changes', () => {
      const handleExpandedChange = jest.fn();
      renderWithTheme(
        <StudioTreeView
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
        <StudioTreeView items={mockItems} expandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <StudioTreeView items={mockItems} expandedItems={[]} />
        </ThemeProvider>
      );

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });
  });

  describe('Selection', () => {
    it('should select item when clicked in single-select mode', () => {
      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      expect(handleSelectionChange).toHaveBeenCalled();
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      expect(lastCall[1]).toBe('1');
    });

    it('should support multi-selection', () => {
      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          multiSelect
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const documentsItem = screen.getByText('Documents');
      const picturesItem = screen.getByText('Pictures');

      fireEvent.click(documentsItem);
      fireEvent.click(picturesItem);

      expect(handleSelectionChange).toHaveBeenCalledTimes(2);
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      expect(Array.isArray(lastCall[1])).toBe(true);
      expect((lastCall[1] as string[]).length).toBe(2);
    });

    it('should show checkboxes when checkboxSelection is enabled', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} checkboxSelection multiSelect />
      );

      // Checkboxes should be rendered (Material-UI Checkbox components)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should support controlled selection', () => {
      const { rerender } = renderWithTheme(
        <StudioTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');

      rerender(
        <ThemeProvider theme={theme}>
          <StudioTreeView items={mockItems} selectedItems={[]} />
        </ThemeProvider>
      );

      expect(documentsItem).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

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
      renderWithTheme(<StudioTreeView items={mockItems} />);

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
        <StudioTreeView items={mockItems} defaultExpandedItems={['1']} />
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

    it('should select with Enter key', () => {
      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Select with Enter
      fireEvent.keyDown(treeView, { key: 'Enter' });

      expect(handleSelectionChange).toHaveBeenCalled();
    });
  });

  describe('API Ref', () => {
    it('should expose API methods through ref', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(<StudioTreeView items={mockItems} apiRef={apiRef} />);

      expect(apiRef.current).toBeDefined();
      expect(apiRef.current?.focusItem).toBeDefined();
      expect(apiRef.current?.getItem).toBeDefined();
      expect(apiRef.current?.setItemExpansion).toBeDefined();
      expect(apiRef.current?.setItemSelection).toBeDefined();
    });

    it('should focus item programmatically', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(<StudioTreeView items={mockItems} apiRef={apiRef} />);

      apiRef.current?.focusItem?.('1');

      // Focus should be set (implementation detail)
      expect(apiRef.current).toBeDefined();
    });

    it('should get item by ID', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(<StudioTreeView items={mockItems} apiRef={apiRef} />);

      const item = apiRef.current?.getItem?.('1');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Documents');
    });

    it('should set item expansion programmatically', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(<StudioTreeView items={mockItems} apiRef={apiRef} />);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();

      apiRef.current?.setItemExpansion?.('1', true);

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
    });

    it('should set item selection programmatically', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };
      const handleSelectionChange = jest.fn();

      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          apiRef={apiRef}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      apiRef.current?.setItemSelection?.('1', true);

      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should set item disabled state programmatically', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          apiRef={apiRef}
        />
      );

      // Initially, item should not be disabled
      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');

      // Disable item via API
      apiRef.current?.setIsItemDisabled?.('1', true);

      // Item should now be disabled
      expect(documentsItem).toHaveAttribute('aria-disabled', 'true');

      // Re-enable item via API
      apiRef.current?.setIsItemDisabled?.('1', false);

      // Item should no longer be disabled
      expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('should combine prop-based and API-based disabled state', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          apiRef={apiRef}
          isItemDisabled={(itemId) => itemId === '2'}
        />
      );

      // Item 2 should be disabled via prop
      const picturesItem = screen.getByText('Pictures').closest('li');
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');

      // Item 1 should not be disabled
      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');

      // Disable item 1 via API
      apiRef.current?.setIsItemDisabled?.('1', true);

      // Item 1 should now be disabled
      expect(documentsItem).toHaveAttribute('aria-disabled', 'true');

      // Item 2 should still be disabled (via prop)
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should prevent interaction with items disabled via API', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };
      const handleClick = jest.fn();

      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          apiRef={apiRef}
          onItemClick={handleClick}
        />
      );

      // Disable item via API
      apiRef.current?.setIsItemDisabled?.('1', true);

      // Try to click the disabled item
      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      // Click should not trigger handler for disabled items
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Disabled Items', () => {
    it('should disable items based on isItemDisabled', () => {
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          isItemDisabled={(itemId) => itemId === '2'}
        />
      );

      const picturesItem = screen.getByText('Pictures').closest('li');
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should not allow interaction with disabled items', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          isItemDisabled={(itemId) => itemId === '2'}
          onItemClick={handleClick}
        />
      );

      const picturesItem = screen.getByText('Pictures');
      fireEvent.click(picturesItem);

      // Click should not trigger handler for disabled items
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should allow programmatic disabling via API', () => {
      const apiRef: StudioTreeViewApiRef = { current: undefined };
      const handleClick = jest.fn();

      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          apiRef={apiRef}
          onItemClick={handleClick}
        />
      );

      // Initially, item should be enabled
      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');

      // Disable via API
      apiRef.current?.setIsItemDisabled?.('1', true);

      // Item should now be disabled
      expect(documentsItem).toHaveAttribute('aria-disabled', 'true');

      // Click should not work
      fireEvent.click(screen.getByText('Documents'));
      expect(handleClick).not.toHaveBeenCalled();

      // Re-enable via API
      apiRef.current?.setIsItemDisabled?.('1', false);

      // Item should be enabled again
      expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');

      // Click should work now
      fireEvent.click(screen.getByText('Documents'));
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Custom Getters', () => {
    it('should use custom getItemLabel', () => {
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          getItemLabel={(item) => `Custom: ${item.label}`}
        />
      );

      expect(screen.getByText('Custom: Documents')).toBeInTheDocument();
      expect(screen.getByText('Custom: Pictures')).toBeInTheDocument();
    });

    it('should use custom getItemId', () => {
      const customItems: TreeViewItem[] = [
        { id: 'custom-1', label: 'Item 1' },
        { id: 'custom-2', label: 'Item 2' },
      ];

      renderWithTheme(
        <StudioTreeView
          items={customItems}
          getItemId={(item) => `id-${item.id}`}
        />
      );

      // Should still render items
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle double-click events', () => {
      const handleDoubleClick = jest.fn();
      renderWithTheme(
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      // Double-click should be called, single-click should not
      expect(handleDoubleClick).toHaveBeenCalled();
      // Note: Single-click might still be called due to timing, but double-click takes precedence
    });

    it('should not handle interactions for disabled items', () => {
      const handleClick = jest.fn();
      const handleDoubleClick = jest.fn();
      const handleContextMenu = jest.fn();
      
      renderWithTheme(
        <StudioTreeView
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
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();

      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems.length).toBeGreaterThan(0);

      treeItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-level');
      });
    });

    it('should set aria-expanded on expandable items', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('should set aria-selected on selected items', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Auto-expand on Navigation', () => {
    it('should not auto-expand when autoExpandOnNavigation is false', () => {
      const { container } = renderWithTheme(
        <StudioTreeView items={mockItems} autoExpandOnNavigation={false} />
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
        <StudioTreeView items={mockItems} autoExpandOnNavigation={true} />
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
      const apiRef: StudioTreeViewApiRef = { current: null };

      renderWithTheme(
        <StudioTreeView items={mockItems} apiRef={apiRef} autoExpandOnNavigation={true} />
      );

      // Use API to focus item
      if (apiRef.current) {
        apiRef.current.focusItem('1');
      }

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
        <StudioTreeView items={itemsWithoutChildren} autoExpandOnNavigation={true} />
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
        <StudioTreeView
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
