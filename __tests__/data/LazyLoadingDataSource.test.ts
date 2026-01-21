/**
 * @fileoverview Unit Tests for LazyLoadingDataSource Class
 *
 * Comprehensive test suite for lazy loading data source wrapper.
 *
 * Constructor:
 *   - should initialize with provided data source and config
 *   - should apply default configuration values
 *   - should merge user config with defaults
 *   - should initialize empty state structures
 *
 * getTreeItems - Basic Functionality:
 *   - should delegate to original data source when lazy loading is disabled
 *   - should load items from original data source on first call
 *   - should return enhanced items with lazy loading metadata
 *   - should handle root level requests (empty parentId)
 *   - should handle undefined params gracefully
 *
 * getTreeItems - Caching:
 *   - should return cached items when data is fresh
 *   - should reload items when cache is stale
 *   - should not reload items within staleTime window
 *   - should update cache when loading new items
 *
 * getTreeItems - Error Handling:
 *   - should handle errors from original data source
 *   - should return error state items on failure
 *   - should track errors in errorItems map
 *   - should clear loading state on error
 *
 * getChildrenCount:
 *   - should delegate to original data source when lazy loading is disabled
 *   - should return cached count when items are cached
 *   - should delegate to original data source when not cached
 *
 * Cache Management:
 *   - should clear all cache entries
 *   - should clear cache for specific parent
 *   - should maintain accurate cache size after clearing
 *
 * LRU Cache Eviction:
 *   - should evict oldest entries when cache exceeds maxCacheSize
 *   - should maintain cache size within limits
 *   - should clean up all associated state during eviction
 *   - should not evict when cache is within limits
 *
 * State Queries:
 *   - should track loading state correctly
 *   - should track loaded state correctly
 *   - should track error state correctly
 *   - should return current lazy loading state
 *
 * Preloading:
 *   - should preload children when enabled
 *   - should not preload when disabled
 *   - should not preload if already loaded
 *   - should not preload if currently loading
 *
 * Cache Statistics:
 *   - should return accurate cache statistics
 *   - should reflect current cache size
 *   - should return configured max cache size
 *
 * Item Enhancement:
 *   - should enhance items with loading state metadata
 *   - should enhance items with loaded state metadata
 *   - should enhance items with error state metadata
 *   - should enhance items with loadable children flag
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import { LazyLoadingDataSource, LazyLoadingConfig } from '../../src/data/LazyLoadingDataSource';
import { DataSource, TreeViewItem } from '../../src/components/HandyTreeView/types';

describe('LazyLoadingDataSource', () => {
  const mockItems = [
    { id: '1', label: 'Item 1', hasChildren: true },
    { id: '2', label: 'Item 2', hasChildren: false },
  ];

  const mockChildren = [
    { id: '1-1', label: 'Child 1-1' },
    { id: '1-2', label: 'Child 1-2' },
  ];

  let mockGetTreeItems;
  let mockGetChildrenCount;
  let mockDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();

    mockGetTreeItems = jest.fn();
    mockGetChildrenCount = jest.fn();

    mockDataSource = {
      getTreeItems: mockGetTreeItems,
      getChildrenCount: mockGetChildrenCount,
    };
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize with provided data source and config', () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      expect(dataSource).toBeInstanceOf(LazyLoadingDataSource);
      expect(dataSource.getLazyLoadingState().cacheSize).toBe(0);
      expect(dataSource.getLazyLoadingState().loadingItems.size).toBe(0);
    });

    it('should apply default configuration values', () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const stats = dataSource.getCacheStats();
      expect(stats.maxSize).toBe(1000); // Default maxCacheSize
    });

    it('should merge user config with defaults', () => {
      const config = {
        enabled: true,
        maxCacheSize: 500,
        staleTime: 60000,
      };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const stats = dataSource.getCacheStats();
      expect(stats.maxSize).toBe(500); // User-provided value
    });

    it('should initialize empty state structures', () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const state = dataSource.getLazyLoadingState();
      expect(state.loadingItems.size).toBe(0);
      expect(state.loadedItems.size).toBe(0);
      expect(state.loadTimestamps.size).toBe(0);
      expect(state.errorItems.size).toBe(0);
      expect(state.cacheSize).toBe(0);
    });
  });

  describe('getTreeItems - Basic Functionality', () => {
    it('should delegate to original data source when lazy loading is disabled', async () => {
      const config = { enabled: false };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(mockGetTreeItems).toHaveBeenCalledWith({ parentId: '1' });
      expect(result).toEqual(mockItems);
      expect(dataSource.getLazyLoadingState().loadedItems.size).toBe(0); // No caching
    });

    it('should load items from original data source on first call', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(mockGetTreeItems).toHaveBeenCalledWith({ parentId: '1' });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });

    it('should return enhanced items with lazy loading metadata', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(result[0]).toHaveProperty('isLoading');
      expect(result[0]).toHaveProperty('isLoaded');
      expect(result[0]).toHaveProperty('hasError');
      expect(result[0]).toHaveProperty('hasLoadableChildren');
    });

    it('should handle root level requests (empty parentId)', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems({ parentId: '' });

      expect(mockGetTreeItems).toHaveBeenCalledWith({ parentId: '' });
      expect(result).toHaveLength(2);
    });

    it('should handle undefined params gracefully', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems();

      expect(mockGetTreeItems).toHaveBeenCalledWith({ parentId: '' });
      expect(result).toHaveLength(2);
    });
  });

  describe('getTreeItems - Caching', () => {
    it('should return cached items when data is fresh', async () => {
      const config = { enabled: true, staleTime: 5000 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      // First call - loads from source
      const result1 = await dataSource.getTreeItems({ parentId: '1' });
      expect(mockGetTreeItems).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await dataSource.getTreeItems({ parentId: '1' });
      expect(mockGetTreeItems).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(result2).toEqual(result1);
    });

    it('should reload items when cache is stale', async () => {
      const config = { enabled: true, staleTime: 1000 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      // First call
      await dataSource.getTreeItems({ parentId: '1' });
      expect(mockGetTreeItems).toHaveBeenCalledTimes(1);

      // Advance time past staleTime
      jest.advanceTimersByTime(2000);

      // Second call - should reload
      await dataSource.getTreeItems({ parentId: '1' });
      expect(mockGetTreeItems).toHaveBeenCalledTimes(2);
    });

    it('should not reload items within staleTime window', async () => {
      const config = { enabled: true, staleTime: 5000 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });
      jest.advanceTimersByTime(3000); // Within staleTime
      await dataSource.getTreeItems({ parentId: '1' });

      expect(mockGetTreeItems).toHaveBeenCalledTimes(1);
    });

    it('should update cache when loading new items', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });

      const state = dataSource.getLazyLoadingState();
      expect(state.loadedItems.has('1')).toBe(true);
      expect(state.cacheSize).toBe(2); // 2 items cached
    });
  });

  describe('getTreeItems - Error Handling', () => {
    it('should handle errors from original data source', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const error = new Error('Failed to load');
      mockGetTreeItems.mockRejectedValue(error);

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(result).toHaveLength(1);
      expect(result[0].hasError).toBe(true);
      expect(result[0].errorMessage).toBe('Failed to load');
    });

    it('should return error state items on failure', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockRejectedValue(new Error('Network error'));

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(result[0].id).toContain('__error__');
      expect(result[0].label).toContain('Error loading items');
      expect(result[0].isPlaceholder).toBe(true);
    });

    it('should track errors in errorItems map', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const error = new Error('Test error');
      mockGetTreeItems.mockRejectedValue(error);

      await dataSource.getTreeItems({ parentId: '1' });

      expect(dataSource.hasError('1')).toBe(true);
      const state = dataSource.getLazyLoadingState();
      expect(state.errorItems.has('1')).toBe(true);
    });

    it('should clear loading state on error', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockRejectedValue(new Error('Error'));

      await dataSource.getTreeItems({ parentId: '1' });

      expect(dataSource.isLoading('1')).toBe(false);
      const state = dataSource.getLazyLoadingState();
      expect(state.loadingItems.has('1')).toBe(false);
    });
  });

  describe('getChildrenCount', () => {
    it('should delegate to original data source when lazy loading is disabled', () => {
      const config = { enabled: false };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const item = { id: '1', label: 'Item 1' };
      mockGetChildrenCount.mockReturnValue(5);

      const count = dataSource.getChildrenCount(item);

      expect(mockGetChildrenCount).toHaveBeenCalledWith(item);
      expect(count).toBe(5);
    });

    it('should return cached count when items are cached', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const item = { id: '1', label: 'Item 1' };
      mockGetTreeItems.mockResolvedValue(mockChildren);
      mockGetChildrenCount.mockReturnValue(10); // Different from cached count

      // Load items first to populate cache
      await dataSource.getTreeItems({ parentId: '1' });

      // getChildrenCount should use cached count
      const count = dataSource.getChildrenCount(item);

      expect(count).toBe(2); // From cache, not from mockGetChildrenCount
      expect(mockGetChildrenCount).not.toHaveBeenCalled();
    });

    it('should delegate to original data source when not cached', () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const item = { id: '1', label: 'Item 1' };
      mockGetChildrenCount.mockReturnValue(3);

      const count = dataSource.getChildrenCount(item);

      expect(mockGetChildrenCount).toHaveBeenCalledWith(item);
      expect(count).toBe(3);
    });
  });

  describe('Cache Management', () => {
    it('should clear all cache entries', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });
      await dataSource.getTreeItems({ parentId: '2' });

      expect(dataSource.getLazyLoadingState().cacheSize).toBeGreaterThan(0);

      dataSource.clearCache();

      const state = dataSource.getLazyLoadingState();
      expect(state.loadedItems.size).toBe(0);
      expect(state.loadTimestamps.size).toBe(0);
      expect(state.errorItems.size).toBe(0);
      expect(state.cacheSize).toBe(0);
    });

    it('should clear cache for specific parent', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });
      await dataSource.getTreeItems({ parentId: '2' });

      const beforeState = dataSource.getLazyLoadingState();
      const beforeSize = beforeState.cacheSize;

      dataSource.clearCacheForParent('1');

      const afterState = dataSource.getLazyLoadingState();
      expect(afterState.loadedItems.has('1')).toBe(false);
      expect(afterState.loadedItems.has('2')).toBe(true); // '2' should still be cached
      expect(afterState.cacheSize).toBeLessThan(beforeSize);
    });

    it('should maintain accurate cache size after clearing', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });
      const sizeBefore = dataSource.getLazyLoadingState().cacheSize;

      dataSource.clearCacheForParent('1');

      const sizeAfter = dataSource.getLazyLoadingState().cacheSize;
      expect(sizeAfter).toBe(sizeBefore - 2); // Removed 2 items
    });
  });

  describe('LRU Cache Eviction', () => {
    it('should evict oldest entries when cache exceeds maxCacheSize', async () => {
      const config = { enabled: true, maxCacheSize: 3 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      // Create items that will exceed cache size
      mockGetTreeItems
        .mockResolvedValueOnce([{ id: '1-1', label: 'Item 1-1' }]) // 1 item
        .mockResolvedValueOnce([{ id: '2-1', label: 'Item 2-1' }]) // 1 item
        .mockResolvedValueOnce([{ id: '3-1', label: 'Item 3-1' }]) // 1 item
        .mockResolvedValueOnce([{ id: '4-1', label: 'Item 4-1' }]); // 1 item

      // Load items with delays to create different timestamps
      await dataSource.getTreeItems({ parentId: '1' });
      jest.advanceTimersByTime(100);
      await dataSource.getTreeItems({ parentId: '2' });
      jest.advanceTimersByTime(100);
      await dataSource.getTreeItems({ parentId: '3' });
      jest.advanceTimersByTime(100);
      await dataSource.getTreeItems({ parentId: '4' }); // This should trigger eviction

      const state = dataSource.getLazyLoadingState();
      // Cache should be within limits (oldest entry '1' should be evicted)
      expect(state.cacheSize).toBeLessThanOrEqual(3);
      expect(state.loadedItems.has('1')).toBe(false); // Oldest should be evicted
    });

    it('should maintain cache size within limits', async () => {
      const config = { enabled: true, maxCacheSize: 5 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems); // 2 items each

      // Load multiple parents to exceed cache size
      for (let i = 1; i <= 5; i++) {
        await dataSource.getTreeItems({ parentId: String(i) });
        jest.advanceTimersByTime(100);
      }

      const state = dataSource.getLazyLoadingState();
      expect(state.cacheSize).toBeLessThanOrEqual(5);
    });

    it('should clean up all associated state during eviction', async () => {
      const config = { enabled: true, maxCacheSize: 2 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems
        .mockResolvedValueOnce([{ id: '1-1', label: 'Item 1-1' }])
        .mockResolvedValueOnce([{ id: '2-1', label: 'Item 2-1' }])
        .mockResolvedValueOnce([{ id: '3-1', label: 'Item 3-1' }]);

      await dataSource.getTreeItems({ parentId: '1' });
      jest.advanceTimersByTime(100);
      await dataSource.getTreeItems({ parentId: '2' });
      jest.advanceTimersByTime(100);
      await dataSource.getTreeItems({ parentId: '3' }); // Triggers eviction of '1'

      const state = dataSource.getLazyLoadingState();
      expect(state.loadedItems.has('1')).toBe(false);
      expect(state.loadTimestamps.has('1')).toBe(false);
      expect(state.errorItems.has('1')).toBe(false);
    });

    it('should not evict when cache is within limits', async () => {
      const config = { enabled: true, maxCacheSize: 100 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });
      await dataSource.getTreeItems({ parentId: '2' });

      const state = dataSource.getLazyLoadingState();
      expect(state.loadedItems.has('1')).toBe(true);
      expect(state.loadedItems.has('2')).toBe(true);
      expect(state.cacheSize).toBe(4); // 2 items * 2 parents
    });
  });

  describe('State Queries', () => {
    it('should track loading state correctly', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      let resolvePromise: (value: TreeViewItem[]) => void;
      const promise = new Promise<TreeViewItem[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetTreeItems.mockReturnValue(promise);

      const loadingPromise = dataSource.getTreeItems({ parentId: '1' });

      // While loading
      expect(dataSource.isLoading('1')).toBe(true);

      resolvePromise!(mockItems);
      await loadingPromise;

      // After loading
      expect(dataSource.isLoading('1')).toBe(false);
    });

    it('should track loaded state correctly', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      expect(dataSource.isLoaded('1')).toBe(false);

      await dataSource.getTreeItems({ parentId: '1' });

      expect(dataSource.isLoaded('1')).toBe(true);
    });

    it('should track error state correctly', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockRejectedValue(new Error('Test error'));

      expect(dataSource.hasError('1')).toBe(false);

      await dataSource.getTreeItems({ parentId: '1' });

      expect(dataSource.hasError('1')).toBe(true);
    });

    it('should return current lazy loading state', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });

      const state = dataSource.getLazyLoadingState();
      expect(state).toHaveProperty('loadingItems');
      expect(state).toHaveProperty('loadedItems');
      expect(state).toHaveProperty('loadTimestamps');
      expect(state).toHaveProperty('errorItems');
      expect(state).toHaveProperty('cacheSize');
      expect(state.loadedItems.has('1')).toBe(true);
    });
  });

  describe('Preloading', () => {
    it('should preload children when enabled', async () => {
      const config = { enabled: true, preloadChildren: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.preloadChildren('1');

      expect(mockGetTreeItems).toHaveBeenCalledWith({ parentId: '1' });
      expect(dataSource.isLoaded('1')).toBe(true);
    });

    it('should not preload when disabled', async () => {
      const config = { enabled: true, preloadChildren: false };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      await dataSource.preloadChildren('1');

      expect(mockGetTreeItems).not.toHaveBeenCalled();
    });

    it('should not preload if already loaded', async () => {
      const config = { enabled: true, preloadChildren: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      // Load first
      await dataSource.getTreeItems({ parentId: '1' });
      const callCount = mockGetTreeItems.mock.calls.length;

      // Try to preload
      await dataSource.preloadChildren('1');

      expect(mockGetTreeItems).toHaveBeenCalledTimes(callCount); // No additional calls
    });

    it('should not preload if currently loading', async () => {
      const config = { enabled: true, preloadChildren: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      let resolvePromise: (value: TreeViewItem[]) => void;
      const promise = new Promise<TreeViewItem[]>((resolve) => {
        resolvePromise = resolve;
      });
      mockGetTreeItems.mockReturnValue(promise);

      // Start loading
      const loadingPromise = dataSource.getTreeItems({ parentId: '1' });

      // Try to preload while loading
      await dataSource.preloadChildren('1');

      const callCount = mockGetTreeItems.mock.calls.length;
      resolvePromise!(mockItems);
      await loadingPromise;

      expect(mockGetTreeItems).toHaveBeenCalledTimes(callCount); // No additional preload call
    });
  });

  describe('Cache Statistics', () => {
    it('should return accurate cache statistics', async () => {
      const config = { enabled: true, maxCacheSize: 500 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      await dataSource.getTreeItems({ parentId: '1' });

      const stats = dataSource.getCacheStats();
      expect(stats.size).toBe(2); // 2 items cached
      expect(stats.maxSize).toBe(500);
      expect(stats.hitRate).toBe(0); // TODO: Implement hit rate tracking
    });

    it('should reflect current cache size', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      expect(dataSource.getCacheStats().size).toBe(0);

      await dataSource.getTreeItems({ parentId: '1' });

      expect(dataSource.getCacheStats().size).toBe(2);
    });

    it('should return configured max cache size', () => {
      const config = { enabled: true, maxCacheSize: 200 };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const stats = dataSource.getCacheStats();
      expect(stats.maxSize).toBe(200);
    });
  });

  describe('Item Enhancement', () => {
    it('should enhance items with loading state metadata', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const itemsWithChildren: TreeViewItem[] = [
        { id: '1', label: 'Parent', hasChildren: true },
      ];
      mockGetTreeItems.mockResolvedValue(itemsWithChildren);

      const result = await dataSource.getTreeItems({ parentId: 'root' });

      expect(result[0]).toHaveProperty('isLoading');
      expect(typeof result[0].isLoading).toBe('boolean');
    });

    it('should enhance items with loaded state metadata', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockResolvedValue(mockItems);

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(result[0]).toHaveProperty('isLoaded');
      expect(typeof result[0].isLoaded).toBe('boolean');
    });

    it('should enhance items with error state metadata', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      mockGetTreeItems.mockRejectedValue(new Error('Test error'));

      const result = await dataSource.getTreeItems({ parentId: '1' });

      expect(result[0]).toHaveProperty('hasError');
      expect(result[0].hasError).toBe(true);
      expect(result[0]).toHaveProperty('errorMessage');
    });

    it('should enhance items with loadable children flag', async () => {
      const config = { enabled: true };
      const dataSource = new LazyLoadingDataSource(mockDataSource, config);

      const itemsWithChildren: TreeViewItem[] = [
        { id: '1', label: 'Parent', hasChildren: true },
      ];
      mockGetTreeItems.mockResolvedValue(itemsWithChildren);

      const result = await dataSource.getTreeItems({ parentId: 'root' });

      expect(result[0]).toHaveProperty('hasLoadableChildren');
      expect(typeof result[0].hasLoadableChildren).toBe('boolean');
    });
  });
});
