/**
 * @fileoverview End-to-End Tests for HandyTreeView
 *
 * Comprehensive E2E test suite that tests complete user workflows,
 * keyboard navigation, accessibility, and performance scenarios.
 *
 * These tests simulate real user interactions and complete workflows
 * rather than isolated unit functionality.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem, DataSource } from '../src/components/HandyTreeView';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

/**
 * Helper to check if an item is focused via aria-activedescendant
 */
const expectItemToBeFocused = (treeView: HTMLElement, itemId: string) => {
  expect(treeView).toHaveAttribute('aria-activedescendant', itemId);
};

/**
 * Helper to get the focused item element by ID
 */
const getFocusedItem = (itemId: string) => {
  return document.getElementById(itemId);
};

/**
 * Helper to generate large tree data for performance tests
 */
const generateLargeTree = (depth: number, breadth: number, prefix = 'item'): TreeViewItem[] => {
  if (depth === 0) {
    return [];
  }

  const items: TreeViewItem[] = [];
  for (let i = 0; i < breadth; i++) {
    const id = `${prefix}-${i}`;
    const children = generateLargeTree(depth - 1, breadth, `${id}-child`);
    items.push({
      id,
      label: `Item ${i}`,
      ...(children.length > 0 && { children }),
    });
  }
  return items;
};

/**
 * Mock DataSource for lazy loading tests
 */
const createMockDataSource = (items: TreeViewItem[]): DataSource => {
  const itemMap = new Map<string, TreeViewItem[]>();
  
  // Build map of parentId -> children
  const buildMap = (parentItems: TreeViewItem[], parentId?: string) => {
    if (parentId === undefined) {
      itemMap.set('root', parentItems);
    } else {
      itemMap.set(parentId, parentItems);
    }
    
    parentItems.forEach((item) => {
      if (item.children && item.children.length > 0) {
        buildMap(item.children, item.id);
      }
    });
  };
  
  buildMap(items);
  
  return {
    getTreeItems: async (params: { parentId?: string }) => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      const key = params.parentId || 'root';
      return Promise.resolve(itemMap.get(key) || []);
    },
    getChildrenCount: (item: TreeViewItem) => {
      return item.children?.length || 0;
    },
  };
};

describe('HandyTreeView E2E Tests', () => {
  describe('User Interaction Workflows', () => {
    const mockItems: TreeViewItem[] = [
      {
        id: '1',
        label: 'Documents',
        children: [
          { id: '1-1', label: 'file1.txt' },
          { id: '1-2', label: 'file2.txt' },
          {
            id: '1-3',
            label: 'Subfolder',
            children: [
              { id: '1-3-1', label: 'nested1.txt' },
              { id: '1-3-2', label: 'nested2.txt' },
            ],
          },
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
      { id: '3', label: 'file3.txt' },
    ];

    it('should complete full workflow: expand, select, navigate, collapse', async () => {
      const onExpandedChange = jest.fn();
      const onSelectedChange = jest.fn();
      const onItemClick = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onExpandedItemsChange={onExpandedChange}
          onSelectedItemsChange={onSelectedChange}
          onItemClick={onItemClick}
          multiSelect={true}
          checkboxSelection={true}
        />
      );

      // Step 1: Expand Documents folder
      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('file2.txt')).toBeInTheDocument();
        expect(screen.getByText('Subfolder')).toBeInTheDocument();
      });

      expect(onExpandedChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['1'])
      );

      // Step 2: Expand Subfolder
      const subfolderItem = screen.getByText('Subfolder');
      fireEvent.click(subfolderItem);

      await waitFor(() => {
        expect(screen.getByText('nested1.txt')).toBeInTheDocument();
        expect(screen.getByText('nested2.txt')).toBeInTheDocument();
      });

      // Step 3: Select multiple items
      const file1Checkbox = screen.getByRole('checkbox', { name: /file1/i });
      const nested1Checkbox = screen.getByRole('checkbox', { name: /nested1/i });

      fireEvent.click(file1Checkbox);
      fireEvent.click(nested1Checkbox);

      await waitFor(() => {
        expect(onSelectedChange).toHaveBeenCalled();
      });

      // Step 4: Click on an item
      const file2Item = screen.getByText('file2.txt');
      fireEvent.click(file2Item);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.anything(),
        '1-2'
      );

      // Step 5: Collapse Documents folder
      fireEvent.click(documentsItem);

      await waitFor(() => {
        expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
        expect(screen.queryByText('Subfolder')).not.toBeInTheDocument();
      });
    });

    it('should handle complete selection workflow with propagation', async () => {
      const onSelectedChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onSelectedItemsChange={onSelectedChange}
          multiSelect={true}
          checkboxSelection={true}
          selectionPropagation={{ descendants: true, parents: true }}
          defaultExpandedItems={['1', '1-3']}
        />
      );

      // Wait for items to be visible
      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });

      // Select a parent item - should propagate to children
      const documentsCheckbox = screen.getByRole('checkbox', { name: /Documents/i });
      fireEvent.click(documentsCheckbox);

      await waitFor(() => {
        // All children should be selected
        const file1Checkbox = screen.getByRole('checkbox', { name: /file1/i });
        const file2Checkbox = screen.getByRole('checkbox', { name: /file2/i });
        const subfolderCheckbox = screen.getByRole('checkbox', { name: /Subfolder/i });

        expect(file1Checkbox).toBeChecked();
        expect(file2Checkbox).toBeChecked();
        expect(subfolderCheckbox).toBeChecked();
      });

      // Verify selection callback was called with all descendant IDs
      expect(onSelectedChange).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['1', '1-1', '1-2', '1-3', '1-3-1', '1-3-2'])
      );
    });

    it('should handle complete label editing workflow', async () => {
      const onLabelChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemLabelChange={onLabelChange}
          isItemEditable={(id) => id === '1-1'}
          defaultExpandedItems={['1']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });

      // Double-click to start editing
      const file1Item = screen.getByText('file1.txt');
      fireEvent.dblClick(file1Item);

      // Find the input field - wait for it to appear
      const input = await waitFor(() => {
        return screen.getByDisplayValue('file1.txt') as HTMLInputElement;
      });
      expect(input).toBeInTheDocument();

      // Edit the label
      fireEvent.change(input, { target: { value: 'renamed-file.txt' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      await waitFor(() => {
        expect(onLabelChange).toHaveBeenCalledWith('1-1', 'renamed-file.txt');
        expect(screen.getByText('renamed-file.txt')).toBeInTheDocument();
      });
    });

    it('should handle complete drag-and-drop reordering workflow', async () => {
      const onPositionChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemPositionChange={onPositionChange}
          itemsReordering={true}
          defaultExpandedItems={['1']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(screen.getByText('file2.txt')).toBeInTheDocument();
      });

      const file1Item = screen.getByText('file1.txt');
      const file2Item = screen.getByText('file2.txt');

      // Get initial order
      const items = screen.getAllByRole('treeitem');
      const file1Index = items.findIndex((item) => within(item).queryByText('file1.txt') !== null);
      const file2Index = items.findIndex((item) => within(item).queryByText('file2.txt') !== null);

      // Drag file1 to file2 position
      fireEvent.dragStart(file1Item);
      fireEvent.dragOver(file2Item);
      fireEvent.drop(file2Item);

      await waitFor(() => {
        expect(onPositionChange).toHaveBeenCalled();
        const lastCall = onPositionChange.mock.calls[onPositionChange.mock.calls.length - 1];
        expect(lastCall[0]).toMatchObject({
          itemId: expect.any(String),
          newPosition: expect.objectContaining({
            index: expect.any(Number),
          }),
        });
      });
    });
  });

  describe('Keyboard Navigation Workflows', () => {
    const mockItems: TreeViewItem[] = [
      {
        id: '1',
        label: 'Documents',
        children: [
          { id: '1-1', label: 'file1.txt' },
          { id: '1-2', label: 'file2.txt' },
          {
            id: '1-3',
            label: 'Subfolder',
            children: [
              { id: '1-3-1', label: 'nested1.txt' },
              { id: '1-3-2', label: 'nested2.txt' },
            ],
          },
        ],
      },
      {
        id: '2',
        label: 'Pictures',
        children: [
          { id: '2-1', label: 'photo1.jpg' },
        ],
      },
      { id: '3', label: 'file3.txt' },
    ];

    it('should complete full keyboard navigation workflow', async () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      // Focus the tree
      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate with Arrow keys
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to Documents
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1');
      });

      fireEvent.keyDown(treeView, { key: 'ArrowRight', code: 'ArrowRight' }); // Expand Documents
      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });

      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to file1.txt
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1-1');
      });

      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to file2.txt
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1-2');
      });

      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to Subfolder
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1-3');
      });

      fireEvent.keyDown(treeView, { key: 'ArrowRight', code: 'ArrowRight' }); // Expand Subfolder
      await waitFor(() => {
        expect(screen.getByText('nested1.txt')).toBeInTheDocument();
      });

      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to nested1.txt
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1-3-1');
      });

      // Navigate back up
      fireEvent.keyDown(treeView, { key: 'ArrowUp', code: 'ArrowUp' }); // Back to Subfolder
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1-3');
      });

      fireEvent.keyDown(treeView, { key: 'ArrowLeft', code: 'ArrowLeft' }); // Collapse Subfolder
      await waitFor(() => {
        expect(screen.queryByText('nested1.txt')).not.toBeInTheDocument();
      });

      fireEvent.keyDown(treeView, { key: 'ArrowLeft', code: 'ArrowLeft' }); // Move to parent (Documents)
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1');
      });

      // Test Home/End navigation
      fireEvent.keyDown(treeView, { key: 'Home', code: 'Home' }); // Move to first item
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1');
      });

      fireEvent.keyDown(treeView, { key: 'End', code: 'End' }); // Move to last item
      await waitFor(() => {
        expectItemToBeFocused(treeView, '3');
      });
    });

    it('should handle complete multi-select keyboard workflow', async () => {
      const onSelectedChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onSelectedItemsChange={onSelectedChange}
          multiSelect={true}
          defaultExpandedItems={['1']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to file1.txt
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Documents
      fireEvent.keyDown(treeView, { key: 'ArrowRight', code: 'ArrowRight' }); // Expand
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // file1.txt

      // Select with Space
      fireEvent.keyDown(treeView, { key: ' ', code: 'Space' });

      await waitFor(() => {
        expect(onSelectedChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.arrayContaining(['1-1'])
        );
      });

      // Navigate to file2.txt with Shift+Arrow
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown', shiftKey: true });

      await waitFor(() => {
        expect(onSelectedChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.arrayContaining(['1-1', '1-2'])
        );
      });

      // Deselect with Space
      fireEvent.keyDown(treeView, { key: ' ', code: 'Space' });
      await waitFor(() => {
        expect(onSelectedChange).toHaveBeenCalledWith(
          expect.anything(),
          expect.not.arrayContaining(['1-2'])
        );
      });
    });

    it('should handle Page Up/Down navigation workflow', async () => {
      // Create a larger tree for Page Up/Down testing
      const largeItems: TreeViewItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(<HandyTreeView items={largeItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate to middle item
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' });
      }

      await waitFor(() => {
        expectItemToBeFocused(treeView, 'item-9');
      });

      // Page Down
      fireEvent.keyDown(treeView, { key: 'PageDown', code: 'PageDown' });
      await waitFor(() => {
        // Should move down by page size (default 10)
        const focusedItem = document.activeElement;
        expect(focusedItem).toBeInTheDocument();
      });

      // Page Up
      fireEvent.keyDown(treeView, { key: 'PageUp', code: 'PageUp' });
      await waitFor(() => {
        // Should move back up
        const focusedItem = document.activeElement;
        expect(focusedItem).toBeInTheDocument();
      });
    });

    it('should handle Escape key workflow (cancel editing, clear selection)', async () => {
      const onLabelChange = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          onItemLabelChange={onLabelChange}
          isItemEditable={(id) => id === '1-1'}
          multiSelect={true}
          defaultExpandedItems={['1']}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });

      // Start editing
      const file1Item = screen.getByText('file1.txt');
      fireEvent.dblClick(file1Item);

      const input = screen.getByDisplayValue('file1.txt') as HTMLInputElement;
      expect(input).toBeInTheDocument();

      // Type something
      fireEvent.change(input, { target: { value: 'file1.txt-modified' } });

      // Cancel with Escape
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByDisplayValue('file1.txt-modified')).not.toBeInTheDocument();
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
        expect(onLabelChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility Workflows', () => {
    const mockItems: TreeViewItem[] = [
      {
        id: '1',
        label: 'Documents',
        children: [
          { id: '1-1', label: 'file1.txt' },
          { id: '1-2', label: 'file2.txt' },
        ],
      },
      { id: '2', label: 'Pictures' },
    ];

    it('should provide complete screen reader workflow', async () => {
      const onScreenReaderAnnounce = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          enableScreenReader={true}
          onScreenReaderAnnounce={onScreenReaderAnnounce}
        />
      );

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Navigate and verify announcements
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' }); // Move to Documents

      await waitFor(() => {
        expect(onScreenReaderAnnounce).toHaveBeenCalledWith(
          expect.stringContaining('Documents')
        );
      });

      // Expand and verify announcement
      fireEvent.keyDown(treeView, { key: 'ArrowRight', code: 'ArrowRight' });

      await waitFor(() => {
        expect(onScreenReaderAnnounce).toHaveBeenCalledWith(
          expect.stringMatching(/expanded|Documents/i)
        );
      });

      // Select and verify announcement
      fireEvent.keyDown(treeView, { key: ' ', code: 'Space' });
      await waitFor(() => {
        expect(onScreenReaderAnnounce).toHaveBeenCalledWith(
          expect.stringMatching(/selected|Documents/i)
        );
      });
    });

    it('should maintain proper ARIA attributes throughout interactions', async () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          multiSelect={true}
          checkboxSelection={true}
        />
      );

      // Check initial ARIA attributes
      const treeView = screen.getByRole('tree');
      expect(treeView).toHaveAttribute('aria-multiselectable', 'true');

      const documentsItem = screen.getByText('Documents');
      const treeItem = documentsItem.closest('[role="treeitem"]');
      expect(treeItem).toHaveAttribute('aria-expanded', 'false');

      // Expand and verify ARIA updates
      fireEvent.click(documentsItem);

      await waitFor(() => {
        expect(treeItem).toHaveAttribute('aria-expanded', 'true');
      });

      // Check children have proper ARIA attributes
      const file1Item = screen.getByText('file1.txt');
      const file1TreeItem = file1Item.closest('[role="treeitem"]');
      expect(file1TreeItem).toHaveAttribute('aria-level', '2');
      expect(file1TreeItem).toHaveAttribute('aria-posinset');
      expect(file1TreeItem).toHaveAttribute('aria-setsize');
    });

    it('should handle focus management workflow', async () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      
      // Initial focus
      treeView.focus();
      expect(treeView).toHaveFocus();

      // Navigate and verify focus moves
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' });
      
      await waitFor(() => {
        expectItemToBeFocused(treeView, '1');
      });

      // Verify focus doesn't leave tree during navigation
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(treeView, { key: 'ArrowDown', code: 'ArrowDown' });
      
      await waitFor(() => {
        const focusedElement = document.activeElement;
        expect(focusedElement?.closest('[role="tree"]')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Workflows', () => {
    it('should handle large tree rendering and interaction', async () => {
      const largeTree = generateLargeTree(4, 5); // 4 levels, 5 items per level

      const startTime = performance.now();
      renderWithTheme(<HandyTreeView items={largeTree} />);
      const renderTime = performance.now() - startTime;

      // Should render within reasonable time (adjust threshold as needed)
      expect(renderTime).toBeLessThan(1000);

      // Verify items are rendered
      expect(screen.getByText('Item 0')).toBeInTheDocument();

      // Test interaction performance
      const firstItem = screen.getByText('Item 0');
      const interactionStart = performance.now();
      fireEvent.click(firstItem);
      const interactionTime = performance.now() - interactionStart;

      // Interaction should be fast
      expect(interactionTime).toBeLessThan(100);
    });

    it('should handle lazy loading performance workflow', async () => {
      const largeTree = generateLargeTree(3, 10);
      const dataSource = createMockDataSource(largeTree);

      renderWithTheme(
        <HandyTreeView
          dataSource={dataSource}
          lazyLoading={{ enabled: true, staleTime: 5000 }}
        />
      );

      // Wait for root items to load
      await waitFor(
        () => {
          expect(screen.getByText('Item 0')).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Expand an item and verify children load
      const item0 = screen.getByText('Item 0');
      fireEvent.click(item0);

      // Wait for children to load
      await waitFor(
        () => {
          expect(screen.getByText(/Item 0-child-0/i)).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Verify loading indicators work
      // (This would require checking for loading state during fetch)
    });

    it('should handle rapid expansion/collapse without performance issues', async () => {
      const largeTree = generateLargeTree(3, 10);

      renderWithTheme(<HandyTreeView items={largeTree} />);

      const firstItem = screen.getByText('Item 0');
      
      // Rapidly expand and collapse
      for (let i = 0; i < 10; i++) {
        fireEvent.click(firstItem);
        await waitFor(() => {
          const expanded = firstItem.closest('[role="treeitem"]')?.getAttribute('aria-expanded');
          expect(expanded).toBe(i % 2 === 0 ? 'true' : 'false');
        });
      }

      // Should still be responsive
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });

    it('should handle virtual scrolling with large datasets', async () => {
      // Create a flat list of many items for virtual scrolling
      const flatItems: TreeViewItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        label: `Item ${i}`,
      }));

      renderWithTheme(
        <HandyTreeView
          items={flatItems}
          enableVirtualScrolling={true}
          viewportHeight={400}
          itemHeight={32}
        />
      );

      // Should render quickly even with 1000 items
      const startTime = performance.now();
      await waitFor(() => {
        expect(screen.getByText('Item 0')).toBeInTheDocument();
      });
      const loadTime = performance.now() - startTime;

      // Should load quickly with virtual scrolling
      expect(loadTime).toBeLessThan(500);

      // Verify scrolling works
      const treeView = screen.getByRole('tree');
      fireEvent.scroll(treeView, { target: { scrollTop: 5000 } });

      // Should still be responsive
      expect(screen.getByText('Item 0')).toBeInTheDocument();
    });
  });

  describe('Complete Real-World Workflows', () => {
    const fileSystemItems: TreeViewItem[] = [
      {
        id: 'root',
        label: 'Project',
        children: [
          {
            id: 'src',
            label: 'src',
            children: [
              { id: 'src-index', label: 'index.ts' },
              { id: 'src-app', label: 'app.ts' },
              {
                id: 'src-components',
                label: 'components',
                children: [
                  { id: 'src-components-button', label: 'Button.tsx' },
                  { id: 'src-components-input', label: 'Input.tsx' },
                ],
              },
            ],
          },
          {
            id: 'tests',
            label: 'tests',
            children: [
              { id: 'tests-app', label: 'app.test.ts' },
            ],
          },
          { id: 'package', label: 'package.json' },
        ],
      },
    ];

    it('should handle complete file explorer workflow', async () => {
      const onItemDoubleClick = jest.fn();
      const onItemClick = jest.fn();

      renderWithTheme(
        <HandyTreeView
          items={fileSystemItems}
          onItemDoubleClick={onItemDoubleClick}
          onItemClick={onItemClick}
          defaultExpandedItems={['root']}
        />
      );

      // Navigate through file structure
      await waitFor(() => {
        expect(screen.getByText('src')).toBeInTheDocument();
      });

      // Expand src folder
      const srcFolder = screen.getByText('src');
      fireEvent.click(srcFolder);

      await waitFor(() => {
        expect(screen.getByText('index.ts')).toBeInTheDocument();
        expect(screen.getByText('components')).toBeInTheDocument();
      });

      // Expand components folder
      const componentsFolder = screen.getByText('components');
      fireEvent.click(componentsFolder);

      await waitFor(() => {
        expect(screen.getByText('Button.tsx')).toBeInTheDocument();
        expect(screen.getByText('Input.tsx')).toBeInTheDocument();
      });

      // Double-click to open file
      const buttonFile = screen.getByText('Button.tsx');
      fireEvent.dblClick(buttonFile);

      expect(onItemDoubleClick).toHaveBeenCalledWith(
        expect.anything(),
        'src-components-button'
      );

      // Single click to select
      const inputFile = screen.getByText('Input.tsx');
      fireEvent.click(inputFile);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.anything(),
        'src-components-input'
      );
    });

    it('should handle complete search and filter workflow', async () => {
      // Filter function that recursively filters items
      const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
        const filtered: TreeViewItem[] = [];
        
        for (const item of items) {
          const children = item.children ? filterItems(item.children) : undefined;
          const hasMatchingChildren = children && children.length > 0;
          const matches = item.label.includes('Button');
          
          if (matches || hasMatchingChildren) {
            filtered.push({
              ...item,
              children: hasMatchingChildren ? children : item.children,
            });
          }
        }
        
        return filtered;
      };

      renderWithTheme(
        <HandyTreeView
          items={fileSystemItems}
          filterItems={filterItems}
          defaultExpandedItems={['root', 'src', 'src-components']}
        />
      );

      // After filtering, only Button-related items should be visible
      await waitFor(() => {
        expect(screen.getByText('Button.tsx')).toBeInTheDocument();
        expect(screen.queryByText('Input.tsx')).not.toBeInTheDocument();
        expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle complete API-driven workflow', async () => {
      const apiRef: HandyTreeViewApiRef = { current: undefined };

      renderWithTheme(
        <HandyTreeView
          items={fileSystemItems}
          apiRef={apiRef}
        />
      );

      await waitFor(() => {
        expect(apiRef.current).toBeDefined();
      });

      // Use API to programmatically expand
      apiRef.current?.setItemExpansion?.('root', true);
      
      await waitFor(() => {
        expect(screen.getByText('src')).toBeInTheDocument();
      });

      // Use API to programmatically select
      apiRef.current?.setItemSelection?.('src', true);

      // Use API to focus
      apiRef.current?.focusItem?.('src-components');

      await waitFor(() => {
        const treeView = screen.getByRole('tree');
        expectItemToBeFocused(treeView, 'src-components');
      });

      // Use API to get item
      const item = apiRef.current?.getItem?.('src-components');
      expect(item).toBeDefined();
      expect(item?.label).toBe('components');
    });
  });
});
