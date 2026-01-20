/**
 * @fileoverview useScreenReader – Screen Reader Support Hook
 *
 * Provides screen reader announcements and live region support
 * for accessibility.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import { useCallback, useRef, useEffect } from 'react';
import { TreeViewItemId } from '../StudioTreeView';

/**
 * Props for useScreenReader hook
 */
interface UseScreenReaderProps {
  /** Whether to enable screen reader announcements */
  enableAnnouncements?: boolean;
  /** Custom announcement function */
  onAnnounce?: (message: string) => void;
}

/**
 * useScreenReader – Screen Reader Support Hook
 *
 * Provides screen reader announcements through ARIA live regions
 * and custom announcement handlers.
 *
 * @param props - Hook configuration
 * @returns Screen reader announcement functions
 */
export const useScreenReader = (props: UseScreenReaderProps = {}) => {
  const { enableAnnouncements = true, onAnnounce } = props;
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Create live region for announcements
  useEffect(() => {
    if (!enableAnnouncements) return;

    // Create or get live region
    let liveRegion = document.getElementById('studio-tree-view-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'studio-tree-view-live-region';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }

    liveRegionRef.current = liveRegion as HTMLDivElement;

    return () => {
      // Don't remove live region on cleanup - it might be used by other instances
    };
  }, [enableAnnouncements]);

  /**
   * Announce a message to screen readers
   */
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (!enableAnnouncements) return;

      // Use custom handler if provided
      if (onAnnounce) {
        onAnnounce(message);
        return;
      }

      // Use live region
      const liveRegion = liveRegionRef.current || document.getElementById('studio-tree-view-live-region');
      if (liveRegion) {
        liveRegion.setAttribute('aria-live', priority);
        liveRegion.textContent = message;
        
        // Clear after a short delay to allow re-announcement of same message
        setTimeout(() => {
          if (liveRegion) {
            liveRegion.textContent = '';
          }
        }, 1000);
      }
    },
    [enableAnnouncements, onAnnounce]
  );

  /**
   * Announce item selection
   */
  const announceSelection = useCallback(
    (itemId: TreeViewItemId, itemLabel: string, isSelected: boolean) => {
      const state = isSelected ? 'selected' : 'unselected';
      announce(`${itemLabel} ${state}`);
    },
    [announce]
  );

  /**
   * Announce item expansion
   */
  const announceExpansion = useCallback(
    (itemId: TreeViewItemId, itemLabel: string, isExpanded: boolean) => {
      const state = isExpanded ? 'expanded' : 'collapsed';
      announce(`${itemLabel} ${state}`);
    },
    [announce]
  );

  /**
   * Announce navigation
   */
  const announceNavigation = useCallback(
    (itemLabel: string, position: number, total: number) => {
      announce(`${itemLabel}, item ${position} of ${total}`);
    },
    [announce]
  );

  /**
   * Announce focus change
   */
  const announceFocus = useCallback(
    (itemLabel: string, level: number, hasChildren: boolean) => {
      const childrenInfo = hasChildren ? ', has children' : '';
      announce(`${itemLabel}, level ${level}${childrenInfo}`);
    },
    [announce]
  );

  /**
   * Announce loading state
   */
  const announceLoading = useCallback(
    (itemLabel: string) => {
      announce(`Loading ${itemLabel}`, 'polite');
    },
    [announce]
  );

  /**
   * Announce error state
   */
  const announceError = useCallback(
    (itemLabel: string, errorMessage: string) => {
      announce(`Error loading ${itemLabel}: ${errorMessage}`, 'assertive');
    },
    [announce]
  );

  return {
    announce,
    announceSelection,
    announceExpansion,
    announceNavigation,
    announceFocus,
    announceLoading,
    announceError,
  };
};
