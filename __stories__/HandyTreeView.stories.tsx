/**
 * @fileoverview Storybook stories for HandyTreeView component
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { Folder, FolderOpen, InsertDriveFile, CloudDownload, Error as ErrorIcon } from '@mui/icons-material';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem } from '../src/components/HandyTreeView';

const meta: Meta<typeof HandyTreeView> = {
  title: 'Components/HandyTreeView',
  component: HandyTreeView,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof HandyTreeView>;

// Sample data for stories
const basicItems: TreeViewItem[] = [
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

const largeTreeItems: TreeViewItem[] = Array.from({ length: 50 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i}`,
  children: i % 5 === 0 ? Array.from({ length: 10 }, (_, j) => ({
    id: `item-${i}-${j}`,
    label: `Item ${i}-${j}`,
  })) : undefined,
}));

/**
 * Basic static tree view
 */
export const Basic: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Basic Tree View
      </Typography>
      <HandyTreeView items={basicItems} />
    </Box>
  ),
};

/**
 * Controlled expansion example
 */
export const ControlledExpansion: Story = {
  render: () => {
    const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Controlled Expansion
        </Typography>
        <HandyTreeView
          items={basicItems}
          expandedItems={expandedItems}
          onExpandedItemsChange={(event, itemIds) => {
            setExpandedItems(itemIds as string[]);
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Expanded: {expandedItems.length > 0 ? expandedItems.join(', ') : 'None'}
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Multi-selection with checkboxes
 */
export const MultiSelection: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Multi-Selection with Checkboxes
        </Typography>
        <HandyTreeView
          items={basicItems}
          multiSelect
          checkboxSelection
          selectedItems={selectedItems}
          onSelectedItemsChange={(event, itemIds) => {
            setSelectedItems(itemIds as string[]);
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Selected: {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
          </Typography>
        </Box>
      </Box>
    );
  },
};

/**
 * Using API ref for programmatic control
 */
export const ApiRef: Story = {
  render: () => {
    const apiRef: HandyTreeViewApiRef = { current: undefined };

    const handleFocusFirst = () => {
      apiRef.current?.focusItem?.('1');
    };

    const handleExpandAll = () => {
      basicItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          apiRef.current?.setItemExpansion?.(item.id, true);
        }
      });
    };

    const handleCollapseAll = () => {
      basicItems.forEach((item) => {
        if (item.children && item.children.length > 0) {
          apiRef.current?.setItemExpansion?.(item.id, false);
        }
      });
    };

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Using API Ref
        </Typography>
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={handleFocusFirst}>
            Focus First
          </Button>
          <Button variant="outlined" size="small" onClick={handleExpandAll}>
            Expand All
          </Button>
          <Button variant="outlined" size="small" onClick={handleCollapseAll}>
            Collapse All
          </Button>
        </Box>
        <HandyTreeView items={basicItems} apiRef={apiRef} />
      </Box>
    );
  },
};

/**
 * Disabled items example
 */
export const DisabledItems: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Disabled Items
      </Typography>
      <HandyTreeView
        items={basicItems}
        isItemDisabled={(itemId) => itemId === '2'}
      />
    </Box>
  ),
};

/**
 * Custom item labels
 */
export const CustomLabels: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Custom Item Labels
      </Typography>
      <HandyTreeView
        items={basicItems}
        getItemLabel={(item) => {
          const type = item.type === 'directory' ? '📁' : '📄';
          return `${type} ${item.label}`;
        }}
      />
    </Box>
  ),
};

/**
 * Keyboard navigation example
 */
export const KeyboardNavigation: Story = {
  render: () => {
    const treeRef = React.useRef<HTMLUListElement>(null);
    
    React.useEffect(() => {
      // Focus the tree when the story loads
      if (treeRef.current) {
        treeRef.current.focus();
      }
    }, []);

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Keyboard Navigation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Click on the tree or press Tab to focus it, then use Arrow keys to navigate, Enter/Space to select, Home/End to jump to first/last item
        </Typography>
        <HandyTreeView items={basicItems} ref={treeRef} />
      </Box>
    );
  },
};

/**
 * Large tree performance example
 */
export const LargeTree: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 400, maxHeight: 600, overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Large Tree (50 items)
      </Typography>
      <HandyTreeView items={largeTreeItems} />
    </Box>
  ),
};

/**
 * Double-click handling
 */
export const DoubleClick: Story = {
  render: () => {
    const [message, setMessage] = useState<string>('');
    const [open, setOpen] = useState(false);

    const handleDoubleClick = (event: React.MouseEvent, itemId: string | number) => {
      const item = findItem(basicItems, itemId);
      setMessage(`Double-clicked: ${item?.label || itemId}`);
      setOpen(true);
    };

    const findItem = (items: TreeViewItem[], id: string | number): TreeViewItem | null => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Double-Click Handling
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Double-click any item to see a notification
        </Typography>
        <HandyTreeView items={basicItems} onItemDoubleClick={handleDoubleClick} />
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="info" onClose={() => setOpen(false)}>
            {message}
          </Alert>
        </Snackbar>
      </Box>
    );
  },
};

/**
 * Context menu example
 */
export const ContextMenu: Story = {
  render: () => {
    const [contextMenu, setContextMenu] = useState<{
      mouseX: number;
      mouseY: number;
      itemId: string | number | null;
    } | null>(null);
    const [selectedAction, setSelectedAction] = useState<string>('');

    const handleContextMenu = (event: React.MouseEvent, itemId: string | number) => {
      event.preventDefault();
      setContextMenu(
        contextMenu === null
          ? {
              mouseX: event.clientX + 2,
              mouseY: event.clientY - 6,
              itemId,
            }
          : null
      );
    };

    const handleClose = () => {
      setContextMenu(null);
    };

    const handleMenuAction = (action: string) => {
      if (contextMenu) {
        setSelectedAction(`${action} on ${contextMenu.itemId}`);
        handleClose();
      }
    };

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Context Menu
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Right-click any item to open context menu
        </Typography>
        <HandyTreeView items={basicItems} onItemContextMenu={handleContextMenu} />
        {selectedAction && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Last action: {selectedAction}</Typography>
          </Box>
        )}
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
          }
        >
          <MenuItem onClick={() => handleMenuAction('Open')}>Open</MenuItem>
          <MenuItem onClick={() => handleMenuAction('Rename')}>Rename</MenuItem>
          <MenuItem onClick={() => handleMenuAction('Delete')}>Delete</MenuItem>
          <MenuItem onClick={() => handleMenuAction('Properties')}>Properties</MenuItem>
        </Menu>
      </Box>
    );
  },
};

/**
 * Custom icons example
 */
export const CustomIcons: Story = {
  render: () => (
    <Box sx={{ p: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Custom Icons
      </Typography>
      <HandyTreeView
        items={basicItems}
        getItemIcon={(item) => {
          if (item.children && item.children.length > 0) {
            return <Folder />;
          }
          return <InsertDriveFile />;
        }}
      />
    </Box>
  ),
};

/**
 * Loading states example
 */
export const LoadingStates: Story = {
  render: () => {
    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set(['1']));

    const handleToggleLoading = () => {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        if (next.has('1')) {
          next.delete('1');
        } else {
          next.add('1');
        }
        return next;
      });
    };

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Loading States
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" size="small" onClick={handleToggleLoading}>
            Toggle Loading on "Documents"
          </Button>
        </Box>
        <HandyTreeView
          items={basicItems}
          isItemLoading={(itemId) => loadingItems.has(itemId as string)}
        />
      </Box>
    );
  },
};

/**
 * Selection propagation example
 */
export const SelectionPropagation: Story = {
  render: () => {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    return (
      <Box sx={{ p: 2, maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Selection Propagation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecting a parent automatically selects all children
        </Typography>
        <HandyTreeView
          items={basicItems}
          multiSelect
          checkboxSelection
          selectionPropagation={{ descendants: true, parents: true }}
          selectedItems={selectedItems}
          onSelectedItemsChange={(event, itemIds) => {
            setSelectedItems(itemIds as string[]);
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">
            Selected: {selectedItems.length > 0 ? selectedItems.join(', ') : 'None'}
          </Typography>
        </Box>
      </Box>
    );
  },
};
