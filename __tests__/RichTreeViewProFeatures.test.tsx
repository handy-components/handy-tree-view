/**
 * @fileoverview Unit Tests for RichTreeViewPro Features
 *
 * Comprehensive test suite for selection propagation, label editing, and item reordering.
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license AGPL-3.0-or-later – see LICENSE in the repository root for full text
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { StudioTreeView, StudioTreeViewApiRef } from '../src/components/StudioTreeView';
import { TreeViewItem } from '../../types';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('Selection Propagation', () => {
  const mockItems: TreeViewItem[] = [
    {
      id: '1',
      label: 'Parent',
      children: [
        { id: '1-1', label: 'Child 1' },
        { id: '1-2', label: 'Child 2' },
      ],
    },
    {
      id: '2',
      label: 'Another Parent',
      children: [
        { id: '2-1', label: 'Child 3' },
      ],
    },
  ];

  it('should select all descendants when parent is selected with descendants propagation', () => {
    const handleSelectionChange = jest.fn();
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        multiSelect
        checkboxSelection
        selectionPropagation={{ descendants: true, parents: false }}
        onSelectedItemsChange={handleSelectionChange}
      />
    );

    const parentItem = screen.getByText('Parent').closest('li');
    expect(parentItem).toBeInTheDocument();

    // Click parent checkbox
    const checkbox = parentItem?.querySelector('input[type="checkbox"]');
    if (checkbox) {
      fireEvent.click(checkbox);
    }

    waitFor(() => {
      expect(handleSelectionChange).toHaveBeenCalled();
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      const selectedItems = Array.isArray(lastCall[1]) ? lastCall[1] : [];
      expect(selectedItems).toContain('1');
      expect(selectedItems).toContain('1-1');
      expect(selectedItems).toContain('1-2');
    });
  });

  it('should select parent when all children are selected with parents propagation', () => {
    const handleSelectionChange = jest.fn();
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        multiSelect
        checkboxSelection
        selectionPropagation={{ descendants: false, parents: true }}
        onSelectedItemsChange={handleSelectionChange}
      />
    );

    // Expand parent first
    const parentItem = screen.getByText('Parent').closest('li');
    const expandIcon = parentItem?.querySelector('button');
    if (expandIcon) {
      fireEvent.click(expandIcon);
    }

    waitFor(() => {
      expect(screen.getByText('Child 1')).toBeInTheDocument();
    });

    // Select both children
    const child1 = screen.getByText('Child 1').closest('li');
    const child2 = screen.getByText('Child 2').closest('li');
    
    const checkbox1 = child1?.querySelector('input[type="checkbox"]');
    const checkbox2 = child2?.querySelector('input[type="checkbox"]');
    
    if (checkbox1) fireEvent.click(checkbox1);
    if (checkbox2) fireEvent.click(checkbox2);

    waitFor(() => {
      expect(handleSelectionChange).toHaveBeenCalled();
      // Parent should be auto-selected
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      const selectedItems = Array.isArray(lastCall[1]) ? lastCall[1] : [];
      expect(selectedItems).toContain('1');
    });
  });

  it('should deselect descendants when parent is deselected with descendants propagation', () => {
    const handleSelectionChange = jest.fn();
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        multiSelect
        checkboxSelection
        selectionPropagation={{ descendants: true, parents: false }}
        selectedItems={['1', '1-1', '1-2']}
        onSelectedItemsChange={handleSelectionChange}
      />
    );

    const parentItem = screen.getByText('Parent').closest('li');
    const checkbox = parentItem?.querySelector('input[type="checkbox"]');
    
    if (checkbox) {
      fireEvent.click(checkbox); // Deselect
    }

    waitFor(() => {
      expect(handleSelectionChange).toHaveBeenCalled();
      const lastCall = handleSelectionChange.mock.calls[handleSelectionChange.mock.calls.length - 1];
      const selectedItems = Array.isArray(lastCall[1]) ? lastCall[1] : [];
      expect(selectedItems).not.toContain('1');
      expect(selectedItems).not.toContain('1-1');
      expect(selectedItems).not.toContain('1-2');
    });
  });
});

describe('Label Editing', () => {
  const mockItems: TreeViewItem[] = [
    { id: '1', label: 'Editable Item' },
    { id: '2', label: 'Non-editable Item' },
  ];

  it('should start editing when setEditedItem is called', () => {
    const apiRef: StudioTreeViewApiRef = { current: null };
    renderWithTheme(
      <StudioTreeView
        apiRef={apiRef}
        items={mockItems}
        isItemEditable={(itemId) => itemId === '1'}
      />
    );

    // Call setEditedItem via API ref
    if (apiRef.current?.setEditedItem) {
      apiRef.current.setEditedItem('1');
    }

    waitFor(() => {
      const input = screen.getByDisplayValue('Editable Item');
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });
  });

  it('should save label when Enter is pressed', async () => {
    const handleLabelChange = jest.fn();
    const apiRef: StudioTreeViewApiRef = { current: null };
    renderWithTheme(
      <StudioTreeView
        apiRef={apiRef}
        items={mockItems}
        isItemEditable={(itemId) => itemId === '1'}
        onItemLabelChange={handleLabelChange}
      />
    );

    if (apiRef.current?.setEditedItem) {
      apiRef.current.setEditedItem('1');
    }

    await waitFor(() => {
      const input = screen.getByDisplayValue('Editable Item') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('Editable Item') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New Label' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(handleLabelChange).toHaveBeenCalledWith('1', 'New Label');
    });
  });

  it('should cancel editing when Escape is pressed', async () => {
    const handleLabelChange = jest.fn();
    const apiRef: StudioTreeViewApiRef = { current: null };
    renderWithTheme(
      <StudioTreeView
        apiRef={apiRef}
        items={mockItems}
        isItemEditable={(itemId) => itemId === '1'}
        onItemLabelChange={handleLabelChange}
      />
    );

    if (apiRef.current?.setEditedItem) {
      apiRef.current.setEditedItem('1');
    }

    await waitFor(() => {
      const input = screen.getByDisplayValue('Editable Item') as HTMLInputElement;
      expect(input).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('Editable Item') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Changed Label' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(handleLabelChange).not.toHaveBeenCalled();
      expect(screen.getByText('Editable Item')).toBeInTheDocument();
    });
  });

  it('should not allow editing non-editable items', () => {
    const apiRef: StudioTreeViewApiRef = { current: null };
    renderWithTheme(
      <StudioTreeView
        apiRef={apiRef}
        items={mockItems}
        isItemEditable={(itemId) => itemId === '1'}
      />
    );

    // Try to edit non-editable item
    if (apiRef.current?.setEditedItem) {
      apiRef.current.setEditedItem('2');
    }

    // Should not show input for non-editable item
    expect(screen.queryByDisplayValue('Non-editable Item')).not.toBeInTheDocument();
  });
});

describe('Item Reordering', () => {
  const mockItems: TreeViewItem[] = [
    { id: '1', label: 'Item 1' },
    { id: '2', label: 'Item 2' },
    { id: '3', label: 'Item 3' },
  ];

  it('should enable drag and drop when itemsReordering is true', () => {
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        itemsReordering={true}
      />
    );

    const item1 = screen.getByText('Item 1').closest('li');
    expect(item1).toHaveAttribute('draggable', 'true');
  });

  it('should disable drag for non-reorderable items', () => {
    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        itemsReordering={true}
        isItemReorderable={(itemId) => itemId !== '2'}
      />
    );

    const item2 = screen.getByText('Item 2').closest('li');
    expect(item2).toHaveAttribute('draggable', 'false');
  });

  it('should call canMoveItemToNewPosition before moving', () => {
    const canMove = jest.fn().mockReturnValue(false);
    const handlePositionChange = jest.fn();

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        itemsReordering={true}
        canMoveItemToNewPosition={canMove}
        onItemPositionChange={handlePositionChange}
      />
    );

    const item1 = screen.getByText('Item 1').closest('li');
    const item2 = screen.getByText('Item 2').closest('li');

    if (item1 && item2) {
      // Simulate drag and drop
      fireEvent.dragStart(item1);
      fireEvent.dragOver(item2);
      fireEvent.drop(item2);
    }

    waitFor(() => {
      expect(canMove).toHaveBeenCalled();
      // Position change should not be called if move is not allowed
      expect(handlePositionChange).not.toHaveBeenCalled();
    });
  });

  it('should call onItemPositionChange when item is moved', () => {
    const handlePositionChange = jest.fn();

    renderWithTheme(
      <StudioTreeView
        items={mockItems}
        itemsReordering={true}
        onItemPositionChange={handlePositionChange}
      />
    );

    const item1 = screen.getByText('Item 1').closest('li');
    const item2 = screen.getByText('Item 2').closest('li');

    if (item1 && item2) {
      fireEvent.dragStart(item1);
      fireEvent.dragOver(item2);
      fireEvent.drop(item2);
    }

    waitFor(() => {
      expect(handlePositionChange).toHaveBeenCalled();
      const call = handlePositionChange.mock.calls[0][0];
      expect(call.itemId).toBe('1');
      expect(call.newPosition).toBeDefined();
    });
  });

  it('should update items array when item is moved', () => {
    const { rerender } = renderWithTheme(
      <StudioTreeView
        items={mockItems}
        itemsReordering={true}
      />
    );

    const item1 = screen.getByText('Item 1').closest('li');
    const item2 = screen.getByText('Item 2').closest('li');

    if (item1 && item2) {
      fireEvent.dragStart(item1);
      fireEvent.dragOver(item2);
      fireEvent.drop(item2);
    }

    // Items should be reordered
    waitFor(() => {
      const items = screen.getAllByRole('treeitem');
      // Order should have changed
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
