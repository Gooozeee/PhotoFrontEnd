import { describe, it, expect } from 'vitest';
import { getAlbumGridLayout } from './getAlbumGridLayout';

describe('getAlbumGridLayout', () => {
  it('uses a wider single/two column layout for tiny albums', () => {
    expect(getAlbumGridLayout(1)).toEqual({
      gridClassName: 'columns-1 sm:columns-2',
      maxWidthClassName: 'max-w-[900px]',
    });
  });

  it('keeps small albums tighter', () => {
    expect(getAlbumGridLayout(4)).toEqual({
      gridClassName: 'columns-1 sm:columns-2',
      maxWidthClassName: 'max-w-[1100px]',
    });
  });

  it('uses three columns for medium albums', () => {
    expect(getAlbumGridLayout(6)).toEqual({
      gridClassName: 'columns-1 sm:columns-2 lg:columns-3',
      maxWidthClassName: 'max-w-[1200px]',
    });
  });

  it('uses four columns for large albums', () => {
    expect(getAlbumGridLayout(12)).toEqual({
      gridClassName: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
      maxWidthClassName: 'max-w-[1600px]',
    });
  });
});
