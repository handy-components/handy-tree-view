/**
 * @fileoverview Type definitions for TreeView components
 *
 * Contains TreeViewItem, DataSource interfaces, and caching strategy types.
 * These types are shared across all TreeView components including StudioTreeView.
 *
 * @author Scott Davis
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

/**
 * Represents a single item in the tree view hierarchy.
 *
 * Each tree item has a unique identifier, display label, and optional children.
 * The interface is extensible to support additional properties as needed.
 */
export interface TreeViewItem {
  /** Unique identifier for the tree item */
  id: string;
  /** Display text for the tree item */
  label: string;
  /** Optional array of child tree items */
  children?: TreeViewItem[];
  /** Optional count of children (used for lazy loading) */
  childrenCount?: number;
  /** Indicates whether the item is a directory that can contain children */
  hasChildren?: boolean;
  /** The underlying file-system entry type */
  type?: "file" | "directory" | "placeholder";
  /** True if the entry is marked as hidden on the host OS */
  isHidden?: boolean;
  /** True if the entry is a protected system file on the host OS */
  isSystem?: boolean;
  /** True if this is a placeholder item for lazy loading */
  isPlaceholder?: boolean;
  /** True if the entry is marked as hidden on the host OS (alternative property name) */
  hidden?: boolean;
  /** True if the entry is read-only */
  readonly?: boolean;
  /** Additional properties that can be added to tree items */
  [key: string]: any;
}

/**
 * Interface for caching tree view data with optional TTL support.
 *
 * Implementations can provide different caching strategies (memory, localStorage,
 * IndexedDB, etc.) while maintaining a consistent interface.
 */
export interface DataSourceCache {
  /**
   * Retrieves a value from the cache
   * @param key - The cache key to retrieve
   * @returns The cached value or null if not found/expired
   */
  get: (key: string) => Promise<any> | any;

  /**
   * Stores a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param ttl - Optional time-to-live in milliseconds
   */
  set: (key: string, value: any, ttl?: number) => void;

  /**
   * Clears all cached data
   */
  clear: () => void;

  /**
   * Removes a specific item from the cache
   * @param key - The cache key to remove
   * @returns True if the item was removed, false if not found
   */
  delete?: (key: string) => boolean;

  /**
   * Checks if a key exists in the cache
   * @param key - The cache key to check
   * @returns True if the key exists and is not expired
   */
  has?: (key: string) => boolean;
}

/**
 * Interface for data sources that provide tree view data.
 *
 * Data sources are responsible for fetching tree items and determining
 * the number of children for each item. This enables lazy loading of
 * tree data from various sources (APIs, file systems, databases, etc.).
 */
export interface DataSource {
  /**
   * Fetches tree items for a given parent
   * @param params - Parameters for the fetch operation
   * @param params.parentId - Optional parent ID to fetch children for
   * @returns Promise that resolves to an array of tree items
   */
  getTreeItems: (params: { parentId?: string }) => Promise<TreeViewItem[]>;

  /**
   * Gets the number of children for a given tree item
   * @param item - The tree item to get children count for
   * @returns The number of children (0 for leaf nodes)
   */
  getChildrenCount: (item: TreeViewItem) => number;
}

/**
 * Represents the current state of lazy loading operations.
 *
 * Tracks which items are currently loading and which have encountered errors
 * during the lazy loading process.
 */
export interface LazyLoadingState {
  /** Set of item IDs that are currently being loaded */
  loadingItems: Set<string>;
  /** Map of item IDs to error messages for failed loads */
  errorItems: Map<string, string>;
}
