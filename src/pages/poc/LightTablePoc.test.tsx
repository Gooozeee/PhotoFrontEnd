import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import LightTablePoc from './LightTablePoc';
import { getStaticSeries } from './useArchiveSeries';

vi.mock('./useArchiveSeries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useArchiveSeries')>();
  return {
    ...actual,
    useArchiveSeries: () => ({ series: actual.getStaticSeries(), loading: false, error: null }),
  };
});

const SERIES = getStaticSeries();

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
    expect(screen.getAllByRole('button', { name: /Open .* series/ })).toHaveLength(SERIES.length * 2);
    expect(screen.getByRole('link', { name: /Landscapes/ })).toHaveAttribute('href', '/singleAlbum?album=Landscapes');
  });

  it('does not repeat an image within a series or across covers', () => {
    for (const series of SERIES) {
      expect(new Set(series.images).size).toBe(series.images.length);
    }

    expect(new Set(SERIES.map((series) => series.cover)).size).toBe(SERIES.length);
  });

  it('opens a series and navigates it with the keyboard', async () => {
    const series = SERIES[0];
    renderPoc();

    fireEvent.click(screen.getAllByRole('button', { name: `Open ${series.title} series` })[0]);

    expect(await screen.findByRole('dialog', { name: `${series.title} series` })).toBeInTheDocument();
    expect(screen.getByText(`1 / ${series.images.length}`)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(await screen.findByText(`2 / ${series.images.length}`)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes a series from the close button', async () => {
    const series = SERIES[1];
    renderPoc();

    fireEvent.click(screen.getAllByRole('button', { name: `Open ${series.title} series` })[0]);
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('opens a series from the mobile list and jumps to a frame', async () => {
    const series = SERIES[1];
    renderPoc();

    // The mobile list is rendered after the desktop light table.
    fireEvent.click(screen.getAllByRole('button', { name: `Open ${series.title} series` })[1]);

    expect(await screen.findByRole('dialog', { name: `${series.title} series` })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Go to frame 3' }));

    expect(await screen.findByText(`3 / ${series.images.length}`)).toBeInTheDocument();
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
