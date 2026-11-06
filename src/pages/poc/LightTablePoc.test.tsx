import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LightTablePoc from './LightTablePoc';
import { getStaticSeries } from './useArchiveSeries';

const archiveState = vi.hoisted(() => ({
  series: [] as import('./useArchiveSeries').ArchiveSeries[],
  loading: false,
  error: null as string | null,
  retry: vi.fn(),
}));

vi.mock('./useArchiveSeries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./useArchiveSeries')>();
  return {
    ...actual,
    useArchiveSeries: () => archiveState,
  };
});

vi.mock('../../hooks/useDiscovery', () => ({
  useHighlights: () => ({ photos: [], loading: false, error: null }),
}));

const SERIES = getStaticSeries();

function renderPoc() {
  return render(
    <MemoryRouter>
      <LightTablePoc />
    </MemoryRouter>,
  );
}

describe('LightTablePoc', () => {
  beforeEach(() => {
    archiveState.series = SERIES;
    archiveState.loading = false;
    archiveState.error = null;
    archiveState.retry.mockClear();
  });

  it('shows a connecting screen while the archive loads', () => {
    archiveState.series = [];
    archiveState.loading = true;
    renderPoc();

    expect(screen.getByRole('heading', { name: 'Connecting to the archive.' })).toBeInTheDocument();
  });

  it('shows a retry screen when the archive fails', () => {
    archiveState.series = [];
    archiveState.error = 'Could not reach the archive.';
    renderPoc();

    expect(screen.getByRole('heading', { name: 'Could not reach the archive.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(archiveState.retry).toHaveBeenCalled();
  });

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
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 });
  });

  it('closes a series from the close button', async () => {
    const series = SERIES[1];
    renderPoc();

    fireEvent.click(screen.getAllByRole('button', { name: `Open ${series.title} series` })[0]);
    fireEvent.click(await screen.findByRole('button', { name: 'Close' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), { timeout: 3000 });
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

  it('renders the static hero and light table', () => {
    renderPoc();

    expect(screen.getByAltText('Pai Canyon after rain, Thailand')).toBeInTheDocument();
    expect(screen.getByTestId('light-table')).toBeInTheDocument();
  });
});
