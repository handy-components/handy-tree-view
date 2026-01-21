/**
 * @fileoverview HandyTreeView – Custom Tree View Component Exports
 *
 * Main export file for HandyTreeView component and related types.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

export { HandyTreeView, ItemDataContext } from './HandyTreeView';
export type { HandyTreeViewProps, HandyTreeViewApiRef, TreeViewItemId } from './HandyTreeView';

export { HandyTreeItem } from './HandyTreeItem';
export type { HandyTreeItemProps } from './HandyTreeItem';

export { useHandyTreeViewApi } from './hooks/useHandyTreeViewApi';
export { useExpansion } from './hooks/useExpansion';
export { useSelection } from './hooks/useSelection';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useUserInteractions } from './hooks/useUserInteractions';
export { useScreenReader } from './hooks/useScreenReader';
export { usePerformance } from './hooks/usePerformance';

// Export types for standalone package
export type { TreeViewItem, DataSource, DataSourceCache } from './types';