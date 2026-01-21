# HandyTreeView

A fully custom tree view component.

## Features

- ✅ **Lazy Loading** - Support for `dataSource` and `dataSourceCache`
- ✅ **Multi-Selection** - Single and multi-selection with checkbox support
- ✅ **Controlled/Uncontrolled** - Both expansion and selection modes
- ✅ **Selection Propagation** - Auto-select/deselect parent/child relationships
- ✅ **Label Editing** - In-place editing of item labels
- ✅ **Item Reordering** - Drag-and-drop reordering of tree items
- ✅ **Keyboard Navigation** - Full keyboard support (Arrow keys, Enter, Space, Home, End)
- ✅ **User Interactions** - Click, double-click, right-click, hover states, context menu support
- ✅ **Visual Features** - Expand/collapse animations, loading states, error states, focus indicators, custom icons
- ✅ **Accessibility** - Full ARIA support, screen reader announcements, keyboard navigation, focus management
- ✅ **Performance** - Memoization, virtual scrolling support, efficient re-rendering
- ✅ **Custom Styling** - Material-UI theme integration
- ✅ **Programmatic Control** - API ref for programmatic manipulation
- ✅ **Advanced Features** - Custom filtering, hidden files control, custom empty states, ItemDataContext, onItemExpansion callback

## Installation

```bash
npm install @handy-components/handy-tree-view
```

```typescript
import { HandyTreeView } from '@handy-components/handy-tree-view';
```

## Basic Usage

### Static Tree

```tsx
import { HandyTreeView } from '@handy-components/handy-tree-view';

const items = [
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

<HandyTreeView items={items} />
```

### Controlled Expansion

```tsx
const [expandedItems, setExpandedItems] = useState<string[]>(['1']);

<HandyTreeView
  items={items}
  expandedItems={expandedItems}
  onExpandedItemsChange={(event, itemIds) => {
    setExpandedItems(itemIds as string[]);
  }}
/>
```

### Multi-Selection with Checkboxes

```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);

<HandyTreeView
  items={items}
  multiSelect
  checkboxSelection
  selectedItems={selectedItems}
  onSelectedItemsChange={(event, itemIds) => {
    setSelectedItems(itemIds as string[]);
  }}
/>
```

### Using API Ref

```tsx
const apiRef = useRef<HandyTreeViewApiRef>({ current: undefined });

<HandyTreeView items={items} apiRef={apiRef} />

// Programmatically control the tree
apiRef.current?.current?.focusItem?.('1');
apiRef.current?.current?.setItemExpansion?.('1', true);
apiRef.current?.current?.setItemSelection?.('1', true);
```

### User Interactions

```tsx
<HandyTreeView
  items={items}
  onItemClick={(event, itemId) => console.log('Clicked:', itemId)}
  onItemDoubleClick={(event, itemId) => console.log('Double-clicked:', itemId)}
  onItemContextMenu={(event, itemId) => {
    event.preventDefault();
    // Show context menu
  }}
  onItemHover={(event, itemId) => console.log('Hovered:', itemId)}
  onItemHoverEnd={(event, itemId) => console.log('Hover ended:', itemId)}
/>
```

### Visual Features

```tsx
<HandyTreeView
  items={items}
  animateExpansion={true}
  isItemLoading={(itemId) => loadingItems.has(itemId)}
  getItemError={(itemId) => errorItems.get(itemId) || null}
  getItemIcon={(item) => {
    if (item.type === 'directory') {
      return <Folder fontSize="small" />;
    }
    return <InsertDriveFile fontSize="small" />;
  }}
/>
```

### Accessibility

```tsx
<HandyTreeView
  items={items}
  enableScreenReader={true}
  onScreenReaderAnnounce={(message) => console.log('Announcement:', message)}
  aria-label="File system tree"
  multiSelect
/>
```

### Performance

```tsx
<HandyTreeView
  items={largeItems}
  enableVirtualScrolling={true}
  viewportHeight={400}
  itemHeight={32}
/>
```

### Auto-expand on Navigation

```tsx
<HandyTreeView
  items={items}
  autoExpandOnNavigation={true}
/>
```

When `autoExpandOnNavigation` is enabled, items with children will automatically expand when they receive focus via keyboard navigation or programmatic focus (e.g., `apiRef.current.focusItem(itemId)`). This is useful for improving navigation efficiency in large trees.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TreeViewItem[]` | `[]` | Static tree items to display |
| `dataSource` | `DataSource` | `undefined` | Data source for lazy loading |
| `dataSourceCache` | `DataSourceCache` | `undefined` | Cache for data source |
| `apiRef` | `HandyTreeViewApiRef` | `undefined` | API reference for programmatic control |
| `multiSelect` | `boolean` | `false` | Enable multi-selection |
| `checkboxSelection` | `boolean` | `false` | Show checkboxes for selection |
| `expandedItems` | `TreeViewItemId[]` | `undefined` | Controlled expanded items |
| `defaultExpandedItems` | `TreeViewItemId[]` | `[]` | Default expanded items (uncontrolled) |
| `selectedItems` | `TreeViewItemId \| TreeViewItemId[]` | `undefined` | Controlled selected items |
| `defaultSelectedItems` | `TreeViewItemId \| TreeViewItemId[]` | `undefined` | Default selected items (uncontrolled) |
| `onExpandedItemsChange` | `(event, itemIds) => void` | `undefined` | Callback when expansion changes |
| `onSelectedItemsChange` | `(event, itemIds) => void` | `undefined` | Callback when selection changes |
| `onItemClick` | `(event, itemId) => void` | `undefined` | Callback when item is clicked |
| `onItemDoubleClick` | `(event, itemId) => void` | `undefined` | Callback when item is double-clicked |
| `onItemContextMenu` | `(event, itemId) => void` | `undefined` | Callback when item is right-clicked |
| `onItemHover` | `(event, itemId) => void` | `undefined` | Callback when item is hovered |
| `onItemHoverEnd` | `(event, itemId) => void` | `undefined` | Callback when item hover ends |
| `onItemFocus` | `(event, itemId) => void` | `undefined` | Callback when item receives focus |
| `getItemIcon` | `(item) => React.ReactNode` | `undefined` | Function to get custom icon for item |
| `isItemLoading` | `(itemId) => boolean` | `undefined` | Function to check if item is loading |
| `getItemError` | `(itemId) => string \| null` | `undefined` | Function to get error message for item |
| `animateExpansion` | `boolean` | `true` | Whether to animate expand/collapse |
| `enableScreenReader` | `boolean` | `true` | Whether to enable screen reader announcements |
| `onScreenReaderAnnounce` | `(message) => void` | `undefined` | Custom screen reader announcement handler |
| `enableVirtualScrolling` | `boolean` | `false` | Whether to enable virtual scrolling |
| `viewportHeight` | `number` | `400` | Virtual scrolling viewport height |
| `itemHeight` | `number` | `32` | Virtual scrolling item height |
| `selectionPropagation` | `{ descendants?: boolean, parents?: boolean }` | `{ descendants: false, parents: false }` | Selection propagation settings |
| `isItemEditable` | `(itemId) => boolean` | `undefined` | Function to determine if item is editable |
| `onItemLabelChange` | `(itemId, newLabel) => void` | `undefined` | Callback when item label changes |
| `itemsReordering` | `boolean` | `false` | Whether items can be reordered |
| `isItemReorderable` | `(itemId) => boolean` | `undefined` | Function to determine if item is reorderable |
| `canMoveItemToNewPosition` | `(params) => boolean` | `undefined` | Function to validate if item can be moved |
| `onItemPositionChange` | `(params) => void` | `undefined` | Callback when item position changes |
| `isItemDisabled` | `(itemId) => boolean` | `undefined` | Function to determine if item is disabled |
| `expansionTrigger` | `'content' \| 'iconContainer'` | `'content'` | Which part triggers expansion |
| `autoExpandOnNavigation` | `boolean` | `false` | Whether to automatically expand items when they receive focus via navigation |
| `getItemId` | `(item) => TreeViewItemId` | `(item) => item.id` | Function to get item ID |
| `getItemLabel` | `(item) => string` | `(item) => item.label` | Function to get item label |
| `getItemChildren` | `(item) => TreeViewItem[]` | `(item) => item.children \|\| []` | Function to get item children |
| `selectionPropagation` | `{ descendants?, parents? }` | `{ descendants: false, parents: false }` | Selection propagation settings |
| `sx` | `any` | `undefined` | Custom styles |
| `className` | `string` | `undefined` | Custom className |
| `id` | `string` | `undefined` | Custom id |
| `aria-label` | `string` | `undefined` | ARIA label |
| `aria-labelledby` | `string` | `undefined` | ARIA labelledby |

### API Ref Methods

```typescript
interface HandyTreeViewApiRef {
  current?: {
    focusItem?: (itemId: TreeViewItemId) => void;
    getItem?: (itemId: TreeViewItemId) => TreeViewItem | null;
    getItemDOMElement?: (itemId: TreeViewItemId) => HTMLElement | null;
    getItemTree?: () => TreeViewItem[];
    getParentId?: (itemId: TreeViewItemId) => TreeViewItemId | null;
    isItemExpanded?: (itemId: TreeViewItemId) => boolean;
    setItemExpansion?: (itemId: TreeViewItemId, isExpanded: boolean) => void;
    setItemSelection?: (itemId: TreeViewItemId, isSelected: boolean) => void;
    updateItemChildren?: (itemId: TreeViewItemId, children: TreeViewItem[]) => void;
    updateItemLabel?: (itemId: TreeViewItemId, label: string) => void;
    getItemOrderedChildrenIds?: (itemId: TreeViewItemId) => TreeViewItemId[];
  };
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus tree view |
| `Arrow Up` | Move to previous item |
| `Arrow Down` | Move to next item |
| `Arrow Right` | Expand item / Move to first child |
| `Arrow Left` | Collapse item / Move to parent |
| `Enter` | Expand/Collapse or Select |
| `Space` | Select item |
| `Home` | Focus first item |
| `End` | Focus last item |

## Accessibility

### ARIA Attributes

The component includes comprehensive ARIA attributes:
- `role="tree"` on the root element
- `role="treeitem"` on each item
- `aria-expanded` for expandable items
- `aria-selected` for selected items
- `aria-disabled` for disabled items
- `aria-level` for hierarchy indication
- `aria-multiselectable` when multi-selection is enabled
- `aria-activedescendant` for focused item
- `aria-label` and `aria-labelledby` for labeling

### Screen Reader Support

Screen reader announcements are automatically provided for:
- Item selection changes
- Item expansion/collapse
- Focus changes
- Navigation
- Loading states
- Error states

### Focus Management

- Proper focus indicators with visible outlines
- Keyboard navigation support
- Focus restoration after re-renders
- Programmatic focus control via API ref

## Examples

See the `__examples__` directory for more usage examples:
- Basic static tree
- Controlled expansion
- Multi-selection with checkboxes
- Using API ref
- Custom item rendering
- Disabled items
- User interactions (double-click, right-click, hover)
- Context menu
- File system style interactions
- Visual features (animations, loading states, error states, custom icons)
- Accessibility features (ARIA attributes, screen reader support, keyboard navigation)
- Performance optimizations (memoization, virtual scrolling)

## Storybook

Interactive examples are available in Storybook:
- Basic usage
- Controlled expansion
- Multi-selection
- API ref usage
- Disabled items
- Custom labels
- Keyboard navigation
- Large tree performance

## Testing

Unit tests are available in `__tests__/HandyTreeView.test.tsx`. Run tests with:

```bash
npm test HandyTreeView
```

## Performance

### Memoization

The component uses React.memo and useMemo for optimal performance:
- Tree items are memoized to prevent unnecessary re-renders
- Item maps are cached for O(1) lookups
- Callbacks are memoized with useCallback

### Virtual Scrolling

For very large trees (1000+ items), virtual scrolling can be enabled:
- Only visible items are rendered
- Smooth scrolling performance
- Configurable viewport and item heights

### Best Practices

1. **Memoize items array** if it's computed:
   ```tsx
   const items = useMemo(() => computeItems(), [dependencies]);
   ```

2. **Use virtual scrolling** for large datasets:
   ```tsx
   <HandyTreeView items={items} enableVirtualScrolling={true} />
   ```

3. **Memoize callbacks** passed as props:
   ```tsx
   const handleClick = useCallback((e, id) => { ... }, [deps]);
   ```


## Advanced Features

### Custom Filtering

Use the `filterItems` prop to implement custom filtering logic:

```tsx
const filterItems = (items: TreeViewItem[]): TreeViewItem[] => {
  // Your custom filtering logic
  return items.filter(item => /* your condition */);
};

<HandyTreeView items={items} filterItems={filterItems} />
```

### Hidden Files Control

Control visibility of hidden files with the `showHiddenFiles` prop:

```tsx
<HandyTreeView items={items} showHiddenFiles={false} />
```

When `showHiddenFiles` is `false`, items with:
- Dot prefix (`.hidden-file`)
- `hidden: true` property
- `isHidden: true` property

will be filtered out.

### Custom Empty States

Provide custom messages for different empty states:

```tsx
<HandyTreeView
  items={items}
  emptyStateMessage="No items available in this tree."
  noItemsMatchMessage="No items match your search."
  noDataSourceMessage="Please configure a data source."
/>
```

### ItemDataContext

Access full item data with all custom properties using `ItemDataContext`:

```tsx
import { ItemDataContext } from '@olang-studio/ui';

const MyComponent = () => {
  const { getFullItem } = useContext(ItemDataContext);
  const fullItem = getFullItem('item-id');
  
  // Access all custom properties
  console.log(fullItem?.customProperty);
  
  return <HandyTreeView items={items} />;
};
```

### onItemExpansion Callback

The `onItemExpansion` callback is called when an item expands (different from `onItemExpansionToggle` which is called on both expand and collapse):

```tsx
<HandyTreeView
  items={items}
  onItemExpansion={(itemId) => {
    console.log('Item expanded:', itemId);
  }}
/>
```

### initialRootPath

The `initialRootPath` prop is available for dataSource implementations to use as the starting path for lazy loading. DataSource implementations should check this prop when handling root-level requests.

## Conclusion

HandyTreeView provides a complete, feature-rich tree view component.

## License

MIT – see LICENSE in the repository root for full text
