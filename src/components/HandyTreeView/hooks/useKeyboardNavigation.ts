/**
 * @fileoverview useKeyboardNavigation – Keyboard Navigation Hook
 *
 * Handles keyboard navigation for tree view items, including arrow keys,
 * enter, space, home, end, and multi-select modifiers.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React, { useCallback, useRef } from 'react';
import { TreeViewItem, DataSource } from '../types';
import { TreeViewItemId } from '../HandyTreeView';

/**
 * Props for useKeyboardNavigation hook
 */
interface UseKeyboardNavigationProps {
  items: TreeViewItem[];
  expandedItems: TreeViewItemId[];
  selectedItems: TreeViewItemId[];
  focusedItemId: TreeViewItemId | null;
  setFocusedItemId: (id: TreeViewItemId | null) => void;
  toggleExpansion: (id: TreeViewItemId, event?: React.SyntheticEvent) => void;
  toggleSelection: (id: TreeViewItemId, event?: React.SyntheticEvent, items?: TreeViewItem[]) => void;
  setExpanded: (id: TreeViewItemId, expanded: boolean, event?: React.SyntheticEvent) => void;
  setSelection: (id: TreeViewItemId, selected: boolean, event?: React.SyntheticEvent, items?: TreeViewItem[]) => void;
  clearSelection?: (event?: React.SyntheticEvent) => void;
  getItemChildren: (item: TreeViewItem) => TreeViewItem[];
  getItemId: (item: TreeViewItem) => TreeViewItemId;
  multiSelect?: boolean;
  isItemDisabled?: (itemId: TreeViewItemId) => boolean;
  setEditedItemId?: (id: TreeViewItemId | null) => void;
  editedItemId?: TreeViewItemId | null;
  pageSize?: number; // Number of items to scroll per Page Up/Down
  onItemFocus?: (event: React.SyntheticEvent, itemId: TreeViewItemId) => void; // Callback when item receives focus via keyboard
}

/**
 * Flatten tree items into a flat list with parent references
 */
const flattenItems = (
  items: TreeViewItem[],
  getItemId: (item: TreeViewItem) => TreeViewItemId,
  getItemChildren: (item: TreeViewItem) => TreeViewItem[],
  expandedItems: TreeViewItemId[],
  result: TreeViewItem[] = [],
  level: number = 0
): TreeViewItem[] => {
  items.forEach((item) => {
    result.push(item);
    const itemId = getItemId(item);
    const children = getItemChildren(item);
    if (children && children.length > 0 && expandedItems.includes(itemId)) {
      flattenItems(children, getItemId, getItemChildren, expandedItems, result, level + 1);
    }
  });
  return result;
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
 * useKeyboardNavigation – Keyboard Navigation Hook
 *
 * Provides keyboard navigation handler for tree view.
 *
 * @param props - Hook configuration
 * @returns Keyboard event handler
 */
export const useKeyboardNavigation = (props: UseKeyboardNavigationProps) => {
  const {
    items,
    expandedItems,
    selectedItems,
    focusedItemId,
    setFocusedItemId,
    toggleExpansion,
    toggleSelection,
    setExpanded,
    setSelection,
    clearSelection,
    getItemChildren,
    getItemId,
    multiSelect = false,
    isItemDisabled,
    setEditedItemId,
    editedItemId,
    pageSize = 10, // Default page size for Page Up/Down
    onItemFocus,
  } = props;

  // Track anchor point for range selection (Shift+Arrow)
  const anchorItemIdRef = useRef<TreeViewItemId | null>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Handle Escape key even when no item is focused (for clearing selection)
      if (event.key === 'Escape') {
        event.preventDefault();
        // Cancel editing if in edit mode
        if (editedItemId !== null && editedItemId !== undefined && setEditedItemId) {
          setEditedItemId(null);
        } else if (clearSelection && multiSelect && selectedItems.length > 0) {
          // Clear selection if multi-select and items are selected
          clearSelection(event);
        }
        // Clear anchor point
        anchorItemIdRef.current = null;
        return;
      }

      if (!focusedItemId) {
        // If nothing is focused, focus the first enabled item
        const flatItems = flattenItems(items, getItemId, getItemChildren, expandedItems);
        // Find the first enabled item
        for (const item of flatItems) {
          const itemId = getItemId(item);
          if (!isItemDisabled?.(itemId)) {
            setFocusedItemId(itemId);
            // Trigger focus callback for screen reader announcements
            onItemFocus?.(event, itemId);
            break;
          }
        }
        return;
      }

      const flatItems = flattenItems(items, getItemId, getItemChildren, expandedItems);
      const currentIndex = flatItems.findIndex((item) => getItemId(item) === focusedItemId);

      if (currentIndex === -1) return;

      const currentItem = flatItems[currentIndex];
      const currentId = getItemId(currentItem);

      switch (event.key) {
        case 'ArrowDown': {
          event.preventDefault();
          // Move to next visible item
          let nextIndex = currentIndex + 1;
          while (nextIndex < flatItems.length) {
            const nextItem = flatItems[nextIndex];
            const nextId = getItemId(nextItem);
            if (!isItemDisabled?.(nextId)) {
              setFocusedItemId(nextId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, nextId);
              
              // Handle Shift+Arrow for range selection
              if (event.shiftKey && multiSelect) {
                // Set anchor if not set
                if (anchorItemIdRef.current === null) {
                  anchorItemIdRef.current = currentId;
                }
                
                // Select range from anchor to current
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, nextIndex);
                const endIndex = Math.max(anchorIndex, nextIndex);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              } else if (!event.ctrlKey && !event.metaKey) {
                // Clear anchor if not using modifiers
                anchorItemIdRef.current = null;
              }
              
              break;
            }
            nextIndex++;
          }
          break;
        }

        case 'ArrowUp': {
          event.preventDefault();
          // Move to previous visible item
          let prevIndex = currentIndex - 1;
          while (prevIndex >= 0) {
            const prevItem = flatItems[prevIndex];
            const prevId = getItemId(prevItem);
            if (!isItemDisabled?.(prevId)) {
              setFocusedItemId(prevId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, prevId);
              
              // Handle Shift+Arrow for range selection
              if (event.shiftKey && multiSelect) {
                // Set anchor if not set
                if (anchorItemIdRef.current === null) {
                  anchorItemIdRef.current = currentId;
                }
                
                // Select range from anchor to current
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, prevIndex);
                const endIndex = Math.max(anchorIndex, prevIndex);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              } else if (!event.ctrlKey && !event.metaKey) {
                // Clear anchor if not using modifiers
                anchorItemIdRef.current = null;
              }
              
              break;
            }
            prevIndex--;
          }
          break;
        }

        case 'ArrowRight': {
          event.preventDefault();
          const children = getItemChildren(currentItem);
          if (children && children.length > 0) {
            // If collapsed, expand it
            if (!expandedItems.includes(currentId)) {
              setExpanded(currentId, true, event);
            } else {
              // If expanded, move to first child
              const firstChild = children[0];
              const firstChildId = getItemId(firstChild);
              if (!isItemDisabled?.(firstChildId)) {
                setFocusedItemId(firstChildId);
                // Trigger focus callback for screen reader announcements
                onItemFocus?.(event, firstChildId);
                // Update anchor for range selection
                if (event.shiftKey && multiSelect) {
                  anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                }
              }
            }
          }
          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          const children = getItemChildren(currentItem);
          if (children && children.length > 0 && expandedItems.includes(currentId)) {
            // If expanded, collapse it
            setExpanded(currentId, false, event);
          } else {
            // Move to parent
            const parentItem = findParentItem(currentId, items, getItemId, getItemChildren);
            if (parentItem) {
              const parentId = getItemId(parentItem);
              if (!isItemDisabled?.(parentId)) {
                setFocusedItemId(parentId);
                // Trigger focus callback for screen reader announcements
                onItemFocus?.(event, parentId);
                // Update anchor for range selection
                if (event.shiftKey && multiSelect) {
                  anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                }
              }
            }
          }
          break;
        }

        case 'Enter': {
          event.preventDefault();
          const children = getItemChildren(currentItem);
          if (children && children.length > 0) {
            // Toggle expansion for items with children
            toggleExpansion(currentId, event);
          } else {
            // Toggle selection for leaf items
            if (!isItemDisabled?.(currentId)) {
              if (event.shiftKey && multiSelect) {
                // Shift+Enter: Range selection
                if (anchorItemIdRef.current === null) {
                  anchorItemIdRef.current = currentId;
                }
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, currentIndex);
                const endIndex = Math.max(anchorIndex, currentIndex);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              } else {
                // Regular Enter: Toggle selection
                toggleSelection(currentId, event, items);
                // Clear anchor if not using modifiers
                if (!event.ctrlKey && !event.metaKey) {
                  anchorItemIdRef.current = null;
                }
              }
            }
          }
          break;
        }

        case ' ': {
          event.preventDefault();
          // Toggle selection
          if (!isItemDisabled?.(currentId)) {
            if (event.shiftKey && multiSelect) {
              // Shift+Space: Range selection
              if (anchorItemIdRef.current === null) {
                anchorItemIdRef.current = currentId;
              }
              const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
              const startIndex = Math.min(anchorIndex, currentIndex);
              const endIndex = Math.max(anchorIndex, currentIndex);
              
              for (let j = startIndex; j <= endIndex; j++) {
                const rangeItem = flatItems[j];
                const rangeId = getItemId(rangeItem);
                if (!isItemDisabled?.(rangeId)) {
                  setSelection(rangeId, true, event, items);
                }
              }
            } else {
              // Regular Space: Toggle selection
              toggleSelection(currentId, event, items);
              // Clear anchor if not using modifiers
              if (!event.ctrlKey && !event.metaKey) {
                anchorItemIdRef.current = null;
              }
            }
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          // Move to first item
          if (flatItems.length > 0) {
            const firstItem = flatItems[0];
            const firstId = getItemId(firstItem);
            if (!isItemDisabled?.(firstId)) {
              setFocusedItemId(firstId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, firstId);
              // Update anchor for range selection
              if (event.shiftKey && multiSelect) {
                anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                // Select range from anchor to first
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, 0);
                const endIndex = Math.max(anchorIndex, 0);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              }
            }
          }
          break;
        }

        case 'End': {
          event.preventDefault();
          // Move to last item
          if (flatItems.length > 0) {
            const lastItem = flatItems[flatItems.length - 1];
            const lastId = getItemId(lastItem);
            if (!isItemDisabled?.(lastId)) {
              setFocusedItemId(lastId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, lastId);
              // Update anchor for range selection
              if (event.shiftKey && multiSelect) {
                anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                // Select range from anchor to last
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, flatItems.length - 1);
                const endIndex = Math.max(anchorIndex, flatItems.length - 1);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              }
            }
          }
          break;
        }

        case 'PageDown': {
          event.preventDefault();
          // Move down by page size
          const targetIndex = Math.min(currentIndex + pageSize, flatItems.length - 1);
          for (let i = targetIndex; i >= currentIndex; i--) {
            const targetItem = flatItems[i];
            const targetId = getItemId(targetItem);
            if (!isItemDisabled?.(targetId)) {
              setFocusedItemId(targetId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, targetId);
              // Update anchor for range selection
              if (event.shiftKey && multiSelect) {
                anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                // Select range from anchor to target
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, i);
                const endIndex = Math.max(anchorIndex, i);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              }
              break;
            }
          }
          break;
        }

        case 'PageUp': {
          event.preventDefault();
          // Move up by page size
          const targetIndex = Math.max(currentIndex - pageSize, 0);
          for (let i = targetIndex; i <= currentIndex; i++) {
            const targetItem = flatItems[i];
            const targetId = getItemId(targetItem);
            if (!isItemDisabled?.(targetId)) {
              setFocusedItemId(targetId);
              // Trigger focus callback for screen reader announcements
              onItemFocus?.(event, targetId);
              // Update anchor for range selection
              if (event.shiftKey && multiSelect) {
                anchorItemIdRef.current = anchorItemIdRef.current || currentId;
                // Select range from anchor to target
                const anchorIndex = flatItems.findIndex((item) => getItemId(item) === anchorItemIdRef.current);
                const startIndex = Math.min(anchorIndex, i);
                const endIndex = Math.max(anchorIndex, i);
                
                for (let j = startIndex; j <= endIndex; j++) {
                  const rangeItem = flatItems[j];
                  const rangeId = getItemId(rangeItem);
                  if (!isItemDisabled?.(rangeId) && !selectedItems.includes(rangeId)) {
                    setSelection(rangeId, true, event, items);
                  }
                }
              }
              break;
            }
          }
          break;
        }

        default:
          // Let other keys pass through
          break;
      }
    },
    [
      focusedItemId,
      items,
      expandedItems,
      selectedItems,
      setFocusedItemId,
      toggleExpansion,
      toggleSelection,
      setExpanded,
      setSelection,
      clearSelection,
      getItemChildren,
      getItemId,
      multiSelect,
      isItemDisabled,
      setEditedItemId,
      editedItemId,
      pageSize,
      onItemFocus,
    ]
  );

  return handleKeyDown;
};
