/**
 * @fileoverview Unit Tests for HandyTreeItem Component
 *
 * This test suite covers the HandyTreeItem component functionality:
 *
 * Basic Rendering:
 *   - should render tree item with label
 *   - should render with correct itemId
 *   - should render with correct level
 *   - should render children when expanded
 *   - should not render children when collapsed
 *
 * State Props:
 *   - should render expanded state
 *   - should render selected state
 *   - should render focused state
 *   - should render disabled state
 *   - should render hovered state
 *
 * Expansion:
 *   - should show expansion icon when hasChildren is true
 *   - should not show expansion icon when hasChildren is false
 *   - should call onExpansionToggle when expansion icon is clicked
 *   - should not call onExpansionToggle when disabled
 *   - should rotate expansion icon based on expanded state
 *
 * Selection:
 *   - should show checkbox when checkboxSelection is enabled
 *   - should not show checkbox when checkboxSelection is disabled
 *   - should reflect selected state in checkbox
 *   - should disable checkbox when item is disabled
 *
 * Event Handlers:
 *   - should call onClick when clicked
 *   - should not call onClick when disabled
 *   - should call onDoubleClick when double-clicked
 *   - should not call onDoubleClick when disabled
 *   - should call onContextMenu when right-clicked
 *   - should not call onContextMenu when disabled
 *   - should call onMouseEnter when mouse enters
 *   - should not call onMouseEnter when disabled
 *   - should call onMouseLeave when mouse leaves
 *   - should call onFocus when focused
 *   - should not call onFocus when disabled
 *
 * Label Editing:
 *   - should show input field when editing is true
 *   - should show label when editing is false
 *   - should call onLabelEdit when Enter is pressed
 *   - should call onLabelEditCancel when Escape is pressed
 *   - should call onLabelEdit on blur with trimmed value
 *   - should reset edit value when label prop changes
 *   - should focus and select input when editing starts
 *
 * Loading and Error States:
 *   - should show loading indicator when loading is true
 *   - should show custom loading indicator when provided
 *   - should show error indicator when error is present
 *   - should show custom error indicator when provided
 *   - should show error message when error is present
 *
 * Custom Icons:
 *   - should render custom icon when provided
 *   - should not render icon when not provided
 *
 * Drag and Drop:
 *   - should be draggable when itemsReordering and reorderable are true
 *   - should not be draggable when disabled
 *   - should call onDragStart when drag starts
 *   - should not call onDragStart when not reorderable
 *   - should call onDragEnd when drag ends
 *   - should call onDragOver when item is dragged over
 *   - should call onDrop when item is dropped
 *   - should set dataTransfer data on drag start
 *   - should show dragging opacity when dragging
 *   - should show dragOver background when dragOver
 *
 * ARIA Attributes:
 *   - should have correct ARIA attributes
 *   - should have aria-expanded when hasChildren
 *   - should have aria-selected when selected
 *   - should have aria-disabled when disabled
 *   - should have correct aria-level
 *   - should have aria-posinset and aria-setsize when provided
 *
 * Expansion Trigger:
 *   - should set data-expansion-trigger on content when expansionTrigger is content
 *   - should set data-expansion-trigger on icon when expansionTrigger is iconContainer
 *
 * Animation:
 *   - should use Collapse component when animateExpansion is true
 *   - should not use Collapse component when animateExpansion is false
 *
 * @author Scott Davis
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { HandyTreeItem } from '../src/components/HandyTreeView/HandyTreeItem';
import { createDataTransfer } from './HandyTreeView.test-utils';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('HandyTreeItem', () => {
  describe('Basic Rendering', () => {
    it('should render tree item with label', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should render with correct itemId', () => {
      renderWithTheme(
        <HandyTreeItem itemId="test-id" label="Test Item" level={0} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('id', 'test-id');
    });

    it('should render with correct level', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={2} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-level', '3'); // level + 1
    });

    it('should render children when expanded', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Parent"
          level={0}
          hasChildren={true}
          expanded={true}
        >
          <div>Child Content</div>
        </HandyTreeItem>
      );

      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should not render children when collapsed', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Parent"
          level={0}
          hasChildren={true}
          expanded={false}
          animateExpansion={false}
        >
          <div>Child Content</div>
        </HandyTreeItem>
      );

      // When animateExpansion is false and expanded is false, children should not be rendered
      expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    });
  });

  describe('State Props', () => {
    it('should render expanded state', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-expanded', 'true');
    });

    it('should render selected state', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} selected={true} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('should render focused state', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} focused={true} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('tabIndex', '0');
    });

    it('should render disabled state', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} disabled={true} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('should render hovered state', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} hovered={true} />
      );

      // Hovered state affects styling, which is harder to test directly
      // But we can verify the prop is accepted
      const item = screen.getByRole('treeitem');
      expect(item).toBeInTheDocument();
    });
  });

  describe('Expansion', () => {
    it('should show expansion icon when hasChildren is true', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
        />
      );

      // There are multiple buttons (content + icon), so get all and find the icon button
      const buttons = screen.getAllByRole('button');
      const iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      expect(iconButton).toBeInTheDocument();
    });

    it('should not show expansion icon when hasChildren is false', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={false}
        />
      );

      // Should have a spacer instead - only the content button should exist
      const buttons = screen.getAllByRole('button');
      // Only the content button (with data-expansion-trigger="true") should exist
      const iconButtons = buttons.filter(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      expect(iconButtons.length).toBe(0);
    });

    it('should call onExpansionToggle when expansion icon is clicked', () => {
      const handleExpansionToggle = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          onExpansionToggle={handleExpansionToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      fireEvent.click(iconButton!);

      expect(handleExpansionToggle).toHaveBeenCalledTimes(1);
    });

    it('should not call onExpansionToggle when disabled', () => {
      const handleExpansionToggle = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          disabled={true}
          onExpansionToggle={handleExpansionToggle}
        />
      );

      const buttons = screen.getAllByRole('button');
      const iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      fireEvent.click(iconButton!);

      expect(handleExpansionToggle).not.toHaveBeenCalled();
    });

    it('should rotate expansion icon based on expanded state', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={false}
        />
      );

      let buttons = screen.getAllByRole('button');
      let iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      expect(iconButton).toHaveStyle({ transform: 'rotate(-90deg)' });

      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeItem
            itemId="1"
            label="Test Item"
            level={0}
            hasChildren={true}
            expanded={true}
          />
        </ThemeProvider>
      );

      buttons = screen.getAllByRole('button');
      iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'false');
      expect(iconButton).toHaveStyle({ transform: 'rotate(0deg)' });
    });
  });

  describe('Selection', () => {
    it('should show checkbox when checkboxSelection is enabled', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          checkboxSelection={true}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should not show checkbox when checkboxSelection is disabled', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          checkboxSelection={false}
        />
      );

      const checkbox = screen.queryByRole('checkbox');
      expect(checkbox).not.toBeInTheDocument();
    });

    it('should reflect selected state in checkbox', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          checkboxSelection={true}
          selected={true}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });

    it('should disable checkbox when item is disabled', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          checkboxSelection={true}
          disabled={true}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox).toBeDisabled();
    });

    it('should have aria-label on checkbox', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          checkboxSelection={true}
        />
      );

      // Get checkbox directly - MUI Checkbox may set aria-label on the input element
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      
      // Check if aria-label is set (MUI might set it on the input element inside)
      const checkboxInput = checkbox.querySelector('input');
      if (checkboxInput) {
        expect(checkboxInput).toHaveAttribute('aria-label', 'Test Item');
      } else {
        // If no input element, check the checkbox itself
        expect(checkbox).toHaveAttribute('aria-label', 'Test Item');
      }
    });
  });

  describe('Event Handlers', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onClick={handleClick}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.click(content!);

      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleClick).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onClick when disabled', () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
          onClick={handleClick}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.click(content!);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should call onDoubleClick when double-clicked', () => {
      const handleDoubleClick = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onDoubleClick={handleDoubleClick}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.dblClick(content!);

      expect(handleDoubleClick).toHaveBeenCalledTimes(1);
      expect(handleDoubleClick).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onDoubleClick when disabled', () => {
      const handleDoubleClick = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
          onDoubleClick={handleDoubleClick}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.dblClick(content!);

      expect(handleDoubleClick).not.toHaveBeenCalled();
    });

    it('should call onContextMenu when right-clicked', () => {
      const handleContextMenu = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onContextMenu={handleContextMenu}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.contextMenu(content!);

      expect(handleContextMenu).toHaveBeenCalledTimes(1);
      expect(handleContextMenu).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onContextMenu when disabled', () => {
      const handleContextMenu = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
          onContextMenu={handleContextMenu}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.contextMenu(content!);

      expect(handleContextMenu).not.toHaveBeenCalled();
    });

    it('should call onMouseEnter when mouse enters', () => {
      const handleMouseEnter = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onMouseEnter={handleMouseEnter}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.mouseEnter(content!);

      expect(handleMouseEnter).toHaveBeenCalledTimes(1);
      expect(handleMouseEnter).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onMouseEnter when disabled', () => {
      const handleMouseEnter = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
          onMouseEnter={handleMouseEnter}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.mouseEnter(content!);

      expect(handleMouseEnter).not.toHaveBeenCalled();
    });

    it('should call onMouseLeave when mouse leaves', () => {
      const handleMouseLeave = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onMouseLeave={handleMouseLeave}
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      fireEvent.mouseLeave(content!);

      expect(handleMouseLeave).toHaveBeenCalledTimes(1);
      expect(handleMouseLeave).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should call onFocus when focused', () => {
      const handleFocus = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          onFocus={handleFocus}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.focus(item);

      expect(handleFocus).toHaveBeenCalledTimes(1);
      expect(handleFocus).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onFocus when disabled', () => {
      const handleFocus = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
          onFocus={handleFocus}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.focus(item);

      expect(handleFocus).not.toHaveBeenCalled();
    });
  });

  describe('Label Editing', () => {
    it('should show input field when editing is true', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={true}
        />
      );

      const input = screen.getByDisplayValue('Test Item');
      expect(input).toBeInTheDocument();
    });

    it('should show label when editing is false', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={false}
        />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.queryByDisplayValue('Test Item')).not.toBeInTheDocument();
    });

    it('should call onLabelEdit when Enter is pressed', () => {
      const handleLabelEdit = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={true}
          onLabelEdit={handleLabelEdit}
        />
      );

      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'New Label' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      expect(handleLabelEdit).toHaveBeenCalledWith('New Label');
    });

    it('should call onLabelEditCancel when Escape is pressed', () => {
      const handleLabelEditCancel = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={true}
          onLabelEditCancel={handleLabelEditCancel}
        />
      );

      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement;
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      expect(handleLabelEditCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onLabelEdit on blur with trimmed value', async () => {
      const handleLabelEdit = jest.fn();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={true}
          onLabelEdit={handleLabelEdit}
        />
      );

      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '  New Label  ' } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(handleLabelEdit).toHaveBeenCalledWith('New Label');
      });
    });

    it('should reset edit value when label prop changes', () => {
      const { rerender } = renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Original Label"
          level={0}
          editing={true}
        />
      );

      let input = screen.getByDisplayValue('Original Label') as HTMLInputElement;
      expect(input.value).toBe('Original Label');

      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeItem
            itemId="1"
            label="Updated Label"
            level={0}
            editing={true}
          />
        </ThemeProvider>
      );

      input = screen.getByDisplayValue('Updated Label') as HTMLInputElement;
      expect(input.value).toBe('Updated Label');
    });

    it('should focus and select input when editing starts', async () => {
      const { rerender } = renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          editing={false}
        />
      );

      rerender(
        <ThemeProvider theme={theme}>
          <HandyTreeItem
            itemId="1"
            label="Test Item"
            level={0}
            editing={true}
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        const input = screen.getByDisplayValue('Test Item') as HTMLInputElement;
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading indicator when loading is true', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} loading={true} />
      );

      // CircularProgress is rendered
      const progress = document.querySelector('.MuiCircularProgress-root');
      expect(progress).toBeInTheDocument();
    });

    it('should show custom loading indicator when provided', () => {
      const customIndicator = <div data-testid="custom-loading">Loading...</div>;
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          loading={true}
          loadingIndicator={customIndicator}
        />
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
    });

    it('should show error indicator when error is present', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          error="Error message"
        />
      );

      // ErrorOutline icon is rendered
      const errorIcon = document.querySelector('[data-testid="ErrorOutlineIcon"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should show custom error indicator when provided', () => {
      const customIndicator = <div data-testid="custom-error">Error!</div>;
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          error="Error message"
          errorIndicator={customIndicator}
        />
      );

      expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    });

    it('should show error message when error is present', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          error="Error message"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
    });
  });

  describe('Custom Icons', () => {
    it('should render custom icon when provided', () => {
      const customIcon = <div data-testid="custom-icon">Icon</div>;
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          icon={customIcon}
        />
      );

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should not render icon when not provided', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={0} />
      );

      expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should be draggable when itemsReordering and reorderable are true', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('draggable', 'true');
    });

    it('should not be draggable when disabled', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={true}
          disabled={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('draggable', 'false');
    });

    it('should call onDragStart when drag starts', () => {
      const handleDragStart = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={true}
          onDragStart={handleDragStart}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.dragStart(item, { dataTransfer });

      expect(handleDragStart).toHaveBeenCalledTimes(1);
      expect(handleDragStart).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should not call onDragStart when not reorderable', () => {
      const handleDragStart = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={false}
          onDragStart={handleDragStart}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.dragStart(item, { dataTransfer });

      expect(handleDragStart).not.toHaveBeenCalled();
    });

    it('should call onDragEnd when drag ends', () => {
      const handleDragEnd = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={true}
          onDragEnd={handleDragEnd}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.dragEnd(item, { dataTransfer });

      expect(handleDragEnd).toHaveBeenCalledTimes(1);
      expect(handleDragEnd).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should call onDragOver when item is dragged over', () => {
      const handleDragOver = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          onDragOver={handleDragOver}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.dragOver(item, { dataTransfer });

      expect(handleDragOver).toHaveBeenCalledTimes(1);
      expect(handleDragOver).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should call onDrop when item is dropped', () => {
      const handleDrop = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          itemsReordering={true}
          onDrop={handleDrop}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.drop(item, { dataTransfer });

      expect(handleDrop).toHaveBeenCalledTimes(1);
      expect(handleDrop).toHaveBeenCalledWith(
        expect.any(Object),
        '1'
      );
    });

    it('should set dataTransfer data on drag start', () => {
      const handleDragStart = jest.fn();
      const dataTransfer = createDataTransfer();
      renderWithTheme(
        <HandyTreeItem
          itemId="test-id"
          label="Test Item"
          level={0}
          itemsReordering={true}
          reorderable={true}
          onDragStart={handleDragStart}
        />
      );

      const item = screen.getByRole('treeitem');
      fireEvent.dragStart(item, { dataTransfer });

      expect(dataTransfer.getData('text/plain')).toBe('test-id');
    });

    it('should show dragging opacity when dragging', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          dragging={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveStyle({ opacity: '0.5' });
    });

    it('should show dragOver background when dragOver', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          dragOver={true}
        />
      );

      const item = screen.getByRole('treeitem');
      // The backgroundColor is set via theme, so we check the style attribute
      expect(item).toHaveStyle({ backgroundColor: expect.anything() });
    });
  });

  describe('ARIA Attributes', () => {
    it('should have correct ARIA attributes', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={true}
          selected={true}
          disabled={false}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('role', 'treeitem');
      expect(item).toHaveAttribute('id', '1');
      expect(item).toHaveAttribute('aria-expanded', 'true');
      expect(item).toHaveAttribute('aria-selected', 'true');
      expect(item).toHaveAttribute('aria-disabled', 'false');
      expect(item).toHaveAttribute('aria-level', '1');
    });

    it('should have aria-expanded when hasChildren', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={false}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not have aria-expanded when no children', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={false}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).not.toHaveAttribute('aria-expanded');
    });

    it('should have aria-selected when selected', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          selected={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-selected', 'true');
    });

    it('should have aria-disabled when disabled', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          disabled={true}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-disabled', 'true');
    });

    it('should have correct aria-level', () => {
      renderWithTheme(
        <HandyTreeItem itemId="1" label="Test Item" level={3} />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-level', '4'); // level + 1
    });

    it('should have aria-posinset and aria-setsize when provided', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          posInSet={2}
          setSize={5}
        />
      );

      const item = screen.getByRole('treeitem');
      expect(item).toHaveAttribute('aria-posinset', '2');
      expect(item).toHaveAttribute('aria-setsize', '5');
    });
  });

  describe('Expansion Trigger', () => {
    it('should set data-expansion-trigger on content when expansionTrigger is content', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          expansionTrigger="content"
        />
      );

      const content = screen.getByText('Test Item').closest('[role="button"]');
      expect(content).toHaveAttribute('data-expansion-trigger', 'true');
    });

    it('should set data-expansion-trigger on icon when expansionTrigger is iconContainer', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expansionTrigger="iconContainer"
        />
      );

      const buttons = screen.getAllByRole('button');
      const iconButton = buttons.find(btn => btn.getAttribute('data-expansion-trigger') === 'true');
      expect(iconButton).toBeInTheDocument();
      expect(iconButton).toHaveAttribute('data-expansion-trigger', 'true');
    });
  });

  describe('Animation', () => {
    it('should use Collapse component when animateExpansion is true', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={true}
          animateExpansion={true}
        >
          <div>Child</div>
        </HandyTreeItem>
      );

      // Collapse component renders with specific class
      const collapse = document.querySelector('.MuiCollapse-root');
      expect(collapse).toBeInTheDocument();
    });

    it('should not use Collapse component when animateExpansion is false', () => {
      renderWithTheme(
        <HandyTreeItem
          itemId="1"
          label="Test Item"
          level={0}
          hasChildren={true}
          expanded={true}
          animateExpansion={false}
        >
          <div>Child</div>
        </HandyTreeItem>
      );

      // No Collapse component, just a Box
      const collapse = document.querySelector('.MuiCollapse-root');
      expect(collapse).not.toBeInTheDocument();
    });
  });
});
