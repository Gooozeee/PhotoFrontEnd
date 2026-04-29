import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SingleAlbumPage from './SingleAlbumPage';

const useImageGalleryMock = vi.hoisted(() => ({
  images: [
    {
      id: '1',
      url: '/images/alpha.webp',
      caption: 'Alpha',
      blurPlaceholder: 'blur-1',
      unitWidth: 1,
      unitHeight: 1,
    },
    {
      id: '2',
      url: '/images/bravo.webp',
      caption: 'Bravo',
      blurPlaceholder: 'blur-2',
      unitWidth: 1,
      unitHeight: 1,
    },
  ],
  loading: false,
  loadingMore: false,
  error: null as string | null,
  hasMore: false,
  totalCount: 2,
  loadMore: vi.fn(),
}));

vi.mock('../hooks/useImageGallery', () => ({
  useImageGallery: () => ({
    images: useImageGalleryMock.images,
    loading: useImageGalleryMock.loading,
    loadingMore: useImageGalleryMock.loadingMore,
    error: useImageGalleryMock.error,
    hasMore: useImageGalleryMock.hasMore,
    totalCount: useImageGalleryMock.totalCount,
    loadMore: useImageGalleryMock.loadMore,
  }),
}));

vi.mock('../components/SingleAlbumImage', () => ({
  default: ({ imageDescription, onImageClick, imageIndex }: any) => (
    <button type="button" onClick={() => onImageClick?.(imageIndex)}>
      {imageDescription}
    </button>
  ),
}));

vi.mock('../components/ImageModal', () => ({
  default: ({ imageUrl, onClose, onNext, onPrev }: any) => (
    <div>
      <span>{imageUrl}</span>
      <button onClick={onClose}>close</button>
      <button onClick={onNext}>next</button>
      <button onClick={onPrev}>prev</button>
    </div>
  ),
}));

vi.mock('../components/Footer', () => ({ default: () => <footer>footer</footer> }));

describe('SingleAlbumPage', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/singleAlbum?album=Birds');
    useImageGalleryMock.loading = false;
    useImageGalleryMock.loadingMore = false;
    useImageGalleryMock.error = null;
    useImageGalleryMock.hasMore = false;
    useImageGalleryMock.totalCount = 2;
    useImageGalleryMock.loadMore.mockReset();
    useImageGalleryMock.images = [
      {
        id: '1',
        url: '/images/alpha.webp',
        caption: 'Alpha',
        blurPlaceholder: 'blur-1',
        unitWidth: 1,
        unitHeight: 1,
      },
      {
        id: '2',
        url: '/images/bravo.webp',
        caption: 'Bravo',
        blurPlaceholder: 'blur-2',
        unitWidth: 1,
        unitHeight: 1,
      },
    ];
  });

  it('renders the album title and photos count', () => {
    render(<SingleAlbumPage />);

    expect(screen.getByText('Birds')).toBeInTheDocument();
    expect(screen.getByText('2 photos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alpha/i })).toBeInTheDocument();
  });

  it('opens the modal when an image is clicked', () => {
    render(<SingleAlbumPage />);

    fireEvent.click(screen.getByRole('button', { name: /alpha/i }));

    expect(screen.getByText('/images/alpha.webp')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'close' })).toBeInTheDocument();
  });

  it('navigates between images inside the modal', () => {
    render(<SingleAlbumPage />);

    fireEvent.click(screen.getByRole('button', { name: /alpha/i }));
    fireEvent.click(screen.getByRole('button', { name: 'next' }));

    expect(screen.getByText('/images/bravo.webp')).toBeInTheDocument();
  });

  it('shows the wake-up message while album images are loading', () => {
    useImageGalleryMock.loading = true;
    useImageGalleryMock.images = [];

    render(<SingleAlbumPage />);

    expect(screen.getByText('Waiting for the images to wake up...')).toBeInTheDocument();
  });

  it('shows progressive loading status for large collections', () => {
    useImageGalleryMock.hasMore = true;
    useImageGalleryMock.totalCount = 30;
    useImageGalleryMock.images = Array.from({ length: 24 }, (_, index) => ({
      id: String(index + 1),
      url: `/images/photo-${index + 1}.webp`,
      caption: `Photo ${index + 1}`,
      blurPlaceholder: `blur-${index + 1}`,
      unitWidth: 1,
      unitHeight: 1,
    }));

    render(<SingleAlbumPage />);

    expect(screen.getByRole('button', { name: /photo 24/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /photo 25/i })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 24 of 30 photos. More load as you scroll.')).toBeInTheDocument();
  });

  it('shows the loading more state while a later page is loading', () => {
    useImageGalleryMock.loadingMore = true;
    useImageGalleryMock.hasMore = true;
    useImageGalleryMock.totalCount = 30;
    useImageGalleryMock.images = Array.from({ length: 24 }, (_, index) => ({
      id: String(index + 1),
      url: `/images/photo-${index + 1}.webp`,
      caption: `Photo ${index + 1}`,
      blurPlaceholder: `blur-${index + 1}`,
      unitWidth: 1,
      unitHeight: 1,
    }));

    render(<SingleAlbumPage />);

    expect(screen.getByText('Loading more photos...')).toBeInTheDocument();
  });

  it('shows a clear invalid album message for broken album links', () => {
    window.history.pushState({}, '', '/singleAlbum?album=Missing');
    useImageGalleryMock.images = [];
    useImageGalleryMock.totalCount = 0;
    useImageGalleryMock.error = 'Album "Missing" was not found.';

    render(<SingleAlbumPage />);

    expect(screen.getByText('Album not found')).toBeInTheDocument();
    expect(screen.getByText('Album "Missing" was not found.')).toBeInTheDocument();
    expect(screen.getByText('Invalid album link')).toBeInTheDocument();
  });
});
