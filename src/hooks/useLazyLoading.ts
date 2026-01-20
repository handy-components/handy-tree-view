/**
 * @fileoverview useLazyLoading – Custom React hook for lazy loading state management
 *
 * This custom hook provides comprehensive lazy loading state management for tree view
 * components. It wraps a standard DataSource with lazy loading capabilities, enabling
 * efficient data loading, caching, and state tracking for large hierarchical datasets.
 *
 * KEY FEATURES:
 * =============
 * 🔄 **State Management**: Tracks loading, loaded, and error states for tree items
 * 📦 **Cache Control**: Provides methods to clear cache globally or for specific parents
 * ⚡ **Performance**: Optimizes re-renders through memoized callbacks and state diffing
 * 🔄 **Real-time Sync**: Polls the underlying data source for state changes
 * 🛠️ **Refresh Operations**: Supports refreshing data at parent or global level
 * 📊 **Statistics**: Provides cache statistics for monitoring and debugging
 *
 * USAGE:
 * ======
 * ```typescript
 * const {
 *   lazyLoadingDataSource,
 *   isLoading,
 *   isItemLoading,
 *   clearCache,
 *   refreshParent
 * } = useLazyLoading(dataSource, {
 *   enabled: true,
 *   staleTime: 5000,
 *   maxCacheSize: 100
 * });
 * ```
 *
 * @author Scott Davis
 * @version 1.0.0 – 2025-01-27
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { LazyLoadingDataSource, LazyLoadingConfig, LazyLoadingState } from '../data/LazyLoadingDataSource';
import { DataSource } from '../types';

// ===================================================================
// LAZY LOADING HOOK INTERFACE
// ===================================================================

/**
 * Return value interface for the useLazyLoading hook
 *
 * This interface defines all the properties and methods returned by the useLazyLoading
 * hook, providing a comprehensive API for managing lazy loading state and operations.
 *
 * @interface UseLazyLoadingReturn
 * @author Scott Davis
 * @since 1.0.0
 */
export interface UseLazyLoadingReturn {
  /** 
   * The wrapped data source with lazy loading capabilities
   * This is the enhanced data source that should be used by tree components
   */
  lazyLoadingDataSource: LazyLoadingDataSource;
  
  /** 
   * Current lazy loading state containing loading, loaded, and error information
   * This state is automatically synchronized with the underlying data source
   */
  lazyLoadingState: LazyLoadingState;
  
  /** 
   * Boolean flag indicating whether any items are currently loading
   * Useful for showing global loading indicators
   */
  isLoading: boolean;
  
  /** 
   * Function to check if a specific item is currently loading
   * @param itemId - The unique identifier of the item to check
   * @returns True if the item is currently loading, false otherwise
   */
  isItemLoading: (itemId: string) => boolean;
  
  /** 
   * Function to check if a specific item has been successfully loaded
   * @param itemId - The unique identifier of the item to check
   * @returns True if the item has been loaded, false otherwise
   */
  isItemLoaded: (itemId: string) => boolean;
  
  /** 
   * Function to check if a specific item has encountered an error during loading
   * @param itemId - The unique identifier of the item to check
   * @returns True if the item has an error, false otherwise
   */
  hasItemError: (itemId: string) => boolean;
  
  /** 
   * Function to clear all cached data and reset the lazy loading state
   * Use this to force a complete refresh of all data
   */
  clearCache: () => void;
  
  /** 
   * Function to clear cached data for a specific parent item
   * @param parentId - The unique identifier of the parent whose cache should be cleared
   */
  clearCacheForParent: (parentId: string) => void;
  
  /** 
   * Function to preload children for a parent item in the background
   * @param parentId - The unique identifier of the parent whose children should be preloaded
   * @returns Promise that resolves when preloading is complete
   */
  preloadChildren: (parentId: string) => Promise<void>;
  
  /** 
   * Function to get current cache statistics for monitoring and debugging
   * @returns Object containing cache size, max size, and hit rate information
   */
  getCacheStats: () => { size: number; maxSize: number; hitRate: number };
  
  /** 
   * Function to refresh data for a specific parent by clearing its cache and reloading
   * @param parentId - The unique identifier of the parent to refresh
   * @returns Promise that resolves when refresh is complete
   */
  refreshParent: (parentId: string) => Promise<void>;
  
  /** 
   * Function to refresh all data by clearing the entire cache and reloading from root
   * @returns Promise that resolves when global refresh is complete
   */
  refreshAll: () => Promise<void>;
}

// ===================================================================
// LAZY LOADING HOOK
// ===================================================================

/**
 * useLazyLoading – Custom React hook for comprehensive lazy loading state management
 *
 * This hook wraps a standard DataSource with lazy loading capabilities, providing
 * sophisticated state management, caching, and real-time synchronization for tree
 * view components. It handles loading states, error tracking, cache management,
 * and provides optimized methods for data refresh and preloading operations.
 *
 * The hook creates a LazyLoadingDataSource wrapper around the original data source
 * and maintains local state that stays synchronized with the wrapper's internal state
 * through periodic polling. This ensures UI components always have access to the
 * most current loading and error information.
 *
 * PERFORMANCE CONSIDERATIONS:
 * ==========================
 * - Uses memoized callbacks to prevent unnecessary re-renders
 * - Implements state diffing to avoid redundant state updates
 * - Polls at 300ms intervals to balance responsiveness with performance
 * - Provides stable references for callback functions
 *
 * ERROR HANDLING:
 * ==============
 * - Gracefully handles missing or null data source instances
 * - Provides default values when operations cannot be performed
 * - Tracks error states for individual items and operations
 *
 * @function useLazyLoading
 * @param {DataSource} originalDataSource - The original data source to wrap with lazy loading
 * @param {LazyLoadingConfig} config - Configuration object controlling lazy loading behavior
 * @returns {UseLazyLoadingReturn} Comprehensive object with wrapped data source and management functions
 * 
 * @example
 * ```typescript
 * // Basic usage with file system data source
 * const { lazyLoadingDataSource, isLoading, clearCache } = useLazyLoading(
 *   fileSystemDataSource,
 *   { enabled: true, staleTime: 5000, maxCacheSize: 100 }
 * );
 *
 * // Using loading state in components
 * if (isLoading) {
 *   return <LoadingSpinner />;
 * }
 *
 * // Checking individual item loading state
 * const itemLoading = isItemLoading('folder-123');
 * ```
 *
 * @author Scott Davis
 * @since 1.0.0
 * @version 1.0.0
 */
export function useLazyLoading(
  originalDataSource: DataSource,
  config: LazyLoadingConfig
): UseLazyLoadingReturn {
  console.log('[useLazyLoading] HOOK CALLED', {
    hasDataSource: !!originalDataSource && Object.keys(originalDataSource).length > 0,
    configEnabled: config?.enabled,
    configKeys: config ? Object.keys(config) : []
  });

  // ===================================================================
  // LAZY LOADING DATA SOURCE INITIALIZATION
  // ===================================================================
  
  /**
   * Ref to store the LazyLoadingDataSource instance
   * Using ref ensures the instance persists across re-renders while allowing updates
   */
  const lazyLoadingDataSourceRef = useRef<LazyLoadingDataSource | undefined>(undefined);
  
  // Initialize the LazyLoadingDataSource wrapper on first render
  if (!lazyLoadingDataSourceRef.current) {
    console.log('[useLazyLoading] Creating new LazyLoadingDataSource');
    lazyLoadingDataSourceRef.current = new LazyLoadingDataSource(originalDataSource, config);
  }

  /**
   * Effect to recreate the LazyLoadingDataSource when dependencies change
   * This ensures the wrapper always uses the latest data source and configuration
   */
  useEffect(() => {
    console.log('[useLazyLoading] useEffect recreate data source', {
      hasRef: !!lazyLoadingDataSourceRef.current,
      configEnabled: config?.enabled
    });
    if (lazyLoadingDataSourceRef.current) {
      // Recreate the wrapper with the updated data source and configuration
      console.log('[useLazyLoading] Recreating LazyLoadingDataSource');
      lazyLoadingDataSourceRef.current = new LazyLoadingDataSource(originalDataSource, config);
    }
  }, [originalDataSource, config]);

  // ===================================================================
  // STATE MANAGEMENT AND SYNCHRONIZATION
  // ===================================================================
  
  /**
   * Local state to track lazy loading status
   * This mirrors the LazyLoadingDataSource's internal state for efficient React integration
   */
  const [lazyLoadingState, setLazyLoadingState] = useState<LazyLoadingState>({
    loadingItems: new Set(),     // Items currently being loaded
    loadedItems: new Map(),      // Successfully loaded items with their children
    loadTimestamps: new Map(),   // Load timestamps for cache invalidation
    errorItems: new Map(),       // Items that failed to load with error details
    cacheSize: 0                 // Current number of cached items
  });

  /**
   * Effect to synchronize local state with the LazyLoadingDataSource
   * Uses polling to ensure the UI stays in sync with async loading operations
   */
  useEffect(() => {
    /**
     * Updates local state from the LazyLoadingDataSource
     * Implements state diffing to prevent unnecessary re-renders
     */
    const updateState = () => {
      // Guard against uninitialized data source
      if (!lazyLoadingDataSourceRef.current) return;

      const newState = lazyLoadingDataSourceRef.current.getLazyLoadingState();

      // Performance optimization: only update state if something actually changed
      // This prevents cascading re-renders when the underlying state is stable
      setLazyLoadingState((prevState) => {
        const stateUnchanged =
          prevState.cacheSize === newState.cacheSize &&
          prevState.loadingItems.size === newState.loadingItems.size &&
          prevState.loadedItems.size === newState.loadedItems.size &&
          prevState.errorItems.size === newState.errorItems.size;

        return stateUnchanged ? prevState : newState;
      });
    };

    // Perform initial synchronization immediately
    updateState();

    /**
     * Set up polling interval for real-time state updates
     * 300ms interval balances responsiveness with performance
     * Shorter intervals would cause unnecessary renders, longer would feel sluggish
     */
    console.log('[useLazyLoading] Setting up polling interval');
    const interval = setInterval(() => {
      console.log('[useLazyLoading] Polling updateState');
      updateState();
    }, 300);

    // Cleanup: clear interval when component unmounts or dependencies change
    return () => {
      console.log('[useLazyLoading] Cleaning up polling interval');
      clearInterval(interval);
    };
  }, []); // Empty dependency array since we only want this effect to run once

  // ===================================================================
  // LAZY LOADING METHODS
  // ===================================================================

  // ===================================================================
  // STATE QUERY METHODS
  // ===================================================================
  
  /**
   * Global loading state indicator
   * Returns true if any items are currently being loaded from the data source
   * Useful for showing global loading spinners or disabling UI interactions
   */
  const isLoading = lazyLoadingState.loadingItems.size > 0;

  /**
   * Memoized function to check if a specific item is currently loading
   * Uses useCallback to prevent unnecessary re-renders of components that depend on this function
   * 
   * @param itemId - Unique identifier of the item to check
   * @returns True if the item is currently loading, false otherwise
   */
  const isItemLoading = useCallback((itemId: string): boolean => {
    return lazyLoadingState.loadingItems.has(itemId);
  }, [lazyLoadingState.loadingItems]);

  /**
   * Memoized function to check if a specific item has been successfully loaded
   * Useful for determining whether to show cached data or trigger a new load
   * 
   * @param itemId - Unique identifier of the item to check
   * @returns True if the item has been loaded and cached, false otherwise
   */
  const isItemLoaded = useCallback((itemId: string): boolean => {
    return lazyLoadingState.loadedItems.has(itemId);
  }, [lazyLoadingState.loadedItems]);

  /**
   * Memoized function to check if a specific item has encountered a loading error
   * Enables conditional rendering of error states or retry mechanisms
   * 
   * @param itemId - Unique identifier of the item to check
   * @returns True if the item has an error, false otherwise
   */
  const hasItemError = useCallback((itemId: string): boolean => {
    return lazyLoadingState.errorItems.has(itemId);
  }, [lazyLoadingState.errorItems]);

  // ===================================================================
  // CACHE MANAGEMENT METHODS
  // ===================================================================
  
  /**
   * Clears all cached data and resets the lazy loading state
   * This forces a complete refresh of all data on the next access
   * Use this when you need to ensure fresh data from the data source
   */
  const clearCache = useCallback((): void => {
    if (lazyLoadingDataSourceRef.current) {
      // Clear all cached items in the data source
      lazyLoadingDataSourceRef.current.clearCache();
      // Immediately update local state to reflect the cleared cache
      setLazyLoadingState(lazyLoadingDataSourceRef.current.getLazyLoadingState());
    }
  }, []);

  /**
   * Clears cached data for a specific parent item and its children
   * This allows selective cache invalidation without affecting other cached data
   * 
   * @param parentId - Unique identifier of the parent whose cache should be cleared
   */
  const clearCacheForParent = useCallback((parentId: string): void => {
    if (lazyLoadingDataSourceRef.current) {
      // Clear cache only for the specified parent
      lazyLoadingDataSourceRef.current.clearCacheForParent(parentId);
      // Update local state to reflect the partial cache clear
      setLazyLoadingState(lazyLoadingDataSourceRef.current.getLazyLoadingState());
    }
  }, []);

  // ===================================================================
  // PRELOADING AND OPTIMIZATION METHODS
  // ===================================================================
  
  /**
   * Preloads children for a parent item in the background
   * This can improve perceived performance by loading data before it's needed
   * The operation is async and won't block the UI
   * 
   * @param parentId - Unique identifier of the parent whose children should be preloaded
   * @returns Promise that resolves when preloading is complete or fails silently
   */
  const preloadChildren = useCallback(async (parentId: string): Promise<void> => {
    if (lazyLoadingDataSourceRef.current) {
      // Initiate background preloading
      await lazyLoadingDataSourceRef.current.preloadChildren(parentId);
      // Update state to reflect any newly loaded data
      setLazyLoadingState(lazyLoadingDataSourceRef.current.getLazyLoadingState());
    }
  }, []);

  /**
   * Retrieves current cache statistics for monitoring and debugging
   * Provides insights into cache utilization and hit rates
   * 
   * @returns Object containing cache size, maximum size, and hit rate metrics
   */
  const getCacheStats = useCallback((): { size: number; maxSize: number; hitRate: number } => {
    if (lazyLoadingDataSourceRef.current) {
      return lazyLoadingDataSourceRef.current.getCacheStats();
    }
    // Return safe defaults when data source is not available
    return { size: 0, maxSize: 0, hitRate: 0 };
  }, []);

  // ===================================================================
  // DATA REFRESH METHODS
  // ===================================================================
  
  /**
   * Refreshes data for a specific parent by clearing its cache and reloading
   * This provides a way to get fresh data for a specific part of the tree
   * without affecting other cached data
   * 
   * @param parentId - Unique identifier of the parent to refresh
   * @returns Promise that resolves when the refresh operation is complete
   */
  const refreshParent = useCallback(async (parentId: string): Promise<void> => {
    if (lazyLoadingDataSourceRef.current) {
      // Step 1: Clear cache for this specific parent to ensure fresh data
      lazyLoadingDataSourceRef.current.clearCacheForParent(parentId);
      
      // Step 2: Trigger a fresh load of the parent's data from the source
      await lazyLoadingDataSourceRef.current.getTreeItems({ parentId });
      
      // Step 3: Update local state to reflect the newly loaded data
      setLazyLoadingState(lazyLoadingDataSourceRef.current.getLazyLoadingState());
    }
  }, []);

  /**
   * Refreshes all data by clearing the entire cache and reloading from the root
   * This is useful for global refresh operations or when the underlying data
   * structure may have changed significantly
   * 
   * @returns Promise that resolves when the complete refresh operation is finished
   */
  const refreshAll = useCallback(async (): Promise<void> => {
    if (lazyLoadingDataSourceRef.current) {
      // Step 1: Clear the entire cache to ensure all data is fresh
      lazyLoadingDataSourceRef.current.clearCache();
      
      // Step 2: Reload the root level data to start fresh
      await lazyLoadingDataSourceRef.current.getTreeItems({});
      
      // Step 3: Update local state to reflect the completely refreshed data
      setLazyLoadingState(lazyLoadingDataSourceRef.current.getLazyLoadingState());
    }
  }, []);

  // ===================================================================
  // RETURN VALUE CONSTRUCTION
  // ===================================================================

  /**
   * Return the complete API for lazy loading management
   * All functions are memoized to prevent unnecessary re-renders in consuming components
   * The lazyLoadingDataSource is the enhanced wrapper that should be used by tree components
   */
  return {
    // Core data source and state
    lazyLoadingDataSource: lazyLoadingDataSourceRef.current!, // Non-null assertion safe due to initialization above
    lazyLoadingState,                                          // Real-time synchronized state
    
    // State query functions (memoized for performance)
    isLoading,              // Global loading indicator
    isItemLoading,          // Per-item loading check
    isItemLoaded,           // Per-item loaded check  
    hasItemError,           // Per-item error check
    
    // Cache management functions (memoized for performance)
    clearCache,             // Clear all cached data
    clearCacheForParent,    // Clear cache for specific parent
    
    // Performance optimization functions (memoized for performance)
    preloadChildren,        // Background preloading
    getCacheStats,          // Cache monitoring
    
    // Data refresh functions (memoized for performance)
    refreshParent,          // Refresh specific parent
    refreshAll             // Global refresh
  };
}
