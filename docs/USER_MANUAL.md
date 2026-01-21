# HandyTreeView User's Manual

A comprehensive guide to using the HandyTreeView component - a fully-featured, accessible tree view component for React with Material-UI support.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Basic Usage](#basic-usage)
5. [Features](#features)
   - [Expansion Control](#expansion-control)
   - [Selection](#selection)
   - [Keyboard Navigation](#keyboard-navigation)
   - [User Interactions](#user-interactions)
   - [Visual Features](#visual-features)
   - [Accessibility](#accessibility)
   - [Performance](#performance)
   - [Lazy Loading](#lazy-loading)
   - [Programmatic Control](#programmatic-control)
   - [Customization](#customization)
6. [API Reference](#api-reference)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

HandyTreeView is a fully custom tree view component. It offers complete control over behavior and features, making it ideal for building file explorers, navigation menus, hierarchical data displays, and more.

### Key Features

- ✅ **Lazy Loading** - Support for `dataSource` and `dataSourceCache`
- ✅ **Multi-Selection** - Single and multi-selection with checkbox support
- ✅ **Controlled/Uncontrolled** - Both expansion and selection modes
- ✅ **Selection Propagation** - Auto-select/deselect parent/child relationships
- ✅ **Keyboard Navigation** - Full keyboard support (Arrow keys, Enter, Space, Home, End)
- ✅ **User Interactions** - Click, double-click, right-click, hover states, context menu support
- ✅ **Visual Features** - Expand/collapse animations, loading states, error states, focus indicators, custom icons
- ✅ **Accessibility** - Full ARIA support, screen reader announcements, keyboard navigation, focus management
- ✅ **Performance** - Memoization, virtual scrolling support, efficient re-rendering
- ✅ **Custom Styling** - Material-UI theme integration
- ✅ **Programmatic Control** - API ref for programmatic manipulation

---

## Installation

### NPM

```bash
npm install @handy-components/handy-tree-view
```

### Package.json (for local development)

Since this package is currently private, for local development use a file dependency:

```json
{
  "dependencies": {
    "@handy-components/handy-tree-view": "file:../handy-tree-view"
  }
}
```

### Import

```typescript
import { HandyTreeView, TreeViewItem, HandyTreeViewApiRef } from '@handy-components/handy-tree-view';
```

---

## Quick Start

Here's a minimal example to get you started:

```tsx
import { HandyTreeView, TreeViewItem } from '@handy-components/handy-tree-view';

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

function App() {
  return <HandyTreeView items={items} />;
}
```

---

## Basic Usage

### Static Tree

The simplest way to use HandyTreeView is with a static array of items:

```tsx
import { HandyTreeView, TreeViewItem } from '@handy-components/handy-tree-view';

const items: TreeViewItem[] = [
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

function MyTreeView() {
  return <HandyTreeView items={items} />;
}
```

### TreeViewItem Interface

Each item in the tree must conform to the `TreeViewItem` interface:

```typescript
interface TreeViewItem {
  id: string;                    // Unique identifier (required)
  label: string;                 // Display text (required)
  children?: TreeViewItem[];     // Child items (optional)
  childrenCount?: number;         // Count of children (for lazy loading)
  hasChildren?: boolean;         // Whether item can have children
  type?: "file" | "directory" | "placeholder";
  isHidden?: boolean;           // Whether item is hidden
  isSystem?: boolean;           // Whether item is a system file
  isPlaceholder?: boolean;      // Whether item is a placeholder
  hidden?: boolean;             // Alternative property name for hidden
  readonly?: boolean;          // Whether item is read-only
  [key: string]: any;          // Additional custom properties
}
```

---

## Features

### Expansion Control

#### Uncontrolled Expansion

By default, HandyTreeView manages expansion state internally. You can set initial expanded items:

```tsx
function UncontrolledTree() {
  return (
    <HandyTreeView
      items={items}
      defaultExpandedItems={['1', '1-3']}  // Initially expand these items
    />
  );
}
```

#### Controlled Expansion

For full control over expansion state:

```tsx
import { useState } from 'react';

function ControlledTree() {
  const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

  return (
    <HandyTreeView
      items={items}
      expandedItems={expandedItems}
      onExpandedItemsChange={(event, itemIds) => {
        setExpandedItems(itemIds as string[]);
      }}
    />
  );
}
```

#### Expansion Trigger

Control which part of the item triggers expansion:

```tsx
// Expand when clicking the icon/chevron only
<HandyTreeView
  items={items}
  expansionTrigger="iconContainer"
/>

// Expand when clicking anywhere on the item (default)
<HandyTreeView
  items={items}
  expansionTrigger="content"
/>
```

---

### Selection

#### Single Selection

```tsx
function SingleSelectionTree() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <HandyTreeView
      items={items}
      selectedItems={selectedItem}
      onSelectedItemsChange={(event, itemIds) => {
        setSelectedItem(itemIds as string | null);
      }}
    />
  );
}
```

#### Multi-Selection

Enable multi-selection with checkboxes:

```tsx
function MultiSelectionTree() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <HandyTreeView
      items={items}
      multiSelect
      checkboxSelection
      selectedItems={selectedItems}
      onSelectedItemsChange={(event, itemIds) => {
        setSelectedItems(itemIds as string[]);
      }}
    />
  );
}
```

#### Selection Propagation

Automatically select/deselect parent and child items:

```tsx
function SelectionPropagationTree() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <HandyTreeView
      items={items}
      multiSelect
      checkboxSelection
      selectionPropagation={{
        descendants: true,  // Selecting parent selects all children
        parents: true       // Selecting all children selects parent
      }}
      selectedItems={selectedItems}
      onSelectedItemsChange={(event, itemIds) => {
        setSelectedItems(itemIds as string[]);
      }}
    />
  );
}
```

#### Disable Selection

Disable selection entirely or for specific items:

```tsx
// Disable selection completely
<HandyTreeView
  items={items}
  disableSelection
/>

// Disable selection for specific items
<HandyTreeView
  items={items}
  isItemSelectionDisabled={(itemId) => itemId === '2'}
/>
```

---

### Keyboard Navigation

HandyTreeView provides full keyboard navigation support:

#### Keyboard Shortcuts

- **Arrow Up/Down** - Navigate between items
- **Arrow Left** - Collapse expanded item or move to parent
- **Arrow Right** - Expand collapsed item or move to first child
- **Enter/Space** - Select focused item
- **Home** - Move to first item
- **End** - Move to last item
- **Page Up/Down** - Navigate by page
- **Escape** - Cancel editing or clear selection
- **Shift + Arrow** - Multi-select range (when multiSelect is enabled)

#### Example

```tsx
function KeyboardNavigationTree() {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Use Arrow keys to navigate, Enter/Space to select, Home/End to jump to first/last item
      </Typography>
      <HandyTreeView items={items} />
    </Box>
  );
}
```

#### Auto-Expand on Navigation

Automatically expand items when navigating to them:

```tsx
<HandyTreeView
  items={items}
  autoExpandOnNavigation={true}
/>
```

---

### User Interactions

#### Click Handling

```tsx
function ClickHandlingTree() {
  const handleClick = (event: React.MouseEvent, itemId: string | number) => {
    console.log('Clicked item:', itemId);
  };

  return (
    <HandyTreeView
      items={items}
      onItemClick={handleClick}
    />
  );
}
```

#### Double-Click Handling

```tsx
function DoubleClickTree() {
  const handleDoubleClick = (event: React.MouseEvent, itemId: string | number) => {
    console.log('Double-clicked item:', itemId);
    // Typically used to open files or folders
  };

  return (
    <HandyTreeView
      items={items}
      onItemDoubleClick={handleDoubleClick}
    />
  );
}
```

#### Right-Click Context Menu

```tsx
import { Menu, MenuItem } from '@mui/material';

function ContextMenuTree() {
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    itemId: string | number | null;
  } | null>(null);

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

  return (
    <>
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
        <MenuItem onClick={handleClose}>Open</MenuItem>
        <MenuItem onClick={handleClose}>Rename</MenuItem>
        <MenuItem onClick={handleClose}>Delete</MenuItem>
        <MenuItem onClick={handleClose}>Properties</MenuItem>
      </Menu>
    </>
  );
}
```

#### Hover States

```tsx
function HoverTree() {
  const handleHover = (event: React.MouseEvent, itemId: string | number) => {
    console.log('Hovered item:', itemId);
  };

  const handleHoverEnd = (event: React.MouseEvent, itemId: string | number) => {
    console.log('Hover ended on item:', itemId);
  };

  return (
    <HandyTreeView
      items={items}
      onItemHover={handleHover}
      onItemHoverEnd={handleHoverEnd}
    />
  );
}
```

---

### Visual Features

#### Expand/Collapse Animations

Smooth animations when expanding and collapsing items:

```tsx
<HandyTreeView
  items={items}
  animateExpansion={true}  // Enable animations (default: true)
/>
```

#### Custom Icons

Provide custom icons for items:

```tsx
import { Folder, FolderOpen, InsertDriveFile } from '@mui/icons-material';

function CustomIconsTree() {
  return (
    <HandyTreeView
      items={items}
      getItemIcon={(item) => {
        if (item.children && item.children.length > 0) {
          return <Folder />;
        }
        return <InsertDriveFile />;
      }}
    />
  );
}
```

#### Loading States

Show loading indicators for items:

```tsx
function LoadingStatesTree() {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set(['1']));

  return (
    <HandyTreeView
      items={items}
      isItemLoading={(itemId) => loadingItems.has(itemId as string)}
    />
  );
}
```

#### Error States

Display error messages for items:

```tsx
function ErrorStatesTree() {
  const [errorItems, setErrorItems] = useState<Map<string, string>>(
    new Map([['1', 'Failed to load directory contents']])
  );

  return (
    <HandyTreeView
      items={items}
      getItemError={(itemId) => errorItems.get(itemId as string) || null}
    />
  );
}
```

#### Custom Labels

Customize how item labels are displayed:

```tsx
function CustomLabelsTree() {
  return (
    <HandyTreeView
      items={items}
      getItemLabel={(item) => {
        const type = item.type === 'directory' ? '📁' : '📄';
        return `${type} ${item.label}`;
      }}
    />
  );
}
```

---

### Accessibility

#### Screen Reader Support

HandyTreeView includes built-in screen reader support:

```tsx
function ScreenReaderTree() {
  const [announcements, setAnnouncements] = useState<string[]>([]);

  const handleAnnounce = (message: string) => {
    setAnnouncements((prev) => [...prev.slice(-9), message]);
  };

  return (
    <HandyTreeView
      items={items}
      enableScreenReader={true}
      onScreenReaderAnnounce={handleAnnounce}
    />
  );
}
```

#### ARIA Attributes

HandyTreeView automatically provides proper ARIA attributes:
- `role="tree"` on the root element
- `role="treeitem"` on each item
- `aria-expanded` for expandable items
- `aria-selected` for selected items
- `aria-level`, `aria-posinset`, `aria-setsize` for hierarchical structure
- `aria-multiselectable` when multi-selection is enabled

#### Focus Management

```tsx
function FocusManagementTree() {
  const handleFocus = (event: React.SyntheticEvent, itemId: string | number) => {
    console.log('Focused item:', itemId);
  };

  return (
    <HandyTreeView
      items={items}
      onItemFocus={handleFocus}
    />
  );
}
```

#### Disabled Items Focusable

Control whether disabled items can receive focus:

```tsx
<HandyTreeView
  items={items}
  isItemDisabled={(itemId) => itemId === '2'}
  disabledItemsFocusable={false}  // Disabled items cannot receive focus (default)
/>
```

---

### Performance

#### Virtual Scrolling

For large trees (1000+ items), enable virtual scrolling:

```tsx
function VirtualScrollingTree() {
  const largeItems: TreeViewItem[] = Array.from({ length: 1000 }, (_, i) => ({
    id: `item-${i}`,
    label: `Item ${i}`,
  }));

  return (
    <HandyTreeView
      items={largeItems}
      enableVirtualScrolling={true}
      viewportHeight={400}  // Height of visible area
      itemHeight={32}       // Height of each item
    />
  );
}
```

#### Memoization

HandyTreeView uses React.memo and useMemo internally for optimal performance. For best results, memoize your items array if it's computed:

```tsx
import { useMemo } from 'react';

function OptimizedTree() {
  const items = useMemo(() => {
    // Expensive computation
    return computeTreeItems();
  }, [dependencies]);

  return <HandyTreeView items={items} />;
}
```

---

### Lazy Loading

HandyTreeView supports lazy loading through a `dataSource` interface:

#### DataSource Interface

```typescript
interface DataSource {
  getTreeItems: (params: { parentId?: string }) => Promise<TreeViewItem[]>;
  getChildrenCount: (item: TreeViewItem) => number;
}
```

#### Basic Lazy Loading

```tsx
import { LazyLoadingDataSource, LazyLoadingConfig } from '@handy-components/handy-tree-view';

const dataSource: DataSource = {
  async getTreeItems({ parentId }) {
    // Fetch items from API
    const response = await fetch(`/api/items?parentId=${parentId || ''}`);
    return response.json();
  },
  getChildrenCount(item) {
    return item.childrenCount || 0;
  },
};

function LazyLoadingTree() {
  return (
    <HandyTreeView
      dataSource={dataSource}
      lazyLoading={{
        enabled: true,
        staleTime: 5000,      // Cache for 5 seconds
        maxCacheSize: 1000,   // Maximum cached items
      }}
    />
  );
}
```

#### Using LazyLoadingDataSource

```tsx
import { LazyLoadingDataSource } from '@handy-components/handy-tree-view';

const baseDataSource: DataSource = {
  async getTreeItems({ parentId }) {
    // Your data fetching logic
  },
  getChildrenCount(item) {
    return item.childrenCount || 0;
  },
};

const lazyDataSource = new LazyLoadingDataSource(baseDataSource, {
  enabled: true,
  staleTime: 5000,
  maxCacheSize: 1000,
});

function LazyLoadingTree() {
  return <HandyTreeView dataSource={lazyDataSource} />;
}
```

#### DataSource Cache

Provide a custom cache implementation:

```typescript
interface DataSourceCache {
  get: (key: string) => Promise<any> | any;
  set: (key: string, value: any, ttl?: number) => void;
  clear: () => void;
  delete?: (key: string) => boolean;
  has?: (key: string) => boolean;
}

const customCache: DataSourceCache = {
  get: (key) => {
    // Retrieve from cache
  },
  set: (key, value, ttl) => {
    // Store in cache
  },
  clear: () => {
    // Clear cache
  },
};

<HandyTreeView
  dataSource={dataSource}
  dataSourceCache={customCache}
/>
```

---

### Programmatic Control

Use the API ref for programmatic control:

```tsx
import { useRef } from 'react';
import { HandyTreeViewApiRef } from '@handy-components/handy-tree-view';

function ProgrammaticControlTree() {
  const apiRef = useRef<HandyTreeViewApiRef>({ current: undefined });

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

  const handleSelectItem = () => {
    apiRef.current?.current?.setItemSelection?.('1-1', true);
  };

  const handleGetItem = () => {
    const item = apiRef.current?.current?.getItem?.('1-1');
    console.log('Item:', item);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        <Button onClick={handleFocusFirst}>Focus First</Button>
        <Button onClick={handleExpandAll}>Expand All</Button>
        <Button onClick={handleCollapseAll}>Collapse All</Button>
        <Button onClick={handleSelectItem}>Select Item</Button>
        <Button onClick={handleGetItem}>Get Item</Button>
      </Box>
      <HandyTreeView items={items} apiRef={apiRef} />
    </Box>
  );
}
```

#### Available API Methods

- `focusItem(itemId)` - Focus a specific item
- `getItem(itemId)` - Get item data
- `getItemDOMElement(itemId)` - Get the DOM element for an item
- `getItemTree()` - Get the entire tree structure
- `getParentId(itemId)` - Get the parent ID of an item
- `isItemExpanded(itemId)` - Check if an item is expanded
- `setEditedItem(itemId)` - Set an item to editing mode
- `setIsItemDisabled(itemId, disabled)` - Enable/disable an item
- `setItemExpansion(itemId, isExpanded)` - Expand/collapse an item
- `setItemSelection(itemId, isSelected)` - Select/deselect an item
- `updateItemChildren(itemId, children)` - Update an item's children
- `updateItemLabel(itemId, label)` - Update an item's label
- `getItemOrderedChildrenIds(itemId)` - Get ordered child IDs

---

### Customization

#### Disabled Items

```tsx
<HandyTreeView
  items={items}
  isItemDisabled={(itemId) => itemId === '2'}
/>
```

#### Custom Styling

```tsx
import { Box } from '@mui/material';

<HandyTreeView
  items={items}
  sx={{
    maxWidth: 400,
    maxHeight: 600,
    overflow: 'auto',
  }}
  className="my-tree-view"
/>
```

#### Custom Item Rendering

Use `getItemLabel`, `getItemIcon`, and other custom functions:

```tsx
<HandyTreeView
  items={items}
  getItemLabel={(item) => `[${item.type}] ${item.label}`}
  getItemIcon={(item) => {
    if (item.type === 'directory') {
      return <Folder />;
    }
    return <InsertDriveFile />;
  }}
/>
```

#### Filtering

Filter items using the `filterItems` prop:

```tsx
function FilteredTree() {
  const [searchTerm, setSearchTerm] = useState('');

  const filterItems = (items: TreeViewItem[]) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Box>
      <TextField
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      <HandyTreeView
        items={items}
        filterItems={filterItems}
      />
    </Box>
  );
}
```

#### Empty States

Customize empty state messages:

```tsx
<HandyTreeView
  items={items}
  emptyStateMessage="No items available"
  noItemsMatchMessage="No items match your filter"
  noDataSourceMessage="No data source configured"
/>
```

---

## API Reference

### HandyTreeView Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeViewItem[]` | `[]` | Array of tree items to display |
| `dataSource` | `DataSource` | `undefined` | Data source for lazy loading |
| `dataSourceCache` | `DataSourceCache` | `undefined` | Cache for data source |
| `lazyLoading` | `LazyLoadingConfig` | `undefined` | Lazy loading configuration |
| `multiSelect` | `boolean` | `false` | Enable multi-selection |
| `checkboxSelection` | `boolean` | `false` | Show checkboxes for selection |
| `selectedItems` | `TreeViewItemId \| TreeViewItemId[]` | `undefined` | Controlled selected items |
| `defaultSelectedItems` | `TreeViewItemId \| TreeViewItemId[]` | `undefined` | Default selected items (uncontrolled) |
| `onSelectedItemsChange` | `(event, itemIds) => void` | `undefined` | Callback when selection changes |
| `selectionPropagation` | `{ descendants?: boolean, parents?: boolean }` | `{ descendants: false, parents: false }` | Selection propagation settings |
| `expandedItems` | `TreeViewItemId[]` | `undefined` | Controlled expanded items |
| `defaultExpandedItems` | `TreeViewItemId[]` | `[]` | Default expanded items (uncontrolled) |
| `onExpandedItemsChange` | `(event, itemIds) => void` | `undefined` | Callback when expansion changes |
| `expansionTrigger` | `'content' \| 'iconContainer'` | `'content'` | Which part triggers expansion |
| `isItemDisabled` | `(itemId) => boolean` | `undefined` | Check if item is disabled |
| `isItemSelectionDisabled` | `(itemId) => boolean` | `undefined` | Check if item selection is disabled |
| `disableSelection` | `boolean` | `false` | Disable selection entirely |
| `disabledItemsFocusable` | `boolean` | `false` | Whether disabled items can receive focus |
| `onItemClick` | `(event, itemId) => void` | `undefined` | Click handler |
| `onItemDoubleClick` | `(event, itemId) => void` | `undefined` | Double-click handler |
| `onItemContextMenu` | `(event, itemId) => void` | `undefined` | Right-click handler |
| `onItemHover` | `(event, itemId) => void` | `undefined` | Hover handler |
| `onItemHoverEnd` | `(event, itemId) => void` | `undefined` | Hover end handler |
| `onItemFocus` | `(event, itemId) => void` | `undefined` | Focus handler |
| `getItemIcon` | `(item) => React.ReactNode` | `undefined` | Get custom icon for item |
| `getItemLabel` | `(item) => string` | `(item) => item.label` | Get custom label for item |
| `getItemChildren` | `(item) => TreeViewItem[]` | `(item) => item.children \|\| []` | Get children of item |
| `getItemId` | `(item) => TreeViewItemId` | `(item) => item.id` | Get ID of item |
| `isItemLoading` | `(itemId) => boolean` | `undefined` | Check if item is loading |
| `getItemError` | `(itemId) => string \| null` | `undefined` | Get error message for item |
| `animateExpansion` | `boolean` | `true` | Enable expand/collapse animations |
| `enableScreenReader` | `boolean` | `true` | Enable screen reader support |
| `onScreenReaderAnnounce` | `(message) => void` | `undefined` | Custom screen reader announcement handler |
| `enableVirtualScrolling` | `boolean` | `false` | Enable virtual scrolling |
| `viewportHeight` | `number` | `400` | Virtual scrolling viewport height |
| `itemHeight` | `number` | `32` | Virtual scrolling item height |
| `apiRef` | `HandyTreeViewApiRef` | `undefined` | API reference for programmatic control |
| `filterItems` | `(items) => TreeViewItem[]` | `undefined` | Custom filter function |
| `showHiddenFiles` | `boolean` | `false` | Show hidden files/folders |
| `emptyStateMessage` | `string` | `undefined` | Custom empty state message |
| `noItemsMatchMessage` | `string` | `undefined` | Custom no items match message |
| `noDataSourceMessage` | `string` | `undefined` | Custom no data source message |
| `onItemExpansion` | `(itemId) => void` | `undefined` | Callback when item expands |
| `autoExpandOnNavigation` | `boolean` | `false` | Auto-expand on keyboard navigation |
| `sx` | `SxProps` | `undefined` | Material-UI sx prop |
| `className` | `string` | `undefined` | CSS class name |
| `id` | `string` | `undefined` | HTML id attribute |
| `aria-label` | `string` | `undefined` | ARIA label |
| `aria-labelledby` | `string` | `undefined` | ARIA labelledby |

### TreeViewItem Interface

```typescript
interface TreeViewItem {
  id: string;                    // Unique identifier (required)
  label: string;                 // Display text (required)
  children?: TreeViewItem[];     // Child items (optional)
  childrenCount?: number;         // Count of children (for lazy loading)
  hasChildren?: boolean;         // Whether item can have children
  type?: "file" | "directory" | "placeholder";
  isHidden?: boolean;           // Whether item is hidden
  isSystem?: boolean;           // Whether item is a system file
  isPlaceholder?: boolean;      // Whether item is a placeholder
  hidden?: boolean;             // Alternative property name for hidden
  readonly?: boolean;          // Whether item is read-only
  [key: string]: any;          // Additional custom properties
}
```

### HandyTreeViewApiRef

```typescript
interface HandyTreeViewApiRef {
  current?: {
    focusItem?: (itemId: TreeViewItemId) => void;
    getItem?: (itemId: TreeViewItemId) => TreeViewItem | null;
    getItemDOMElement?: (itemId: TreeViewItemId) => HTMLElement | null;
    getItemTree?: () => TreeViewItem[];
    getParentId?: (itemId: TreeViewItemId) => TreeViewItemId | null;
    isItemExpanded?: (itemId: TreeViewItemId) => boolean;
    setEditedItem?: (itemId: TreeViewItemId | null) => void;
    setIsItemDisabled?: (itemId: TreeViewItemId, disabled: boolean) => void;
    setItemExpansion?: (itemId: TreeViewItemId, isExpanded: boolean) => void;
    setItemSelection?: (itemId: TreeViewItemId, isSelected: boolean) => void;
    updateItemChildren?: (itemId: TreeViewItemId, children: TreeViewItem[]) => void;
    updateItemLabel?: (itemId: TreeViewItemId, label: string) => void;
    getItemOrderedChildrenIds?: (itemId: TreeViewItemId) => TreeViewItemId[];
  };
}
```

---

## Best Practices

### 1. Memoize Items Array

If your items array is computed, memoize it to prevent unnecessary re-renders:

```tsx
import { useMemo } from 'react';

function MyComponent() {
  const items = useMemo(() => {
    return computeTreeItems();
  }, [dependencies]);

  return <HandyTreeView items={items} />;
}
```

### 2. Use Controlled Mode for Complex State

For complex applications, use controlled mode to have full control over state:

```tsx
const [expandedItems, setExpandedItems] = useState<string[]>([]);
const [selectedItems, setSelectedItems] = useState<string[]>([]);

<HandyTreeView
  items={items}
  expandedItems={expandedItems}
  onExpandedItemsChange={(event, itemIds) => setExpandedItems(itemIds as string[])}
  selectedItems={selectedItems}
  onSelectedItemsChange={(event, itemIds) => setSelectedItems(itemIds as string[])}
/>
```

### 3. Optimize Large Trees

For trees with 1000+ items, enable virtual scrolling:

```tsx
<HandyTreeView
  items={largeItems}
  enableVirtualScrolling={true}
  viewportHeight={400}
  itemHeight={32}
/>
```

### 4. Use Lazy Loading for Remote Data

For data fetched from APIs, use lazy loading:

```tsx
const dataSource: DataSource = {
  async getTreeItems({ parentId }) {
    const response = await fetch(`/api/items?parentId=${parentId || ''}`);
    return response.json();
  },
  getChildrenCount(item) {
    return item.childrenCount || 0;
  },
};

<HandyTreeView
  dataSource={dataSource}
  lazyLoading={{ enabled: true, staleTime: 5000 }}
/>
```

### 5. Provide Accessible Labels

Always provide meaningful labels and ARIA attributes:

```tsx
<HandyTreeView
  items={items}
  aria-label="File browser"
  aria-labelledby="tree-title"
/>
```

### 6. Handle Loading and Error States

Provide visual feedback for loading and error states:

```tsx
<HandyTreeView
  items={items}
  isItemLoading={(itemId) => loadingItems.has(itemId as string)}
  getItemError={(itemId) => errorItems.get(itemId as string) || null}
/>
```

---

## Troubleshooting

### Items Not Rendering

- Ensure `items` prop is provided and is an array
- Check that each item has `id` and `label` properties
- Verify items are not filtered out by `filterItems`

### Selection Not Working

- Ensure `multiSelect` is enabled for multi-selection
- Check `disableSelection` is not set to `true`
- Verify `isItemSelectionDisabled` is not blocking selection

### Expansion Not Working

- Check that items have `children` property or `hasChildren` is `true`
- Verify `isItemDisabled` is not blocking expansion
- Ensure controlled `expandedItems` state is properly managed

### Performance Issues

- Enable virtual scrolling for large trees
- Memoize items array if computed
- Use lazy loading for remote data
- Check for unnecessary re-renders

### Accessibility Issues

- Ensure `enableScreenReader` is enabled
- Provide proper ARIA labels
- Test with keyboard navigation
- Verify focus management

---

## Examples

For more examples, see:
- `__examples__/BasicUsage.tsx` - Basic usage patterns
- `__examples__/UserInteractions.tsx` - User interaction examples
- `__examples__/VisualFeatures.tsx` - Visual feature examples
- `__examples__/AccessibilityPerformance.tsx` - Accessibility and performance examples
- `__stories__/HandyTreeView.stories.tsx` - Storybook stories

---

## License

MIT

---

## Support

For issues, questions, or contributions, please visit:
- GitHub: https://github.com/handy-components/handy-tree-view
- Issues: https://github.com/handy-components/handy-tree-view/issues
