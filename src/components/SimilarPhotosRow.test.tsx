import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import SimilarPhotosRow from './SimilarPhotosRow';

type TestPhoto = {
  id: string;
  fileName: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  description: string | null;
  rating: number | null;
  width: number;
  height: number;
  tags: string[];
  albumId: string | null;
};

function makePhoto(id: string, albumId: string | null): TestPhoto {
  return {
    id,
    fileName: `${id}.jpg`,
    url: `${id}.webp`,
    thumbnailUrl: null,
    caption: null,
    description: null,
    rating: null,
    width: 800,
    height: 600,
    tags: [],
    albumId,
  };
}

const similarState = vi.hoisted(() => ({
  photos: [] as TestPhoto[],
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
  beforeEach(() => {
    similarState.photos = [makePhoto('similar-a', 'a'), makePhoto('similar-b', 'a')];
    similarState.loading = false;
  });

  it('renders nothing while loading', () => {
    similarState.loading = true;
    const { container } = render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the similar photos row with the swap hint', () => {
    render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);

    expect(screen.getByText('More like this')).toBeInTheDocument();
    expect(screen.getByText('Click to swap')).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('marks the selected frame and offers a way back to the original', () => {
    const onReset = vi.fn();
    render(<SimilarPhotosRow photoId="p1" selectedId="similar-a" onReset={onReset} />);

    expect(screen.getByRole('button', { name: 'View similar photo similar-a.jpg' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'View similar photo similar-b.jpg' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Back to original' }));
    expect(onReset).toHaveBeenCalled();
  });

  it('calls onSelect with the clicked photo id', () => {
    const onSelect = vi.fn();
    render(<SimilarPhotosRow photoId="p1" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo similar-a.jpg' }));

    expect(onSelect).toHaveBeenCalledWith('similar-a');
  });

  it('passes the full photo to onSelectPhoto', () => {
    const onSelectPhoto = vi.fn();
    render(<SimilarPhotosRow photoId="p1" onSelectPhoto={onSelectPhoto} />);

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo similar-b.jpg' }));

    expect(onSelectPhoto).toHaveBeenCalledWith(expect.objectContaining({ id: 'similar-b', fileName: 'similar-b.jpg' }));
  });

  it('mixes in other albums after the closest frames', () => {
    similarState.photos = [
      makePhoto('a1', 'a'),
      makePhoto('a2', 'a'),
      makePhoto('a3', 'a'),
      makePhoto('a4', 'a'),
      makePhoto('b1', 'b'),
      makePhoto('b2', 'b'),
      makePhoto('b3', 'b'),
      makePhoto('b4', 'b'),
      makePhoto('c1', 'c'),
      makePhoto('c2', 'c'),
      makePhoto('c3', 'c'),
      makePhoto('c4', 'c'),
    ];

    render(<SimilarPhotosRow photoId="p1" onSelect={vi.fn()} />);

    const labels = screen.getAllByRole('button').map((button) => button.getAttribute('aria-label'));
    expect(labels).toEqual([
      'View similar photo a1.jpg',
      'View similar photo a2.jpg',
      'View similar photo a3.jpg',
      'View similar photo a4.jpg',
      'View similar photo b1.jpg',
      'View similar photo c1.jpg',
      'View similar photo b2.jpg',
      'View similar photo c2.jpg',
    ]);
  });
});
