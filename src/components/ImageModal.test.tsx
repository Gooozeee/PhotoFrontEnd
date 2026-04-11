import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImageModal from './ImageModal';

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

  afterEach(() => {
    vi.useRealTimers();
  });
});
