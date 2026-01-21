/**
 * @fileoverview User Interactions Examples for HandyTreeView
 *
 * Demonstrates user interaction patterns including clicks, double-clicks,
 * right-clicks, hover states, and context menus.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { HandyTreeView, TreeViewItem } from '../src/components/HandyTreeView';

/**
 * Example 1: Double-Click Handling
 */
export const DoubleClickExample = () => {
  const [message, setMessage] = useState<string>('');
  const [open, setOpen] = useState(false);

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

  const handleDoubleClick = (event: React.MouseEvent, itemId: string | number) => {
    const item = findItem(items, itemId);
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Double-Click Handling
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Double-click any item to see a notification
      </Typography>
      <HandyTreeView
        items={items}
        onItemDoubleClick={handleDoubleClick}
      />
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
};

/**
 * Example 2: Right-Click Context Menu
 */
export const ContextMenuExample = () => {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string | number | null;
  } | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');

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

  const handleContextMenu = (event: React.MouseEvent, itemId: string | number) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
      itemId,
    });
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  const handleMenuAction = (action: string) => {
    if (contextMenu?.itemId) {
      setSelectedAction(`${action} on item ${contextMenu.itemId}`);
      handleClose();
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Right-Click Context Menu
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Right-click any item to open a context menu
      </Typography>
      <HandyTreeView
        items={items}
        onItemContextMenu={handleContextMenu}
      />
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleMenuAction('Open')}>Open</MenuItem>
        <MenuItem onClick={() => handleMenuAction('Rename')}>Rename</MenuItem>
        <MenuItem onClick={() => handleMenuAction('Delete')}>Delete</MenuItem>
        <MenuItem onClick={() => handleMenuAction('Properties')}>Properties</MenuItem>
      </Menu>
      {selectedAction && (
        <Snackbar
          open={!!selectedAction}
          autoHideDuration={3000}
          onClose={() => setSelectedAction('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="info" onClose={() => setSelectedAction('')}>
            {selectedAction}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

/**
 * Example 3: Hover States
 */
export const HoverStatesExample = () => {
  const [hoveredItem, setHoveredItem] = useState<string | number | null>(null);

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

  const handleHover = (event: React.MouseEvent, itemId: string | number) => {
    setHoveredItem(itemId);
  };

  const handleHoverEnd = () => {
    setHoveredItem(null);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Hover States
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Hover over items to see visual feedback. Current hovered item is shown below.
      </Typography>
      <HandyTreeView
        items={items}
        onItemHover={handleHover}
        onItemHoverEnd={handleHoverEnd}
      />
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2">
          Hovered Item: {hoveredItem ? `Item ${hoveredItem}` : 'None'}
        </Typography>
      </Paper>
    </Box>
  );
};

/**
 * Example 4: Combined Interactions
 */
export const CombinedInteractionsExample = () => {
  const [log, setLog] = useState<string[]>([]);

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

  const addLog = (message: string) => {
    setLog((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Combined Interactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Try clicking, double-clicking, right-clicking, and hovering over items
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <HandyTreeView
            items={items}
            onItemClick={(e, id) => addLog(`Single-click: ${id}`)}
            onItemDoubleClick={(e, id) => addLog(`Double-click: ${id}`)}
            onItemContextMenu={(e, id) => addLog(`Right-click: ${id}`)}
            onItemHover={(e, id) => addLog(`Hover: ${id}`)}
            onItemHoverEnd={(e, id) => addLog(`Hover end: ${id}`)}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Interaction Log
          </Typography>
          {log.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No interactions yet
            </Typography>
          ) : (
            log.map((entry, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {entry}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};

/**
 * Example 5: File System Style Interactions
 */
export const FileSystemStyleExample = () => {
  const [selectedFile, setSelectedFile] = useState<string | number | null>(null);
  const [openedFile, setOpenedFile] = useState<string | number | null>(null);

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      type: 'directory',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file' },
        { id: '1-2', label: 'file2.txt', type: 'file' },
      ],
    },
    {
      id: '2',
      label: 'Pictures',
      type: 'directory',
      children: [
        { id: '2-1', label: 'photo1.jpg', type: 'file' },
        { id: '2-2', label: 'photo2.jpg', type: 'file' },
      ],
    },
  ];

  const handleClick = (event: React.MouseEvent, itemId: string | number) => {
    const item = findItem(items, itemId);
    if (item?.type === 'file') {
      setSelectedFile(itemId);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent, itemId: string | number) => {
    const item = findItem(items, itemId);
    if (item?.type === 'file') {
      setOpenedFile(itemId);
    }
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        File System Style Interactions
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Single-click to select files, double-click to open them
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <HandyTreeView
            items={items}
            selectedItems={selectedFile ? [selectedFile] : []}
            onItemClick={handleClick}
            onItemDoubleClick={handleDoubleClick}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Selected: {selectedFile ? `Item ${selectedFile}` : 'None'}
          </Typography>
          <Typography variant="body2">
            Opened: {openedFile ? `Item ${openedFile}` : 'None'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
