/**
 * @fileoverview RichTreeViewPlus Features Examples
 *
 * Demonstrates the RichTreeViewPlus exclusive features: custom filtering,
 * hidden files control, initial root path, custom empty states, ItemDataContext,
 * and onItemExpansion callback.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { useState, useContext } from 'react';
import { Box, Typography, Paper, Button, Switch, FormControlLabel, TextField } from '@mui/material';
import { Folder, InsertDriveFile } from '@mui/icons-material';
import { StudioTreeView, ItemDataContext } from '../StudioTreeView';
import { TreeViewItem } from '../../types';

/**
 * Example 1: Custom Filtering
 */
export const CustomFiltering = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      children: [
        { id: '1-1', label: 'file1.txt' },
        { id: '1-2', label: 'file2.txt' },
        { id: '1-3', label: 'document.pdf' },
      ],
    },
    {
      id: '2',
      label: 'Pictures',
      children: [
        { id: '2-1', label: 'photo1.jpg' },
        { id: '2-2', label: 'photo2.png' },
      ],
    },
  ];

  const filterItems = (itemsToFilter: TreeViewItem[]): TreeViewItem[] => {
    if (!searchQuery.trim()) {
      return itemsToFilter;
    }

    const query = searchQuery.toLowerCase();
    return itemsToFilter
      .filter((item) => {
        const label = item.label?.toLowerCase() || '';
        return label.includes(query);
      })
      .map((item) => {
        if (item.children && item.children.length > 0) {
          const filteredChildren = filterItems(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }
        return item;
      })
      .filter((item) => {
        // Keep item if it matches or has matching children
        const label = item.label?.toLowerCase() || '';
        return label.includes(query) || (item.children && item.children.length > 0);
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Custom Filtering
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use the filterItems prop to implement custom filtering logic. This example filters items by search query.
      </Typography>
      <TextField
        fullWidth
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        placeholder="Type to filter items..."
      />
      <StudioTreeView items={items} filterItems={filterItems} />
    </Box>
  );
};

/**
 * Example 2: Hidden Files Control
 */
export const HiddenFilesControl = () => {
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);

  const items: TreeViewItem[] = [
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

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Hidden Files Control
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showHiddenFiles}
            onChange={(e) => setShowHiddenFiles(e.target.checked)}
          />
        }
        label="Show Hidden Files"
        sx={{ mb: 2 }}
      />
      <StudioTreeView items={items} showHiddenFiles={showHiddenFiles} />
    </Box>
  );
};

/**
 * Example 3: Custom Empty States
 */
export const CustomEmptyStates = () => {
  const [items, setItems] = useState<TreeViewItem[]>([]);
  const [hasDataSource, setHasDataSource] = useState(false);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Custom Empty States
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => setItems([])}
        >
          Clear Items
        </Button>
        <Button
          variant="outlined"
          onClick={() => setItems([{ id: '1', label: 'Item 1' }])}
        >
          Add Items
        </Button>
        <FormControlLabel
          control={
            <Switch
              checked={hasDataSource}
              onChange={(e) => setHasDataSource(e.target.checked)}
            />
          }
          label="Has Data Source"
        />
      </Box>
      <StudioTreeView
        items={items}
        dataSource={hasDataSource ? undefined : undefined} // Simulate no data source
        emptyStateMessage="No items available in this tree."
        noItemsMatchMessage="No items match your current filters."
        noDataSourceMessage="Please configure a data source to load items."
      />
    </Box>
  );
};

/**
 * Example 4: ItemDataContext
 */
export const ItemDataContextExample = () => {
  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      type: 'directory',
      customProperty: 'custom-value-1',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file', customProperty: 'custom-value-1-1' },
        { id: '1-2', label: 'file2.txt', type: 'file', customProperty: 'custom-value-1-2' },
      ],
    },
  ];

  const ItemDisplay = () => {
    const { getFullItem } = useContext(ItemDataContext);
    const [selectedId, setSelectedId] = useState<string>('1');

    const fullItem = getFullItem(selectedId);

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            onItemClick={(event, itemId) => setSelectedId(String(itemId))}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Full Item Data (via ItemDataContext)
          </Typography>
          {fullItem ? (
            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(fullItem, null, 2)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click an item to see its full data
            </Typography>
          )}
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        ItemDataContext
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use ItemDataContext to access full item data with all custom properties, even after filtering.
      </Typography>
      <ItemDisplay />
    </Box>
  );
};

/**
 * Example 5: onItemExpansion Callback
 */
export const OnItemExpansionExample = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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
        onItemExpansion Callback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        The onItemExpansion callback is called when an item expands (different from onItemExpansionToggle which is called on both expand and collapse).
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            onItemExpansion={(itemId) => {
              setExpandedItems((prev) => [...prev, String(itemId)]);
            }}
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Expanded Items (via onItemExpansion)
          </Typography>
          {expandedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No items expanded yet
            </Typography>
          ) : (
            expandedItems.map((id) => (
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
 * Example 6: Combined RichTreeViewPlus Features
 */
export const CombinedRichTreeViewPlusFeatures = () => {
  const [showHiddenFiles, setShowHiddenFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const items: TreeViewItem[] = [
    {
      id: '1',
      label: 'Documents',
      type: 'directory',
      children: [
        { id: '1-1', label: 'file1.txt', type: 'file', hidden: false },
        { id: '1-2', label: '.hidden-file', type: 'file', hidden: true },
        { id: '1-3', label: 'document.pdf', type: 'file', hidden: false },
      ],
    },
    {
      id: '2',
      label: 'Pictures',
      type: 'directory',
      children: [
        { id: '2-1', label: 'photo1.jpg', type: 'file', hidden: false },
        { id: '2-2', label: '.hidden-photo', type: 'file', hidden: true },
      ],
    },
  ];

  const filterItems = (itemsToFilter: TreeViewItem[]): TreeViewItem[] => {
    let filtered = itemsToFilter;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered
        .filter((item) => {
          const label = item.label?.toLowerCase() || '';
          return label.includes(query);
        })
        .map((item) => {
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterItems(item.children);
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return item;
        })
        .filter((item) => {
          const label = item.label?.toLowerCase() || '';
          return label.includes(query) || (item.children && item.children.length > 0);
        });
    }

    return filtered;
  };

  const ItemDisplay = () => {
    const { getFullItem } = useContext(ItemDataContext);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const fullItem = selectedId ? getFullItem(selectedId) : null;

    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <StudioTreeView
            items={items}
            showHiddenFiles={showHiddenFiles}
            filterItems={filterItems}
            onItemClick={(event, itemId) => setSelectedId(String(itemId))}
            onItemExpansion={(itemId) => {
              setExpandedItems((prev) => [...prev, String(itemId)]);
            }}
            emptyStateMessage="No items available."
            noItemsMatchMessage="No items match your search."
          />
        </Box>
        <Paper sx={{ width: 300, p: 2, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Item Data
          </Typography>
          {fullItem ? (
            <Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(fullItem, null, 2)}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Click an item to see its full data
            </Typography>
          )}
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Expanded Items
            </Typography>
            {expandedItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No items expanded
              </Typography>
            ) : (
              expandedItems.map((id) => (
                <Typography key={id} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {id}
                </Typography>
              ))
            )}
          </Box>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Combined RichTreeViewPlus Features
      </Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={showHiddenFiles}
              onChange={(e) => setShowHiddenFiles(e.target.checked)}
            />
          }
          label="Show Hidden Files"
        />
        <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          placeholder="Filter items..."
        />
      </Box>
      <ItemDisplay />
    </Box>
  );
};
