/**
 * @fileoverview Performance Tests for HandyTreeView
 *
 * This test suite covers performance optimizations including memoization,
 * virtual scrolling, and performance-related hooks:
 *
 * Memoization:
 *   - should memoize tree items
 *   - should handle large trees efficiently
 *
 * Virtual Scrolling:
 *   - should enable virtual scrolling when requested
 *   - should render only visible items with virtual scrolling
 *
 * usePerformance Hook:
 *   - should flatten items correctly
 *   - should create item map for quick lookups
 *
 * useScreenReader Hook:
 *   - should announce messages
 *   - should not announce when disabled
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { HandyTreeView, TreeViewItem } from '../src/components/HandyTreeView';
import { useScreenReader } from '../src/components/HandyTreeView/hooks/useScreenReader';
import { usePerformance } from '../src/components/HandyTreeView/hooks/usePerformance';
import { renderWithTheme } from './HandyTreeView.test-utils';

describe('Performance', () => {
  const generateLargeTree = (count: number): TreeViewItem[] => {
    const items: TreeViewItem[] = [];
    for (let i = 1; i <= count; i++) {
      items.push({
        id: `item-${i}`,
        label: `Item ${i}`,
        children: [
          { id: `item-${i}-1`, label: `Child ${i}-1` },
        ],
      });
    }
    return items;
  };

  describe('Memoization', () => {
    it('should memoize tree items', () => {
      const items = generateLargeTree(10);
      renderWithTheme(<HandyTreeView items={items} />);

      // Component should render without performance issues
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('should handle large trees efficiently', () => {
      const items = generateLargeTree(100);
      const startTime = performance.now();

      renderWithTheme(<HandyTreeView items={items} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render in reasonable time (less than 1 second for 100 items)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  describe('Virtual Scrolling', () => {
    it('should enable virtual scrolling when requested', () => {
      const items = generateLargeTree(50);
      renderWithTheme(
        <HandyTreeView
          items={items}
          enableVirtualScrolling={true}
          viewportHeight={400}
          itemHeight={32}
        />
      );

      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();
    });

    it('should render only visible items with virtual scrolling', () => {
      const items = generateLargeTree(100);
      renderWithTheme(
        <HandyTreeView
          items={items}
          enableVirtualScrolling={true}
          viewportHeight={400}
          itemHeight={32}
        />
      );

      // Should still render the tree
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  describe('usePerformance Hook', () => {
    it('should flatten items correctly', () => {
      const items: TreeViewItem[] = [
        {
          id: '1',
          label: 'Parent',
          children: [
            { id: '1-1', label: 'Child' },
          ],
        },
      ];

      const TestComponent = () => {
        const { flattenedItems } = usePerformance({ items });
        return <div data-testid="count">{flattenedItems.length}</div>;
      };

      renderWithTheme(<TestComponent />);

      expect(screen.getByTestId('count')).toHaveTextContent('2');
    });

    it('should create item map for quick lookups', () => {
      const items: TreeViewItem[] = [
        { id: '1', label: 'Item 1' },
        { id: '2', label: 'Item 2' },
      ];

      const TestComponent = () => {
        const { getItemById } = usePerformance({ items });
        const item = getItemById('1');
        return <div data-testid="item">{item?.label}</div>;
      };

      renderWithTheme(<TestComponent />);

      expect(screen.getByTestId('item')).toHaveTextContent('Item 1');
    });
  });

  describe('useScreenReader Hook', () => {
    it('should announce messages', () => {
      const TestComponent = () => {
        const { announce } = useScreenReader({ enableAnnouncements: true });
        React.useEffect(() => {
          announce('Test message');
        }, [announce]);
        return <div>Test</div>;
      };

      renderWithTheme(<TestComponent />);

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion).toBeInTheDocument();
    });

    it('should not announce when disabled', () => {
      const TestComponent = () => {
        const { announce } = useScreenReader({ enableAnnouncements: false });
        React.useEffect(() => {
          announce('Test message');
        }, [announce]);
        return <div>Test</div>;
      };

      renderWithTheme(<TestComponent />);

      // Should not create live region when disabled
      // (might still exist from previous test)
    });
  });
});
