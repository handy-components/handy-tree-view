/**
 * @fileoverview Unit Tests for RichTreeViewPlus Features
 *
 * Comprehensive test suite for custom filtering, hidden files control,
 * custom empty states, ItemDataContext, and onItemExpansion callback.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { StudioTreeView, ItemDataContext } from '../src/components/StudioTreeView';
import { TreeViewItem } from '../../types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Custom Filtering (filterItems)', () => {
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

  it('should filter items using filterItems function', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items.filter((item) => item.label?.includes('Documents'));
    };

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        filterItems={filterItems}
      />
    );

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.queryByText('Pictures')).not.toBeInTheDocument();
  });

  it('should recursively filter children', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items
        .map((item) => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = item.children.filter((child) => child.label?.includes('file1'));
            return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined };
          }
          return item;
        })
        .filter((item) => {
          const label = item.label?.toLowerCase() || '';
          return label.includes('documents') || (item.children && item.children.length > 0);
        });
    };

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        filterItems={filterItems}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.queryByText('file2.txt')).not.toBeInTheDocument();
    });
  });

  it('should show noItemsMatchMessage when all items are filtered out', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items.filter((item) => item.label?.includes('NonExistent'));
    };

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        filterItems={filterItems}
        noItemsMatchMessage="No items match your search."
      />
    );

    expect(screen.getByText('No items match your search.')).toBeInTheDocument();
  });
});

describe('Hidden Files Control (showHiddenFiles)', () => {
  const mockItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt', hidden: false },
        { id: '1-2', label: '.hidden-file', hidden: true },
        { id: '1-3', label: 'file2.txt', hidden: false },
      ],
    },
    {
      id: '2',
      label: '.hidden-folder',
      hidden: true,
      children: [
        { id: '2-1', label: 'secret.txt' },
      ],
    },
  ];

  it('should hide files with dot prefix when showHiddenFiles is false', () => {
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        showHiddenFiles={false}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
      expect(screen.queryByText('.hidden-file')).not.toBeInTheDocument();
      expect(screen.queryByText('.hidden-folder')).not.toBeInTheDocument();
    });
  });

  it('should show all files when showHiddenFiles is true', () => {
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        showHiddenFiles={true}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('.hidden-file')).toBeInTheDocument();
      expect(screen.getByText('.hidden-folder')).toBeInTheDocument();
    });
  });

  it('should hide files with hidden flag when showHiddenFiles is false', () => {
    const itemsWithHiddenFlag: TreeViewItem[] = [
      {
        id: '1',
        label: 'Documents',
        children: [
          { id: '1-1', label: 'file1.txt', isHidden: true },
          { id: '1-2', label: 'file2.txt', isHidden: false },
        ],
      },
    ];

    renderWithTheme(
      <StudioTreeView
        items={itemsWithHiddenFlag}
        showHiddenFiles={false}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.queryByText('file1.txt')).not.toBeInTheDocument();
      expect(screen.getByText('file2.txt')).toBeInTheDocument();
    });
  });
});

describe('Custom Empty States', () => {
  it('should show emptyStateMessage when no items are available', () => {
    renderWithTheme(
      <StudioTreeView
        items={[]}
        emptyStateMessage="No items available in this tree."
      />
    );

    expect(screen.getByText('No items available in this tree.')).toBeInTheDocument();
  });

  it('should show noItemsMatchMessage when items are filtered out', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items.filter((item) => false); // Filter everything out
    };

    renderWithTheme(
      <StudioTreeView
        items={[{ id: '1', label: 'Item 1' }]}
        filterItems={filterItems}
        noItemsMatchMessage="No items match your search."
      />
    );

    expect(screen.getByText('No items match your search.')).toBeInTheDocument();
  });

  it('should show noDataSourceMessage when no data source is available', () => {
    renderWithTheme(
      <StudioTreeView
        items={[]}
        dataSource={undefined}
        noDataSourceMessage="Please configure a data source."
      />
    );

    expect(screen.getByText('Please configure a data source.')).toBeInTheDocument();
  });
});

describe('ItemDataContext', () => {
  const mockItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      type: 'directory',
      customProperty: 'custom-value',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file', customProperty: 'custom-value-1' },
      ],
    },
  ];

  it('should provide access to full item data via context', () => {
    const TestComponent = () => {
      const { getFullItem } = useContext(ItemDataContext);
      const fullItem = getFullItem('1');

      return (
        <Box>
          <StudioTreeView items={mockItems} />
          {fullItem && (
            <div data-testid="full-item">
              {fullItem.customProperty}
            </div>
          )}
        </Box>
      );
    };

    renderWithTheme(<TestComponent />);

    waitFor(() => {
      expect(screen.getByTestId('full-item')).toHaveTextContent('custom-value');
    });
  });

  it('should preserve custom properties after filtering', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items; // No filtering, just pass through
    };

    const TestComponent = () => {
      const { getFullItem } = useContext(ItemDataContext);
      const fullItem = getFullItem('1-1');

      return (
        <Box>
          <StudioTreeView items={mockItems} filterItems={filterItems} />
          {fullItem && (
            <div data-testid="full-item">
              {fullItem.customProperty}
            </div>
          )}
        </Box>
      );
    };

    renderWithTheme(<TestComponent />);

    waitFor(() => {
      expect(screen.getByTestId('full-item')).toHaveTextContent('custom-value-1');
    });
  });
});

describe('onItemExpansion Callback', () => {
  const mockItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt' },
      ],
    },
  ];

  it('should call onItemExpansion when item expands', () => {
    const handleItemExpansion = jest.fn();

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        onItemExpansion={handleItemExpansion}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(handleItemExpansion).toHaveBeenCalledWith('1');
    });
  });

  it('should not call onItemExpansion when item collapses', () => {
    const handleItemExpansion = jest.fn();

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        defaultExpandedItems={['1']}
        onItemExpansion={handleItemExpansion}
      />
    );

    // Collapse Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      // Should not be called on collapse
      expect(handleItemExpansion).not.toHaveBeenCalled();
    });
  });

  it('should call onItemExpansion multiple times for different items', () => {
    const handleItemExpansion = jest.fn();

    const items: TreeViewItem[] = [
      {
        id: '1',
        label: 'Folder 1',
        children: [
          { id: '1-1', label: 'file1.txt' },
        ],
      },
      {
        id: '2',
        label: 'Folder 2',
        children: [
          { id: '2-1', label: 'file2.txt' },
        ],
      },
    ];

    renderWithTheme(
      <StudioTreeView
        items={items}
        onItemExpansion={handleItemExpansion}
      />
    );

    // Expand Folder 1
    const folder1 = screen.getByText('Folder 1').closest('li');
    const expandIcon1 = folder1?.querySelector('button');
    if (expandIcon1) {
      fireEvent.click(expandIcon1);
    }

    // Expand Folder 2
    const folder2 = screen.getByText('Folder 2').closest('li');
    const expandIcon2 = folder2?.querySelector('button');
    if (expandIcon2) {
      fireEvent.click(expandIcon2);
    }

    waitFor(() => {
      expect(handleItemExpansion).toHaveBeenCalledWith('1');
      expect(handleItemExpansion).toHaveBeenCalledWith('2');
      expect(handleItemExpansion).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Combined Features', () => {
  const mockItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt', hidden: false },
        { id: '1-2', label: '.hidden-file', hidden: true },
      ],
    },
  ];

  it('should apply both filterItems and showHiddenFiles', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items.filter((item) => item.label?.includes('Documents'));
    };

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        filterItems={filterItems}
        showHiddenFiles={false}
      />
    );

    // Expand Documents
    const documentsItem = screen.getByText('Documents').closest('li');
    const expandIcon = documentsItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.queryByText('.hidden-file')).not.toBeInTheDocument();
    });
  });

  it('should show correct empty state message when filterItems removes all items', () => {
    const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
      return items.filter((item) => false);
    };

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        filterItems={filterItems}
        noItemsMatchMessage="No items match your filters."
      />
    );

    expect(screen.getByText('No items match your filters.')).toBeInTheDocument();
  });
});
