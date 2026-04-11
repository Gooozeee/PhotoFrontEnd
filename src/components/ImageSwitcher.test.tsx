import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageSwitcher from './ImageSwitcher';

describe('ImageSwitcher', () => {
  it('renders the first image and all image placeholders', () => {
    render(<ImageSwitcher images={['one.webp', 'two.webp']} />);

    expect(screen.getByAltText('Image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Image 2')).toBeInTheDocument();
  });

  it('advances the image on interval', () => {
    vi.useFakeTimers();

    render(<ImageSwitcher images={['one.webp', 'two.webp']} />);
    expect(screen.getByAltText('Image 1')).toHaveClass('opacity-100');

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByAltText('Image 1')).toHaveClass('opacity-0');
    expect(screen.getByAltText('Image 2')).toHaveClass('opacity-100');

    vi.useRealTimers();
  });
});
