/**
 * @fileoverview Basic Usage Examples for HandyTreeView
 *
 * Demonstrates basic usage patterns for HandyTreeView component.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { HandyTreeView, HandyTreeViewApiRef, TreeViewItem } from '../src/components/HandyTreeView';

/**
 * Example 1: Basic Static Tree
 */
export const BasicStaticTree = () => {
  const items: TreeViewItem[] = [
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
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Basic Static Tree
      </Typography>
      <HandyTreeView items={items} />
    </Box>
  );
};

/**
 * Example 2: Controlled Expansion
 */
export const ControlledExpansion = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

  const items: TreeViewItem[] = [
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
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Controlled Expansion
      </Typography>
      <HandyTreeView
        items={items}
        expandedItems={expandedItems}
        onExpandedItemsChange={(event, itemIds) => {
          setExpandedItems(itemIds as string[]);
        }}
      />
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Expanded: {expandedItems.join(', ')}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Example 3: Multi-Selection with Checkboxes
 */
export const MultiSelectionWithCheckboxes = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const items: TreeViewItem[] = [
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
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Multi-Selection with Checkboxes
      </Typography>
      <HandyTreeView
        items={items}
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
};

/**
 * Example 4: Using API Ref
 */
export const UsingApiRef = () => {
  const apiRef = React.useRef<HandyTreeViewApiRef>({ current: undefined });

  const items: TreeViewItem[] = [
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
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  const handleFocusFirst = () => {
    apiRef.current?.current?.focusItem?.('1');
  };

  const handleExpandAll = () => {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        apiRef.current?.current?.setItemExpansion?.(item.id, true);
      }
    });
  };

  const handleCollapseAll = () => {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        apiRef.current?.current?.setItemExpansion?.(item.id, false);
      }
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Using API Ref
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={handleFocusFirst}>
          Focus First Item
        </Button>
        <Button variant="outlined" size="small" onClick={handleExpandAll}>
          Expand All
        </Button>
        <Button variant="outlined" size="small" onClick={handleCollapseAll}>
          Collapse All
        </Button>
      </Box>
      <HandyTreeView items={items} apiRef={apiRef} />
    </Box>
  );
};

/**
 * Example 5: Custom Item Rendering
 */
export const CustomItemRendering = () => {
  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file' },
        { id: '1-2', label: 'file2.txt', type: 'file' },
      ],
      type: 'directory',
    },
    {
      id: '2',
      label: 'Pictures',
      children: [
        { id: '2-1', label: 'photo1.jpg', type: 'file' },
        { id: '2-2', label: 'photo2.jpg', type: 'file' },
      ],
      type: 'directory',
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Custom Item Rendering (via getItemLabel)
      </Typography>
      <HandyTreeView
        items={items}
        getItemLabel={(item) => {
          const type = item.type === 'directory' ? '📁' : '📄';
          return `${type} ${item.label}`;
        }}
      />
    </Box>
  );
};

/**
 * Example 6: Disabled Items
 */
export const DisabledItems = () => {
  const items: TreeViewItem[] = [
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
      label: 'Pictures (Disabled)',
      children: [
        { id: '2-1', label: 'photo1.jpg' },
        { id: '2-2', label: 'photo2.jpg' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Disabled Items
      </Typography>
      <HandyTreeView
        items={items}
        isItemDisabled={(itemId) => itemId === '2'}
      />
    </Box>
  );
};
