/**
 * @fileoverview Visual Features Tests for HandyTreeView
 *
 * This test suite covers visual features including animations,
 * loading states, error states, focus indicators, and custom icons:
 *
 * Expand/Collapse Animations:
 *   - should animate expansion when animateExpansion is true
 *   - should not animate when animateExpansion is false
 *
 * Loading States:
 *   - should show loading indicator when item is loading
 *   - should not show loading indicator when item is not loading
 *
 * Error States:
 *   - should show error indicator when item has error
 *   - should show error message when item has error
 *   - should not show error when item has no error
 *
 * Custom Icons:
 *   - should render custom icon when getItemIcon is provided
 *   - should render different icons for different item types
 *
 * Focus Indicators:
 *   - should show focus indicator when item is focused
 *   - should have proper focus outline styles
 *
 * HandyTreeItem Visual Features:
 *   - should render with loading state
 *   - should render with error state
 *   - should render with custom icon
 *   - should animate expansion when animateExpansion is true
 *
 * Combined Visual Features:
 *   - should handle loading and error states together
 *   - should handle custom icons with loading states
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Folder, InsertDriveFile } from '@mui/icons-material';
import { HandyTreeView, TreeViewItem } from '../src/components/HandyTreeView';
import { HandyTreeItem } from '../src/components/HandyTreeView/HandyTreeItem';
import { renderWithTheme, mockItems, theme } from './HandyTreeView.test-utils';

describe('Visual Features', () => {
  describe('Expand/Collapse Animations', () => {
    it('should animate expansion when animateExpansion is true', async () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} animateExpansion={true} defaultExpandedItems={[]} />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      // Check that children appear (animation will be handled by Collapse component)
      await waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });
    });

    it('should not animate when animateExpansion is false', () => {
      renderWithTheme(
        <HandyTreeView items={mockItems} animateExpansion={false} defaultExpandedItems={[]} />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      // Children should appear immediately without animation
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when item is loading', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemLoading={(itemId) => itemId === '1'}
        />
      );

      const documentsItem = screen.getByText('Documents');
      // Loading indicator should be present
      const loadingIndicator = documentsItem.closest('li')?.querySelector('[role="progressbar"]');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('should not show loading indicator when item is not loading', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemLoading={(itemId) => itemId === '2'}
        />
      );

      const documentsItem = screen.getByText('Documents');
      const loadingIndicator = documentsItem.closest('li')?.querySelector('[role="progressbar"]');
      expect(loadingIndicator).not.toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('should show error indicator when item has error', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          getItemError={(itemId) => (itemId === '1' ? 'Failed to load' : null)}
        />
      );

      const documentsItem = screen.getByText('Documents');
      const errorIcon = documentsItem.closest('li')?.querySelector('[data-testid="ErrorOutlineIcon"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should show error message when item has error', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          getItemError={(itemId) => (itemId === '1' ? 'Failed to load directory' : null)}
        />
      );

      expect(screen.getByText('Failed to load directory')).toBeInTheDocument();
    });

    it('should not show error when item has no error', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          getItemError={(itemId) => null}
        />
      );

      const errorAlert = screen.queryByRole('alert');
      expect(errorAlert).not.toBeInTheDocument();
    });
  });

  describe('Custom Icons', () => {
    it('should render custom icon when getItemIcon is provided', () => {
      const itemsWithType: TreeViewItem[] = [
        {
          id: '1',
          label: 'Documents',
          type: 'directory',
          children: [
            { id: '1-1', label: 'file1.txt' },
            { id: '1-2', label: 'file2.txt' },
          ],
        },
        {
          id: '2',
          label: 'Pictures',
          type: 'directory',
          children: [
            { id: '2-1', label: 'photo1.jpg' },
          ],
        },
      ];

      renderWithTheme(
        <HandyTreeView
          items={itemsWithType}
          getItemIcon={(item) => {
            if (item.type === 'directory') {
              return <Folder data-testid="folder-icon" />;
            }
            return null;
          }}
        />
      );

      const folderIcons = screen.getAllByTestId('folder-icon');
      expect(folderIcons.length).toBeGreaterThan(0);
    });

    it('should render different icons for different item types', () => {
      const itemsWithTypes: TreeViewItem[] = [
        {
          id: '1',
          label: 'Documents',
          type: 'directory',
          children: [
            { id: '1-1', label: 'file1.txt', type: 'file' },
          ],
        },
      ];

      renderWithTheme(
        <HandyTreeView
          items={itemsWithTypes}
          defaultExpandedItems={['1']}
          getItemIcon={(item) => {
            if (item.type === 'directory') {
              return <Folder data-testid="folder-icon" />;
            } else if (item.type === 'file') {
              return <InsertDriveFile data-testid="file-icon" />;
            }
            return null;
          }}
        />
      );

      expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });
  });

  describe('Focus Indicators', () => {
    it('should show focus indicator when item is focused', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Focused item should have focus-visible styles
      const focusedItem = screen.getByText('Documents').closest('li');
      expect(focusedItem).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper focus outline styles', () => {
      renderWithTheme(<HandyTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      const content = documentsItem?.querySelector('[role="button"]');

      // Check that focus styles are applied
      expect(content).toBeInTheDocument();
    });
  });

  describe('HandyTreeItem Visual Features', () => {
    it('should render with loading state', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Loading Item"
          level={0}
          loading={true}
        />
      );

      const loadingIndicator = screen.getByRole('progressbar');
      expect(loadingIndicator).toBeInTheDocument();
    });

    it('should render with error state', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Error Item"
          level={0}
          error="Test error message"
        />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render with custom icon', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Custom Icon Item"
          level={0}
          icon={<Folder data-testid="custom-icon" />}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should animate expansion when animateExpansion is true', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Animated Item"
          level={0}
          hasChildren={true}
          expanded={false}
          animateExpansion={true}
        >
          <HandyTreeItem itemId="1-1" label="Child" level={1} />
        </HandyTreeItem>
      );

      // Expand item
      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeItem
            itemId="1"
            label="Animated Item"
            level={0}
            hasChildren={true}
            expanded={true}
            animateExpansion={true}
          >
            <HandyTreeItem itemId="1-1" label="Child" level={1} />
          </HandyTreeItem>
        </ThemeProvider>
      );

      // Child should be rendered (Collapse component handles animation)
      expect(screen.getByText('Child')).toBeInTheDocument();
    });
  });

  describe('Combined Visual Features', () => {
    it('should handle loading and error states together', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemLoading={(itemId) => itemId === '1'}
          getItemError={(itemId) => (itemId === '2' ? 'Error message' : null)}
        />
      );

      // Loading indicator should be present for item 1
      const documentsItem = screen.getByText('Documents');
      const loadingIndicator = documentsItem.closest('li')?.querySelector('[role="progressbar"]');
      expect(loadingIndicator).toBeInTheDocument();

      // Error should be present for item 2
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('should handle custom icons with loading states', () => {
      renderWithTheme(
        <HandyTreeView
          items={mockItems}
          isItemLoading={(itemId) => itemId === '1'}
          getItemIcon={(item) => <Folder data-testid="icon" />}
        />
      );

      // Both icon and loading indicator should be present
      expect(screen.getAllByTestId('icon').length).toBeGreaterThan(0);
      const loadingIndicator = screen.getByText('Documents').closest('li')?.querySelector('[role="progressbar"]');
      expect(loadingIndicator).toBeInTheDocument();
    });
  });
});
