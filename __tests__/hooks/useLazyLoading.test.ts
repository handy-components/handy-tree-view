/**
 * @fileoverview Unit Tests for useLazyLoading Hook
 *
 * Comprehensive test suite for lazy loading functionality.
 *
 * Initialization:
 *   - should create LazyLoadingDataSource on mount
 *   - should return lazyLoadingDataSource
 *   - should initialize with empty state
 *
 * isLoading:
 *   - should return false when no items are loading
 *   - should return true when items are loading
 *
 * isItemLoading:
 *   - should return false for non-loading items
 *   - should return true for loading items
 *
 * isItemLoaded:
 *   - should return false for non-loaded items
 *   - should return true for loaded items
 *
 * hasItemError:
 *   - should return false for items without errors
 *   - should return true for items with errors
 *
 * clearCache:
 *   - should clear all cache
 *   - should update state after clearing cache
 *
 * clearCacheForParent:
 *   - should clear cache for specific parent
 *
 * preloadChildren:
 *   - should preload children for parent
 *   - should update state after preloading
 *
 * getCacheStats:
 *   - should return cache statistics
 *   - should return default stats when data source is not available
 *
 * refreshParent:
 *   - should refresh parent data
 *
 * refreshAll:
 *   - should refresh all data
 *
 * State Synchronization:
 *   - should poll for state updates
 *   - should update state when polling detects changes
 *   - should cleanup polling interval on unmount
 *
 * Recreation on Config Change:
 *   - should recreate data source when config changes
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLazyLoading } from '../../src/hooks/useLazyLoading';
import { DataSource } from '../../src/components/HandyTreeView/types';
import { LazyLoadingDataSource } from '../../src/data/LazyLoadingDataSource';

// Mock LazyLoadingDataSource
jest.mock('../../src/data/LazyLoadingDataSource');

describe('useLazyLoading', () => {
  const mockDataSource: DataSource = {
    getTreeItems: jest.fn(),
    getChildrenCount: jest.fn(),
  };

  const mockConfig = {
    enabled: true,
    staleTime: 5000,
    maxCacheSize: 100,
  };

  let mockLazyLoadingDataSource: jest.Mocked<LazyLoadingDataSource>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create a mock instance
    mockLazyLoadingDataSource = {
      getTreeItems: jest.fn(),
      getChildrenCount: jest.fn(),
      getLazyLoadingState: jest.fn(() => ({
        loadingItems: new Set(),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 0,
      })),
      clearCache: jest.fn(),
      clearCacheForParent: jest.fn(),
      preloadChildren: jest.fn().mockResolvedValue(undefined),
      getCacheStats: jest.fn(() => ({
        size: 0,
        maxSize: 100,
        hitRate: 0,
      })),
    } as unknown as jest.Mocked<LazyLoadingDataSource>;

    (LazyLoadingDataSource as jest.MockedClass<typeof LazyLoadingDataSource>).mockImplementation(
      () => mockLazyLoadingDataSource
    );
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should create LazyLoadingDataSource on mount', () => {
      renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(LazyLoadingDataSource).toHaveBeenCalledWith(mockDataSource, mockConfig);
    });

    it('should return lazyLoadingDataSource', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.lazyLoadingDataSource).toBe(mockLazyLoadingDataSource);
    });

    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.lazyLoadingState.loadingItems.size).toBe(0);
      expect(result.current.lazyLoadingState.loadedItems.size).toBe(0);
      expect(result.current.lazyLoadingState.errorItems.size).toBe(0);
      expect(result.current.lazyLoadingState.cacheSize).toBe(0);
    });
  });

  describe('isLoading', () => {
    it('should return false when no items are loading', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.isLoading).toBe(false);
    });

    it('should return true when items are loading', () => {
      mockLazyLoadingDataSource.getLazyLoadingState.mockReturnValue({
        loadingItems: new Set(['1', '2']),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 0,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('isItemLoading', () => {
    it('should return false for non-loading items', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.isItemLoading('1')).toBe(false);
    });

    it('should return true for loading items', () => {
      mockLazyLoadingDataSource.getLazyLoadingState.mockReturnValue({
        loadingItems: new Set(['1']),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 0,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isItemLoading('1')).toBe(true);
    });
  });

  describe('isItemLoaded', () => {
    it('should return false for non-loaded items', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.isItemLoaded('1')).toBe(false);
    });

    it('should return true for loaded items', () => {
      const loadedMap = new Map();
      loadedMap.set('1', [{ id: '1-1', label: 'Child' }]);

      mockLazyLoadingDataSource.getLazyLoadingState.mockReturnValue({
        loadingItems: new Set(),
        loadedItems: loadedMap,
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 1,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.isItemLoaded('1')).toBe(true);
    });
  });

  describe('hasItemError', () => {
    it('should return false for items without errors', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.hasItemError('1')).toBe(false);
    });

    it('should return true for items with errors', () => {
      const errorMap = new Map();
      errorMap.set('1', 'Error message');

      mockLazyLoadingDataSource.getLazyLoadingState.mockReturnValue({
        loadingItems: new Set(),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: errorMap,
        cacheSize: 0,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.hasItemError('1')).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear all cache', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        result.current.clearCache();
      });

      expect(mockLazyLoadingDataSource.clearCache).toHaveBeenCalled();
    });

    it('should update state after clearing cache', () => {
      mockLazyLoadingDataSource.getLazyLoadingState.mockReturnValue({
        loadingItems: new Set(),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 0,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        result.current.clearCache();
      });

      expect(result.current.lazyLoadingState.cacheSize).toBe(0);
    });
  });

  describe('clearCacheForParent', () => {
    it('should clear cache for specific parent', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        result.current.clearCacheForParent('1');
      });

      expect(mockLazyLoadingDataSource.clearCacheForParent).toHaveBeenCalledWith('1');
    });
  });

  describe('preloadChildren', () => {
    it('should preload children for parent', async () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      await act(async () => {
        await result.current.preloadChildren('1');
      });

      expect(mockLazyLoadingDataSource.preloadChildren).toHaveBeenCalledWith('1');
    });

    it('should update state after preloading', async () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      await act(async () => {
        await result.current.preloadChildren('1');
      });

      expect(mockLazyLoadingDataSource.getLazyLoadingState).toHaveBeenCalled();
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      mockLazyLoadingDataSource.getCacheStats.mockReturnValue({
        size: 5,
        maxSize: 100,
        hitRate: 0.8,
      });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      const stats = result.current.getCacheStats();

      expect(stats).toEqual({
        size: 5,
        maxSize: 100,
        hitRate: 0.8,
      });
    });

    it('should return default stats when data source is not available', () => {
      (LazyLoadingDataSource as jest.MockedClass<typeof LazyLoadingDataSource>).mockImplementation(
        () => undefined as any
      );

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      // Verify getCacheStats exists
      expect(result.current.getCacheStats).toBeDefined();
      expect(typeof result.current.getCacheStats).toBe('function');

      const stats = result.current.getCacheStats();

      expect(stats).toEqual({
        size: 0,
        maxSize: 0,
        hitRate: 0,
      });
    });
  });

  describe('refreshParent', () => {
    it('should refresh parent data', async () => {
      mockLazyLoadingDataSource.getTreeItems.mockResolvedValue([]);

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      await act(async () => {
        await result.current.refreshParent('1');
      });

      expect(mockLazyLoadingDataSource.clearCacheForParent).toHaveBeenCalledWith('1');
      expect(mockLazyLoadingDataSource.getTreeItems).toHaveBeenCalledWith({ parentId: '1' });
    });
  });

  describe('refreshAll', () => {
    it('should refresh all data', async () => {
      mockLazyLoadingDataSource.getTreeItems.mockResolvedValue([]);

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      await act(async () => {
        await result.current.refreshAll();
      });

      expect(mockLazyLoadingDataSource.clearCache).toHaveBeenCalled();
      expect(mockLazyLoadingDataSource.getTreeItems).toHaveBeenCalledWith({});
    });
  });

  describe('State Synchronization', () => {
    it('should poll for state updates', () => {
      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockLazyLoadingDataSource.getLazyLoadingState).toHaveBeenCalled();
    });

    it('should update state when polling detects changes', () => {
      const initialState = {
        loadingItems: new Set(),
        loadedItems: new Map(),
        loadTimestamps: new Map(),
        errorItems: new Map(),
        cacheSize: 0,
      };

      mockLazyLoadingDataSource.getLazyLoadingState
        .mockReturnValueOnce(initialState)
        .mockReturnValueOnce({
          ...initialState,
          cacheSize: 5,
        });

      const { result } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      expect(result.current.lazyLoadingState.cacheSize).toBe(0);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.lazyLoadingState.cacheSize).toBe(5);
    });

    it('should cleanup polling interval on unmount', () => {
      const { unmount } = renderHook(() => useLazyLoading(mockDataSource, mockConfig));

      const callCount = mockLazyLoadingDataSource.getLazyLoadingState.mock.calls.length;

      unmount();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not have called getLazyLoadingState after unmount
      expect(mockLazyLoadingDataSource.getLazyLoadingState.mock.calls.length).toBe(callCount);
    });
  });

  describe('Recreation on Config Change', () => {
    it('should recreate data source when config changes', () => {
      const { rerender } = renderHook(
        ({ config }) => useLazyLoading(mockDataSource, config),
        { initialProps: { config: mockConfig } }
      );

      const newConfig = { ...mockConfig, maxCacheSize: 200 };
      rerender({ config: newConfig });

      expect(LazyLoadingDataSource).toHaveBeenCalledTimes(2);
      expect(LazyLoadingDataSource).toHaveBeenLastCalledWith(mockDataSource, newConfig);
    });
  });
});
