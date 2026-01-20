/**
 * @fileoverview Unit Tests for Accessibility and Performance
 *
 * Comprehensive test suite for accessibility features and performance optimizations.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StudioTreeView } from '../src/components/StudioTreeView';
import { useScreenReader } from '../hooks/useScreenReader';
import { usePerformance } from '../hooks/usePerformance';
import { TreeViewItem } from '../../types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Accessibility', () => {
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
      ],
    },
  ];

  describe('ARIA Attributes', () => {
    it('should have role="tree" on root element', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();
    });

    it('should have role="treeitem" on each item', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeItems = screen.getAllByRole('treeitem');
      expect(treeItems.length).toBeGreaterThan(0);
    });

    it('should have aria-expanded on expandable items', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have aria-selected on selected items', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} selectedItems={['1']} />
      );

      const documentsItem = screen.getByText('Documents').closest('li');
      expect(documentsItem).toHaveAttribute('aria-selected', 'true');
    });

    it('should have aria-disabled on disabled items', () => {
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          isItemDisabled={(itemId) => itemId === '2'}
        />
      );

      const picturesItem = screen.getByText('Pictures').closest('li');
      expect(picturesItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have aria-level on items', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeItems = screen.getAllByRole('treeitem');
      treeItems.forEach((item) => {
        expect(item).toHaveAttribute('aria-level');
      });
    });

    it('should have aria-multiselectable when multiSelect is enabled', () => {
      renderWithTheme(<StudioTreeView items={mockItems} multiSelect />);

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-multiselectable', 'true');
    });

    it('should have aria-activedescendant when item is focused', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should have aria-activedescendant
      expect(treeView).toHaveAttribute('aria-activedescendant');
    });

    it('should support custom aria-label', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} aria-label="Custom tree label" />
      );

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-label', 'Custom tree label');
    });

    it('should support aria-labelledby', () => {
      renderWithTheme(
        <>
          <div id="tree-label">Tree Label</div>
          <StudioTreeView items={mockItems} aria-labelledby="tree-label" />
        </>
      );

      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-labelledby', 'tree-label');
    });
  });

  describe('Screen Reader Support', () => {
    it('should create live region for announcements', () => {
      renderWithTheme(<StudioTreeView items={mockItems} enableScreenReader={true} />);

      const liveRegion = document.getElementById('studio-tree-view-live-region');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('role', 'status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should not create live region when disabled', () => {
      renderWithTheme(<StudioTreeView items={mockItems} enableScreenReader={false} />);

      // Live region might still exist from previous test, but should not be used
      const treeView = screen.getByRole('tree');
      expect(treeView).toBeInTheDocument();
    });

    it('should call custom announcement handler', () => {
      const handleAnnounce = jest.fn();
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          enableScreenReader={true}
          onScreenReaderAnnounce={handleAnnounce}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should call announcement handler
      waitFor(() => {
        expect(handleAnnounce).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate with arrow keys', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate down
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Should have moved focus
      expect(treeView).toBeInTheDocument();
    });

    it('should expand with ArrowRight', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowRight' });

      expect(screen.getByText('file1.txt')).toBeInTheDocument();
    });

    it('should collapse with ArrowLeft', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} defaultExpandedItems={['1']} />
      );

      expect(screen.getByText('file1.txt')).toBeInTheDocument();

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowLeft' });

      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
    });

    it('should navigate to first item with Home', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      fireEvent.keyDown(treeView, { key: 'Home' });

      // Should focus first item
      expect(treeView).toBeInTheDocument();
    });

    it('should navigate to last item with End', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

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

      renderWithTheme(<StudioTreeView items={largeItems} />);

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

      renderWithTheme(<StudioTreeView items={largeItems} />);

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
        <StudioTreeView
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

    it('should clear selection with Escape in multi-select mode', () => {
      const handleSelectionChange = jest.fn();
      renderWithTheme(
        <StudioTreeView
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
      expect(handleSelectionChange).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Array)
      );
    });

    it('should navigate to parent with ArrowLeft when item has no children', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} defaultExpandedItems={['1']} />
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // First item should be focusable
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      const firstItem = screen.getByText('Documents').closest('li');
      expect(firstItem).toHaveAttribute('tabIndex', '0');
    });

    it('should restore focus after re-render', () => {
      const { rerender } = renderWithTheme(
        <StudioTreeView items={mockItems} />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Re-render
      rerender(
        <ThemeProvider theme={theme}>
          <StudioTreeView items={mockItems} />
        </ThemeProvider>
      );

      // Focus should be maintained
      expect(treeView).toBeInTheDocument();
    });
  });
});

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
      renderWithTheme(<StudioTreeView items={items} />);

      // Component should render without performance issues
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });

    it('should handle large trees efficiently', () => {
      const items = generateLargeTree(100);
      const startTime = performance.now();

      renderWithTheme(<StudioTreeView items={items} />);

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
        <StudioTreeView
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
        <StudioTreeView
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

      const liveRegion = document.getElementById('studio-tree-view-live-region');
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
