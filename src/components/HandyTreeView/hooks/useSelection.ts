/**
 * @fileoverview useSelection – Selection State Management Hook
 *
 * Manages selection state for tree items, supporting both controlled
 * and uncontrolled modes, single and multi-selection.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { TreeViewItem, DataSource } from '../types';
import { TreeViewItemId } from '../HandyTreeView';

/**
 * Props for useSelection hook
 */
interface UseSelectionProps {
  /** Default selected items (uncontrolled) */
  defaultSelectedItems?: TreeViewItemId | TreeViewItemId[];
  /** Controlled selected items */
  selectedItems?: TreeViewItemId | TreeViewItemId[];
  /** Whether multi-selection is enabled */
  multiSelect?: boolean;
  /** Callback when selected items change */
  onSelectedItemsChange?: (event: React.SyntheticEvent | null, itemIds: TreeViewItemId | TreeViewItemId[]) => void;
  /** Callback when item selection toggles */
  onItemSelectionToggle?: (event: React.SyntheticEvent | null, itemId: TreeViewItemId, isSelected: boolean) => void;
  /** Selection propagation settings */
  selectionPropagation?: {
    descendants?: boolean;
    parents?: boolean;
  };
  /** Function to get children of an item */
  getItemChildren: (item: TreeViewItem) => TreeViewItem[];
  /** Function to get ID of an item */
  getItemId: (item: TreeViewItem) => TreeViewItemId;
}

/**
 * Get all descendant IDs of an item
 */
const getDescendantIds = (
  item: TreeViewItem,
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[]
): TreeViewItemId[] => {
  const descendants: TreeViewItemId[] = [];
  const children = getItemChildren(item);
  
  children.forEach((child) => {
    const childId = getItemId(child);
    descendants.push(childId);
    // Recursively get descendants
    const childDescendants = getDescendantIds(child, getItemId, getItemChildren);
    descendants.push(...childDescendants);
  });
  
  return descendants;
};

/**
 * Find item by ID in tree
 */
const findItemById = (
  itemId: TreeViewItemId,
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[]
): TreeViewItem | null => {
  for (const item of items) {
    if (getItemId(item) === itemId) {
      return item;
    }
    const children = getItemChildren(item);
    if (children && children.length > 0) {
      const found = findItemById(itemId, children, getItemId, getItemChildren);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Find parent item of an item
 */
const findParentItem = (
  itemId: TreeViewItemId,
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[],
  parent: TreeViewItem | null = null
): TreeViewItem | null => {
  for (const item of items) {
    if (getItemId(item) === itemId) {
      return parent;
    }
    const children = getItemChildren(item);
    if (children && children.length > 0) {
      const found = findParentItem(itemId, children, getItemId, getItemChildren, item);
      if (found !== null) {
        return found;
      }
    }
  }
  return null;
};

/**
 * Get all ancestor IDs of an item
 */
const getAncestorIds = (
  itemId: TreeViewItemId,
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[]
): TreeViewItemId[] => {
  const ancestors: TreeViewItemId[] = [];
  let currentParent = findParentItem(itemId, items, getItemId, getItemChildren);
  
  while (currentParent) {
    const parentId = getItemId(currentParent);
    ancestors.push(parentId);
    currentParent = findParentItem(parentId, items, getItemId, getItemChildren);
  }
  
  return ancestors;
};

/**
 * Check if all siblings of an item are selected
 */
const areAllSiblingsSelected = (
  itemId: TreeViewItemId,
  items: TreeViewItem[],
  selectedItems: TreeViewItemId[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[]
): boolean => {
  const parent = findParentItem(itemId, items, getItemId, getItemChildren);
  if (!parent) {
    return false; // Root items don't have siblings
  }
  
  const siblings = getItemChildren(parent);
  if (siblings.length === 0) {
    return false;
  }
  
  // Check if all siblings are selected
  return siblings.every((sibling) => {
    const siblingId = getItemId(sibling);
    return selectedItems.includes(siblingId);
  });
};

/**
 * useSelection – Selection State Management Hook
 *
 * Manages selection state with support for controlled/uncontrolled modes
 * and single/multi-selection with selection propagation.
 *
 * @param props - Hook configuration
 * @returns Selection state and methods
 */
export const useSelection = (props: UseSelectionProps) => {
  const {
    defaultSelectedItems,
    selectedItems: controlledSelectedItems,
    multiSelect = false,
    onSelectedItemsChange,
    onItemSelectionToggle,
    selectionPropagation = { descendants: false, parents: false },
    getItemChildren,
    getItemId,
  } = props;
  
  // We need access to items for propagation logic
  // This will be passed from the component
  const itemsRef = useRef<TreeViewItem[]>([]);

  const isControlled = controlledSelectedItems !== undefined;

  // Normalize to array format internally
  const normalizeToArray = (items: TreeViewItemId | TreeViewItemId[] | undefined): TreeViewItemId[] => {
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  };

  const [internalSelectedItems, setInternalSelectedItems] = useState<TreeViewItemId[]>(
    normalizeToArray(defaultSelectedItems)
  );

  // Use controlled or internal state
  const selectedItems = isControlled
    ? normalizeToArray(controlledSelectedItems)
    : internalSelectedItems;

  // Sync internal state when controlled prop changes
  useEffect(() => {
    if (isControlled && controlledSelectedItems) {
      // Don't update internal state in controlled mode
    } else if (!isControlled && defaultSelectedItems) {
      setInternalSelectedItems(normalizeToArray(defaultSelectedItems));
    }
  }, [isControlled, controlledSelectedItems, defaultSelectedItems]);

  // Check if item is selected
  const isSelected = useCallback(
    (itemId: TreeViewItemId): boolean => {
      return selectedItems.includes(itemId);
    },
    [selectedItems]
  );

  // Toggle selection
  const toggleSelection = useCallback(
    (itemId: TreeViewItemId, event?: React.SyntheticEvent) => {
      const isCurrentlySelected = isSelected(itemId);
      setSelection(itemId, !isCurrentlySelected, event);
    },
    [isSelected]
  );

  // Set selection state with propagation support
  const setSelection = useCallback(
    (itemId: TreeViewItemId, selected: boolean, event?: React.SyntheticEvent, items?: TreeViewItem[]) => {
      const itemsToUse = items || itemsRef.current;
      let newSelectedItems: TreeViewItemId[];

      if (multiSelect) {
        // Multi-select mode
        if (selected) {
          newSelectedItems = [...selectedItems, itemId];
          
          // Selection propagation: descendants
          if (selectionPropagation.descendants) {
            const item = findItemById(itemId, itemsToUse, getItemId, getItemChildren);
            if (item) {
              const descendants = getDescendantIds(item, getItemId, getItemChildren);
              descendants.forEach((descId) => {
                if (!newSelectedItems.includes(descId)) {
                  newSelectedItems.push(descId);
                }
              });
            }
          }
        } else {
          newSelectedItems = selectedItems.filter((id) => id !== itemId);
          
          // Selection propagation: descendants (deselect all descendants)
          if (selectionPropagation.descendants) {
            const item = findItemById(itemId, itemsToUse, getItemId, getItemChildren);
            if (item) {
              const descendants = getDescendantIds(item, getItemId, getItemChildren);
              newSelectedItems = newSelectedItems.filter((id) => !descendants.includes(id));
            }
          }
        }
        
        // Selection propagation: parents
        if (selectionPropagation.parents) {
          if (selected) {
            // Check if all siblings are now selected, if so select parent
            const ancestors = getAncestorIds(itemId, itemsToUse, getItemId, getItemChildren);
            ancestors.forEach((ancestorId) => {
              if (!newSelectedItems.includes(ancestorId)) {
                const ancestorItem = findItemById(ancestorId, itemsToUse, getItemId, getItemChildren);
                if (ancestorItem) {
                  const ancestorChildren = getItemChildren(ancestorItem);
                  const allChildrenSelected = ancestorChildren.every((child) => {
                    const childId = getItemId(child);
                    return newSelectedItems.includes(childId);
                  });
                  if (allChildrenSelected) {
                    newSelectedItems.push(ancestorId);
                  }
                }
              }
            });
          } else {
            // Deselect parent if any child is deselected
            const ancestors = getAncestorIds(itemId, itemsToUse, getItemId, getItemChildren);
            ancestors.forEach((ancestorId) => {
              newSelectedItems = newSelectedItems.filter((id) => id !== ancestorId);
            });
          }
        }
      } else {
        // Single-select mode (no propagation in single-select)
        newSelectedItems = selected ? [itemId] : [];
      }

      // Normalize output based on multiSelect
      const output = multiSelect ? newSelectedItems : newSelectedItems[0] || null;

      if (isControlled) {
        // In controlled mode, just call the callback
        onSelectedItemsChange?.(event || null, output as TreeViewItemId | TreeViewItemId[]);
      } else {
        // In uncontrolled mode, update internal state
        setInternalSelectedItems(newSelectedItems);
        onSelectedItemsChange?.(event || null, output as TreeViewItemId | TreeViewItemId[]);
      }

      // Call item-level toggle callback
      onItemSelectionToggle?.(event || null, itemId, selected);
    },
    [isControlled, selectedItems, multiSelect, onSelectedItemsChange, onItemSelectionToggle, selectionPropagation, getItemId, getItemChildren]
  );

  // Clear all selections
  const clearSelection = useCallback(
    (event?: React.SyntheticEvent) => {
      const output = multiSelect ? [] : null;
      if (isControlled) {
        onSelectedItemsChange?.(event || null, output as TreeViewItemId | TreeViewItemId[]);
      } else {
        setInternalSelectedItems([]);
        onSelectedItemsChange?.(event || null, output as TreeViewItemId | TreeViewItemId[]);
      }
    },
    [isControlled, multiSelect, onSelectedItemsChange]
  );

  // Update items ref when items change (for propagation logic)
  const updateItems = useCallback((items: TreeViewItem[]) => {
    itemsRef.current = items;
  }, []);

  return {
    selectedItems,
    isSelected,
    toggleSelection,
    setSelection,
    clearSelection,
    updateItems, // Expose method to update items for propagation
  };
};
