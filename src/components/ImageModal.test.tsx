import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ImageModal, { clampCaption } from './ImageModal';

const similarState = vi.hoisted(() => ({
  photos: [
    { id: 'sim-1', fileName: 'sim.webp', albumId: null, albumName: null, url: 'sim.webp', thumbnailUrl: null, caption: 'Similar frame', description: null, rating: 8, width: 1200, height: 800, tags: ['x'] },
  ],
}));

vi.mock('../hooks/useDiscovery', () => ({
  useSimilarPhotos: () => ({
    photos: similarState.photos,
    loading: false,
    error: null,
  }),
}));

vi.mock('react-icons/io5', () => ({
  IoClose: () => <span>close</span>,
  IoChevronBack: () => <span>back</span>,
  IoChevronForward: () => <span>forward</span>,
  IoExpand: () => <span>expand</span>,
  IoContract: () => <span>contract</span>,
}));

describe('ImageModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders the image and close control', () => {
    const onClose = vi.fn();

    render(
      <ImageModal imageUrl="test.jpg" onClose={onClose} />
    );

    expect(screen.getByAltText('Full size view')).toBeInTheDocument();
    expect(screen.getByLabelText('Close image')).toBeInTheDocument();
  });

  it('calls close when escape is pressed', () => {
    const onClose = vi.fn();

    render(
      <ImageModal imageUrl="test.jpg" onClose={onClose} />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    vi.runAllTimers();
    expect(onClose).toHaveBeenCalled();
  });

  it('calls next and prev navigation handlers', () => {
    const onClose = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();

    render(
      <ImageModal imageUrl="test.jpg" totalImages={3} onClose={onClose} onNext={onNext} onPrev={onPrev} />
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'ArrowLeft' });

    expect(onNext).toHaveBeenCalled();
    expect(onPrev).toHaveBeenCalled();
  });

  it('switches to a similar photo and hides the album controls', () => {
    const onClose = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();

    render(
      <ImageModal
        imageUrl="test.jpg"
        imageIndex={2}
        totalImages={3}
        caption="Original frame"
        photoId="p1"
        onClose={onClose}
        onNext={onNext}
        onPrev={onPrev}
      />
    );

    expect(screen.getByText('02 / 03')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View similar photo sim.webp' }));

    expect(screen.getByAltText('Similar frame')).toBeInTheDocument();
    expect(screen.getByText('Photograph')).toBeInTheDocument();
    expect(screen.queryByText('02 / 03')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNext).not.toHaveBeenCalled();
  });

  it('renders a short caption without internal tags', () => {
    const onClose = vi.fn();

    render(
      <ImageModal imageUrl="test.jpg" caption="Storm over the Mournes" tags={["nature", "landscape"]} onClose={onClose} />
    );

    expect(screen.getByText('Storm over the Mournes')).toBeInTheDocument();
    expect(screen.queryByText('nature')).not.toBeInTheDocument();
    expect(screen.queryByText('landscape')).not.toBeInTheDocument();
  });

  describe('clampCaption', () => {
    it('returns null for empty captions', () => {
      expect(clampCaption(null)).toBeNull();
      expect(clampCaption(undefined)).toBeNull();
      expect(clampCaption('   ')).toBeNull();
    });

    it('keeps short captions unchanged', () => {
      expect(clampCaption('Storm over the Mournes')).toBe('Storm over the Mournes');
    });

    it('truncates long captions to the limit with an ellipsis', () => {
      const long = 'A'.repeat(200);
      const result = clampCaption(long);
      expect(result).toBe(`${'A'.repeat(80)}…`);
      expect(result!.length).toBe(81);
    });

    it('does not leave trailing whitespace before the ellipsis', () => {
      const result = clampCaption('a '.repeat(50));
      expect(result!.endsWith('…')).toBe(true);
      expect(result!.endsWith(' …')).toBe(false);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
