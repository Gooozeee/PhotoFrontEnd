export function getAlbumGridLayout(imageCount: number): {
  gridClassName: string;
  maxWidthClassName: string;
} {
  if (imageCount <= 2) {
    return {
      gridClassName: 'columns-1 sm:columns-2',
      maxWidthClassName: 'max-w-[900px]',
    };
  }

  if (imageCount <= 4) {
    return {
      gridClassName: 'columns-1 sm:columns-2',
      maxWidthClassName: 'max-w-[1100px]',
    };
  }

  if (imageCount <= 6) {
    return {
      gridClassName: 'columns-1 sm:columns-2 lg:columns-3',
      maxWidthClassName: 'max-w-[1200px]',
    };
  }

  if (imageCount <= 10) {
    return {
      gridClassName: 'columns-1 sm:columns-2 md:columns-3',
      maxWidthClassName: 'max-w-[1400px]',
    };
  }

  return {
    gridClassName: 'columns-1 sm:columns-2 md:columns-3 lg:columns-4',
    maxWidthClassName: 'max-w-[1600px]',
  };
}
