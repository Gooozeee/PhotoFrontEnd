import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HighlightsStrip from './HighlightsStrip';

const highlightsState = vi.hoisted(() => ({
  photos: [
    { id: 'h1', fileName: 'sunset.jpg', url: 'sunset.webp', thumbnailUrl: null, caption: 'Sunset over the bay', description: null, rating: 9, width: 1200, height: 800, tags: ['landscape'], albumId: null },
    { id: 'h2', fileName: 'portrait.jpg', url: 'portrait.webp', thumbnailUrl: null, caption: 'Portrait', description: null, rating: 8, width: 800, height: 1200, tags: ['portrait'], albumId: null },
  ],
  loading: false,
  error: null as string | null,
}));

vi.mock('../hooks/useDiscovery', () => ({
  useHighlights: () => ({
    photos: highlightsState.photos,
    loading: highlightsState.loading,
    error: highlightsState.error,
  }),
}));

vi.mock('./ImageModal', () => ({
  default: ({ caption, onClose }: { caption?: string | null; onClose: () => void }) => (
    <div>
      <span>modal</span>
      <span>{caption}</span>
      <button type="button" onClick={onClose}>close</button>
    </div>
  ),
  clampCaption: (value: string | null | undefined) => value ?? null,
}));

describe('HighlightsStrip', () => {
  beforeEach(() => {
    highlightsState.photos = [
      { id: 'h1', fileName: 'sunset.jpg', url: 'sunset.webp', thumbnailUrl: null, caption: 'Sunset over the bay', description: null, rating: 9, width: 1200, height: 800, tags: ['landscape'], albumId: null },
      { id: 'h2', fileName: 'portrait.jpg', url: 'portrait.webp', thumbnailUrl: null, caption: 'Portrait', description: null, rating: 8, width: 800, height: 1200, tags: ['portrait'], albumId: null },
    ];
    highlightsState.loading = false;
    highlightsState.error = null;
  });

  it('renders the two-row responsive gallery', () => {
    render(<HighlightsStrip />);

    expect(screen.getByText('Best images')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /View larger highlight/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/Images roll through the grid/)).toBeInTheDocument();
  });

  it('renders nothing when there are no highlights', () => {
    highlightsState.photos = [];
    const { container } = render(<HighlightsStrip />);

    expect(container).toBeEmptyDOMElement();
  });

  it('opens the modal when a photo is selected', () => {
    render(<HighlightsStrip />);

    fireEvent.click(screen.getAllByRole('button', { name: /View larger highlight/ })[0]);

    expect(screen.getByText('modal')).toBeInTheDocument();
  });

  it('closes the modal when close is pressed', () => {
    render(<HighlightsStrip />);

    fireEvent.click(screen.getAllByRole('button', { name: /View larger highlight/ })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(screen.queryByText('modal')).not.toBeInTheDocument();
  });
});
