/**
 * @fileoverview StudioTreeItem – Tree Item Component
 *
 * Individual tree item component for StudioTreeView.
 * Handles rendering, interactions, and accessibility.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React, { forwardRef, useCallback, memo, useState, useEffect, useRef } from 'react';
import { Box, Typography, Checkbox, IconButton, Collapse, CircularProgress, Alert, TextField } from '@mui/material';
import { ChevronRight, ExpandMore, ErrorOutline } from '@mui/icons-material';

/**
 * Props for StudioTreeItem
 */
export interface StudioTreeItemProps {
  /** Unique identifier for the item */
  itemId: string | number;
  /** Display label */
  label: string;
  /** Nesting level (0 = root) */
  level: number;
  /** Whether the item is expanded */
  expanded?: boolean;
  /** Whether the item is selected */
  selected?: boolean;
  /** Whether the item is focused */
  focused?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item has children */
  hasChildren?: boolean;
  /** Whether to show checkbox for selection */
  checkboxSelection?: boolean;
  /** Which part triggers expansion */
  expansionTrigger?: 'content' | 'iconContainer';
  /** Click handler */
  onClick?: (event: React.MouseEvent, itemId: string | number) => void;
  /** Focus handler */
  onFocus?: (event: React.SyntheticEvent, itemId: string | number) => void;
  /** Expansion toggle handler */
  onExpansionToggle?: (event: React.SyntheticEvent) => void;
  /** Double-click handler */
  onDoubleClick?: (event: React.MouseEvent, itemId: string | number) => void;
  /** Right-click / context menu handler */
  onContextMenu?: (event: React.MouseEvent, itemId: string | number) => void;
  /** Mouse enter handler */
  onMouseEnter?: (event: React.MouseEvent, itemId: string | number) => void;
  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent, itemId: string | number) => void;
  /** Whether item is hovered */
  hovered?: boolean;
  /** Whether item is loading */
  loading?: boolean;
  /** Whether item has error */
  error?: string | null;
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode;
  /** Custom error indicator */
  errorIndicator?: React.ReactNode;
  /** Whether to animate expand/collapse */
  animateExpansion?: boolean;
  /** Children to render when expanded */
  children?: React.ReactNode;
  /** Whether item is being edited */
  editing?: boolean;
  /** Callback when label edit is confirmed */
  onLabelEdit?: (newLabel: string) => void;
  /** Callback when label edit is cancelled */
  onLabelEditCancel?: () => void;
  /** Whether items can be reordered */
  itemsReordering?: boolean;
  /** Whether this specific item is reorderable */
  reorderable?: boolean;
  /** Drag start handler */
  onDragStart?: (event: React.DragEvent, itemId: string | number) => void;
  /** Drag end handler */
  onDragEnd?: (event: React.DragEvent, itemId: string | number) => void;
  /** Drag over handler */
  onDragOver?: (event: React.DragEvent, itemId: string | number) => void;
  /** Drop handler */
  onDrop?: (event: React.DragEvent, itemId: string | number) => void;
  /** Whether item is being dragged */
  dragging?: boolean;
  /** Whether item has drag over */
  dragOver?: boolean;
}

/**
 * StudioTreeItem – Tree Item Component
 *
 * Renders a single tree item with support for expansion, selection, and focus.
 *
 * @param props - Component props
 * @param ref - Forwarded ref to the list item element
 * @returns StudioTreeItem component
 */
export const StudioTreeItem = forwardRef<HTMLLIElement, StudioTreeItemProps>(
  (props, ref) => {
    const {
      itemId,
      label,
      level,
      expanded = false,
      selected = false,
      focused = false,
      disabled = false,
      hasChildren = false,
      checkboxSelection = false,
      expansionTrigger = 'content',
      onClick,
      onFocus,
      onExpansionToggle,
      onDoubleClick,
      onContextMenu,
      onMouseEnter,
      onMouseLeave,
      hovered = false,
      loading = false,
      error = null,
      icon,
      loadingIndicator,
      errorIndicator,
      animateExpansion = true,
      children,
      editing = false,
      onLabelEdit,
      onLabelEditCancel,
      itemsReordering = false,
      reorderable = true,
      onDragStart,
      onDragEnd,
      onDragOver,
      onDrop,
      dragging = false,
      dragOver = false,
    } = props;
    
    // Label editing state
    const [editValue, setEditValue] = useState(label);
    const editInputRef = useRef<HTMLInputElement>(null);
    
    // Update edit value when label changes
    useEffect(() => {
      setEditValue(label);
    }, [label]);
    
    // Focus input when editing starts
    useEffect(() => {
      if (editing && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, [editing]);

    // ===================================================================
    // EVENT HANDLERS
    // ===================================================================

    const handleClick = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) return;
        onClick?.(event, itemId);
      },
      [disabled, onClick, itemId]
    );

    const handleFocus = useCallback(
      (event: React.SyntheticEvent) => {
        if (disabled) return;
        onFocus?.(event, itemId);
      },
      [disabled, onFocus, itemId]
    );

    const handleDoubleClick = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) return;
        onDoubleClick?.(event, itemId);
      },
      [disabled, onDoubleClick, itemId]
    );

    const handleContextMenu = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) return;
        onContextMenu?.(event, itemId);
      },
      [disabled, onContextMenu, itemId]
    );

    const handleMouseEnter = useCallback(
      (event: React.MouseEvent) => {
        if (disabled) return;
        onMouseEnter?.(event, itemId);
      },
      [disabled, onMouseEnter, itemId]
    );

    const handleMouseLeave = useCallback(
      (event: React.MouseEvent) => {
        onMouseLeave?.(event, itemId);
      },
      [onMouseLeave, itemId]
    );
    
    const handleLabelEditConfirm = useCallback(() => {
      if (onLabelEdit && editValue.trim() !== '') {
        onLabelEdit(editValue.trim());
      } else if (onLabelEditCancel) {
        onLabelEditCancel();
      }
    }, [onLabelEdit, onLabelEditCancel, editValue]);
    
    const handleLabelEditCancel = useCallback(() => {
      setEditValue(label); // Reset to original label
      onLabelEditCancel?.();
    }, [label, onLabelEditCancel]);
    
    const handleLabelEditKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleLabelEditConfirm();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          handleLabelEditCancel();
        }
      },
      [handleLabelEditConfirm, handleLabelEditCancel]
    );

    const handleExpansionIconClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        if (disabled || !hasChildren) return;
        onExpansionToggle?.(event);
      },
      [disabled, hasChildren, onExpansionToggle]
    );
    
    const handleDragStart = useCallback(
      (event: React.DragEvent) => {
        if (!itemsReordering || !reorderable || disabled) {
          event.preventDefault();
          return;
        }
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(itemId));
        onDragStart?.(event, itemId);
      },
      [itemsReordering, reorderable, disabled, itemId, onDragStart]
    );
    
    const handleDragEnd = useCallback(
      (event: React.DragEvent) => {
        onDragEnd?.(event, itemId);
      },
      [itemId, onDragEnd]
    );
    
    const handleDragOver = useCallback(
      (event: React.DragEvent) => {
        if (!itemsReordering || disabled) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        onDragOver?.(event, itemId);
      },
      [itemsReordering, disabled, itemId, onDragOver]
    );
    
    const handleDrop = useCallback(
      (event: React.DragEvent) => {
        if (!itemsReordering || disabled) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        onDrop?.(event, itemId);
      },
      [itemsReordering, disabled, itemId, onDrop]
    );

    // ===================================================================
    // RENDER
    // ===================================================================

    return (
      <Box
        component="li"
        ref={ref}
        role="treeitem"
        id={String(itemId)}
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={selected !== undefined ? selected : undefined}
        aria-disabled={disabled}
        aria-level={level + 1}
        aria-setsize={undefined} // Will be set by parent if needed
        aria-posinset={undefined} // Will be set by parent if needed
        tabIndex={focused ? 0 : -1}
        onFocus={handleFocus}
        draggable={itemsReordering && reorderable && !disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          outline: 'none',
          position: 'relative',
          opacity: dragging ? 0.5 : 1,
          backgroundColor: dragOver ? 'action.hover' : 'transparent',
          transition: 'opacity 0.2s ease-in-out, background-color 0.15s ease-in-out',
          '&:focus': {
            backgroundColor: 'action.hover',
          },
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'primary.main',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        }}
      >
        {/* Item Content */}
        <Box
          component="div"
          role="button"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          data-expansion-trigger={expansionTrigger === 'content'}
          sx={{
            display: 'flex',
            alignItems: 'center',
            minHeight: 32,
            px: 1,
            py: 0.5,
            cursor: disabled ? 'default' : 'pointer',
            backgroundColor: selected ? 'action.selected' : hovered ? 'action.hover' : 'transparent',
            opacity: disabled ? 0.5 : 1,
            transition: 'background-color 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: disabled
                ? 'transparent'
                : selected
                ? 'action.selected'
                : 'action.hover',
            },
          }}
        >
          {/* Expansion Icon */}
          {hasChildren && (
            <IconButton
              size="small"
              onClick={handleExpansionIconClick}
              data-expansion-trigger={expansionTrigger === 'iconContainer'}
              sx={{
                width: 24,
                height: 24,
                p: 0,
                mr: 0.5,
                transition: 'transform 0.2s ease-in-out',
                transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              <ExpandMore fontSize="small" />
            </IconButton>
          )}

          {/* Spacer for items without children */}
          {!hasChildren && <Box sx={{ width: 24, mr: 0.5 }} />}

          {/* Custom Icon */}
          {icon && <Box sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>}

          {/* Checkbox (if enabled) */}
          {checkboxSelection && (
            <Checkbox
              checked={selected}
              disabled={disabled}
              size="small"
              sx={{ mr: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Label or Edit Input */}
          {editing ? (
            <TextField
              inputRef={editInputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleLabelEditConfirm}
              onKeyDown={handleLabelEditKeyDown}
              size="small"
              variant="outlined"
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  height: 28,
                  fontSize: '0.875rem',
                },
              }}
              autoFocus
            />
          ) : (
            <Typography
              variant="body2"
              component="span"
              sx={{
                flex: 1,
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {label}
            {/* Loading Indicator */}
            {loading && (
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                {loadingIndicator || (
                  <CircularProgress size={12} thickness={4} sx={{ color: 'text.secondary' }} />
                )}
              </Box>
            )}
            {/* Error Indicator */}
            {error && (
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                {errorIndicator || (
                  <ErrorOutline fontSize="small" sx={{ color: 'error.main' }} />
                )}
              </Box>
            )}
            </Typography>
          )}
        </Box>

        {/* Error Message */}
        {error && (
          <Box sx={{ pl: 4, pr: 1, pb: 0.5 }}>
            <Alert severity="error" sx={{ py: 0.25, fontSize: '0.75rem' }}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Children (rendered when expanded) */}
        {hasChildren && children && (
          animateExpansion ? (
            <Collapse in={expanded} timeout="auto">
              <Box component="div" role="group" sx={{ pl: 2 }}>
                {children}
              </Box>
            </Collapse>
          ) : (
            expanded && (
              <Box component="div" role="group" sx={{ pl: 2 }}>
                {children}
              </Box>
            )
          )
        )}
      </Box>
    );
  }
);

StudioTreeItem.displayName = 'StudioTreeItem';

// Memoize component to prevent unnecessary re-renders
export const MemoizedStudioTreeItem = memo(StudioTreeItem, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.itemId === nextProps.itemId &&
    prevProps.label === nextProps.label &&
    prevProps.expanded === nextProps.expanded &&
    prevProps.selected === nextProps.selected &&
    prevProps.focused === nextProps.focused &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.hovered === nextProps.hovered &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.level === nextProps.level
  );
});

MemoizedStudioTreeItem.displayName = 'MemoizedStudioTreeItem';
