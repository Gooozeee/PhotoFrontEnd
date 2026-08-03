import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContextMenu from './ContextMenu';

describe('ContextMenu', () => {
  it('renders menu items and invokes their onClick', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <ContextMenu
        x={100}
        y={80}
        onClose={onClose}
        items={[
          { label: 'Open' },
          { label: 'Delete', danger: true, onClick },
        ]}
      />
    );

    expect(screen.getByRole('menuitem', { name: 'Open' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick for disabled items', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    render(
      <ContextMenu x={0} y={0} onClose={onClose} items={[{ label: 'Move', disabled: true, onClick }]} />
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Move' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<ContextMenu x={0} y={0} onClose={onClose} items={[{ label: 'Open' }]} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on outside pointerdown', () => {
    const onClose = vi.fn();
    const { container } = render(
      <div>
        <div data-testid="outside" />
        <ContextMenu x={0} y={0} onClose={onClose} items={[{ label: 'Open' }]} />
      </div>
    );

    fireEvent.pointerDown(screen.getByTestId('outside'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(container).toBeTruthy();
  });

  it('does not close on a click inside the menu', () => {
    const onClose = vi.fn();
    render(<ContextMenu x={0} y={0} onClose={onClose} items={[{ label: 'Open' }]} />);

    fireEvent.pointerDown(screen.getByRole('menuitem', { name: 'Open' }));

    expect(onClose).not.toHaveBeenCalled();
  });
});
