/**
 * @fileoverview Unit Tests for usePerformance Hook
 *
 * Comprehensive test suite for performance optimization utilities.
 *
 * flattenedItems:
 *   - should flatten tree items into a flat list
 *   - should include level information in flattened items
 *   - should update when items change
 *
 * itemMap:
 *   - should create a map of all items by ID
 *   - should allow O(1) lookup of items
 *   - should update map when items change
 *
 * getItemById:
 *   - should return item by ID
 *   - should return null for non-existent item
 *
 * Virtual Scrolling:
 *   - should return all items when virtual scrolling is disabled
 *   - should calculate visible items when virtual scrolling is enabled
 *   - should calculate total height correctly
 *   - should include offsetY when virtual scrolling is enabled
 *
 * debounce:
 *   - should debounce function calls
 *   - should use custom debounce delay
 *   - should pass arguments to debounced function
 *   - should cleanup debounce timer on unmount
 *
 * Edge Cases:
 *   - should handle empty items array
 *   - should handle items with no children
 *   - should handle deeply nested items
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { usePerformance } from '../../src/components/HandyTreeView/hooks/usePerformance';
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

describe('usePerformance', () => {
  describe('flattenedItems', () => {
    it('should flatten tree items into a flat list', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      expect(result.current.flattenedItems).toHaveLength(4); // 2 parents + 2 children
      expect(result.current.flattenedItems.map((item) => item.id)).toEqual([
        '1',
        '1-1',
        '1-2',
        '2',
      ]);
    });

    it('should include level information in flattened items', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      const item1 = result.current.flattenedItems.find((item) => item.id === '1');
      const item1_1 = result.current.flattenedItems.find((item) => item.id === '1-1');

      expect((item1 as any).__level).toBe(0);
      expect((item1_1 as any).__level).toBe(1);
    });

    it('should update when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePerformance({ items }),
        { initialProps: { items: mockItems } }
      );

      expect(result.current.flattenedItems).toHaveLength(4);

      const newItems: TreeViewItem[] = [{ id: '3', label: 'New Item' }];
      rerender({ items: newItems });

      expect(result.current.flattenedItems).toHaveLength(1);
      expect(result.current.flattenedItems[0].id).toBe('3');
    });
  });

  describe('itemMap', () => {
    it('should create a map of all items by ID', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      expect(result.current.itemMap.get('1')).toBeDefined();
      expect(result.current.itemMap.get('1-1')).toBeDefined();
      expect(result.current.itemMap.get('1-2')).toBeDefined();
      expect(result.current.itemMap.get('2')).toBeDefined();
    });

    it('should allow O(1) lookup of items', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      const item = result.current.itemMap.get('1-1');
      expect(item?.label).toBe('Child 1-1');
    });

    it('should update map when items change', () => {
      const { result, rerender } = renderHook(
        ({ items }) => usePerformance({ items }),
        { initialProps: { items: mockItems } }
      );

      expect(result.current.itemMap.get('1')).toBeDefined();

      const newItems: TreeViewItem[] = [{ id: '3', label: 'New Item' }];
      rerender({ items: newItems });

      expect(result.current.itemMap.get('1')).toBeUndefined();
      expect(result.current.itemMap.get('3')).toBeDefined();
    });
  });

  describe('getItemById', () => {
    it('should return item by ID', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      const item = result.current.getItemById('1-1');
      expect(item?.label).toBe('Child 1-1');
    });

    it('should return null for non-existent item', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: mockItems })
      );

      const item = result.current.getItemById('999');
      expect(item).toBeNull();
    });
  });

  describe('Virtual Scrolling', () => {
    it('should return all items when virtual scrolling is disabled', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          enableVirtualScrolling: false,
        })
      );

      expect(result.current.virtualScrollState.visibleItems).toHaveLength(4);
      expect(result.current.virtualScrollState.startIndex).toBe(0);
      expect(result.current.virtualScrollState.endIndex).toBe(4);
    });

    it('should calculate visible items when virtual scrolling is enabled', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          enableVirtualScrolling: true,
          viewportHeight: 100,
          itemHeight: 32,
        })
      );

      // Should show approximately 3 items (100 / 32 = 3.125) + 2 buffer = 5
      expect(result.current.virtualScrollState.visibleItems.length).toBeLessThanOrEqual(5);
      expect(result.current.virtualScrollState.startIndex).toBe(0);
    });

    it('should calculate total height correctly', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          enableVirtualScrolling: true,
          itemHeight: 32,
        })
      );

      // 4 items * 32 = 128
      expect(result.current.virtualScrollState.totalHeight).toBe(128);
    });

    it('should include offsetY when virtual scrolling is enabled', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          enableVirtualScrolling: true,
          itemHeight: 32,
        })
      );

      expect(result.current.virtualScrollState.offsetY).toBeDefined();
      expect(result.current.virtualScrollState.offsetY).toBe(0);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('should debounce function calls', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          debounceDelay: 100,
        })
      );

      const mockFn = jest.fn();
      const debouncedFn = result.current.debounce(mockFn);

      act(() => {
        debouncedFn();
        debouncedFn();
        debouncedFn();
      });

      expect(mockFn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should use custom debounce delay', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          debounceDelay: 200,
        })
      );

      const mockFn = jest.fn();
      const debouncedFn = result.current.debounce(mockFn);

      act(() => {
        debouncedFn();
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', () => {
      const { result } = renderHook(() =>
        usePerformance({
          items: mockItems,
          debounceDelay: 100,
        })
      );

      const mockFn = jest.fn();
      const debouncedFn = result.current.debounce(mockFn);

      act(() => {
        debouncedFn('arg1', 'arg2');
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('should cleanup debounce timer on unmount', () => {
      const { result, unmount } = renderHook(() =>
        usePerformance({
          items: mockItems,
          debounceDelay: 100,
        })
      );

      const mockFn = jest.fn();
      const debouncedFn = result.current.debounce(mockFn);

      act(() => {
        debouncedFn();
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Function should not be called after unmount
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const { result } = renderHook(() =>
        usePerformance({ items: [] })
      );

      expect(result.current.flattenedItems).toEqual([]);
      expect(result.current.itemMap.size).toBe(0);
    });

    it('should handle items with no children', () => {
      const items: TreeViewItem[] = [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
      ];

      const { result } = renderHook(() =>
        usePerformance({ items })
      );

      expect(result.current.flattenedItems).toHaveLength(2);
      expect(result.current.itemMap.size).toBe(2);
    });

    it('should handle deeply nested items', () => {
      const deepItems: TreeViewItem[] = [
        {
          id: '1',
          label: 'Level 1',
          children: [
            {
              id: '1-1',
              label: 'Level 2',
              children: [
                {
                  id: '1-1-1',
                  label: 'Level 3',
                  children: [{ id: '1-1-1-1', label: 'Level 4' }],
                },
              ],
            },
          ],
        },
      ];

      const { result } = renderHook(() =>
        usePerformance({ items: deepItems })
      );

      expect(result.current.flattenedItems).toHaveLength(4);
      expect(result.current.getItemById('1-1-1-1')).toBeDefined();
    });
  });
});
