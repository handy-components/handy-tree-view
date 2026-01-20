/**
 * @fileoverview useExpansion – Expansion State Management Hook
 *
 * Manages expansion state for tree items, supporting both controlled
 * and uncontrolled modes.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { TreeViewItemId } from '../StudioTreeView';

/**
 * Props for useExpansion hook
 */
interface UseExpansionProps {
  /** Default expanded items (uncontrolled) */
  defaultExpandedItems?: TreeViewItemId[];
  /** Controlled expanded items */
  expandedItems?: TreeViewItemId[];
  /** Callback when expanded items change */
  onExpandedItemsChange?: (event: React.SyntheticEvent | null, itemIds: TreeViewItemId[]) => void;
}

/**
 * useExpansion – Expansion State Management Hook
 *
 * Manages expansion state with support for controlled and uncontrolled modes.
 *
 * @param props - Hook configuration
 * @returns Expansion state and methods
 */
export const useExpansion = (props: UseExpansionProps) => {
  const {
    defaultExpandedItems = [],
    expandedItems: controlledExpandedItems,
    onExpandedItemsChange,
  } = props;

  const isControlled = controlledExpandedItems !== undefined;
  const [internalExpandedItems, setInternalExpandedItems] = useState<TreeViewItemId[]>(
    defaultExpandedItems
  );

  // Use controlled or internal state
  const expandedItems = isControlled ? controlledExpandedItems : internalExpandedItems;

  // Sync internal state when controlled prop changes
  useEffect(() => {
    if (isControlled && controlledExpandedItems) {
      // Don't update internal state in controlled mode
    } else if (!isControlled && defaultExpandedItems.length > 0) {
      setInternalExpandedItems(defaultExpandedItems);
    }
  }, [isControlled, controlledExpandedItems, defaultExpandedItems]);

  // Check if item is expanded
  const isExpanded = useCallback(
    (itemId: TreeViewItemId): boolean => {
      return expandedItems.includes(itemId);
    },
    [expandedItems]
  );

  // Toggle expansion
  const toggleExpansion = useCallback(
    (itemId: TreeViewItemId, event?: React.SyntheticEvent) => {
      const isCurrentlyExpanded = isExpanded(itemId);
      setExpanded(itemId, !isCurrentlyExpanded, event);
    },
    [isExpanded]
  );

  // Set expansion state
  const setExpanded = useCallback(
    (itemId: TreeViewItemId, expanded: boolean, event?: React.SyntheticEvent) => {
      if (isControlled) {
        // In controlled mode, just call the callback
        const newExpandedItems = expanded
          ? [...expandedItems, itemId]
          : expandedItems.filter((id) => id !== itemId);
        onExpandedItemsChange?.(event || null, newExpandedItems);
      } else {
        // In uncontrolled mode, update internal state
        setInternalExpandedItems((prev) => {
          const newExpandedItems = expanded
            ? [...prev, itemId]
            : prev.filter((id) => id !== itemId);
          onExpandedItemsChange?.(event || null, newExpandedItems);
          return newExpandedItems;
        });
      }
    },
    [isControlled, expandedItems, onExpandedItemsChange]
  );

  return {
    expandedItems,
    isExpanded,
    toggleExpansion,
    setExpanded,
  };
};
