/**
 * @fileoverview Unit Tests for useSelection Hook
 *
 * Comprehensive test suite for selection state management.
 *
 * Initial State:
 *   - should initialize with empty selection when no defaults provided
 *   - should initialize with default selected items (single)
 *   - should initialize with default selected items (array)
 *   - should use controlled selected items when provided
 *
 * isSelected:
 *   - should return true for selected items
 *   - should return false for non-selected items
 *
 * Single Selection Mode:
 *   - should select a single item
 *   - should replace selection when selecting another item
 *   - should clear selection when deselecting
 *   - should call onSelectedItemsChange with single value in single-select mode
 *
 * Multi Selection Mode:
 *   - should select multiple items
 *   - should deselect items without affecting others
 *   - should call onSelectedItemsChange with array in multi-select mode
 *
 * toggleSelection:
 *   - should select a non-selected item
 *   - should deselect a selected item
 *   - should pass event to setSelection
 *
 * clearSelection:
 *   - should clear all selections in single-select mode
 *   - should clear all selections in multi-select mode
 *   - should call onSelectedItemsChange when clearing
 *
 * Selection Propagation - Descendants:
 *   - should select descendants when selecting parent
 *   - should deselect descendants when deselecting parent
 *
 * Selection Propagation - Parents:
 *   - should select parent when all children are selected
 *   - should deselect parent when any child is deselected
 *
 * onItemSelectionToggle:
 *   - should call onItemSelectionToggle when selecting
 *   - should call onItemSelectionToggle when deselecting
 *
 * Controlled Mode:
 *   - should call onSelectedItemsChange but not update internal state
 *
 * updateItems:
 *   - should update items ref for propagation logic
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { useSelection } from '../../src/components/HandyTreeView/hooks/useSelection';
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
    children: [
      { id: '2-1', label: 'Child 2-1' },
      { id: '2-2', label: 'Child 2-2' },
    ],
  },
];

const getItemId = (item: TreeViewItem) => item.id;
const getItemChildren = (item: TreeViewItem) => item.children || [];

describe('useSelection', () => {
  describe('Initial State', () => {
    it('should initialize with empty selection when no defaults provided', () => {
      const { result } = renderHook(() =>
        useSelection({
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should initialize with default selected items (single)', () => {
      const { result } = renderHook(() =>
        useSelection({
          defaultSelectedItems: '1',
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.selectedItems).toEqual(['1']);
    });

    it('should initialize with default selected items (array)', () => {
      const { result } = renderHook(() =>
        useSelection({
          defaultSelectedItems: ['1', '2'],
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.selectedItems).toEqual(['1', '2']);
    });

    it('should use controlled selected items when provided', () => {
      const { result } = renderHook(() =>
        useSelection({
          selectedItems: ['1', '2', '3'],
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.selectedItems).toEqual(['1', '2', '3']);
    });
  });

  describe('isSelected', () => {
    it('should return true for selected items', () => {
      const { result } = renderHook(() =>
        useSelection({
          defaultSelectedItems: ['1', '2'],
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('2')).toBe(true);
    });

    it('should return false for non-selected items', () => {
      const { result } = renderHook(() =>
        useSelection({
          defaultSelectedItems: ['1'],
          getItemId,
          getItemChildren,
        })
      );

      expect(result.current.isSelected('2')).toBe(false);
    });
  });

  describe('Single Selection Mode', () => {
    it('should select a single item', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: false,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('1', true);
      });

      expect(result.current.selectedItems).toEqual(['1']);
    });

    it('should replace selection when selecting another item', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: false,
          defaultSelectedItems: ['1'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('2', true);
      });

      expect(result.current.selectedItems).toEqual(['2']);
      expect(result.current.isSelected('1')).toBe(false);
    });

    it('should clear selection when deselecting', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: false,
          defaultSelectedItems: ['1'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('1', false);
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should call onSelectedItemsChange with single value in single-select mode', () => {
      const onSelectedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: false,
          onSelectedItemsChange,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('1', true);
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith(null, '1');
    });
  });

  describe('Multi Selection Mode', () => {
    it('should select multiple items', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('1', true);
        result.current.setSelection('2', true);
        result.current.setSelection('3', true);
      });

      expect(result.current.selectedItems).toContain('1');
      expect(result.current.selectedItems).toContain('2');
      expect(result.current.selectedItems).toContain('3');
    });

    it('should deselect items without affecting others', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          defaultSelectedItems: ['1', '2', '3'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('2', false);
      });

      expect(result.current.selectedItems).toContain('1');
      expect(result.current.selectedItems).not.toContain('2');
      expect(result.current.selectedItems).toContain('3');
    });

    it('should call onSelectedItemsChange with array in multi-select mode', () => {
      const onSelectedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          onSelectedItemsChange,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('1', true);
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith(null, ['1']);
    });
  });

  describe('toggleSelection', () => {
    it('should select a non-selected item', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.isSelected('1')).toBe(true);
    });

    it('should deselect a selected item', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          defaultSelectedItems: ['1'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.toggleSelection('1');
      });

      expect(result.current.isSelected('1')).toBe(false);
    });

    it('should pass event to setSelection', () => {
      const onItemSelectionToggle = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          onItemSelectionToggle,
          getItemId,
          getItemChildren,
        })
      );

      const mockEvent = {} as React.SyntheticEvent;

      act(() => {
        result.current.toggleSelection('1', mockEvent);
      });

      expect(onItemSelectionToggle).toHaveBeenCalledWith(mockEvent, '1', true);
    });
  });

  describe('clearSelection', () => {
    it('should clear all selections in single-select mode', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: false,
          defaultSelectedItems: ['1'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should clear all selections in multi-select mode', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          defaultSelectedItems: ['1', '2', '3'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedItems).toEqual([]);
    });

    it('should call onSelectedItemsChange when clearing', () => {
      const onSelectedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          defaultSelectedItems: ['1'],
          onSelectedItemsChange,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(onSelectedItemsChange).toHaveBeenCalledWith(null, []);
    });
  });

  describe('Selection Propagation - Descendants', () => {
    it('should select descendants when selecting parent', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          selectionPropagation: { descendants: true },
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.updateItems(mockItems);
        result.current.setSelection('1', true, undefined, mockItems);
      });

      expect(result.current.isSelected('1')).toBe(true);
      expect(result.current.isSelected('1-1')).toBe(true);
      expect(result.current.isSelected('1-2')).toBe(true);
    });

    it('should deselect descendants when deselecting parent', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          selectionPropagation: { descendants: true },
          defaultSelectedItems: ['1', '1-1', '1-2'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.updateItems(mockItems);
        result.current.setSelection('1', false, undefined, mockItems);
      });

      expect(result.current.isSelected('1')).toBe(false);
      expect(result.current.isSelected('1-1')).toBe(false);
      expect(result.current.isSelected('1-2')).toBe(false);
    });
  });

  describe('Selection Propagation - Parents', () => {
    it('should select parent when all children are selected', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          selectionPropagation: { parents: true },
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.updateItems(mockItems);
        result.current.setSelection('1-1', true, undefined, mockItems);
        result.current.setSelection('1-2', true, undefined, mockItems);
      });

      expect(result.current.isSelected('1')).toBe(true);
    });

    it('should deselect parent when any child is deselected', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          selectionPropagation: { parents: true },
          defaultSelectedItems: ['1', '1-1', '1-2'],
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.updateItems(mockItems);
        result.current.setSelection('1-1', false, undefined, mockItems);
      });

      expect(result.current.isSelected('1')).toBe(false);
    });
  });

  describe('onItemSelectionToggle', () => {
    it('should call onItemSelectionToggle when selecting', () => {
      const onItemSelectionToggle = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          onItemSelectionToggle,
          getItemId,
          getItemChildren,
        })
      );

      const mockEvent = {} as React.SyntheticEvent;

      act(() => {
        result.current.setSelection('1', true, mockEvent);
      });

      expect(onItemSelectionToggle).toHaveBeenCalledWith(mockEvent, '1', true);
    });

    it('should call onItemSelectionToggle when deselecting', () => {
      const onItemSelectionToggle = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          defaultSelectedItems: ['1'],
          onItemSelectionToggle,
          getItemId,
          getItemChildren,
        })
      );

      const mockEvent = {} as React.SyntheticEvent;

      act(() => {
        result.current.setSelection('1', false, mockEvent);
      });

      expect(onItemSelectionToggle).toHaveBeenCalledWith(mockEvent, '1', false);
    });
  });

  describe('Controlled Mode', () => {
    it('should call onSelectedItemsChange but not update internal state', () => {
      const onSelectedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useSelection({
          selectedItems: ['1'],
          onSelectedItemsChange,
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.setSelection('2', true);
      });

      expect(onSelectedItemsChange).toHaveBeenCalled();
      expect(result.current.selectedItems).toEqual(['1']);
    });
  });

  describe('updateItems', () => {
    it('should update items ref for propagation logic', () => {
      const { result } = renderHook(() =>
        useSelection({
          multiSelect: true,
          selectionPropagation: { descendants: true },
          getItemId,
          getItemChildren,
        })
      );

      act(() => {
        result.current.updateItems(mockItems);
        result.current.setSelection('1', true, undefined, mockItems);
      });

      expect(result.current.isSelected('1')).toBe(true);
    });
  });
});
