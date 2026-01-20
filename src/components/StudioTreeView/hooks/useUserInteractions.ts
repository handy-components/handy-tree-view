/**
 * @fileoverview useUserInteractions – User Interaction Handling Hook
 *
 * Handles all user interactions including clicks, double-clicks, right-clicks,
 * hover states, and context menu support.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import { useCallback, useRef, useState } from 'react';
import { TreeViewItemId } from '../StudioTreeView';

/**
 * Double-click threshold in milliseconds
 */
const DOUBLE_CLICK_THRESHOLD = 300;

/**
 * Props for useUserInteractions hook
 */
interface UseUserInteractionsProps {
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
  /** Whether item is disabled */
  isItemDisabled?: (itemId: TreeViewItemId) => boolean;
  /** Whether to prevent default context menu */
  preventContextMenu?: boolean;
}

/**
 * useUserInteractions – User Interaction Handling Hook
 *
 * Provides handlers for all user interactions including clicks, double-clicks,
 * right-clicks, hover states, and context menu support.
 *
 * @param props - Hook configuration
 * @returns Interaction handlers and hover state
 */
export const useUserInteractions = (props: UseUserInteractionsProps) => {
  const {
    onItemClick,
    onItemDoubleClick,
    onItemContextMenu,
    onItemHover,
    onItemHoverEnd,
    isItemDisabled,
    preventContextMenu = false,
  } = props;

  // Track last click time for double-click detection
  const lastClickTime = useRef<number>(0);
  const lastClickItemId = useRef<TreeViewItemId | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track hovered item
  const [hoveredItemId, setHoveredItemId] = useState<TreeViewItemId | null>(null);

  /**
   * Handle single click
   */
  const handleClick = useCallback(
    (event: React.MouseEvent, itemId: TreeViewItemId) => {
      if (isItemDisabled?.(itemId)) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastClickTime.current;
      const sameItem = lastClickItemId.current === itemId;

      // Clear any pending single-click handler
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      // Check for double-click
      if (timeDiff < DOUBLE_CLICK_THRESHOLD && sameItem) {
        // This is a double-click
        lastClickTime.current = 0;
        lastClickItemId.current = null;
        onItemDoubleClick?.(event, itemId);
      } else {
        // This might be a single click, but wait to see if there's a double-click
        lastClickTime.current = currentTime;
        lastClickItemId.current = itemId;

        // Schedule single-click handler
        clickTimeoutRef.current = setTimeout(() => {
          onItemClick?.(event, itemId);
          lastClickTime.current = 0;
          lastClickItemId.current = null;
          clickTimeoutRef.current = null;
        }, DOUBLE_CLICK_THRESHOLD);
      }
    },
    [isItemDisabled, onItemClick, onItemDoubleClick]
  );

  /**
   * Handle double-click explicitly
   */
  const handleDoubleClick = useCallback(
    (event: React.MouseEvent, itemId: TreeViewItemId) => {
      if (isItemDisabled?.(itemId)) {
        return;
      }

      // Clear any pending single-click handler
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      lastClickTime.current = 0;
      lastClickItemId.current = null;

      onItemDoubleClick?.(event, itemId);
    },
    [isItemDisabled, onItemDoubleClick]
  );

  /**
   * Handle right-click / context menu
   */
  const handleContextMenu = useCallback(
    (event: React.MouseEvent, itemId: TreeViewItemId) => {
      if (isItemDisabled?.(itemId)) {
        return;
      }

      if (preventContextMenu) {
        event.preventDefault();
      }

      onItemContextMenu?.(event, itemId);
    },
    [isItemDisabled, preventContextMenu, onItemContextMenu]
  );

  /**
   * Handle mouse enter (hover start)
   */
  const handleMouseEnter = useCallback(
    (event: React.MouseEvent, itemId: TreeViewItemId) => {
      if (isItemDisabled?.(itemId)) {
        return;
      }

      setHoveredItemId(itemId);
      onItemHover?.(event, itemId);
    },
    [isItemDisabled, onItemHover]
  );

  /**
   * Handle mouse leave (hover end)
   */
  const handleMouseLeave = useCallback(
    (event: React.MouseEvent, itemId: TreeViewItemId) => {
      setHoveredItemId(null);
      onItemHoverEnd?.(event, itemId);
    },
    [onItemHoverEnd]
  );

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
  }, []);

  return {
    handleClick,
    handleDoubleClick,
    handleContextMenu,
    handleMouseEnter,
    handleMouseLeave,
    hoveredItemId,
    cleanup,
  };
};
