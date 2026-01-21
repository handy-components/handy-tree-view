/**
 * @fileoverview Unit Tests for useScreenReader Hook
 *
 * Comprehensive test suite for screen reader support.
 *
 * Live Region Creation:
 *   - should create live region when enabled
 *   - should not create live region when disabled
 *   - should reuse existing live region
 *
 * announce:
 *   - should announce message to live region
 *   - should use custom announcement handler when provided
 *   - should not announce when disabled
 *   - should support assertive priority
 *   - should clear message after delay
 *
 * announceSelection:
 *   - should announce item selection
 *   - should announce item deselection
 *
 * announceExpansion:
 *   - should announce item expansion
 *   - should announce item collapse
 *
 * announceNavigation:
 *   - should announce navigation with position
 *
 * announceFocus:
 *   - should announce focus with level and children info
 *   - should announce focus without children info when no children
 *
 * announceLoading:
 *   - should announce loading state
 *
 * announceError:
 *   - should announce error with assertive priority
 *
 * Default Behavior:
 *   - should enable announcements by default
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { useScreenReader } from '../../src/components/HandyTreeView/hooks/useScreenReader';

describe('useScreenReader', () => {
  beforeEach(() => {
    // Clean up any existing live regions
    const existing = document.getElementById('handy-tree-view-live-region');
    if (existing) {
      existing.remove();
    }
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    const existing = document.getElementById('handy-tree-view-live-region');
    if (existing) {
      existing.remove();
    }
  });

  describe('Live Region Creation', () => {
    it('should create live region when enabled', () => {
      renderHook(() => useScreenReader({ enableAnnouncements: true }));

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.getAttribute('role')).toBe('status');
      expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
      expect(liveRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should not create live region when disabled', () => {
      renderHook(() => useScreenReader({ enableAnnouncements: false }));

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion).not.toBeInTheDocument();
    });

    it('should reuse existing live region', () => {
      const existing = document.createElement('div');
      existing.id = 'handy-tree-view-live-region';
      document.body.appendChild(existing);

      renderHook(() => useScreenReader({ enableAnnouncements: true }));

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion).toBe(existing);
    });
  });

  describe('announce', () => {
    it('should announce message to live region', () => {
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true })
      );

      act(() => {
        result.current.announce('Test message');
      });

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion?.textContent).toBe('Test message');
    });

    it('should use custom announcement handler when provided', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announce('Test message');
      });

      expect(onAnnounce).toHaveBeenCalledWith('Test message');
    });

    it('should not announce when disabled', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: false, onAnnounce })
      );

      act(() => {
        result.current.announce('Test message');
      });

      expect(onAnnounce).not.toHaveBeenCalled();
    });

    it('should support assertive priority', () => {
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true })
      );

      act(() => {
        result.current.announce('Urgent message', 'assertive');
      });

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion?.getAttribute('aria-live')).toBe('assertive');
    });

    it('should clear message after delay', () => {
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true })
      );

      act(() => {
        result.current.announce('Test message');
      });

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion?.textContent).toBe('Test message');

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(liveRegion?.textContent).toBe('');
    });
  });

  describe('announceSelection', () => {
    it('should announce item selection', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceSelection('1', 'Item 1', true);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1 selected');
    });

    it('should announce item deselection', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceSelection('1', 'Item 1', false);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1 unselected');
    });
  });

  describe('announceExpansion', () => {
    it('should announce item expansion', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceExpansion('1', 'Item 1', true);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1 expanded');
    });

    it('should announce item collapse', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceExpansion('1', 'Item 1', false);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1 collapsed');
    });
  });

  describe('announceNavigation', () => {
    it('should announce navigation with position', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceNavigation('Item 1', 2, 10);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1, item 2 of 10');
    });
  });

  describe('announceFocus', () => {
    it('should announce focus with level and children info', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceFocus('Item 1', 2, true);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1, level 2, has children');
    });

    it('should announce focus without children info when no children', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceFocus('Item 1', 1, false);
      });

      expect(onAnnounce).toHaveBeenCalledWith('Item 1, level 1');
    });
  });

  describe('announceLoading', () => {
    it('should announce loading state', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceLoading('Item 1');
      });

      expect(onAnnounce).toHaveBeenCalledWith('Loading Item 1', 'polite');
    });
  });

  describe('announceError', () => {
    it('should announce error with assertive priority', () => {
      const onAnnounce = jest.fn();
      const { result } = renderHook(() =>
        useScreenReader({ enableAnnouncements: true, onAnnounce })
      );

      act(() => {
        result.current.announceError('Item 1', 'Failed to load');
      });

      expect(onAnnounce).toHaveBeenCalledWith(
        'Error loading Item 1: Failed to load',
        'assertive'
      );
    });
  });

  describe('Default Behavior', () => {
    it('should enable announcements by default', () => {
      const { result } = renderHook(() => useScreenReader());

      act(() => {
        result.current.announce('Test message');
      });

      const liveRegion = document.getElementById('handy-tree-view-live-region');
      expect(liveRegion?.textContent).toBe('Test message');
    });
  });
});
