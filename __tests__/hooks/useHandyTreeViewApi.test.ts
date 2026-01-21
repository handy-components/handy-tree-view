/**
 * @fileoverview Unit Tests for useHandyTreeViewApi Hook
 *
 * Comprehensive test suite for programmatic API methods.
 *
 * getItem:
 *   - should return item by ID
 *   - should return null for non-existent item
 *   - should find nested items
 *
 * getItemTree:
 *   - should return all items
 *
 * getParentId:
 *   - should return parent ID for child item
 *   - should return null for root item
 *   - should return null for non-existent item
 *
 * isItemExpanded:
 *   - should return true for expanded items
 *   - should return false for non-expanded items
 *
 * focusItem:
 *   - should call setFocusedItemId
 *
 * setItemExpansion:
 *   - should call setExpanded
 *
 * setItemSelection:
 *   - should call setSelection
 *
 * setEditedItem:
 *   - should call setEditedItemId when provided
 *   - should handle null edited item
 *
 * setIsItemDisabled:
 *   - should call setIsItemDisabled when provided
 *   - should warn when setIsItemDisabled is not provided
 *
 * updateItemChildren:
 *   - should update item children
 *   - should not update if item does not exist
 *
 * updateItemLabel:
 *   - should update item label
 *
 * getItemOrderedChildrenIds:
 *   - should return ordered children IDs
 *   - should return empty array for item with no children
 *   - should return empty array for non-existent item
 *
 * getItemDOMElement:
 *   - should return null when no DOM element is registered
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { useHandyTreeViewApi } from '../../src/components/HandyTreeView/hooks/useHandyTreeViewApi';
import { TreeViewItem } from '../../src/components/HandyTreeView/types';

const mockItems: TreeViewItem[] = [
  {
    id: '1',
    label: 'Parent 1',
    children: [
      { id: '1-1', label: 'Child 1-1' },
      { id: '1-2', label: 'Child 1-2' },
    ],
  },
  {
    id: '2',
    label: 'Parent 2',
  },
];

const getItemId = (item: TreeViewItem) => item.id;
const getItemChildren = (item: TreeViewItem) => item.children || [];
const getItemLabel = (item: TreeViewItem) => item.label;

describe('useHandyTreeViewApi', () => {
  const mockSetFocusedItemId = jest.fn();
  const mockSetExpanded = jest.fn();
  const mockSetSelection = jest.fn();
  const mockSetInternalItems = jest.fn();
  const mockSetEditedItemId = jest.fn();
  const mockSetIsItemDisabled = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return item by ID', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const item = result.current.getItem('1');
      expect(item?.label).toBe('Parent 1');
    });

    it('should return null for non-existent item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const item = result.current.getItem('999');
      expect(item).toBeNull();
    });

    it('should find nested items', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const item = result.current.getItem('1-1');
      expect(item?.label).toBe('Child 1-1');
    });
  });

  describe('getItemTree', () => {
    it('should return all items', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const tree = result.current.getItemTree();
      expect(tree).toEqual(mockItems);
    });
  });

  describe('getParentId', () => {
    it('should return parent ID for child item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const parentId = result.current.getParentId('1-1');
      expect(parentId).toBe('1');
    });

    it('should return null for root item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const parentId = result.current.getParentId('1');
      expect(parentId).toBeNull();
    });

    it('should return null for non-existent item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const parentId = result.current.getParentId('999');
      expect(parentId).toBeNull();
    });
  });

  describe('isItemExpanded', () => {
    it('should return true for expanded items', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      expect(result.current.isItemExpanded('1')).toBe(true);
    });

    it('should return false for non-expanded items', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      expect(result.current.isItemExpanded('2')).toBe(false);
    });
  });

  describe('focusItem', () => {
    it('should call setFocusedItemId', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.focusItem('1');
      });

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1');
    });
  });

  describe('setItemExpansion', () => {
    it('should call setExpanded', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.setItemExpansion('1', true);
      });

      expect(mockSetExpanded).toHaveBeenCalledWith('1', true);
    });
  });

  describe('setItemSelection', () => {
    it('should call setSelection', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.setItemSelection('1', true);
      });

      expect(mockSetSelection).toHaveBeenCalledWith('1', true);
    });
  });

  describe('setEditedItem', () => {
    it('should call setEditedItemId when provided', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
          setEditedItemId: mockSetEditedItemId,
        })
      );

      act(() => {
        result.current.setEditedItem('1');
      });

      expect(mockSetEditedItemId).toHaveBeenCalledWith('1');
    });

    it('should handle null edited item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
          setEditedItemId: mockSetEditedItemId,
        })
      );

      act(() => {
        result.current.setEditedItem(null);
      });

      expect(mockSetEditedItemId).toHaveBeenCalledWith(null);
    });
  });

  describe('setIsItemDisabled', () => {
    it('should call setIsItemDisabled when provided', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
          setIsItemDisabled: mockSetIsItemDisabled,
        })
      );

      act(() => {
        result.current.setIsItemDisabled('1', true);
      });

      expect(mockSetIsItemDisabled).toHaveBeenCalledWith('1', true);
    });

    it('should warn when setIsItemDisabled is not provided', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.setIsItemDisabled('1', true);
      });

      expect(consoleSpy).toHaveBeenCalledWith('setIsItemDisabled callback not provided');
      consoleSpy.mockRestore();
    });
  });

  describe('updateItemChildren', () => {
    it('should update item children', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const newChildren: TreeViewItem[] = [{ id: '1-3', label: 'Child 1-3' }];

      act(() => {
        result.current.updateItemChildren('1', newChildren);
      });

      expect(mockSetInternalItems).toHaveBeenCalled();
      const callArgs = mockSetInternalItems.mock.calls[0][0];
      const updatedItem = callArgs.find((item: TreeViewItem) => item.id === '1');
      expect(updatedItem?.children).toEqual(newChildren);
    });

    it('should not update if item does not exist', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.updateItemChildren('999', []);
      });

      expect(mockSetInternalItems).not.toHaveBeenCalled();
    });
  });

  describe('updateItemLabel', () => {
    it('should update item label', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      act(() => {
        result.current.updateItemLabel('1', 'Updated Label');
      });

      expect(mockSetInternalItems).toHaveBeenCalled();
      const callArgs = mockSetInternalItems.mock.calls[0][0];
      const updatedItem = callArgs.find((item: TreeViewItem) => item.id === '1');
      expect(updatedItem?.label).toBe('Updated Label');
    });
  });

  describe('getItemOrderedChildrenIds', () => {
    it('should return ordered children IDs', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const childrenIds = result.current.getItemOrderedChildrenIds('1');
      expect(childrenIds).toEqual(['1-1', '1-2']);
    });

    it('should return empty array for item with no children', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const childrenIds = result.current.getItemOrderedChildrenIds('2');
      expect(childrenIds).toEqual([]);
    });

    it('should return empty array for non-existent item', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const childrenIds = result.current.getItemOrderedChildrenIds('999');
      expect(childrenIds).toEqual([]);
    });
  });

  describe('getItemDOMElement', () => {
    it('should return null when no DOM element is registered', () => {
      const { result } = renderHook(() =>
        useHandyTreeViewApi({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          getItemLabel,
          setInternalItems: mockSetInternalItems,
        })
      );

      const element = result.current.getItemDOMElement('1');
      expect(element).toBeNull();
    });
  });
});
