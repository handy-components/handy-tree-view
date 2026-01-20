/**
 * @fileoverview RichTreeViewPro Features Examples
 *
 * Demonstrates the RichTreeViewPro features: selection propagation,
 * label editing, and item reordering.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Button, Alert, Switch, FormControlLabel } from '@mui/material';
import { Edit, DragIndicator } from '@mui/icons-material';
import { StudioTreeView, StudioTreeViewApiRef } from '../StudioTreeView';
import { TreeViewItem } from '../../types';

/**
 * Example 1: Selection Propagation
 */
export const SelectionPropagation = () => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt' },
        { id: '1-2', label: 'file2.txt' },
        { id: '1-3', label: 'file3.txt' },
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
        Selection Propagation
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        When descendants propagation is enabled, selecting a parent automatically selects all children.
        When parents propagation is enabled, selecting all children automatically selects the parent.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            multiSelect
            checkboxSelection
            selectionPropagation={{ descendants: true, parents: true }}
            selectedItems={selectedItems}
            onSelectedItemsChange={(event, itemIds) => {
              setSelectedItems(Array.isArray(itemIds) ? itemIds : itemIds ? [itemIds] : []);
            }}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Items
          </Typography>
          {selectedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No items selected
            </Typography>
          ) : (
            selectedItems.map((id) => (
              <Typography key={id} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {id}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};

/**
 * Example 2: Label Editing
 */
export const LabelEditing = () => {
  const apiRef = useRef<StudioTreeViewApiRef>(null);
  const [items, setItems] = useState<TreeViewItem[]>([
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
  ]);

  const handleLabelChange = (itemId: string | number, newLabel: string) => {
    const updateItem = (itemsToUpdate: TreeViewItem[]): TreeViewItem[] => {
      return itemsToUpdate.map((item) => {
        if (item.id === itemId) {
          return { ...item, label: newLabel };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    setItems(updateItem(items));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Label Editing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click the edit button to start editing a label. Press Enter to save, Escape to cancel.
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => {
            apiRef.current?.current?.setEditedItem?.('1');
          }}
        >
          Edit "Documents"
        </Button>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => {
            apiRef.current?.current?.setEditedItem?.('2');
          }}
        >
          Edit "Pictures"
        </Button>
      </Box>
      <StudioTreeView
        apiRef={apiRef}
        items={items}
        isItemEditable={(itemId) => ['1', '2', '1-1', '1-2', '2-1'].includes(String(itemId))}
        onItemLabelChange={handleLabelChange}
      />
    </Box>
  );
};

/**
 * Example 3: Item Reordering
 */
export const ItemReordering = () => {
  const [items, setItems] = useState<TreeViewItem[]>([
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
    {
      id: '3',
      label: 'Videos',
    },
  ]);

  const handlePositionChange = (params: {
    itemId: string | number;
    oldPosition: any;
    newPosition: any;
  }) => {
    console.log('Item moved:', params);
    // The items are already updated by the component
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Item Reordering
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Drag and drop items to reorder them. Items can be moved within the same parent or to different parents.
      </Alert>
      <StudioTreeView
        items={items}
        itemsReordering={true}
        isItemReorderable={(itemId) => true}
        canMoveItemToNewPosition={(params) => {
          // Allow all moves for this example
          return true;
        }}
        onItemPositionChange={handlePositionChange}
      />
    </Box>
  );
};

/**
 * Example 4: Combined Features
 */
export const CombinedFeatures = () => {
  const apiRef = useRef<StudioTreeViewApiRef>(null);
  const [items, setItems] = useState<TreeViewItem[]>([
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
  ]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [enableReordering, setEnableReordering] = useState(false);
  const [enablePropagation, setEnablePropagation] = useState(false);

  const handleLabelChange = (itemId: string | number, newLabel: string) => {
    const updateItem = (itemsToUpdate: TreeViewItem[]): TreeViewItem[] => {
      return itemsToUpdate.map((item) => {
        if (item.id === itemId) {
          return { ...item, label: newLabel };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    setItems(updateItem(items));
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Combined RichTreeViewPro Features
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={enableReordering}
              onChange={(e) => setEnableReordering(e.target.checked)}
            />
          }
          label="Enable Reordering"
        />
        <FormControlLabel
          control={
            <Switch
              checked={enablePropagation}
              onChange={(e) => setEnablePropagation(e.target.checked)}
            />
          }
          label="Enable Selection Propagation"
        />
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => {
            apiRef.current?.current?.setEditedItem?.('1');
          }}
        >
          Edit "Documents"
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            apiRef={apiRef}
            items={items}
            multiSelect
            checkboxSelection
            itemsReordering={enableReordering}
            isItemReorderable={(itemId) => true}
            isItemEditable={(itemId) => ['1', '2'].includes(String(itemId))}
            selectionPropagation={
              enablePropagation ? { descendants: true, parents: true } : { descendants: false, parents: false }
            }
            selectedItems={selectedItems}
            onSelectedItemsChange={(event, itemIds) => {
              setSelectedItems(Array.isArray(itemIds) ? itemIds : itemIds ? [itemIds] : []);
            }}
            onItemLabelChange={handleLabelChange}
            onItemPositionChange={(params) => {
              console.log('Item moved:', params);
            }}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Items
          </Typography>
          {selectedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No items selected
            </Typography>
          ) : (
            selectedItems.map((id) => (
              <Typography key={id} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {id}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};
