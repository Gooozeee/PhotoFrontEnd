import { describe, it, expect } from 'vitest';
import { aspectRatioOf, cappedAspectRatio, getHighlightRows, MAX_HIGHLIGHT_ASPECT } from './getHighlightRows';

function photo(id: string, width: number, height: number) {
  return { id, width, height };
}

describe('aspectRatioOf', () => {
  it('returns the width over height ratio', () => {
    expect(aspectRatioOf(photo('a', 1200, 800))).toBe(1.5);
  });

  it('returns the fallback for missing or degenerate photos', () => {
    expect(aspectRatioOf(null)).toBe(1.5);
    expect(aspectRatioOf(undefined)).toBe(1.5);
    expect(aspectRatioOf(photo('a', 0, 0))).toBe(1.5);
    expect(aspectRatioOf(photo('a', 1200, 0), 2)).toBe(2);
  });

  it('caps extra-wide photos for highlight layout sizing', () => {
    expect(cappedAspectRatio(photo('pano', 4000, 1000))).toBe(MAX_HIGHLIGHT_ASPECT);
    expect(cappedAspectRatio(photo('landscape', 1200, 800))).toBe(1.5);
  });
});

describe('getHighlightRows', () => {
  it('returns an empty array when there are no photos', () => {
    expect(getHighlightRows([], 1400, 800)).toEqual([]);
  });

  it('returns an empty array for invalid container dimensions', () => {
    expect(getHighlightRows([photo('a', 1200, 800)], 0, 800)).toEqual([]);
    expect(getHighlightRows([photo('a', 1200, 800)], 1400, 0)).toEqual([]);
  });

  it('fills wide screens with three landscape photos per row', () => {
    const photos = Array.from({ length: 8 }, (_, index) => photo(`p${index}`, 1200, 800));
    const rows = getHighlightRows(photos, 1400, 800);

    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.length).toBe(3);
    }
  });

  it('uses fewer images per row on narrow screens to reduce cropping', () => {
    const photos = Array.from({ length: 8 }, (_, index) => photo(`p${index}`, 1200, 800));
    const rows = getHighlightRows(photos, 375, 550);

    for (const row of rows) {
      expect(row.length).toBeLessThanOrEqual(2);
    }
  });

  it('packs portrait photos more densely on wide screens', () => {
    const photos = Array.from({ length: 12 }, (_, index) => photo(`p${index}`, 800, 1200));
    const rows = getHighlightRows(photos, 1400, 800);

    for (const row of rows) {
      expect(row.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('keeps a single photo in a single row', () => {
    const rows = getHighlightRows([photo('a', 1200, 800)], 1400, 800);

    expect(rows.length).toBe(1);
    expect(rows[0]).toHaveLength(1);
  });

  it('groups mixed orientations into balanced rows', () => {
    const photos = [
      photo('l1', 1200, 800),
      photo('p1', 800, 1200),
      photo('l2', 1200, 800),
      photo('p2', 800, 1200),
      photo('l3', 1200, 800),
      photo('p3', 800, 1200),
    ];
    const rows = getHighlightRows(photos, 1400, 800);

    expect(rows.length).toBe(2);
    expect(rows.flat().length).toBe(photos.length);
  });

  it('falls back to a single row when captions exceed the row height', () => {
    const rows = getHighlightRows([photo('a', 1200, 800)], 1400, 40, { captionHeight: 60 });

    expect(rows.length).toBe(1);
    expect(rows[0]).toHaveLength(1);
  });

  it('honours explicit options like wider gaps', () => {
    const photos = Array.from({ length: 8 }, (_, index) => photo(`p${index}`, 1200, 800));
    const rows = getHighlightRows(photos, 1400, 800, { itemGap: 24, rowGap: 24 });

    expect(rows.length).toBe(2);
  });
});
