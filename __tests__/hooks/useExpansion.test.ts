/**
 * @fileoverview Unit Tests for useExpansion Hook
 *
 * Comprehensive test suite for expansion state management.
 *
 * Initial State:
 *   - should initialize with empty expanded items when no defaults provided
 *   - should initialize with default expanded items
 *   - should use controlled expanded items when provided
 *   - should prioritize controlled items over default items
 *
 * isExpanded:
 *   - should return true for expanded items
 *   - should return false for non-expanded items
 *   - should work with controlled mode
 *
 * setExpanded - Uncontrolled Mode:
 *   - should expand an item
 *   - should collapse an item
 *   - should add multiple items
 *   - should not add duplicate items
 *   - should call onExpandedItemsChange callback
 *   - should call onExpandedItemsChange with null event when no event provided
 *
 * setExpanded - Controlled Mode:
 *   - should call onExpandedItemsChange but not update internal state
 *   - should handle collapsing in controlled mode
 *
 * toggleExpansion:
 *   - should expand a collapsed item
 *   - should collapse an expanded item
 *   - should pass event to setExpanded
 *
 * Edge Cases:
 *   - should handle empty string IDs
 *   - should handle numeric IDs
 *   - should handle rapid toggles
 *   - should handle setting same expansion state multiple times
 *
 * State Updates:
 *   - should update when controlled prop changes
 *   - should maintain internal state when switching from uncontrolled to controlled
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act } from '@testing-library/react';
import { useExpansion } from '../../src/components/HandyTreeView/hooks/useExpansion';

describe('useExpansion', () => {
  describe('Initial State', () => {
    it('should initialize with empty expanded items when no defaults provided', () => {
      const { result } = renderHook(() => useExpansion({}));

      expect(result.current.expandedItems).toEqual([]);
    });

    it('should initialize with default expanded items', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1', '2'] })
      );

      expect(result.current.expandedItems).toEqual(['1', '2']);
    });

    it('should use controlled expanded items when provided', () => {
      const { result } = renderHook(() =>
        useExpansion({ expandedItems: ['1', '2', '3'] })
      );

      expect(result.current.expandedItems).toEqual(['1', '2', '3']);
    });

    it('should prioritize controlled items over default items', () => {
      const { result } = renderHook(() =>
        useExpansion({
          defaultExpandedItems: ['1', '2'],
          expandedItems: ['3', '4'],
        })
      );

      expect(result.current.expandedItems).toEqual(['3', '4']);
    });
  });

  describe('isExpanded', () => {
    it('should return true for expanded items', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1', '2'] })
      );

      expect(result.current.isExpanded('1')).toBe(true);
      expect(result.current.isExpanded('2')).toBe(true);
    });

    it('should return false for non-expanded items', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1'] })
      );

      expect(result.current.isExpanded('2')).toBe(false);
      expect(result.current.isExpanded('3')).toBe(false);
    });

    it('should work with controlled mode', () => {
      const { result, rerender } = renderHook(
        ({ expandedItems }) => useExpansion({ expandedItems }),
        { initialProps: { expandedItems: ['1'] } }
      );

      expect(result.current.isExpanded('1')).toBe(true);
      expect(result.current.isExpanded('2')).toBe(false);

      rerender({ expandedItems: ['2'] });

      expect(result.current.isExpanded('1')).toBe(false);
      expect(result.current.isExpanded('2')).toBe(true);
    });
  });

  describe('setExpanded - Uncontrolled Mode', () => {
    it('should expand an item', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.setExpanded('1', true);
      });

      expect(result.current.expandedItems).toContain('1');
      expect(result.current.isExpanded('1')).toBe(true);
    });

    it('should collapse an item', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1'] })
      );

      act(() => {
        result.current.setExpanded('1', false);
      });

      expect(result.current.expandedItems).not.toContain('1');
      expect(result.current.isExpanded('1')).toBe(false);
    });

    it('should add multiple items', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.setExpanded('1', true);
        result.current.setExpanded('2', true);
        result.current.setExpanded('3', true);
      });

      expect(result.current.expandedItems).toEqual(['1', '2', '3']);
    });

    it('should not add duplicate items', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.setExpanded('1', true);
        result.current.setExpanded('1', true);
      });

      expect(result.current.expandedItems).toEqual(['1']);
    });

    it('should call onExpandedItemsChange callback', () => {
      const onExpandedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useExpansion({ onExpandedItemsChange })
      );

      const mockEvent = {} as React.SyntheticEvent;

      act(() => {
        result.current.setExpanded('1', true, mockEvent);
      });

      expect(onExpandedItemsChange).toHaveBeenCalledTimes(1);
      expect(onExpandedItemsChange).toHaveBeenCalledWith(mockEvent, ['1']);
    });

    it('should call onExpandedItemsChange with null event when no event provided', () => {
      const onExpandedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useExpansion({ onExpandedItemsChange })
      );

      act(() => {
        result.current.setExpanded('1', true);
      });

      expect(onExpandedItemsChange).toHaveBeenCalledWith(null, ['1']);
    });
  });

  describe('setExpanded - Controlled Mode', () => {
    it('should call onExpandedItemsChange but not update internal state', () => {
      const onExpandedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useExpansion({
          expandedItems: ['1'],
          onExpandedItemsChange,
        })
      );

      act(() => {
        result.current.setExpanded('2', true);
      });

      // Should call callback with new items
      expect(onExpandedItemsChange).toHaveBeenCalledWith(null, ['1', '2']);

      // But internal state should remain controlled
      expect(result.current.expandedItems).toEqual(['1']);
    });

    it('should handle collapsing in controlled mode', () => {
      const onExpandedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useExpansion({
          expandedItems: ['1', '2'],
          onExpandedItemsChange,
        })
      );

      act(() => {
        result.current.setExpanded('1', false);
      });

      expect(onExpandedItemsChange).toHaveBeenCalledWith(null, ['2']);
      expect(result.current.expandedItems).toEqual(['1', '2']);
    });
  });

  describe('toggleExpansion', () => {
    it('should expand a collapsed item', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.toggleExpansion('1');
      });

      expect(result.current.isExpanded('1')).toBe(true);
    });

    it('should collapse an expanded item', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1'] })
      );

      act(() => {
        result.current.toggleExpansion('1');
      });

      expect(result.current.isExpanded('1')).toBe(false);
    });

    it('should pass event to setExpanded', () => {
      const onExpandedItemsChange = jest.fn();
      const { result } = renderHook(() =>
        useExpansion({ onExpandedItemsChange })
      );

      const mockEvent = {} as React.SyntheticEvent;

      act(() => {
        result.current.toggleExpansion('1', mockEvent);
      });

      expect(onExpandedItemsChange).toHaveBeenCalledWith(mockEvent, ['1']);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string IDs', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.setExpanded('', true);
      });

      expect(result.current.isExpanded('')).toBe(true);
    });

    it('should handle numeric IDs', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.setExpanded(1, true);
        result.current.setExpanded(2, true);
      });

      expect(result.current.isExpanded(1)).toBe(true);
      expect(result.current.isExpanded(2)).toBe(true);
    });

    it('should handle rapid toggles', () => {
      const { result } = renderHook(() => useExpansion({}));

      act(() => {
        result.current.toggleExpansion('1');
        result.current.toggleExpansion('1');
        result.current.toggleExpansion('1');
      });

      expect(result.current.isExpanded('1')).toBe(true);
    });

    it('should handle setting same expansion state multiple times', () => {
      const { result } = renderHook(() =>
        useExpansion({ defaultExpandedItems: ['1'] })
      );

      act(() => {
        result.current.setExpanded('1', true);
        result.current.setExpanded('1', true);
        result.current.setExpanded('1', true);
      });

      expect(result.current.expandedItems).toEqual(['1']);
    });
  });

  describe('State Updates', () => {
    it('should update when controlled prop changes', () => {
      const { result, rerender } = renderHook(
        ({ expandedItems }) => useExpansion({ expandedItems }),
        { initialProps: { expandedItems: ['1'] } }
      );

      expect(result.current.expandedItems).toEqual(['1']);

      rerender({ expandedItems: ['2', '3'] });

      expect(result.current.expandedItems).toEqual(['2', '3']);
    });

    it('should maintain internal state when switching from uncontrolled to controlled', () => {
      type ExpansionProps = {
        defaultExpandedItems?: string[];
        expandedItems?: string[];
      };
      const { result, rerender } = renderHook(
        (props: ExpansionProps) => useExpansion(props),
        { initialProps: { defaultExpandedItems: ['1'] } as ExpansionProps }
      );

      expect(result.current.expandedItems).toEqual(['1']);

      rerender({ expandedItems: ['2'] });

      expect(result.current.expandedItems).toEqual(['2']);
    });
  });
});
