import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SimilarPhotosRow from './SimilarPhotosRow';

const similarState = vi.hoisted(() => ({
  photos: [
    { id: 's1', fileName: 'similar-a.jpg', url: 'similar-a.webp', thumbnailUrl: null, caption: null, description: null, rating: null, width: 800, height: 600, tags: [], albumId: null },
    { id: 's2', fileName: 'similar-b.jpg', url: 'similar-b.webp', thumbnailUrl: null, caption: null, description: null, rating: null, width: 800, height: 600, tags: [], albumId: null },
  ],
  loading: false,
}));

vi.mock('../hooks/useDiscovery', () => ({
  useSimilarPhotos: () => ({
    photos: similarState.photos,
    loading: similarState.loading,
    error: null,
  }),
}));

describe('SimilarPhotosRow', () => {
  it('renders nothing while loading', () => {
    similarState.loading = true;
    const { container } = render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the similar photos row', () => {
    similarState.loading = false;
    render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);

    expect(screen.getByText('Similar photos')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('calls onSelect with the clicked photo id', () => {
    const onSelect = vi.fn();
    render(<SimilarPhotosRow photoId="p1" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo similar-a.jpg' }));

    expect(onSelect).toHaveBeenCalledWith('s1');
  });
});
