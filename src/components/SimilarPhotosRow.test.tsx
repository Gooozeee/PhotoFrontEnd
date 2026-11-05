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
    similarState.loading = false;
  });

  it('renders the similar photos row', () => {
    render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);

    expect(screen.getByText('More like this')).toBeInTheDocument();
    expect(screen.getByText('2 frames')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('calls onSelect with the clicked photo id', () => {
    const onSelect = vi.fn();
    render(<SimilarPhotosRow photoId="p1" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo similar-a.jpg' }));

    expect(onSelect).toHaveBeenCalledWith('s1');
  });

  it('passes the full photo to onSelectPhoto', () => {
    const onSelectPhoto = vi.fn();
    render(<SimilarPhotosRow photoId="p1" onSelectPhoto={onSelectPhoto} />);

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo similar-b.jpg' }));

    expect(onSelectPhoto).toHaveBeenCalledWith(expect.objectContaining({ id: 's2', fileName: 'similar-b.jpg' }));
  });
});
