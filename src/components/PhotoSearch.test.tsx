import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PhotoSearch from './PhotoSearch';

const searchState = vi.hoisted(() => ({
  results: [
    { id: 'r1', fileName: 'snow.jpg', url: 'snow.webp', thumbnailUrl: null, caption: 'Fresh snow', description: null, rating: null, width: 800, height: 600, tags: [], albumId: null },
  ],
  loading: false,
  error: null as string | null,
  searched: false,
}));

vi.mock('../hooks/useDiscovery', () => ({
  usePhotoSearch: () => ({
    results: searchState.results,
    loading: searchState.loading,
    error: searchState.error,
    searched: searchState.searched,
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

describe('PhotoSearch', () => {
  it('renders a search input', () => {
    render(<PhotoSearch />);
    expect(screen.getByRole('searchbox', { name: 'Search photos' })).toBeInTheDocument();
  });

  it('shows results when a search has been performed', () => {
    searchState.searched = true;
    searchState.results = [
      { id: 'r1', fileName: 'snow.jpg', url: 'snow.webp', thumbnailUrl: null, caption: 'Fresh snow', description: null, rating: null, width: 800, height: 600, tags: [], albumId: null },
    ];
    render(<PhotoSearch />);

    expect(screen.getByRole('button', { name: 'View Fresh snow' })).toBeInTheDocument();
  });

  it('shows a no-results message when searched with no matches', () => {
    searchState.searched = true;
    searchState.results = [];
    render(<PhotoSearch />);

    expect(screen.getByText(/No matches for/)).toBeInTheDocument();
  });

  it('opens the modal when a result is selected', () => {
    searchState.results = [
      { id: 'r1', fileName: 'snow.jpg', url: 'snow.webp', thumbnailUrl: null, caption: 'Fresh snow', description: null, rating: null, width: 800, height: 600, tags: [], albumId: null },
    ];
    render(<PhotoSearch />);

    fireEvent.click(screen.getByRole('button', { name: 'View Fresh snow' }));

    expect(screen.getByText('modal')).toBeInTheDocument();
  });
});
