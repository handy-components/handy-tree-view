/**
 * @fileoverview usePerformance – Performance Optimization Hook
 *
 * Provides performance optimizations including memoization,
 * debouncing, and virtual scrolling support.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { TreeViewItem } from '../types';
import { TreeViewItemId } from '../HandyTreeView';

/**
 * Props for usePerformance hook
 */
interface UsePerformanceProps {
  /** Items to optimize */
  items: TreeViewItem[];
  /** Whether to enable virtual scrolling */
  enableVirtualScrolling?: boolean;
  /** Virtual scrolling viewport height */
  viewportHeight?: number;
  /** Virtual scrolling item height */
  itemHeight?: number;
  /** Debounce delay for operations */
  debounceDelay?: number;
}

/**
 * usePerformance – Performance Optimization Hook
 *
 * Provides performance optimizations for tree view rendering.
 *
 * @param props - Hook configuration
 * @returns Optimized items and performance utilities
 */
export const usePerformance = (props: UsePerformanceProps) => {
  const {
    items,
    enableVirtualScrolling = false,
    viewportHeight = 400,
    itemHeight = 32,
    debounceDelay = 100,
  } = props;

  // Memoize flattened items for quick access
  const flattenedItems = useMemo(() => {
    const flatten = (
      itemsToFlatten: TreeViewItem[],
      result: TreeViewItem[] = [],
      level: number = 0
    ): TreeViewItem[] => {
      itemsToFlatten.forEach((item) => {
        result.push({ ...item, __level: level } as TreeViewItem & { __level: number });
        if (item.children && item.children.length > 0) {
          flatten(item.children, result, level + 1);
        }
      });
      return result;
    };
    return flatten(items);
  }, [items]);

  // Memoize item map for O(1) lookups
  const itemMap = useMemo(() => {
    const map = new Map<TreeViewItemId, TreeViewItem>();
    const buildMap = (itemsToMap: TreeViewItem[]) => {
      itemsToMap.forEach((item) => {
        map.set(item.id, item);
        if (item.children) {
          buildMap(item.children);
        }
      });
    };
    buildMap(items);
    return map;
  }, [items]);

  // Virtual scrolling calculations
  const virtualScrollState = useMemo(() => {
    if (!enableVirtualScrolling) {
      return {
        visibleItems: flattenedItems,
        startIndex: 0,
        endIndex: flattenedItems.length,
        totalHeight: flattenedItems.length * itemHeight,
      };
    }

    // Calculate visible range (simplified - full implementation would track scroll position)
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const startIndex = 0;
    const endIndex = Math.min(startIndex + visibleCount + 2, flattenedItems.length); // +2 for buffer

    return {
      visibleItems: flattenedItems.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: flattenedItems.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [enableVirtualScrolling, flattenedItems, viewportHeight, itemHeight]);

  // Debounce function
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const debounce = useCallback(
    <T extends (...args: any[]) => any>(fn: T): T => {
      return ((...args: Parameters<T>) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
          fn(...args);
        }, debounceDelay);
      }) as T;
    },
    [debounceDelay]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    flattenedItems,
    itemMap,
    virtualScrollState,
    debounce,
    getItemById: useCallback(
      (id: TreeViewItemId) => itemMap.get(id) || null,
      [itemMap]
    ),
  };
};
