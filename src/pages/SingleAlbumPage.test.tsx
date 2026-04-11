import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SingleAlbumPage from './SingleAlbumPage';

const useImageGalleryMock = vi.hoisted(() => ({
  images: [
    {
      id: '1',
      url: '/images/alpha.webp',
      blurPlaceholder: 'blur-1',
      unitWidth: 1,
      unitHeight: 1,
    },
    {
      id: '2',
      url: '/images/bravo.webp',
      blurPlaceholder: 'blur-2',
      unitWidth: 1,
      unitHeight: 1,
    },
  ],
}));

vi.mock('../hooks/useImageGallery', () => ({
  useImageGallery: () => ({
    images: useImageGalleryMock.images,
    loading: false,
    error: null,
    hasMore: false,
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
});
