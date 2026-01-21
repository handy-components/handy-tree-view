/**
 * @fileoverview Unit Tests for useKeyboardNavigation Hook
 *
 * Comprehensive test suite for keyboard navigation functionality.
 *
 * Initial Focus:
 *   - should focus first item when no item is focused
 *   - should skip disabled items when focusing first item
 *
 * ArrowDown:
 *   - should move focus to next item
 *   - should skip disabled items
 *
 * ArrowUp:
 *   - should move focus to previous item
 *
 * ArrowRight:
 *   - should expand collapsed item
 *   - should move to first child when item is expanded
 *
 * ArrowLeft:
 *   - should collapse expanded item
 *   - should move to parent when item is collapsed
 *
 * Enter:
 *   - should toggle expansion for items with children
 *   - should toggle selection for leaf items
 *
 * Space:
 *   - should toggle selection
 *
 * Home:
 *   - should focus first item
 *
 * End:
 *   - should focus last item
 *
 * Escape:
 *   - should clear selection in multi-select mode
 *   - should cancel editing when in edit mode
 *   - should work even when no item is focused
 *
 * Shift+Arrow (Range Selection):
 *   - should select range with Shift+ArrowDown
 *
 * Page Up/Down:
 *   - should move focus by page size with PageDown
 *   - should move focus by page size with PageUp
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardNavigation } from '../../src/components/HandyTreeView/hooks/useKeyboardNavigation';
import { TreeViewItem } from '../../src/components/HandyTreeView/types';

const mockItems: TreeViewItem[] = [
  {
    id: '1',
    label: 'Parent 1',
    children: [
      { id: '1-1', label: 'Child 1-1' },
      { id: '1-2', label: 'Child 1-2' },
    ],
  },
  {
    id: '2',
    label: 'Parent 2',
    children: [{ id: '2-1', label: 'Child 2-1' }],
  },
  {
    id: '3',
    label: 'Leaf Item',
  },
];

const getItemId = (item: TreeViewItem) => item.id;
const getItemChildren = (item: TreeViewItem) => item.children || [];

describe('useKeyboardNavigation', () => {
  const mockSetFocusedItemId = jest.fn();
  const mockToggleExpansion = jest.fn();
  const mockToggleSelection = jest.fn();
  const mockSetExpanded = jest.fn();
  const mockSetSelection = jest.fn();
  const mockClearSelection = jest.fn();
  const mockSetEditedItemId = jest.fn();
  const mockOnItemFocus = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (key: string, options: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}) => {
    return {
      key,
      preventDefault: jest.fn(),
      shiftKey: options.shiftKey || false,
      ctrlKey: options.ctrlKey || false,
      metaKey: options.metaKey || false,
    } as unknown as React.KeyboardEvent;
  };

  describe('Initial Focus', () => {
    it('should focus first item when no item is focused', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowDown');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '1');
    });

    it('should skip disabled items when focusing first item', () => {
      const mockIsItemDisabled = jest.fn((id) => id === '1');
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          isItemDisabled: mockIsItemDisabled,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowDown');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('2');
    });
  });

  describe('ArrowDown', () => {
    it('should move focus to next item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowDown');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('2');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '2');
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should skip disabled items', () => {
      const mockIsItemDisabled = jest.fn((id) => id === '2');
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          isItemDisabled: mockIsItemDisabled,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowDown');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('3');
    });
  });

  describe('ArrowUp', () => {
    it('should move focus to previous item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '2',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowUp');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '1');
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('ArrowRight', () => {
    it('should expand collapsed item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowRight');
      result.current(event);

      expect(mockSetExpanded).toHaveBeenCalledWith('1', true, event);
    });

    it('should move to first child when item is expanded', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowRight');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1-1');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '1-1');
    });
  });

  describe('ArrowLeft', () => {
    it('should collapse expanded item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowLeft');
      result.current(event);

      expect(mockSetExpanded).toHaveBeenCalledWith('1', false, event);
    });

    it('should move to parent when item is collapsed', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1-1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowLeft');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '1');
    });
  });

  describe('Enter', () => {
    it('should toggle expansion for items with children', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Enter');
      result.current(event);

      expect(mockToggleExpansion).toHaveBeenCalledWith('1', event);
    });

    it('should toggle selection for leaf items', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '3',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Enter');
      result.current(event);

      expect(mockToggleSelection).toHaveBeenCalledWith('3', event, mockItems);
    });
  });

  describe('Space', () => {
    it('should toggle selection', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent(' ');
      result.current(event);

      expect(mockToggleSelection).toHaveBeenCalledWith('1', event, mockItems);
    });
  });

  describe('Home', () => {
    it('should focus first item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1-2',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Home');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('1');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '1');
    });
  });

  describe('End', () => {
    it('should focus last item', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('End');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalledWith('3');
      expect(mockOnItemFocus).toHaveBeenCalledWith(event, '3');
    });
  });

  describe('Escape', () => {
    it('should clear selection in multi-select mode', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: ['1', '2'],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          clearSelection: mockClearSelection,
          getItemChildren,
          getItemId,
          multiSelect: true,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Escape');
      result.current(event);

      expect(mockClearSelection).toHaveBeenCalledWith(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should cancel editing when in edit mode', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          setEditedItemId: mockSetEditedItemId,
          editedItemId: '1',
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Escape');
      result.current(event);

      expect(mockSetEditedItemId).toHaveBeenCalledWith(null);
    });

    it('should work even when no item is focused', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: [],
          selectedItems: ['1'],
          focusedItemId: null,
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          clearSelection: mockClearSelection,
          getItemChildren,
          getItemId,
          multiSelect: true,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('Escape');
      result.current(event);

      expect(mockClearSelection).toHaveBeenCalledWith(event);
    });
  });

  describe('Shift+Arrow (Range Selection)', () => {
    it('should select range with Shift+ArrowDown', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          multiSelect: true,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('ArrowDown', { shiftKey: true });
      result.current(event);

      expect(mockSetSelection).toHaveBeenCalled();
    });
  });

  describe('Page Up/Down', () => {
    it('should move focus by page size with PageDown', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '1',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          pageSize: 2,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('PageDown');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalled();
      expect(mockOnItemFocus).toHaveBeenCalled();
    });

    it('should move focus by page size with PageUp', () => {
      const { result } = renderHook(() =>
        useKeyboardNavigation({
          items: mockItems,
          expandedItems: ['1'],
          selectedItems: [],
          focusedItemId: '3',
          setFocusedItemId: mockSetFocusedItemId,
          toggleExpansion: mockToggleExpansion,
          toggleSelection: mockToggleSelection,
          setExpanded: mockSetExpanded,
          setSelection: mockSetSelection,
          getItemChildren,
          getItemId,
          pageSize: 2,
          onItemFocus: mockOnItemFocus,
        })
      );

      const event = createMockEvent('PageUp');
      result.current(event);

      expect(mockSetFocusedItemId).toHaveBeenCalled();
      expect(mockOnItemFocus).toHaveBeenCalled();
    });
  });
});
