/**
 * @fileoverview Unit Tests for useUserInteractions Hook
 *
 * Comprehensive test suite for user interaction handling.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import { renderHook, act } from '@testing-library/react';
import { useUserInteractions } from '../hooks/useUserInteractions';

// Mock timers
jest.useFakeTimers();

describe('useUserInteractions', () => {
  const mockOnItemClick = jest.fn();
  const mockOnItemDoubleClick = jest.fn();
  const mockOnItemContextMenu = jest.fn();
  const mockOnItemHover = jest.fn();
  const mockOnItemHoverEnd = jest.fn();
  const mockIsItemDisabled = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  describe('Single Click Handling', () => {
    it('should call onItemClick after threshold delay', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      act(() => {
        result.current.handleClick(event, '1');
      });

      // Should not be called immediately
      expect(mockOnItemClick).not.toHaveBeenCalled();

      // Should be called after threshold
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnItemClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).toHaveBeenCalledWith(event, '1');
    });

    it('should not call onItemClick if double-click occurs', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
          onItemDoubleClick: mockOnItemDoubleClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      // First click
      act(() => {
        result.current.handleClick(event, '1');
      });

      // Second click (double-click) before threshold
      act(() => {
        jest.advanceTimersByTime(200);
        result.current.handleClick(event, '1');
      });

      // Should call double-click, not single-click
      expect(mockOnItemDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).not.toHaveBeenCalled();
    });

    it('should handle clicks on different items separately', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleClick(event, '1');
        result.current.handleClick(event, '2');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should call for both items
      expect(mockOnItemClick).toHaveBeenCalledTimes(2);
      expect(mockOnItemClick).toHaveBeenCalledWith(event, '1');
      expect(mockOnItemClick).toHaveBeenCalledWith(event, '2');
    });
  });

  describe('Double-Click Handling', () => {
    it('should call onItemDoubleClick when handleDoubleClick is called', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemDoubleClick: mockOnItemDoubleClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleDoubleClick(event, '1');
      });

      expect(mockOnItemDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemDoubleClick).toHaveBeenCalledWith(event, '1');
    });

    it('should clear pending single-click when double-click occurs', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
          onItemDoubleClick: mockOnItemDoubleClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleClick(event, '1');
        result.current.handleDoubleClick(event, '1');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnItemDoubleClick).toHaveBeenCalledTimes(1);
      expect(mockOnItemClick).not.toHaveBeenCalled();
    });
  });

  describe('Context Menu Handling', () => {
    it('should call onItemContextMenu when handleContextMenu is called', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemContextMenu: mockOnItemContextMenu,
        })
      );

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleContextMenu(event, '1');
      });

      expect(mockOnItemContextMenu).toHaveBeenCalledTimes(1);
      expect(mockOnItemContextMenu).toHaveBeenCalledWith(event, '1');
    });

    it('should prevent default when preventContextMenu is true', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemContextMenu: mockOnItemContextMenu,
          preventContextMenu: true,
        })
      );

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleContextMenu(event, '1');
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(mockOnItemContextMenu).toHaveBeenCalledTimes(1);
    });

    it('should not call onItemContextMenu for disabled items', () => {
      mockIsItemDisabled.mockReturnValue(true);

      const { result } = renderHook(() =>
        useUserInteractions({
          onItemContextMenu: mockOnItemContextMenu,
          isItemDisabled: mockIsItemDisabled,
        })
      );

      const event = {
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleContextMenu(event, '1');
      });

      expect(mockOnItemContextMenu).not.toHaveBeenCalled();
    });
  });

  describe('Hover Handling', () => {
    it('should track hovered item', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemHover: mockOnItemHover,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleMouseEnter(event, '1');
      });

      expect(result.current.hoveredItemId).toBe('1');
      expect(mockOnItemHover).toHaveBeenCalledTimes(1);
      expect(mockOnItemHover).toHaveBeenCalledWith(event, '1');
    });

    it('should clear hovered item on mouse leave', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemHover: mockOnItemHover,
          onItemHoverEnd: mockOnItemHoverEnd,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleMouseEnter(event, '1');
      });

      expect(result.current.hoveredItemId).toBe('1');

      act(() => {
        result.current.handleMouseLeave(event, '1');
      });

      expect(result.current.hoveredItemId).toBeNull();
      expect(mockOnItemHoverEnd).toHaveBeenCalledTimes(1);
      expect(mockOnItemHoverEnd).toHaveBeenCalledWith(event, '1');
    });

    it('should not call onItemHover for disabled items', () => {
      mockIsItemDisabled.mockReturnValue(true);

      const { result } = renderHook(() =>
        useUserInteractions({
          onItemHover: mockOnItemHover,
          isItemDisabled: mockIsItemDisabled,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleMouseEnter(event, '1');
      });

      expect(mockOnItemHover).not.toHaveBeenCalled();
      expect(result.current.hoveredItemId).toBeNull();
    });
  });

  describe('Disabled Items', () => {
    it('should not handle clicks for disabled items', () => {
      mockIsItemDisabled.mockReturnValue(true);

      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
          isItemDisabled: mockIsItemDisabled,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleClick(event, '1');
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnItemClick).not.toHaveBeenCalled();
    });

    it('should not handle double-clicks for disabled items', () => {
      mockIsItemDisabled.mockReturnValue(true);

      const { result } = renderHook(() =>
        useUserInteractions({
          onItemDoubleClick: mockOnItemDoubleClick,
          isItemDisabled: mockIsItemDisabled,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleDoubleClick(event, '1');
      });

      expect(mockOnItemDoubleClick).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup pending timers on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleClick(event, '1');
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not be called after unmount
      expect(mockOnItemClick).not.toHaveBeenCalled();
    });

    it('should cleanup when cleanup is called', () => {
      const { result } = renderHook(() =>
        useUserInteractions({
          onItemClick: mockOnItemClick,
        })
      );

      const event = { preventDefault: jest.fn() } as unknown as React.MouseEvent;
      
      act(() => {
        result.current.handleClick(event, '1');
        result.current.cleanup();
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnItemClick).not.toHaveBeenCalled();
    });
  });
});
