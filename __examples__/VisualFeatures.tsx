/**
 * @fileoverview Visual Features Examples for StudioTreeView
 *
 * Demonstrates visual features including animations, loading states,
 * error states, focus indicators, and custom icons.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Button, IconButton } from '@mui/material';
import { Folder, FolderOpen, InsertDriveFile, CloudDownload, Error as ErrorIcon } from '@mui/icons-material';
import { StudioTreeView } from '../StudioTreeView';
import { TreeViewItem } from '../../types';

/**
 * Example 1: Expand/Collapse Animations
 */
export const ExpandCollapseAnimations = () => {
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
        Expand/Collapse Animations
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Click items to see smooth expand/collapse animations
      </Typography>
      <StudioTreeView items={items} animateExpansion={true} />
    </Box>
  );
};

/**
 * Example 2: Loading States
 */
export const LoadingStates = () => {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set(['1']));

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Loading Folder',
      children: [
        { id: '1-1', label: 'file1.txt' },
        { id: '1-2', label: 'file2.txt' },
      ],
    },
    {
      id: '2',
      label: 'Normal Folder',
      children: [
        { id: '2-1', label: 'photo1.jpg' },
      ],
    },
  ];

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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Loading States
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={handleToggleLoading}>
          Toggle Loading on "Loading Folder"
        </Button>
      </Box>
      <StudioTreeView
        items={items}
        isItemLoading={(itemId) => loadingItems.has(itemId as string)}
      />
    </Box>
  );
};

/**
 * Example 3: Error States
 */
export const ErrorStates = () => {
  const [errorItems, setErrorItems] = useState<Map<string, string>>(
    new Map([['1', 'Failed to load directory contents']])
  );

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Error Folder',
      children: [
        { id: '1-1', label: 'file1.txt' },
      ],
    },
    {
      id: '2',
      label: 'Normal Folder',
      children: [
        { id: '2-1', label: 'photo1.jpg' },
      ],
    },
  ];

  const handleToggleError = () => {
    setErrorItems((prev) => {
      const next = new Map(prev);
      if (next.has('1')) {
        next.delete('1');
      } else {
        next.set('1', 'Failed to load directory contents');
      }
      return next;
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Error States
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" size="small" onClick={handleToggleError}>
          Toggle Error on "Error Folder"
        </Button>
      </Box>
      <StudioTreeView
        items={items}
        getItemError={(itemId) => errorItems.get(itemId as string) || null}
      />
    </Box>
  );
};

/**
 * Example 4: Custom Icons
 */
export const CustomIcons = () => {
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
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Custom Icons
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Custom icons for folders and files
      </Typography>
      <StudioTreeView
        items={items}
        getItemIcon={(item) => {
          if (item.type === 'directory') {
            return <Folder fontSize="small" sx={{ color: 'primary.main' }} />;
          } else if (item.type === 'file') {
            return <InsertDriveFile fontSize="small" sx={{ color: 'text.secondary' }} />;
          }
          return null;
        }}
      />
    </Box>
  );
};

/**
 * Example 5: Focus Indicators
 */
export const FocusIndicators = () => {
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
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Focus Indicators
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use Tab or Arrow keys to navigate and see focus indicators
      </Typography>
      <StudioTreeView items={items} />
    </Box>
  );
};

/**
 * Example 6: Combined Visual Features
 */
export const CombinedVisualFeatures = () => {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set(['1']));
  const [errorItems, setErrorItems] = useState<Map<string, string>>(
    new Map([['2', 'Access denied']])
  );

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Loading Folder',
      type: 'directory',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file' },
      ],
    },
    {
      id: '2',
      label: 'Error Folder',
      type: 'directory',
      children: [
        { id: '2-1', label: 'photo1.jpg', type: 'file' },
      ],
    },
    {
      id: '3',
      label: 'Normal Folder',
      type: 'directory',
      children: [
        { id: '3-1', label: 'document.pdf', type: 'file' },
      ],
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Combined Visual Features
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Demonstrates loading states, error states, custom icons, and animations together
      </Typography>
      <StudioTreeView
        items={items}
        animateExpansion={true}
        isItemLoading={(itemId) => loadingItems.has(itemId as string)}
        getItemError={(itemId) => errorItems.get(itemId as string) || null}
        getItemIcon={(item) => {
          if (item.type === 'directory') {
            return <Folder fontSize="small" sx={{ color: 'primary.main' }} />;
          } else if (item.type === 'file') {
            return <InsertDriveFile fontSize="small" sx={{ color: 'text.secondary' }} />;
          }
          return null;
        }}
      />
    </Box>
  );
};
