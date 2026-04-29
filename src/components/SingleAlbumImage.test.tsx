import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SingleAlbumImage from './SingleAlbumImage';

vi.mock('./ImageModal', () => ({
  default: () => <div>modal</div>,
}));

describe('SingleAlbumImage', () => {
  it('opens the standalone modal when clicked', () => {
    render(
      <SingleAlbumImage
        imageSource="/images/test.webp"
        imageDescription="Test image"
        unitWidth={1}
        unitHeight={1}
        useUnitSizing={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /test image/i }));
    expect(screen.getByText('modal')).toBeInTheDocument();
  });

  it('hides the visible caption when no description is provided', () => {
    render(
      <SingleAlbumImage
        imageSource="/images/IMG_7886.jpg"
        imageDescription={null}
        imageIndex={0}
        unitWidth={1}
        unitHeight={1}
        useUnitSizing={false}
      />
    );

    expect(screen.getByRole('button', { name: 'View image 1' })).toBeInTheDocument();
    expect(screen.queryByText('IMG_7886.jpg')).not.toBeInTheDocument();
  });
});
