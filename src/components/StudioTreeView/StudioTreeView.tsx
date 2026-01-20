/**
 * @fileoverview StudioTreeView – Custom Tree View Component
 *
 * A fully custom tree view component that provides all the functionality of
 * RichTreeViewPro without external dependencies. Built specifically for
 * OLangStudio with full control over behavior and features.
 *
 * Key Features:
 * - RichTreeViewPro-compatible API
 * - Lazy loading support with dataSource
 * - Multi-selection with checkboxes
 * - Controlled/uncontrolled expansion and selection
 * - Keyboard navigation
 * - Accessibility (ARIA) support
 * - Custom styling and theming
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { forwardRef, useRef, useState, useCallback, useMemo, useEffect, memo, createContext, useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { TreeViewItem, DataSource, DataSourceCache } from '../../types';
import { StudioTreeItem } from './StudioTreeItem';
import { useStudioTreeViewApi } from './hooks/useStudioTreeViewApi';
import { useExpansion } from './hooks/useExpansion';
import { useSelection } from './hooks/useSelection';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { useUserInteractions } from './hooks/useUserInteractions';
import { useScreenReader } from './hooks/useScreenReader';
import { usePerformance } from './hooks/usePerformance';
import { useLazyLoading } from '../../hooks/useLazyLoading';
import { LazyLoadingConfig } from '../../data/LazyLoadingDataSource';

/**
 * ItemDataContext - Context for accessing full item data with custom properties
 * (RichTreeViewPlus feature)
 */
export const ItemDataContext = createContext<{
  getFullItem: (id: TreeViewItemId) => TreeViewItem | undefined;
}>({
  getFullItem: () => undefined,
});

/**
 * TreeViewItemId type - can be string or number
 */
export type TreeViewItemId = string | number;

/**
 * API Reference interface matching RichTreeViewPro
 */
export interface StudioTreeViewApiRef {
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

/**
 * Props interface matching RichTreeViewPro API
 */
export interface StudioTreeViewProps {
  /** API reference for programmatic control */
  apiRef?: StudioTreeViewApiRef;
  /** Whether items can be reordered (future feature) */
  canMoveItemToNewPosition?: (params: {
    itemId: TreeViewItemId;
    oldPosition: any;
    newPosition: any;
  }) => boolean;
  /** Whether to show checkboxes for selection */
  checkboxSelection?: boolean;
  /** Data source for lazy loading */
  dataSource?: DataSource;
  /** Cache for data source */
  dataSourceCache?: DataSourceCache;
  /** Lazy loading configuration */
  lazyLoading?: LazyLoadingConfig;
  /** Default expanded items (uncontrolled) */
  defaultExpandedItems?: TreeViewItemId[];
  /** Default selected items (uncontrolled) */
  defaultSelectedItems?: TreeViewItemId | TreeViewItemId[];
  /** Whether disabled items are focusable */
  disabledItemsFocusable?: boolean;
  /** Whether selection is disabled */
  disableSelection?: boolean;
  /** Expanded items (controlled) */
  expandedItems?: TreeViewItemId[];
  /** Which part of item triggers expansion */
  expansionTrigger?: 'content' | 'iconContainer';
  /** Function to get children of an item */
  getItemChildren?: (item: TreeViewItem) => TreeViewItem[];
  /** Function to get ID of an item */
  getItemId?: (item: TreeViewItem) => TreeViewItemId;
  /** Function to get label of an item */
  getItemLabel?: (item: TreeViewItem) => string;
  /** Whether an item is disabled */
  isItemDisabled?: (itemId: TreeViewItemId) => boolean;
  /** Whether an item is editable (future feature) */
  isItemEditable?: (itemId: TreeViewItemId) => boolean;
  /** Whether an item is reorderable (future feature) */
  isItemReorderable?: (itemId: TreeViewItemId) => boolean;
  /** Whether an item's selection is disabled */
  isItemSelectionDisabled?: (itemId: TreeViewItemId) => boolean;
  /** Items to display (static tree) */
  items?: TreeViewItem[];
  /** Whether items can be reordered (future feature) */
  itemsReordering?: boolean;
  /** Whether multi-selection is enabled */
  multiSelect?: boolean;
  /** Callback when expanded items change */
  onExpandedItemsChange?: (event: React.SyntheticEvent | null, itemIds: TreeViewItemId[]) => void;
  /** Callback when item is clicked */
  onItemClick?: (event: React.MouseEvent, itemId: TreeViewItemId) => void;
  /** Callback when item is double-clicked */
  onItemDoubleClick?: (event: React.MouseEvent, itemId: TreeViewItemId) => void;
  /** Callback when item is right-clicked */
  onItemContextMenu?: (event: React.MouseEvent, itemId: TreeViewItemId) => void;
  /** Callback when item is hovered */
  onItemHover?: (event: React.MouseEvent, itemId: TreeViewItemId) => void;
  /** Callback when item hover ends */
  onItemHoverEnd?: (event: React.MouseEvent, itemId: TreeViewItemId) => void;
  /** Callback when item expansion toggles */
  onItemExpansionToggle?: (event: React.SyntheticEvent | null, itemId: TreeViewItemId, isExpanded: boolean) => void;
  /** Function to get custom icon for item */
  getItemIcon?: (item: TreeViewItem) => React.ReactNode;
  /** Function to check if item is loading */
  isItemLoading?: (itemId: TreeViewItemId) => boolean;
  /** Function to get error message for item */
  getItemError?: (itemId: TreeViewItemId) => string | null;
  /** Whether to animate expand/collapse */
  animateExpansion?: boolean;
  /** Whether to enable screen reader announcements */
  enableScreenReader?: boolean;
  /** Custom screen reader announcement handler */
  onScreenReaderAnnounce?: (message: string) => void;
  /** Whether to enable virtual scrolling */
  enableVirtualScrolling?: boolean;
  /** Virtual scrolling viewport height */
  viewportHeight?: number;
  /** Virtual scrolling item height */
  itemHeight?: number;
  /** Callback when item receives focus */
  onItemFocus?: (event: React.SyntheticEvent | null, itemId: TreeViewItemId) => void;
  /** Callback when item label changes (future feature) */
  onItemLabelChange?: (itemId: TreeViewItemId, newLabel: string) => void;
  /** Callback when item position changes (future feature) */
  onItemPositionChange?: (params: {
    itemId: TreeViewItemId;
    oldPosition: any;
    newPosition: any;
  }) => void;
  /** Callback when item selection toggles */
  onItemSelectionToggle?: (event: React.SyntheticEvent | null, itemId: TreeViewItemId, isSelected: boolean) => void;
  /** Callback when selected items change */
  onSelectedItemsChange?: (event: React.SyntheticEvent | null, itemIds: TreeViewItemId | TreeViewItemId[]) => void;
  /** Selected items (controlled) */
  selectedItems?: TreeViewItemId | TreeViewItemId[];
  /** Selection propagation settings */
  selectionPropagation?: {
    descendants?: boolean;
    parents?: boolean;
  };
  /** Custom styles */
  sx?: any;
  /** Custom className */
  className?: string;
  /** Custom id */
  id?: string;
  /** ARIA label */
  'aria-label'?: string;
  /** ARIA labelledby */
  'aria-labelledby'?: string;
  /** Custom filter function for items (RichTreeViewPlus feature) */
  filterItems?: (items: TreeViewItem[]) => TreeViewItem[];
  /** Whether to show hidden files/folders (RichTreeViewPlus feature) */
  showHiddenFiles?: boolean;
  /** Initial root path to load instead of the default root (RichTreeViewPlus feature) */
  initialRootPath?: string;
  /** Custom empty state message when no items are available (RichTreeViewPlus feature) */
  emptyStateMessage?: string;
  /** Custom message when items exist but are filtered out (RichTreeViewPlus feature) */
  noItemsMatchMessage?: string;
  /** Custom message when no data source is available (RichTreeViewPlus feature) */
  noDataSourceMessage?: string;
  /** Callback when item expansion changes (RichTreeViewPlus feature - different from onItemExpansionToggle) */
  onItemExpansion?: (itemId: TreeViewItemId) => void;
  /** Whether to automatically expand items when they receive focus via navigation */
  autoExpandOnNavigation?: boolean;
}

/**
 * StudioTreeView – Custom Tree View Component
 *
 * A fully custom implementation that matches RichTreeViewPro API
 * without external dependencies.
 *
 * @param props - Component props matching RichTreeViewPro API
 * @param ref - Forwarded ref to the root element
 * @returns StudioTreeView component
 *
 * @example
 * ```tsx
 * <StudioTreeView
 *   items={treeItems}
 *   multiSelect={true}
 *   checkboxSelection={true}
 *   onSelectedItemsChange={(event, itemIds) => console.log('Selected:', itemIds)}
 * />
 * ```
 */
// Render counter for debugging
let renderCount = 0;

export const StudioTreeView = forwardRef<HTMLUListElement, StudioTreeViewProps>(
  (props, ref) => {
    renderCount++;
    const renderId = renderCount;
    console.log(`[StudioTreeView] RENDER START #${renderId}`, { 
      hasDataSource: !!props.dataSource, 
      itemsCount: props.items?.length || 0,
      hasLazyLoading: !!props.lazyLoading,
      timestamp: Date.now()
    });

    const {
      apiRef,
      checkboxSelection = false,
      dataSource,
      dataSourceCache,
      defaultExpandedItems = [],
      defaultSelectedItems,
      disabledItemsFocusable = false,
      disableSelection = false,
      expandedItems: controlledExpandedItems,
      expansionTrigger = 'content',
      getItemChildren = (item) => item.children || [],
      getItemId = (item) => item.id,
      getItemLabel = (item) => item.label,
      isItemDisabled,
      isItemEditable,
      isItemReorderable,
      isItemSelectionDisabled,
      items = [],
      multiSelect = false,
      onExpandedItemsChange,
      onItemClick,
      onItemDoubleClick,
      onItemContextMenu,
      onItemHover,
      onItemHoverEnd,
      onItemExpansionToggle,
      onItemFocus,
      getItemIcon,
      isItemLoading,
      getItemError,
      animateExpansion = true,
      enableScreenReader = true,
      onScreenReaderAnnounce,
      enableVirtualScrolling = false,
      viewportHeight = 400,
      itemHeight = 32,
      onItemLabelChange,
      onItemPositionChange,
      onItemSelectionToggle,
      onSelectedItemsChange,
      selectedItems: controlledSelectedItems,
      selectionPropagation = { descendants: false, parents: false },
      itemsReordering = false,
      canMoveItemToNewPosition,
      filterItems,
      showHiddenFiles = true,
      initialRootPath,
      emptyStateMessage,
      noItemsMatchMessage,
      noDataSourceMessage,
      onItemExpansion,
      autoExpandOnNavigation = false,
      lazyLoading,
      sx,
      className,
      id,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    } = props;

    // ===================================================================
    // LAZY LOADING SETUP
    // ===================================================================

    // Set up lazy loading with sensible defaults and user overrides
    const lazyLoadingConfig: LazyLoadingConfig | undefined = useMemo(() => {
      console.log('[StudioTreeView] useMemo lazyLoadingConfig', { hasDataSource: !!dataSource, hasLazyLoading: !!lazyLoading });
      if (!dataSource) return undefined;
      return {
        enabled: true,
        staleTime: 5 * 60 * 1000, // 5 minutes default
        maxCacheSize: 1000,
        preloadChildren: false,
        showLoadingIndicators: true,
        loadingMessage: "Loading...",
        ...lazyLoading, // User can override any of these defaults
      };
    }, [dataSource, lazyLoading]);

    // Initialize lazy loading with the configured data source
    // Only call useLazyLoading if dataSource is provided to avoid unnecessary work
    console.log('[StudioTreeView] Calling useLazyLoading', { 
      hasDataSource: !!dataSource, 
      hasConfig: !!lazyLoadingConfig,
      dataSourceType: dataSource ? typeof dataSource : 'none',
      dataSourceKeys: dataSource ? Object.keys(dataSource) : []
    });
    
    // Create a stable empty data source to avoid recreating on every render
    const emptyDataSourceRef = useRef<DataSource>({
      getTreeItems: async () => [],
      getChildrenCount: () => 0,
    });
    
    const lazyLoadingResult = useLazyLoading(
      dataSource || emptyDataSourceRef.current, 
      lazyLoadingConfig || { enabled: false }
    );
    console.log('[StudioTreeView] useLazyLoading returned', { 
      hasDataSource: !!lazyLoadingResult.lazyLoadingDataSource,
      isLoading: lazyLoadingResult.isLoading,
      stateCacheSize: lazyLoadingResult.lazyLoadingState.cacheSize
    });
    
    const {
      lazyLoadingDataSource,
      lazyLoadingState,
      isLoading,
      isItemLoading: isItemLoadingFromLazy,
      isItemLoaded,
      hasItemError,
      clearCache,
      clearCacheForParent,
      preloadChildren,
      getCacheStats,
      refreshParent,
      refreshAll,
    } = lazyLoadingResult;

    // ===================================================================
    // STATE MANAGEMENT
    // ===================================================================

    // Track items internally (for lazy loading support)
    const [internalItems, setInternalItems] = useState<TreeViewItem[]>(items);
    const [fullItemsMap, setFullItemsMap] = useState<Map<TreeViewItemId, TreeViewItem>>(new Map());
    const [focusedItemId, setFocusedItemId] = useState<TreeViewItemId | null>(null);
    const [loadingItems, setLoadingItems] = useState<Set<TreeViewItemId>>(new Set());
    const [errorItems, setErrorItems] = useState<Map<TreeViewItemId, string>>(new Map());
    const [editedItemId, setEditedItemId] = useState<TreeViewItemId | null>(null);
    const [draggedItemId, setDraggedItemId] = useState<TreeViewItemId | null>(null);
    const [dragOverItemId, setDragOverItemId] = useState<TreeViewItemId | null>(null);
    const [disabledItems, setDisabledItems] = useState<Set<TreeViewItemId>>(new Set());

    // ===================================================================
    // PERFORMANCE OPTIMIZATION
    // ===================================================================

    const { flattenedItems, itemMap, virtualScrollState, getItemById } = usePerformance({
      items: internalItems,
      enableVirtualScrolling,
      viewportHeight,
      itemHeight,
    });

    // ===================================================================
    // FILTERING LOGIC (RichTreeViewPlus features)
    // ===================================================================

    /**
     * Filter hidden files based on showHiddenFiles prop
     */
    const filterHiddenFiles = useCallback(
      (itemsToFilter: TreeViewItem[]): TreeViewItem[] => {
        if (showHiddenFiles) {
          return itemsToFilter;
        }

        return itemsToFilter
          .filter((item) => {
            const label = getItemLabel(item);
            const hasDotPrefix = label?.startsWith('.');
            const isHidden = item.hidden || item.isHidden;
            return !hasDotPrefix && !isHidden;
          })
          .map((item) => {
            const children = getItemChildren(item);
            if (children && children.length > 0) {
              return {
                ...item,
                children: filterHiddenFiles(children),
              };
            }
            return item;
          });
      },
      [showHiddenFiles, getItemLabel, getItemChildren]
    );

    /**
     * Apply filtering to items
     */
    const applyFiltering = useCallback(
      (itemsToFilter: TreeViewItem[]): TreeViewItem[] => {
        console.log('[StudioTreeView] applyFiltering', { 
          inputCount: itemsToFilter.length,
          hasFilterItems: !!filterItems,
          showHiddenFiles 
        });
        let filtered = itemsToFilter;

        // First apply hidden files filter if showHiddenFiles is false
        if (!showHiddenFiles) {
          filtered = filterHiddenFiles(filtered);
        }

        // Then apply custom filterItems if provided
        if (filterItems) {
          filtered = filterItems(filtered);
        }

        return filtered;
      },
      [showHiddenFiles, filterHiddenFiles, filterItems]
    );

    /**
     * Build full items map for ItemDataContext
     */
    const buildFullItemsMap = useCallback(
      (itemsToMap: TreeViewItem[], map: Map<TreeViewItemId, TreeViewItem> = new Map()): Map<TreeViewItemId, TreeViewItem> => {
        console.log('[StudioTreeView] buildFullItemsMap', { 
          itemsCount: itemsToMap.length,
          mapSize: map.size 
        });
        itemsToMap.forEach((item) => {
          const itemId = getItemId(item);
          map.set(itemId, item);
          const children = getItemChildren(item);
          if (children && children.length > 0) {
            buildFullItemsMap(children, map);
          }
        });
        return map;
      },
      [getItemId, getItemChildren]
    );

    // Update internal items when items prop changes (with filtering)
    // Note: If dataSource is provided, we'll load items via lazy loading instead
    useEffect(() => {
      console.log('[StudioTreeView] useEffect items sync', { 
        hasDataSource: !!dataSource, 
        itemsLength: items.length, 
        internalItemsLength: internalItems.length 
      });
      // Only sync items prop if dataSource is not provided
      if (!dataSource && items.length > 0) {
        console.log('[StudioTreeView] Syncing items prop to internalItems');
        // Store full items map before filtering
        const fullMap = buildFullItemsMap(items);
        setFullItemsMap(fullMap);
        
        // Apply filtering
        const filtered = applyFiltering(items);
        setInternalItems(filtered);
      } else if (!dataSource) {
        console.log('[StudioTreeView] Clearing internalItems (no dataSource, no items)');
        setInternalItems([]);
        setFullItemsMap(new Map());
      }
    }, [items, dataSource, applyFiltering, buildFullItemsMap]);

    // ===================================================================
    // LAZY LOADING: FETCH ROOT ITEMS
    // ===================================================================

    // Track if we've already fetched root items to prevent infinite loops
    const hasFetchedRootItemsRef = useRef(false);

    // Fetch root items when dataSource is provided and items is empty
    useEffect(() => {
      console.log('[StudioTreeView] useEffect fetch root items', {
        hasDataSource: !!dataSource,
        configEnabled: lazyLoadingConfig?.enabled,
        internalItemsLength: internalItems.length,
        itemsLength: items.length,
        hasFetched: hasFetchedRootItemsRef.current
      });
      
      // Only fetch if dataSource is provided and lazy loading is enabled
      if (!dataSource || !lazyLoadingConfig?.enabled) {
        console.log('[StudioTreeView] Skipping fetch - no dataSource or not enabled');
        hasFetchedRootItemsRef.current = false;
        return;
      }
      
      // Don't fetch if we already have items
      if (internalItems.length > 0 || items.length > 0) {
        console.log('[StudioTreeView] Skipping fetch - already have items');
        hasFetchedRootItemsRef.current = false;
        return;
      }
      
      // Don't fetch if we've already fetched
      if (hasFetchedRootItemsRef.current) {
        console.log('[StudioTreeView] Skipping fetch - already fetched');
        return;
      }
      
      console.log('[StudioTreeView] FETCHING ROOT ITEMS');
      hasFetchedRootItemsRef.current = true;
      let isMounted = true;
      
      // Fetch root items
      lazyLoadingDataSource.getTreeItems({ parentId: undefined })
        .then((rootItems) => {
          console.log('[StudioTreeView] Root items fetched', { 
            count: rootItems?.length || 0, 
            isMounted 
          });
          if (!isMounted) return;
          if (rootItems && rootItems.length > 0) {
            // Store full items map before filtering
            const fullMap = buildFullItemsMap(rootItems);
            setFullItemsMap(fullMap);
            
            // Apply filtering
            const filtered = applyFiltering(rootItems);
            console.log('[StudioTreeView] Setting internalItems', { 
              originalCount: rootItems.length, 
              filteredCount: filtered.length 
            });
            setInternalItems(filtered);
          } else {
            hasFetchedRootItemsRef.current = false;
          }
        })
        .catch((error) => {
          if (!isMounted) return;
          console.error('[StudioTreeView] Error fetching root items:', error);
          hasFetchedRootItemsRef.current = false;
          // Error state will be handled by lazyLoadingState
        });
      
      return () => {
        console.log('[StudioTreeView] Cleanup fetch root items');
        isMounted = false;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource, lazyLoadingConfig?.enabled]);

    // ===================================================================
    // EXPANSION STATE MANAGEMENT
    // ===================================================================

    const {
      expandedItems: currentExpandedItems,
      isExpanded,
      toggleExpansion,
      setExpanded,
    } = useExpansion({
      defaultExpandedItems,
      expandedItems: controlledExpandedItems,
      onExpandedItemsChange,
    });

    // ===================================================================
    // SELECTION STATE MANAGEMENT
    // ===================================================================

    const {
      selectedItems: currentSelectedItems,
      isSelected,
      toggleSelection,
      setSelection,
      clearSelection,
      updateItems: updateSelectionItems,
    } = useSelection({
      defaultSelectedItems,
      selectedItems: controlledSelectedItems,
      multiSelect,
      onSelectedItemsChange,
      onItemSelectionToggle,
      selectionPropagation,
      getItemChildren,
      getItemId,
    });
    
    // Update items in selection hook when items change (for propagation)
    useEffect(() => {
      console.log('[StudioTreeView] useEffect updateSelectionItems', { 
        internalItemsLength: internalItems.length 
      });
      updateSelectionItems(internalItems);
    }, [internalItems, updateSelectionItems]);

    // ===================================================================
    // DISABLED ITEMS MANAGEMENT
    // ===================================================================

    /**
     * Combined function to check if an item is disabled
     * Checks both the prop function and internal disabled state
     */
    const isItemDisabledCombined = useCallback(
      (itemId: TreeViewItemId): boolean => {
        // Check internal disabled state first
        if (disabledItems.has(itemId)) {
          return true;
        }
        // Then check prop function if provided
        return isItemDisabled?.(itemId) || false;
      },
      [disabledItems, isItemDisabled]
    );

    /**
     * Set disabled state for an item programmatically
     */
    const setIsItemDisabledInternal = useCallback(
      (itemId: TreeViewItemId, disabled: boolean) => {
        setDisabledItems((prev) => {
          const next = new Set(prev);
          if (disabled) {
            next.add(itemId);
          } else {
            next.delete(itemId);
          }
          return next;
        });
      },
      []
    );

    // ===================================================================
    // API REF
    // ===================================================================

    const api = useStudioTreeViewApi({
      items: internalItems,
      expandedItems: currentExpandedItems,
      selectedItems: currentSelectedItems,
      focusedItemId,
      setFocusedItemId,
      setExpanded,
      setSelection,
      getItemChildren,
      getItemId,
      getItemLabel,
      setInternalItems,
      setEditedItemId,
      setIsItemDisabled: setIsItemDisabledInternal,
    });

    // Expose API through ref
    useEffect(() => {
      if (apiRef) {
        apiRef.current = api;
      }
    }, [apiRef, api]);

    // ===================================================================
    // AUTO-EXPAND ON NAVIGATION
    // ===================================================================

    // Auto-expand items when they receive focus via navigation
    useEffect(() => {
      if (autoExpandOnNavigation && focusedItemId !== null) {
        console.log('[StudioTreeView] useEffect autoExpandOnNavigation', { focusedItemId });
        const item = getItemById(focusedItemId);
        if (item) {
          const children = getItemChildren(item);
          const hasChildren = children && children.length > 0;
          const isCurrentlyExpanded = isExpanded(focusedItemId);
          
          // If item has children and is not expanded, expand it
          if (hasChildren && !isCurrentlyExpanded) {
            console.log('[StudioTreeView] Auto-expanding item', { focusedItemId });
            setExpanded(focusedItemId, true, undefined);
          }
        }
      }
    }, [focusedItemId, autoExpandOnNavigation, getItemById, getItemChildren, isExpanded, setExpanded]);

    // ===================================================================
    // SCREEN READER SUPPORT
    // ===================================================================

    const {
      announceSelection,
      announceExpansion,
      announceNavigation,
      announceFocus,
      announceLoading,
      announceError,
    } = useScreenReader({
      enableAnnouncements: enableScreenReader,
      onAnnounce: onScreenReaderAnnounce,
    });

    // ===================================================================
    // LAZY LOADING: INTEGRATE LOADING/ERROR STATES
    // ===================================================================

    // Combine prop-based and lazy loading states
    const isItemLoadingCombined = useCallback(
      (itemId: TreeViewItemId): boolean => {
        // Check prop-based loading state first
        if (isItemLoading?.(itemId)) {
          return true;
        }
        // Check lazy loading state if dataSource is enabled
        if (dataSource && lazyLoadingConfig?.enabled) {
          return isItemLoadingFromLazy(String(itemId));
        }
        return false;
      },
      [isItemLoading, dataSource, lazyLoadingConfig, isItemLoadingFromLazy]
    );

    const getItemErrorCombined = useCallback(
      (itemId: TreeViewItemId): string | null => {
        // Check prop-based error state first
        const propError = getItemError?.(itemId);
        if (propError) {
          return propError;
        }
        // Check lazy loading error state if dataSource is enabled
        if (dataSource && lazyLoadingConfig?.enabled) {
          const itemIdStr = String(itemId);
          if (hasItemError(itemIdStr)) {
            // Get error from lazyLoadingState
            const error = lazyLoadingState.errorItems.get(itemIdStr);
            // Convert Error object to string if needed
            if (error) {
              return typeof error === 'string' ? error : error.toString();
            }
          }
        }
        return null;
      },
      [getItemError, dataSource, lazyLoadingConfig, hasItemError, lazyLoadingState]
    );

    // ===================================================================
    // USER INTERACTIONS
    // ===================================================================

    const {
      handleClick: handleUserClick,
      handleDoubleClick: handleUserDoubleClick,
      handleContextMenu: handleUserContextMenu,
      handleMouseEnter: handleUserMouseEnter,
      handleMouseLeave: handleUserMouseLeave,
      hoveredItemId,
      cleanup: cleanupInteractions,
    } = useUserInteractions({
      onItemClick,
      onItemDoubleClick,
      onItemContextMenu,
      onItemHover,
      onItemHoverEnd,
      isItemDisabled: isItemDisabledCombined,
      preventContextMenu: false,
    });

    // Cleanup on unmount
    useEffect(() => {
      return cleanupInteractions;
    }, [cleanupInteractions]);

    // ===================================================================
    // KEYBOARD NAVIGATION
    // ===================================================================

    const handleKeyDown = useKeyboardNavigation({
      items: internalItems,
      expandedItems: currentExpandedItems,
      selectedItems: currentSelectedItems,
      focusedItemId,
      setFocusedItemId,
      toggleExpansion,
      toggleSelection,
      setExpanded,
      setSelection,
      clearSelection,
      getItemChildren,
      getItemId,
      multiSelect,
      isItemDisabled: isItemDisabledCombined,
      setEditedItemId,
      editedItemId,
    });

    // ===================================================================
    // EVENT HANDLERS
    // ===================================================================

    const handleItemClick = useCallback(
      (event: React.MouseEvent, itemId: TreeViewItemId) => {
        if (isItemDisabledCombined(itemId)) {
          return;
        }

        // Handle expansion if clicking on icon container
        const expansionElement = event.currentTarget.closest('[data-expansion-trigger]');
        if (expansionTrigger === 'iconContainer' && expansionElement) {
          toggleExpansion(itemId, event);
          return; // Don't handle selection when expanding via icon
        }

        // Handle selection if clicking on content
        if (!disableSelection && !isItemSelectionDisabled?.(itemId)) {
          const wasSelected = isSelected(itemId);
          // Pass items for selection propagation
          setSelection(itemId, !wasSelected, event, internalItems);
          
          // Announce selection change to screen readers
          if (enableScreenReader) {
            const item = getItemById(itemId);
            if (item) {
              announceSelection(itemId, getItemLabel(item), !wasSelected);
            }
          }
        }

        // Call user interaction handler (handles single/double-click detection)
        handleUserClick(event, itemId);
      },
      [
        isItemDisabled,
        expansionTrigger,
        toggleExpansion,
        disableSelection,
        isItemSelectionDisabled,
        setSelection,
        isSelected,
        handleUserClick,
        enableScreenReader,
        getItemById,
        getItemLabel,
        announceSelection,
        internalItems,
      ]
    );

    const handleItemFocus = useCallback(
      (event: React.SyntheticEvent, itemId: TreeViewItemId) => {
        setFocusedItemId(itemId);
        onItemFocus?.(event, itemId);
        
        // Auto-expand on navigation if enabled
        if (autoExpandOnNavigation) {
          const item = getItemById(itemId);
          if (item) {
            const children = getItemChildren(item);
            const hasChildren = children && children.length > 0;
            const isCurrentlyExpanded = isExpanded(itemId);
            
            // If item has children and is not expanded, expand it
            if (hasChildren && !isCurrentlyExpanded) {
              setExpanded(itemId, true, event);
            }
          }
        }
        
        // Announce focus change to screen readers
        if (enableScreenReader) {
          const item = getItemById(itemId);
          if (item) {
            const level = flattenedItems.findIndex((i) => i.id === itemId);
            const hasChildren = getItemChildren(item).length > 0;
            announceFocus(getItemLabel(item), level >= 0 ? level : 0, hasChildren);
          }
        }
      },
      [onItemFocus, autoExpandOnNavigation, getItemById, getItemChildren, isExpanded, setExpanded, enableScreenReader, getItemLabel, flattenedItems, announceFocus]
    );

    const handleItemExpansionToggle = useCallback(
      (event: React.SyntheticEvent | null, itemId: TreeViewItemId, isExpanded: boolean) => {
        onItemExpansionToggle?.(event, itemId, isExpanded);
        
        // Call onItemExpansion when item expands (RichTreeViewPlus feature)
        if (isExpanded && onItemExpansion) {
          onItemExpansion(itemId);
        }
        
        // Announce expansion change to screen readers
        if (enableScreenReader) {
          const item = getItemById(itemId);
          if (item) {
            announceExpansion(itemId, getItemLabel(item), isExpanded);
          }
        }
      },
      [onItemExpansionToggle, onItemExpansion, enableScreenReader, getItemById, getItemLabel, announceExpansion]
    );

    // ===================================================================
    // DRAG AND DROP HANDLERS (Item Reordering)
    // ===================================================================

    /**
     * Remove item from tree structure
     */
    const removeItemFromTree = useCallback(
      (itemsToProcess: TreeViewItem[], targetId: TreeViewItemId): TreeViewItem[] => {
        const result: TreeViewItem[] = [];
        for (const item of itemsToProcess) {
          const itemId = getItemId(item);
          if (itemId === targetId) {
            continue; // Skip the item to remove
          }
          const children = getItemChildren(item);
          if (children && children.length > 0) {
            result.push({
              ...item,
              children: removeItemFromTree(children, targetId),
            });
          } else {
            result.push(item);
          }
        }
        return result;
      },
      [getItemId, getItemChildren]
    );

    /**
     * Update children of an item in the tree
     */
    const updateItemChildrenInTree = useCallback(
      (itemsToProcess: TreeViewItem[], targetId: TreeViewItemId, newChildren: TreeViewItem[]): TreeViewItem[] => {
        return itemsToProcess.map((item) => {
          const itemId = getItemId(item);
          if (itemId === targetId) {
            // Found the target item, update its children
            return {
              ...item,
              children: newChildren,
            };
          }
          const children = getItemChildren(item);
          if (children && children.length > 0) {
            // Recursively search in children
            return {
              ...item,
              children: updateItemChildrenInTree(children, targetId, newChildren),
            };
          }
          return item;
        });
      },
      [getItemId, getItemChildren]
    );

    /**
     * Find item in tree and return it
     */
    const findItemInTree = useCallback(
      (itemsToSearch: TreeViewItem[], targetId: TreeViewItemId): TreeViewItem | null => {
        for (const item of itemsToSearch) {
          const itemId = getItemId(item);
          if (itemId === targetId) {
            return item;
          }
          const children = getItemChildren(item);
          if (children && children.length > 0) {
            const found = findItemInTree(children, targetId);
            if (found) {
              return found;
            }
          }
        }
        return null;
      },
      [getItemId, getItemChildren]
    );

    /**
     * Insert item at position in tree
     */
    const insertItemAtPosition = useCallback(
      (
        itemsToProcess: TreeViewItem[],
        itemToInsert: TreeViewItem,
        targetParentId: TreeViewItemId | null,
        targetIndex: number
      ): TreeViewItem[] => {
        if (targetParentId === null) {
          // Insert at root level
          const result = [...itemsToProcess];
          result.splice(targetIndex, 0, itemToInsert);
          return result;
        }

        // Find parent and insert in its children
        return itemsToProcess.map((item) => {
          const itemId = getItemId(item);
          if (itemId === targetParentId) {
            const children = getItemChildren(item) || [];
            const newChildren = [...children];
            newChildren.splice(targetIndex, 0, itemToInsert);
            return {
              ...item,
              children: newChildren,
            };
          }
          const children = getItemChildren(item);
          if (children && children.length > 0) {
            return {
              ...item,
              children: insertItemAtPosition(children, itemToInsert, targetParentId, targetIndex),
            };
          }
          return item;
        });
      },
      [getItemId, getItemChildren]
    );

    const handleDragStart = useCallback(
      (event: React.DragEvent, itemId: TreeViewItemId) => {
        if (!itemsReordering) return;
        setDraggedItemId(itemId);
      },
      [itemsReordering]
    );

    const handleDragEnd = useCallback(
      (event: React.DragEvent, itemId: TreeViewItemId) => {
        setDraggedItemId(null);
        setDragOverItemId(null);
      },
      []
    );

    const handleDragOver = useCallback(
      (event: React.DragEvent, itemId: TreeViewItemId) => {
        if (!itemsReordering || !draggedItemId || draggedItemId === itemId) return;
        setDragOverItemId(itemId);
      },
      [itemsReordering, draggedItemId]
    );

    const handleDrop = useCallback(
      (event: React.DragEvent, targetItemId: TreeViewItemId) => {
        if (!itemsReordering || !draggedItemId || draggedItemId === targetItemId) {
          setDraggedItemId(null);
          setDragOverItemId(null);
          return;
        }

        // Find the dragged item
        const draggedItem = findItemInTree(internalItems, draggedItemId);
        if (!draggedItem) {
          setDraggedItemId(null);
          setDragOverItemId(null);
          return;
        }

        // Find target item and its parent
        const targetItem = findItemInTree(internalItems, targetItemId);
        if (!targetItem) {
          setDraggedItemId(null);
          setDragOverItemId(null);
          return;
        }

        // Get parent of target
        const targetParentId = api.getParentId?.(targetItemId) || null;
        
        // Calculate new position (index in parent's children)
        let newIndex = 0;
        if (targetParentId !== null) {
          const targetParent = findItemInTree(internalItems, targetParentId);
          if (targetParent) {
            const siblings = getItemChildren(targetParent);
            newIndex = siblings.findIndex((sibling) => getItemId(sibling) === targetItemId);
            if (newIndex < 0) newIndex = 0;
          }
        } else {
          // Root level
          newIndex = internalItems.findIndex((item) => getItemId(item) === targetItemId);
          if (newIndex < 0) newIndex = 0;
        }

        // Check if move is allowed
        const oldPosition = {
          parentId: api.getParentId?.(draggedItemId) || null,
          index: 0, // Would need to calculate this
        };
        const newPosition = {
          parentId: targetParentId,
          index: newIndex,
        };

        if (canMoveItemToNewPosition) {
          const canMove = canMoveItemToNewPosition({
            itemId: draggedItemId,
            oldPosition,
            newPosition,
          });
          if (!canMove) {
            setDraggedItemId(null);
            setDragOverItemId(null);
            return;
          }
        }

        // Remove item from old position
        let updatedItems = removeItemFromTree(internalItems, draggedItemId);

        // Insert at new position
        updatedItems = insertItemAtPosition(updatedItems, draggedItem, targetParentId, newIndex);

        // Update internal items
        setInternalItems(updatedItems);

        // Call callback
        onItemPositionChange?.({
          itemId: draggedItemId,
          oldPosition,
          newPosition,
        });

        setDraggedItemId(null);
        setDragOverItemId(null);
      },
      [
        itemsReordering,
        draggedItemId,
        internalItems,
        findItemInTree,
        removeItemFromTree,
        insertItemAtPosition,
        canMoveItemToNewPosition,
        onItemPositionChange,
        api,
        getItemId,
        getItemChildren,
      ]
    );

    // ===================================================================
    // RENDER TREE ITEMS (Memoized)
    // ===================================================================

    const renderTreeItems = useCallback(
      (itemsToRender: TreeViewItem[], level: number = 0): React.ReactNode => {
        const callId = Math.random().toString(36).substr(2, 9);
        console.log(`[StudioTreeView] renderTreeItems [${callId}]`, { 
          itemsCount: itemsToRender.length, 
          level,
          renderId
        });
        const result = itemsToRender.map((item) => {
          const itemId = getItemId(item);
          const itemLabel = getItemLabel(item);
          const itemChildren = getItemChildren(item);
          const hasChildren = itemChildren && itemChildren.length > 0;
          const isItemExpandedState = isExpanded(itemId);
          const isItemSelectedState = isSelected(itemId);
          const isItemDisabledState = isItemDisabledCombined(itemId);
          const isItemFocused = focusedItemId === itemId;
          const isItemHovered = hoveredItemId === itemId;
          const isItemLoadingState = isItemLoadingCombined(itemId);
          const itemError = getItemErrorCombined(itemId);
          const itemIcon = getItemIcon?.(item);
          const isItemEditableState = isItemEditable?.(itemId) || false;
          const isItemEditing = editedItemId === itemId;
          const isItemReorderableState = isItemReorderable?.(itemId) !== false; // Default to true if not specified
          const isItemDragging = draggedItemId === itemId;
          const isItemDragOver = dragOverItemId === itemId;

          return (
            <StudioTreeItem
              key={itemId}
              itemId={itemId}
              label={itemLabel}
              level={level}
              expanded={isItemExpandedState}
              selected={isItemSelectedState}
              focused={isItemFocused}
              disabled={isItemDisabledState}
              hasChildren={hasChildren}
              checkboxSelection={checkboxSelection && !disableSelection}
              expansionTrigger={expansionTrigger}
              onClick={handleItemClick}
              onDoubleClick={handleUserDoubleClick}
              onContextMenu={handleUserContextMenu}
              onMouseEnter={handleUserMouseEnter}
              onMouseLeave={handleUserMouseLeave}
              hovered={isItemHovered}
              loading={isItemLoadingState}
              error={itemError}
              icon={itemIcon}
              animateExpansion={animateExpansion}
              editing={isItemEditing && isItemEditableState}
              onLabelEdit={(newLabel) => {
                onItemLabelChange?.(itemId, newLabel);
                // Update internal items
                const updatedItems = internalItems.map((i) => {
                  if (getItemId(i) === itemId) {
                    return { ...i, label: newLabel };
                  }
                  return i;
                });
                setInternalItems(updatedItems);
                setEditedItemId(null);
              }}
              onLabelEditCancel={() => {
                setEditedItemId(null);
              }}
              itemsReordering={itemsReordering}
              reorderable={isItemReorderableState}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              dragging={isItemDragging}
              dragOver={isItemDragOver}
              onFocus={handleItemFocus}
              onExpansionToggle={(event) => {
                toggleExpansion(itemId, event);
                handleItemExpansionToggle(event, itemId, !isItemExpandedState);
              }}
            >
              {isItemExpandedState && hasChildren && itemChildren && (
                <Box component="ul" role="group" sx={{ pl: 2, m: 0, listStyle: 'none' }}>
                  {(() => {
                    console.log(`[StudioTreeView] Rendering children for item ${itemId}`, {
                      childrenCount: itemChildren.length,
                      level: level + 1,
                      renderId
                    });
                    return renderTreeItems(itemChildren, level + 1);
                  })()}
                </Box>
              )}
            </StudioTreeItem>
          );
        });
        console.log(`[StudioTreeView] renderTreeItems [${callId}] completed`, {
          itemsCount: itemsToRender.length,
          level,
          resultCount: result.length
        });
        return result;
      },
      [
        getItemId,
        getItemLabel,
        getItemChildren,
        isExpanded,
        isSelected,
        isItemDisabled,
        focusedItemId,
        hoveredItemId,
        checkboxSelection,
        disableSelection,
        expansionTrigger,
        handleItemClick,
        handleUserDoubleClick,
        handleUserContextMenu,
        handleUserMouseEnter,
        handleUserMouseLeave,
        handleItemFocus,
        toggleExpansion,
        handleItemExpansionToggle,
        isItemLoading,
        getItemError,
        getItemIcon,
        isItemEditable,
        editedItemId,
        onItemLabelChange,
        internalItems,
        setInternalItems,
        isItemReorderable,
        itemsReordering,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop,
        draggedItemId,
        dragOverItemId,
        animateExpansion,
      ]
    );

    // ===================================================================
    // ITEM DATA CONTEXT (RichTreeViewPlus feature)
    // ===================================================================

    const itemDataContextValue = useMemo(
      () => ({
        getFullItem: (id: TreeViewItemId) => {
          return fullItemsMap.get(id);
        },
      }),
      [fullItemsMap]
    );

    // ===================================================================
    // EMPTY STATE MESSAGES (RichTreeViewPlus feature)
    // ===================================================================

    const getEmptyStateMessage = useCallback((): string | null => {
      if (internalItems.length === 0) {
        // Check if we have raw items but they were filtered out
        const rawItemsCount = items.length;
        if (rawItemsCount > 0) {
          // Items exist but were filtered out - show filtering message
          return noItemsMatchMessage || 'No items match your search.';
        } else if (rawItemsCount === 0 && !dataSource) {
          // No data source and no items
          return noDataSourceMessage || 'No data source available.';
        } else {
          // No items available
          return emptyStateMessage || 'No items available.';
        }
      }
      return null;
    }, [internalItems.length, items.length, dataSource, emptyStateMessage, noItemsMatchMessage, noDataSourceMessage]);

    const emptyStateMsg = getEmptyStateMessage();

    // ===================================================================
    // RENDER
    // ===================================================================

    console.log(`[StudioTreeView] RENDER END #${renderId}`, { 
      internalItemsLength: internalItems.length,
      expandedItemsCount: currentExpandedItems.length,
      selectedItemsCount: currentSelectedItems.length,
      hasEmptyState: !!emptyStateMsg
    });

    if (internalItems.length === 0 && emptyStateMsg) {
      return (
        <ItemDataContext.Provider value={itemDataContextValue}>
          <Box
            component="ul"
            ref={ref}
            role="tree"
            className={className}
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-busy="false"
            sx={{
              p: 2,
              m: 0,
              listStyle: 'none',
              ...sx,
            }}
          >
            <Typography variant="body2" color="text.secondary" role="status" aria-live="polite">
              {emptyStateMsg}
            </Typography>
          </Box>
        </ItemDataContext.Provider>
      );
    }

    return (
      <ItemDataContext.Provider value={itemDataContextValue}>
        <Box
          component="ul"
          ref={ref}
          role="tree"
          className={className}
          id={id}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-multiselectable={multiSelect}
          aria-activedescendant={focusedItemId ? String(focusedItemId) : undefined}
          onKeyDown={handleKeyDown}
          sx={{
            p: 0,
            m: 0,
            listStyle: 'none',
            outline: 'none',
            ...(enableVirtualScrolling && {
              height: viewportHeight,
              overflow: 'auto',
              position: 'relative',
            }),
            ...sx,
          }}
        >
          {renderTreeItems(internalItems)}
        </Box>
      </ItemDataContext.Provider>
    );
  }
);

StudioTreeView.displayName = 'StudioTreeView';
