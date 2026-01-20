/**
 * @fileoverview StudioTreeView – Custom Tree View Component Exports
 *
 * Main export file for StudioTreeView component and related types.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

export { StudioTreeView, ItemDataContext } from './StudioTreeView';
export type { StudioTreeViewProps, StudioTreeViewApiRef, TreeViewItemId } from './StudioTreeView';

export { StudioTreeItem } from './StudioTreeItem';
export type { StudioTreeItemProps } from './StudioTreeItem';

export { useStudioTreeViewApi } from './hooks/useStudioTreeViewApi';
export { useExpansion } from './hooks/useExpansion';
export { useSelection } from './hooks/useSelection';
export { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
export { useUserInteractions } from './hooks/useUserInteractions';
export { useScreenReader } from './hooks/useScreenReader';
export { usePerformance } from './hooks/usePerformance';