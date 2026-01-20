/**
 * @fileoverview Accessibility and Performance Examples for StudioTreeView
 *
 * Demonstrates accessibility features and performance optimizations.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { useState } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, Alert } from '@mui/material';
import { StudioTreeView } from '../StudioTreeView';
import { TreeViewItem } from '../../types';

/**
 * Example 1: Screen Reader Support
 */
export const ScreenReaderSupport = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

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

  const handleAnnounce = (message: string) => {
    setAnnouncements((prev) => [...prev.slice(-9), message]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Screen Reader Support
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enable screen reader and navigate with keyboard to hear announcements
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            enableScreenReader={true}
            onScreenReaderAnnounce={handleAnnounce}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Screen Reader Announcements
          </Typography>
          {announcements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No announcements yet
            </Typography>
          ) : (
            announcements.map((announcement, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 0.5 }}>
                {announcement}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};

/**
 * Example 2: ARIA Attributes
 */
export const AriaAttributes = () => {
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
        ARIA Attributes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Inspect the tree view with browser dev tools to see ARIA attributes
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          The tree view includes:
          <ul>
            <li>role="tree" on the root element</li>
            <li>role="treeitem" on each item</li>
            <li>aria-expanded for expandable items</li>
            <li>aria-selected for selected items</li>
            <li>aria-level for hierarchy</li>
            <li>aria-multiselectable for multi-selection</li>
            <li>aria-activedescendant for focused item</li>
          </ul>
        </Typography>
      </Alert>
      <StudioTreeView
        items={items}
        multiSelect
        checkboxSelection
        aria-label="File system tree"
      />
    </Box>
  );
};

/**
 * Example 3: Performance with Large Tree
 */
export const PerformanceLargeTree = () => {
  const [enableVirtualScrolling, setEnableVirtualScrolling] = useState(false);
  const [itemCount, setItemCount] = useState(100);

  const generateLargeTree = (count: number): TreeViewItem[] => {
    const items: TreeViewItem[] = [];
    for (let i = 1; i <= count; i++) {
      items.push({
        id: `item-${i}`,
        label: `Item ${i}`,
        children: [
          { id: `item-${i}-1`, label: `Child ${i}-1` },
          { id: `item-${i}-2`, label: `Child ${i}-2` },
        ],
      });
    }
    return items;
  };

  const items = React.useMemo(() => generateLargeTree(itemCount), [itemCount]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Performance with Large Tree
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              checked={enableVirtualScrolling}
              onChange={(e) => setEnableVirtualScrolling(e.target.checked)}
            />
          }
          label="Enable Virtual Scrolling"
        />
        <Typography variant="body2" color="text.secondary">
          Items: {itemCount * 3} (including children)
        </Typography>
      </Box>
      <Box sx={{ height: 400, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
        <StudioTreeView
          items={items}
          enableVirtualScrolling={enableVirtualScrolling}
          viewportHeight={400}
          itemHeight={32}
        />
      </Box>
    </Box>
  );
};

/**
 * Example 4: Keyboard Navigation
 */
export const KeyboardNavigation = () => {
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
        Keyboard Navigation
      </Typography>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" component="div">
          <strong>Keyboard Shortcuts:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>Tab</strong>: Focus tree view</li>
            <li><strong>Arrow Up/Down</strong>: Navigate items</li>
            <li><strong>Arrow Right</strong>: Expand / Move to first child</li>
            <li><strong>Arrow Left</strong>: Collapse / Move to parent</li>
            <li><strong>Enter</strong>: Expand/Collapse or Select</li>
            <li><strong>Space</strong>: Select item</li>
            <li><strong>Home</strong>: Focus first item</li>
            <li><strong>End</strong>: Focus last item</li>
          </ul>
        </Typography>
      </Paper>
      <StudioTreeView items={items} multiSelect checkboxSelection />
    </Box>
  );
};

/**
 * Example 5: Focus Management
 */
export const FocusManagement = () => {
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
        Focus Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use Tab to focus the tree view, then use arrow keys to navigate.
        Focus indicators will be visible.
      </Typography>
      <StudioTreeView items={items} />
    </Box>
  );
};

/**
 * Example 6: Combined Accessibility Features
 */
export const CombinedAccessibility = () => {
  const [announcements, setAnnouncements] = useState<string[]>([]);

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

  const handleAnnounce = (message: string) => {
    setAnnouncements((prev) => [...prev.slice(-9), message]);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Combined Accessibility Features
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Demonstrates all accessibility features working together
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            multiSelect
            checkboxSelection
            enableScreenReader={true}
            onScreenReaderAnnounce={handleAnnounce}
            aria-label="File system tree with full accessibility support"
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 300, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Screen Reader Announcements
          </Typography>
          {announcements.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Navigate with keyboard to see announcements
            </Typography>
          ) : (
            announcements.map((announcement, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 0.5 }}>
                {announcement}
              </Typography>
            ))
          )}
        </Paper>
      </Box>
    </Box>
  );
};
