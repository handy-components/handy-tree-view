/**
 * @fileoverview LazyLoadingDataSource – Generic lazy loading wrapper for data sources
 *
 * This module provides a generic lazy loading wrapper that can be applied to any
 * data source implementing the DataSource interface. It adds intelligent caching,
 * loading state management, and performance optimizations while maintaining full
 * compatibility with existing tree view implementations.
 *
 * KEY FEATURES:
 * =============
 * 🔄 Intelligent Caching:
 *    - LRU-based cache eviction with configurable size limits
 *    - Stale data detection with time-based invalidation
 *    - Memory-efficient storage with automatic cleanup
 *
 * ⚡ Performance Optimizations:
 *    - Prevents redundant API calls through smart caching
 *    - Optional preloading for anticipated user interactions
 *    - Configurable cache parameters for different use cases
 *
 * 🎯 State Management:
 *    - Loading states for visual feedback (spinners, skeletons)
 *    - Error tracking and recovery mechanisms
 *    - Metadata enhancement for tree items
 *
 * 🔧 Developer Experience:
 *    - Zero-configuration defaults with full customization
 *    - Comprehensive state inspection and debugging tools
 *    - Type-safe interfaces with full TypeScript support
 *
 * USAGE EXAMPLES:
 * ==============
 * ```typescript
 * // Basic usage with default configuration
 * const lazyDataSource = new LazyLoadingDataSource(originalDataSource, {
 *   enabled: true
 * });
 *
 * // Advanced configuration with custom cache settings
 * const advancedDataSource = new LazyLoadingDataSource(originalDataSource, {
 *   enabled: true,
 *   staleTime: 10 * 60 * 1000, // 10 minutes
 *   maxCacheSize: 500,
 *   preloadChildren: true,
 *   showLoadingIndicators: true
 * });
 * ```
 *
 * ARCHITECTURE:
 * ============
 * The wrapper follows the Decorator pattern, enhancing any DataSource with
 * lazy loading capabilities without modifying the original implementation.
 * It maintains internal state for caching and loading while delegating actual
 * data fetching to the wrapped data source.
 *
 * @author Scott Davis
 * @version 1.0.0 – 2025-01-27
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 * @since 1.0.0
 */

import { TreeViewItem, DataSource } from '../types';

// ===================================================================
// LAZY LOADING INTERFACES
// ===================================================================

/**
 * Configuration interface for customizing lazy loading behavior
 * 
 * Provides fine-grained control over caching, preloading, and UI feedback
 * options to optimize performance for different use cases and user experiences.
 * 
 * @interface LazyLoadingConfig
 * @author Scott Davis
 * @since 1.0.0
 */
export interface LazyLoadingConfig {
  /** 
   * Whether to enable lazy loading functionality
   * When false, all calls are delegated directly to the original data source
   */
  enabled: boolean;
  
  /** 
   * Time in milliseconds after which cached data is considered stale
   * @default 300000 (5 minutes)
   * @example 60000 // 1 minute
   */
  staleTime?: number;
  
  /** 
   * Maximum number of items to cache before triggering LRU eviction
   * @default 1000
   * @example 500 // For memory-constrained environments
   */
  maxCacheSize?: number;
  
  /** 
   * Whether to preload children when parent items are expanded
   * Improves perceived performance but increases memory usage
   * @default false
   */
  preloadChildren?: boolean;
  
  /** 
   * Whether to show loading indicators during async operations
   * @default true
   */
  showLoadingIndicators?: boolean;
  
  /** 
   * Custom loading message for UI feedback
   * @default "Loading..."
   */
  loadingMessage?: string;
}

/**
 * Internal state tracking for lazy loading operations
 * 
 * Maintains comprehensive state information for caching, loading status,
 * error tracking, and performance monitoring. This state is used internally
 * by LazyLoadingDataSource and exposed through getter methods.
 * 
 * @interface LazyLoadingState
 * @author Scott Davis
 * @since 1.0.0
 */
export interface LazyLoadingState {
  /** 
   * Set of parent IDs currently being loaded from the data source
   * Used to prevent duplicate requests and provide loading state feedback
   */
  loadingItems: Set<string>;
  
  /** 
   * Map of parent ID to cached array of child items
   * Stores the actual tree data to avoid redundant API calls
   */
  loadedItems: Map<string, TreeViewItem[]>;
  
  /** 
   * Map of parent ID to timestamp when items were loaded
   * Used for stale data detection and LRU cache eviction
   */
  loadTimestamps: Map<string, number>;
  
  /** 
   * Map of parent ID to error objects for failed load attempts
   * Enables error recovery and user feedback for failed operations
   */
  errorItems: Map<string, Error>;
  
  /** 
   * Total count of cached items across all parents
   * Used for cache size monitoring and eviction decisions
   */
  cacheSize: number;
}

/**
 * Enhanced tree item with lazy loading metadata
 * 
 * Extends the base TreeViewItem with additional properties that provide
 * information about lazy loading state, enabling rich UI feedback and
 * interaction patterns for tree components.
 * 
 * @interface LazyLoadingTreeItem
 * @extends TreeViewItem
 * @author Scott Davis
 * @since 1.0.0
 */
export interface LazyLoadingTreeItem extends TreeViewItem {
  /** 
   * Whether this item's children are currently being loaded
   * Use this to show loading spinners or skeleton UI
   */
  isLoading?: boolean;
  
  /** 
   * Whether this item's children have been successfully loaded and cached
   * Useful for conditional rendering and state-dependent behaviors
   */
  isLoaded?: boolean;
  
  /** 
   * Whether there was an error loading this item's children
   * Enables error state UI and retry mechanisms
   */
  hasError?: boolean;
  
  /** 
   * Human-readable error message if loading failed
   * Can be displayed to users for debugging or retry prompts
   */
  errorMessage?: string;
  
  /** 
   * Whether this item has children that can be loaded lazily
   * Differs from hasChildren by indicating lazy loading capability
   */
  hasLoadableChildren?: boolean;
}

// ===================================================================
// LAZY LOADING DATA SOURCE WRAPPER
// ===================================================================

/**
 * LazyLoadingDataSource – Generic lazy loading wrapper for data sources
 *
 * A decorator class that enhances any DataSource implementation with intelligent
 * caching, loading state management, and performance optimizations. This class
 * follows the Decorator pattern to add lazy loading capabilities without modifying
 * the original data source implementation.
 *
 * CORE CAPABILITIES:
 * ==================
 * 🔄 Intelligent Caching System:
 *    - LRU (Least Recently Used) cache eviction
 *    - Configurable cache size limits and stale time detection
 *    - Automatic memory management and cleanup
 *
 * ⚡ Performance Optimizations:
 *    - Prevents duplicate API calls for same data
 *    - Optional background preloading for better UX
 *    - Efficient data structure management
 *
 * 🎯 State Management:
 *    - Loading state tracking for UI feedback
 *    - Error state handling and recovery
 *    - Metadata enhancement for tree items
 *
 * 🔧 Developer Tools:
 *    - Comprehensive state inspection methods
 *    - Cache statistics and monitoring
 *    - Configurable behavior for different use cases
 *
 * THREAD SAFETY:
 * ==============
 * This class is designed for single-threaded JavaScript environments.
 * For concurrent access patterns, ensure proper coordination in calling code.
 *
 * @class LazyLoadingDataSource
 * @implements {DataSource}
 * @author Scott Davis
 * @since 1.0.0
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * // Create a lazy loading wrapper
 * const lazySource = new LazyLoadingDataSource(originalDataSource, {
 *   enabled: true,
 *   staleTime: 5 * 60 * 1000, // 5 minutes
 *   maxCacheSize: 1000,
 *   preloadChildren: false
 * });
 * 
 * // Use like any other DataSource
 * const items = await lazySource.getTreeItems({ parentId: 'folder1' });
 * const count = lazySource.getChildrenCount(parentItem);
 * 
 * // Access lazy loading specific features
 * const isLoading = lazySource.isLoading('folder1');
 * const stats = lazySource.getCacheStats();
 * lazySource.clearCache();
 * ```
 */
export class LazyLoadingDataSource implements DataSource {
  /** The original data source being wrapped with lazy loading capabilities */
  private originalDataSource: DataSource;
  /** Merged configuration with defaults applied */
  private config: LazyLoadingConfig;
  /** Internal state tracking for caching and loading operations */
  private state: LazyLoadingState;

  /**
   * Creates a new LazyLoadingDataSource wrapper
   * 
   * Initializes the lazy loading wrapper with the provided data source and
   * configuration. Applies sensible defaults for all optional configuration
   * parameters and sets up initial state tracking structures.
   * 
   * @param originalDataSource - The data source to wrap with lazy loading
   * @param config - Configuration options for lazy loading behavior
   * 
   * @throws {Error} If originalDataSource is null or undefined
   * @throws {Error} If config.enabled is not specified
   * 
   * @author Scott Davis
   * @since 1.0.0
   * 
   * @example
   * ```typescript
   * // Basic setup with minimal config
   * const lazy = new LazyLoadingDataSource(myDataSource, { enabled: true });
   * 
   * // Advanced setup with custom parameters
   * const lazy = new LazyLoadingDataSource(myDataSource, {
   *   enabled: true,
   *   staleTime: 10 * 60 * 1000, // 10 minutes
   *   maxCacheSize: 500,
   *   preloadChildren: true
   * });
   * ```
   */
  constructor(originalDataSource: DataSource, config: LazyLoadingConfig) {
    this.originalDataSource = originalDataSource;
    
    // Merge provided config with sensible defaults
    // User-provided values take precedence over defaults
    this.config = {
      staleTime: 5 * 60 * 1000, // 5 minutes - good balance of freshness vs performance
      maxCacheSize: 1000,       // Suitable for most applications
      preloadChildren: false,   // Conservative default to avoid excessive memory usage
      showLoadingIndicators: true,
      loadingMessage: "Loading...",
      ...config // User overrides take precedence, including required 'enabled' field
    };
    
    // Initialize empty state tracking structures
    this.state = {
      loadingItems: new Set(),     // Track ongoing requests
      loadedItems: new Map(),      // Cache for loaded data
      loadTimestamps: new Map(),   // Track when data was loaded for staleness
      errorItems: new Map(),       // Track errors for debugging and recovery
      cacheSize: 0                 // Running count for efficient size checking
    };
  }

  // ===================================================================
  // PUBLIC INTERFACE
  // ===================================================================

  /**
   * Retrieve tree items for a given parent with intelligent caching
   * 
   * This is the primary method for loading tree data. It implements intelligent
   * caching logic to minimize redundant API calls while ensuring data freshness.
   * The method enhances returned items with lazy loading metadata for UI feedback.
   * 
   * CACHING LOGIC:
   * =============
   * 1. Check if lazy loading is enabled (delegate if disabled)
   * 2. Look for fresh cached data (return enhanced cache if found)
   * 3. Load from original data source if cache miss or stale data
   * 4. Update cache and return enhanced items with metadata
   * 
   * BACKWARD COMPATIBILITY:
   * ======================
   * Some consumers invoke getTreeItems() with no arguments to request root items.
   * This method gracefully handles undefined/null params by defaulting to root
   * level (parentId = '') to maintain compatibility with existing code.
   * 
   * @param params - Parameters for tree item retrieval
   * @param params.parentId - ID of parent item to load children for (empty string = root)
   * @returns Promise resolving to enhanced tree items with lazy loading metadata
   * 
   * @throws {Error} If the underlying data source throws during loading
   * 
   * @author Scott Davis
   * @since 1.0.0
   * 
   * @example
   * ```typescript
   * // Load root items
   * const rootItems = await dataSource.getTreeItems();
   * const rootItems2 = await dataSource.getTreeItems({ parentId: '' });
   * 
   * // Load children of specific parent
   * const children = await dataSource.getTreeItems({ parentId: 'folder1' });
   * 
   * // Check enhanced metadata
   * children.forEach(item => {
   *   if (item.isLoading) console.log('Still loading...');
   *   if (item.hasError) console.log('Error:', item.errorMessage);
   *   if (item.hasLoadableChildren) console.log('Can load children');
   * });
   * ```
   */
  async getTreeItems(params: { parentId?: string } = {}): Promise<LazyLoadingTreeItem[]> {
    // Normalize parentId to empty string for root-level requests
    // This handles both undefined params and undefined parentId gracefully
    const parentId = params?.parentId ?? '';
    
    // Fast path: if lazy loading is disabled, delegate immediately
    // This ensures minimal overhead when lazy loading is not needed
    if (!this.config.enabled) {
      return this.originalDataSource.getTreeItems(params);
    }

    // Check cache for fresh data to avoid redundant API calls
    // Fresh data is data loaded within the configured staleTime window
    if (this.isCachedDataFresh(parentId)) {
      const cachedItems = this.state.loadedItems.get(parentId);
      if (cachedItems) {
        // Return cached data enhanced with current lazy loading state
        return this.enhanceItemsWithLazyLoadingState(cachedItems, parentId);
      }
    }

    // Cache miss or stale data: load from original source
    // This handles loading state, caching, error handling, and enhancement
    return this.loadItemsFromSource(parentId);
  }

  /**
   * Get children count with lazy loading awareness and cache optimization
   * 
   * Returns the number of children for a given tree item. This method optimizes
   * performance by using cached data when available, falling back to the original
   * data source only when necessary. The count reflects actual loaded data when
   * cached, providing accurate information for UI rendering decisions.
   * 
   * OPTIMIZATION STRATEGY:
   * =====================
   * 1. If lazy loading disabled: delegate to original data source
   * 2. If children are cached: return actual cached count (most accurate)
   * 3. Otherwise: delegate to original data source (may be estimate)
   * 
   * @param item - Tree item to get children count for
   * @returns Number of children for the item (0 for leaf nodes)
   * 
   * @author Scott Davis
   * @since 1.0.0
   * 
   * @example
   * ```typescript
   * // Get count for a tree item
   * const count = dataSource.getChildrenCount(folderItem);
   * 
   * // Use count for UI decisions
   * if (count > 0) {
   *   showExpandButton(folderItem);
   * }
   * 
   * // Count reflects cached data when available
   * await dataSource.getTreeItems({ parentId: folderItem.id });
   * const accurateCount = dataSource.getChildrenCount(folderItem); // Now from cache
   * ```
   */
  getChildrenCount(item: TreeViewItem): number {
    // Fast path: delegate immediately if lazy loading is disabled
    if (!this.config.enabled) {
      return this.originalDataSource.getChildrenCount(item);
    }

    // Optimization: use cached data count if available
    // This provides the most accurate count since we have the actual loaded items
    const cachedItems = this.state.loadedItems.get(item.id);
    if (cachedItems) {
      return cachedItems.length;
    }

    // Fallback: delegate to original data source
    // This may return an estimate or require computation
    return this.originalDataSource.getChildrenCount(item);
  }

  // ===================================================================
  // LAZY LOADING METHODS
  // ===================================================================

  /**
   * Load items from the original data source with comprehensive state management
   * 
   * This private method handles the complete lifecycle of loading data from the
   * original data source, including loading state tracking, caching, error
   * handling, and item enhancement. It ensures consistent state management
   * across all loading operations.
   * 
   * LOADING LIFECYCLE:
   * ==================
   * 1. Mark parent as loading (prevents duplicate requests)
   * 2. Delegate to original data source for actual loading
   * 3. Cache results and update timestamps
   * 4. Clear loading state and enhance items with metadata
   * 5. Handle errors gracefully with error state tracking
   * 
   * @param parentId - ID of parent whose children should be loaded
   * @returns Promise resolving to enhanced tree items or error placeholders
   * 
   * @throws Never throws - all errors are caught and converted to error state items
   * 
   * @author Scott Davis
   * @since 1.0.0
   * @private
   */
  private async loadItemsFromSource(parentId: string): Promise<LazyLoadingTreeItem[]> {
    // Mark as loading to prevent duplicate requests and enable UI feedback
    this.state.loadingItems.add(parentId);
    
    try {
      // Delegate to original data source for actual data loading
      const items = await this.originalDataSource.getTreeItems({ parentId });
      
      // Cache the successfully loaded results with timestamp tracking
      this.cacheItems(parentId, items);
      
      // Clear loading state now that operation is complete
      this.state.loadingItems.delete(parentId);
      
      // Return items enhanced with current lazy loading metadata
      return this.enhanceItemsWithLazyLoadingState(items, parentId);
      
    } catch (error) {
      // Track error for debugging and potential recovery
      this.state.errorItems.set(parentId, error as Error);
      this.state.loadingItems.delete(parentId);
      
      // Return user-friendly error placeholder instead of throwing
      return this.createErrorStateItems(parentId, error as Error);
    }
  }

  /**
   * Cache loaded items with intelligent size management and LRU eviction
   * 
   * Stores loaded items in the cache with proper size tracking and timestamp
   * recording for freshness detection. Automatically triggers cache cleanup
   * when size limits are exceeded, using LRU (Least Recently Used) eviction.
   * 
   * CACHE MANAGEMENT STRATEGY:
   * =========================
   * 1. Remove existing cache entry and adjust size counter
   * 2. Store new items with current timestamp
   * 3. Update total cache size for efficient monitoring
   * 4. Trigger LRU cleanup if cache exceeds configured limits
   * 
   * @param parentId - Parent ID to cache items for
   * @param items - Array of tree items to cache
   * 
   * @author Scott Davis
   * @since 1.0.0
   * @private
   */
  private cacheItems(parentId: string, items: TreeViewItem[]): void {
    // Remove existing cache entry and adjust size counter
    // This handles cache updates/refreshes properly
    if (this.state.loadedItems.has(parentId)) {
      const oldItems = this.state.loadedItems.get(parentId) || [];
      this.state.cacheSize -= oldItems.length;
    }

    // Store new cache entry with current timestamp for freshness tracking
    this.state.loadedItems.set(parentId, items);
    this.state.loadTimestamps.set(parentId, Date.now());
    this.state.cacheSize += items.length;

    // Trigger LRU cleanup if cache size exceeds configured limits
    this.cleanupCacheIfNeeded();
  }

  /**
   * Check if cached data is still fresh
   */
  private isCachedDataFresh(parentId: string): boolean {
    const timestamp = this.state.loadTimestamps.get(parentId);
    if (!timestamp) return false;
    
    const age = Date.now() - timestamp;
    return age < (this.config.staleTime || 0);
  }

  /**
   * Clean up cache using LRU eviction when size limits are exceeded
   * 
   * Implements Least Recently Used (LRU) cache eviction to maintain memory
   * efficiency. Removes oldest entries first until cache size falls within
   * configured limits. Ensures all related state (items, timestamps, errors)
   * is cleaned up consistently.
   * 
   * LRU EVICTION ALGORITHM:
   * ======================
   * 1. Check if cleanup is needed (size > maxCacheSize)
   * 2. Sort entries by timestamp (oldest first)
   * 3. Remove oldest entries until under size limit
   * 4. Clean up all associated state maps consistently
   * 
   * @author Scott Davis
   * @since 1.0.0
   * @private
   */
  private cleanupCacheIfNeeded(): void {
    // Early exit if cache is within acceptable size limits
    if (this.state.cacheSize <= (this.config.maxCacheSize || 1000)) {
      return;
    }

    // Create sorted list of cache entries by timestamp (oldest first)
    // This implements the LRU (Least Recently Used) eviction strategy
    const entries = Array.from(this.state.loadTimestamps.entries())
      .sort(([, a], [, b]) => a - b);

    // Remove oldest entries until cache size is within limits
    while (this.state.cacheSize > (this.config.maxCacheSize || 1000) && entries.length > 0) {
      const [parentId] = entries.shift()!;
      const items = this.state.loadedItems.get(parentId) || [];
      
      // Clean up all associated state for this parent consistently
      this.state.loadedItems.delete(parentId);
      this.state.loadTimestamps.delete(parentId);
      this.state.errorItems.delete(parentId);  // Clear errors too
      this.state.cacheSize -= items.length;    // Maintain accurate size tracking
    }
  }

  /**
   * Enhance items with lazy loading state information
   */
  private enhanceItemsWithLazyLoadingState(
    items: TreeViewItem[], 
    parentId: string
  ): LazyLoadingTreeItem[] {
    return items.map(item => ({
      ...item,
      isLoading: this.state.loadingItems.has(item.id),
      isLoaded: this.state.loadedItems.has(item.id),
      hasError: this.state.errorItems.has(item.id),
      errorMessage: this.state.errorItems.get(item.id)?.message,
      hasLoadableChildren: item.hasChildren && !this.state.loadedItems.has(item.id)
    }));
  }

  /**
   * Create error state items when loading fails
   */
  private createErrorStateItems(parentId: string, error: Error): LazyLoadingTreeItem[] {
    return [{
      id: `${parentId}/__error__`,
      label: `Error loading items: ${error.message}`,
      type: 'placeholder',
      isPlaceholder: true,
      hasChildren: false,
      isLoading: false,
      isLoaded: false,
      hasError: true,
      errorMessage: error.message,
      hasLoadableChildren: false
    }];
  }

  // ===================================================================
  // CACHE MANAGEMENT
  // ===================================================================

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.state.loadedItems.clear();
    this.state.loadTimestamps.clear();
    this.state.errorItems.clear();
    this.state.cacheSize = 0;
  }

  /**
   * Clear cache for a specific parent
   */
  clearCacheForParent(parentId: string): void {
    const items = this.state.loadedItems.get(parentId) || [];
    this.state.loadedItems.delete(parentId);
    this.state.loadTimestamps.delete(parentId);
    this.state.errorItems.delete(parentId);
    this.state.cacheSize -= items.length;
  }

  /**
   * Preload children for a parent item
   */
  async preloadChildren(parentId: string): Promise<void> {
    if (!this.config.preloadChildren || !this.config.enabled) {
      return;
    }

    // Don't preload if already loaded or loading
    if (this.state.loadedItems.has(parentId) || this.state.loadingItems.has(parentId)) {
      return;
    }

    // Preload in background
    this.loadItemsFromSource(parentId).catch(() => {
      // Ignore preload errors
    });
  }

  // ===================================================================
  // STATE ACCESS
  // ===================================================================

  /**
   * Get current lazy loading state
   */
  getLazyLoadingState(): LazyLoadingState {
    return { ...this.state };
  }

  /**
   * Check if a specific item is loading
   */
  isLoading(parentId: string): boolean {
    return this.state.loadingItems.has(parentId);
  }

  /**
   * Check if a specific item has been loaded
   */
  isLoaded(parentId: string): boolean {
    return this.state.loadedItems.has(parentId);
  }

  /**
   * Check if a specific item has an error
   */
  hasError(parentId: string): boolean {
    return this.state.errorItems.has(parentId);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.state.cacheSize,
      maxSize: this.config.maxCacheSize || 1000,
      hitRate: 0 // TODO: Implement hit rate tracking
    };
  }
}
