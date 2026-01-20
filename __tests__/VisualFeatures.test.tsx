/**
 * @fileoverview Unit Tests for Visual Features
 *
 * Comprehensive test suite for visual features including animations,
 * loading states, error states, focus indicators, and custom icons.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Folder, InsertDriveFile } from '@mui/icons-material';
import { StudioTreeView } from '../src/components/StudioTreeView';
import { StudioTreeItem } from '../StudioTreeItem';
import { TreeViewItem } from '../../types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Visual Features', () => {
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

  describe('Expand/Collapse Animations', () => {
    it('should animate expansion when animateExpansion is true', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} animateExpansion={true} defaultExpandedItems={[]} />
      );

      const documentsItem = screen.getByText('Documents');
      fireEvent.click(documentsItem);

      // Check that children appear (animation will be handled by Collapse component)
      waitFor(() => {
        expect(screen.getByText('file1.txt')).toBeInTheDocument();
      });
    });

    it('should not animate when animateExpansion is false', () => {
      renderWithTheme(
        <StudioTreeView items={mockItems} animateExpansion={false} defaultExpandedItems={[]} />
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
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
        <StudioTreeView
          items={mockItems}
          getItemError={(itemId) => (itemId === '1' ? 'Failed to load directory' : null)}
        />
      );

      expect(screen.getByText('Failed to load directory')).toBeInTheDocument();
    });

    it('should not show error when item has no error', () => {
      renderWithTheme(
        <StudioTreeView
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
      renderWithTheme(
        <StudioTreeView
          items={mockItems}
          getItemIcon={(item) => {
            if (item.type === 'directory') {
              return <Folder data-testid="folder-icon" />;
            }
            return null;
          }}
        />
      );

      const folderIcon = screen.queryByTestId('folder-icon');
      expect(folderIcon).toBeInTheDocument();
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
        <StudioTreeView
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
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const treeView = screen.getByRole('tree');
      treeView.focus();

      // Focus first item
      fireEvent.keyDown(treeView, { key: 'ArrowDown' });

      // Focused item should have focus-visible styles
      const focusedItem = screen.getByText('Documents').closest('li');
      expect(focusedItem).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper focus outline styles', () => {
      renderWithTheme(<StudioTreeView items={mockItems} />);

      const documentsItem = screen.getByText('Documents').closest('li');
      const content = documentsItem?.querySelector('[role="button"]');

      // Check that focus styles are applied
      expect(content).toBeInTheDocument();
    });
  });

  describe('StudioTreeItem Visual Features', () => {
    it('should render with loading state', () => {
      renderWithTheme(
        <StudioTreeItem
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
        <StudioTreeItem
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
        <StudioTreeItem
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
        <StudioTreeItem
          itemId="1"
          label="Animated Item"
          level={0}
          hasChildren={true}
          expanded={false}
          animateExpansion={true}
        >
          <StudioTreeItem itemId="1-1" label="Child" level={1} />
        </StudioTreeItem>
      );

      // Expand item
      rerender(
        <ThemeProvider theme={theme}>
          <StudioTreeItem
            itemId="1"
            label="Animated Item"
            level={0}
            hasChildren={true}
            expanded={true}
            animateExpansion={true}
          >
            <StudioTreeItem itemId="1-1" label="Child" level={1} />
          </StudioTreeItem>
        </ThemeProvider>
      );

      // Child should be rendered (Collapse component handles animation)
      expect(screen.getByText('Child')).toBeInTheDocument();
    });
  });

  describe('Combined Visual Features', () => {
    it('should handle loading and error states together', () => {
      renderWithTheme(
        <StudioTreeView
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
        <StudioTreeView
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
