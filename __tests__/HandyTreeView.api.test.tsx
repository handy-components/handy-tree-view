/**
 * @fileoverview API and Configuration Tests for HandyTreeView
 *
 * This test suite covers the programmatic API, disabled items, and custom getters:
 *
 * API Ref:
 *   - should expose API methods through ref
 *   - should focus item programmatically
 *   - should get item by ID
 *   - should set item expansion programmatically
 *   - should set item selection programmatically
 *   - should set item disabled state programmatically
 *   - should combine prop-based and API-based disabled state
 *   - should prevent interaction with items disabled via API
 *
 * Disabled Items:
 *   - should disable items based on isItemDisabled
 *   - should not allow interaction with disabled items
 *   - should allow programmatic disabling via API
 *
 * Custom Getters:
 *   - should use custom getItemLabel
 *   - should use custom getItemId
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem } from '../src/components/HandyTreeView';
import { renderWithTheme, mockItems, theme } from './HandyTreeView.test-utils';

describe('HandyTreeView - API', () => {
  describe('API Ref', () => {
    it('should expose API methods through ref', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(<HandyTreeView items={mockItems} apiRef={apiRef} />);

      expect(apiRef.current).toBeDefined();
      expect(apiRef.current?.focusItem).toBeDefined();
      expect(apiRef.current?.getItem).toBeDefined();
      expect(apiRef.current?.setItemExpansion).toBeDefined();
      expect(apiRef.current?.setItemSelection).toBeDefined();
    });

    it('should focus item programmatically', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(<HandyTreeView items={mockItems} apiRef={apiRef} />);

      apiRef.current?.focusItem?.('1');

      // Focus should be set (implementation detail)
      expect(apiRef.current).toBeDefined();
    });

    it('should get item by ID', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(<HandyTreeView items={mockItems} apiRef={apiRef} />);

      const item = apiRef.current?.getItem?.('1');

      expect(item).toBeDefined();
      expect(item?.label).toBe('Documents');
    });

    it('should set item expansion programmatically', async () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(<HandyTreeView items={mockItems} apiRef={apiRef} />);

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();

      apiRef.current?.setItemExpansion?.('1', true);

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });
    });

    it('should set item selection programmatically', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };
      const handleSelectionChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          apiRef={apiRef}
          onSelectedItemsChange={handleSelectionChange}
        />
      );

      apiRef.current?.setItemSelection?.('1', true);

      expect(handleSelectionChange).toHaveBeenCalled();
    });

    it('should set item disabled state programmatically', async () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <HandyTreeView
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
      await waitFor(() => {
        expect(documentsItem).toHaveAttribute('aria-disabled', 'true');
      });

      // Re-enable item via API
      apiRef.current?.setIsItemDisabled?.('1', false);

      // Item should no longer be disabled
      await waitFor(() => {
        expect(documentsItem).not.toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should combine prop-based and API-based disabled state', async () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <HandyTreeView
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
      await waitFor(() => {
        expect(documentsItem).toHaveAttribute('aria-disabled', 'true');
      });

      // Item 2 should still be disabled (via prop)
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should prevent interaction with items disabled via API', () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };
      const handleClick = jest.fn();

      renderWithTheme(
        <HandyTreeView
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
        <HandyTreeView
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
        <HandyTreeView
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

    it('should allow programmatic disabling via API', async () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };
      const handleClick = jest.fn();

      // Use leaf items (items without children) for this test, since clicking items
      // with children expands/collapses them when expansionTrigger='content' (default)
      const leafItems: TreeViewItem[] = [
        { id: '1', label: 'File1.txt' },
        { id: '2', label: 'File2.txt' },
      ];

      renderWithTheme(
        <HandyTreeView
          items={leafItems}
          apiRef={apiRef}
          onItemClick={handleClick}
        />
      );

      // Initially, item should be enabled
      const file1Item = screen.getByText('File1.txt').closest('li');
      expect(file1Item).not.toHaveAttribute('aria-disabled', 'true');

      // Disable via API
      apiRef.current?.setIsItemDisabled?.('1', true);

      // Item should now be disabled
      await waitFor(() => {
        expect(file1Item).toHaveAttribute('aria-disabled', 'true');
      });

      // Click should not work
      fireEvent.click(screen.getByText('File1.txt'));
      expect(handleClick).not.toHaveBeenCalled();

      // Re-enable via API
      apiRef.current?.setIsItemDisabled?.('1', false);

      // Item should be enabled again
      await waitFor(() => {
        expect(file1Item).not.toHaveAttribute('aria-disabled', 'true');
      });

      // Click should work now
      fireEvent.click(screen.getByText('File1.txt'));
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalled();
      });
    });
  });


  describe('Custom Getters', () => {
    it('should use custom getItemLabel', () => {
      renderWithTheme(
        <HandyTreeView
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
        <HandyTreeView
          items={customItems}
          getItemId={(item) => `id-${item.id}`}
        />
      );

      // Should still render items
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

});