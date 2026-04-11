import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GalleryBanner from './GalleryBanner';

vi.mock('../assets/Birds/Seagull Northern Ireland 2022.webp', () => ({ default: 'bird.webp' }));
vi.mock('../assets/Rally/Yellow Escort Pan Kirkistown 2023.webp', () => ({ default: 'rally.webp' }));
vi.mock('../assets/Cities/Aachen Germany 2022.webp', () => ({ default: 'city.webp' }));
vi.mock('../assets/Landscapes/Koh Tao 2023.webp', () => ({ default: 'landscape.webp' }));

vi.mock('./SingleAlbumImage', () => ({
  default: ({ albumName }: { albumName?: string }) => <div>{albumName ?? 'image'}</div>,
}));

describe('GalleryBanner', () => {
  it('renders the album list', () => {
    render(<GalleryBanner title="Image Gallery" />);

    expect(screen.getByText('Image Gallery')).toBeInTheDocument();
    expect(screen.getByText('Landscapes')).toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.getByText('Rally')).toBeInTheDocument();
    expect(screen.getByText('Birds')).toBeInTheDocument();
  });

  it('filters albums by category', () => {
    render(<GalleryBanner title="Image Gallery" />);

    fireEvent.click(screen.getByRole('button', { name: 'Urban' }));

    expect(screen.queryByText('Landscapes')).not.toBeInTheDocument();
    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.queryByText('Rally')).not.toBeInTheDocument();
    expect(screen.queryByText('Birds')).not.toBeInTheDocument();
  });
});
