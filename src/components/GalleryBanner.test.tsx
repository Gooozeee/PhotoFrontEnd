import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GalleryBanner from './GalleryBanner';

const galleryState = vi.hoisted(() => ({
  albums: [
    { id: '1', name: 'Landscapes', coverThumbnailUrl: 'landscape.webp', coverUrl: 'landscape-full.webp' },
    { id: '2', name: 'Cities', coverThumbnailUrl: 'city.webp', coverUrl: 'city-full.webp' },
    { id: '3', name: 'Rally', coverThumbnailUrl: 'rally.webp', coverUrl: 'rally-full.webp' },
    { id: '4', name: 'Birds', coverThumbnailUrl: 'bird.webp', coverUrl: 'bird-full.webp' },
  ],
  loading: false,
  error: null as string | null,
}));

vi.mock('../hooks/useImageGallery', () => ({
  useImageGallery: () => ({
    albums: galleryState.albums,
    images: [],
    loading: galleryState.loading,
    error: galleryState.error,
    hasMore: false,
    loadMore: vi.fn(),
    clearCache: vi.fn(),
  }),
}));

vi.mock('./SingleAlbumImage', () => ({
  default: ({ albumName }: { albumName?: string }) => <div>{albumName ?? 'image'}</div>,
}));

describe('GalleryBanner', () => {
  it('shows a wake-up message while albums are loading', () => {
    galleryState.albums = [];
    galleryState.loading = true;

    render(<GalleryBanner title="Image Gallery" />);

    expect(screen.getByText('Waiting for the images to wake up...')).toBeInTheDocument();

    galleryState.albums = [
      { id: '1', name: 'Landscapes', coverThumbnailUrl: 'landscape.webp', coverUrl: 'landscape-full.webp' },
      { id: '2', name: 'Cities', coverThumbnailUrl: 'city.webp', coverUrl: 'city-full.webp' },
      { id: '3', name: 'Rally', coverThumbnailUrl: 'rally.webp', coverUrl: 'rally-full.webp' },
      { id: '4', name: 'Birds', coverThumbnailUrl: 'bird.webp', coverUrl: 'bird-full.webp' },
    ];
    galleryState.loading = false;
  });

  it('renders the album list', () => {
    render(<GalleryBanner title="Image Gallery" />);

    expect(screen.getByText('Image Gallery')).toBeInTheDocument();
    expect(screen.getAllByText('Landscapes').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cities').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rally').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Birds').length).toBeGreaterThan(0);
  });

  it('filters albums by category', () => {
    render(<GalleryBanner title="Image Gallery" />);

    fireEvent.click(screen.getByRole('button', { name: 'Cities' }));

    expect(screen.getAllByText('Cities').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Landscapes' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Rally' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Birds' })).not.toBeInTheDocument();
  });

  it('renders an all albums filter', () => {
    render(<GalleryBanner title="Image Gallery" />);

    expect(screen.getByRole('button', { name: 'All albums' })).toBeInTheDocument();
  });
});
