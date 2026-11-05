import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LightTablePoc from './LightTablePoc';

function renderPoc() {
  return render(
    <MemoryRouter>
      <LightTablePoc />
    </MemoryRouter>,
  );
}

describe('LightTablePoc', () => {
  it('renders the hero, light table and every series', async () => {
    renderPoc();

    expect(await screen.findByRole('heading', { name: /Michal\s*Guzy/i })).toBeInTheDocument();
    expect(screen.getByText('Selected work')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Open .* series/ })).toHaveLength(10);
  });

  it('opens a series and navigates it with the keyboard', async () => {
    renderPoc();

    fireEvent.click(screen.getAllByRole('button', { name: 'Open Kirkistown series' })[0]);

    expect(await screen.findByRole('dialog', { name: 'Kirkistown series' })).toBeInTheDocument();
    expect(screen.getByText('1 / 5')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(await screen.findByText('2 / 5')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes a series from the close button', async () => {
    renderPoc();

    fireEvent.click(screen.getAllByRole('button', { name: 'Open Rathlin series' })[0]);
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens a series from the mobile list and jumps to a frame', async () => {
    renderPoc();

    // The mobile list is rendered after the desktop light table.
    fireEvent.click(screen.getAllByRole('button', { name: 'Open Rathlin series' })[1]);

    expect(await screen.findByRole('dialog', { name: 'Rathlin series' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go to frame 3' }));

    expect(await screen.findByText('3 / 4')).toBeInTheDocument();
  });

  it('responds to pointer movement on the hero and light table', () => {
    renderPoc();

    fireEvent.pointerMove(screen.getByAltText('Pai Canyon after rain, Thailand'), { clientX: 40, clientY: 60 });
    fireEvent.pointerLeave(screen.getByAltText('Pai Canyon after rain, Thailand'));
    fireEvent.pointerMove(screen.getByTestId('light-table'), { clientX: 120, clientY: 80 });
    fireEvent.pointerLeave(screen.getByTestId('light-table'));

    expect(screen.getByTestId('hero-surface')).toBeInTheDocument();
  });
});
