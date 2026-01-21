/**
 * @fileoverview useHandyTreeViewApi – API Reference Hook
 *
 * Provides programmatic control over the tree view, matching
 * RichTreeViewPro API interface.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { useMemo, useCallback, useRef } from 'react';
import { TreeViewItem, DataSource } from '../types';
import { TreeViewItemId } from '../HandyTreeView';

/**
 * Props for useHandyTreeViewApi hook
 */
interface UseHandyTreeViewApiProps {
  items: TreeViewItem[];
  expandedItems: TreeViewItemId[];
  selectedItems: TreeViewItemId[];
  focusedItemId: TreeViewItemId | null;
  setFocusedItemId: (id: TreeViewItemId | null) => void;
  setExpanded: (id: TreeViewItemId, expanded: boolean) => void;
  setSelection: (id: TreeViewItemId, selected: boolean) => void;
  getItemChildren: (item: TreeViewItem) => TreeViewItem[];
  getItemId: (item: TreeViewItem) => TreeViewItemId;
  getItemLabel: (item: TreeViewItem) => string;
  setInternalItems: (items: TreeViewItem[]) => void;
  setIsItemDisabled?: (itemId: TreeViewItemId, disabled: boolean) => void;
  setEditedItemId?: (id: TreeViewItemId | null) => void;
}

/**
 * Item map for quick lookups
 */
const buildItemMap = (
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[],
  map: Map<TreeViewItemId, TreeViewItem> = new Map()
): Map<TreeViewItemId, TreeViewItem> => {
  items.forEach((item) => {
    const id = getItemId(item);
    map.set(id, item);
    const children = getItemChildren(item);
    if (children && children.length > 0) {
      buildItemMap(children, getItemId, getItemChildren, map);
    }
  });
  return map;
};

/**
 * Find parent of an item
 */
const findParent = (
  itemId: TreeViewItemId,
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[],
  parentId: TreeViewItemId | null = null
): TreeViewItemId | null => {
  for (const item of items) {
    const id = getItemId(item);
    if (id === itemId) {
      return parentId;
    }
    const children = getItemChildren(item);
    if (children && children.length > 0) {
      const found = findParent(itemId, children, getItemId, getItemChildren, id);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
};

/**
 * useHandyTreeViewApi – API Reference Hook
 *
 * Creates and maintains the API reference object that provides
 * programmatic control over the tree view.
 *
 * @param props - Hook configuration
 * @returns API reference object
 */
export const useHandyTreeViewApi = (props: UseHandyTreeViewApiProps) => {
  const {
    items,
    expandedItems,
    selectedItems,
    focusedItemId,
    setFocusedItemId,
    setExpanded,
    setSelection,
    getItemChildren,
    getItemId,
    getItemLabel,
    setInternalItems,
    setEditedItemId,
    setIsItemDisabled: setIsItemDisabledProp,
  } = props;

  // DOM element refs for items
  const itemRefs = useRef<Map<TreeViewItemId, HTMLElement>>(new Map());

  // Build item map for quick lookups
  const itemMap = useMemo(
    () => buildItemMap(items, getItemId, getItemChildren),
    [items, getItemId, getItemChildren]
  );

  // API methods
  const api = useMemo(
    () => ({
      focusItem: (itemId: TreeViewItemId) => {
        const element = itemRefs.current.get(itemId);
        if (element) {
          element.focus();
        }
        setFocusedItemId(itemId);
      },

      getItem: (itemId: TreeViewItemId): TreeViewItem | null => {
        return itemMap.get(itemId) || null;
      },

      getItemDOMElement: (itemId: TreeViewItemId): HTMLElement | null => {
        return itemRefs.current.get(itemId) || null;
      },

      getItemTree: (): TreeViewItem[] => {
        return items;
      },

      getParentId: (itemId: TreeViewItemId): TreeViewItemId | null => {
        return findParent(itemId, items, getItemId, getItemChildren);
      },

      isItemExpanded: (itemId: TreeViewItemId): boolean => {
        return expandedItems.includes(itemId);
      },

      setEditedItem: (itemId: TreeViewItemId | null) => {
        setEditedItemId?.(itemId);
      },

      setIsItemDisabled: (itemId: TreeViewItemId, disabled: boolean) => {
        if (setIsItemDisabledProp) {
          setIsItemDisabledProp(itemId, disabled);
        } else {
          console.warn('setIsItemDisabled callback not provided');
        }
      },

      setItemExpansion: (itemId: TreeViewItemId, isExpanded: boolean) => {
        setExpanded(itemId, isExpanded);
      },

      setItemSelection: (itemId: TreeViewItemId, isSelected: boolean) => {
        setSelection(itemId, isSelected);
      },

      updateItemChildren: (itemId: TreeViewItemId, children: TreeViewItem[]) => {
        const item = itemMap.get(itemId);
        if (item) {
          const updatedItems = items.map((i) => {
            if (getItemId(i) === itemId) {
              return { ...i, children };
            }
            return i;
          });
          setInternalItems(updatedItems);
        }
      },

      updateItemLabel: (itemId: TreeViewItemId, label: string) => {
        const item = itemMap.get(itemId);
        if (item) {
          const updatedItems = items.map((i) => {
            if (getItemId(i) === itemId) {
              return { ...i, label };
            }
            return i;
          });
          setInternalItems(updatedItems);
        }
      },

      getItemOrderedChildrenIds: (itemId: TreeViewItemId): TreeViewItemId[] => {
        const item = itemMap.get(itemId);
        if (!item) return [];
        const children = getItemChildren(item);
        return children.map(getItemId);
      },
    }),
    [
      items,
      itemMap,
      expandedItems,
      setFocusedItemId,
      setExpanded,
      setSelection,
      getItemId,
      getItemChildren,
      setInternalItems,
      setEditedItemId,
      setIsItemDisabledProp,
    ]
  );

  return api;
};
