import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import SizeSlider, { loadThumbSize, saveThumbSize, thumbSizePixels } from './SizeSlider';

describe('SizeSlider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the current value as a percentage', () => {
    render(<SizeSlider value={40} onChange={() => undefined} />);
    expect(screen.getByRole('slider', { name: 'Thumbnail size' })).toHaveValue('40');
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('emits the new value on change', () => {
    const onChange = vi.fn();
    render(<SizeSlider value={50} onChange={onChange} />);

    fireEvent.change(screen.getByRole('slider', { name: 'Thumbnail size' }), { target: { value: '80' } });

    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('loads a stored value from localStorage', () => {
    saveThumbSize(35);
    expect(loadThumbSize()).toBe(35);
  });

  it('falls back to the default when nothing is stored', () => {
    expect(loadThumbSize()).toBe(50);
    expect(loadThumbSize(25)).toBe(25);
  });

  it('clamps invalid stored values', () => {
    saveThumbSize(999);
    expect(loadThumbSize()).toBe(100);
    saveThumbSize(1);
    expect(loadThumbSize()).toBe(20);
    saveThumbSize(Number.NaN);
    expect(loadThumbSize()).toBe(50);
  });

  it('persists changes to localStorage', () => {
    saveThumbSize(70);
    expect(window.localStorage.getItem('admin.library.thumbSize')).toBe('70');
  });

  it('maps the slider to a pixel size', () => {
    expect(thumbSizePixels(20)).toBe(121);
    expect(thumbSizePixels(100)).toBe(352);
    expect(thumbSizePixels(999)).toBe(352);
  });
});
