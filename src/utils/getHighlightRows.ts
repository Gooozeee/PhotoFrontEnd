export interface HighlightSizedPhoto {
  id: string;
  width: number;
  height: number;
}

export interface HighlightRowOptions {
  rowGap: number;
  itemGap: number;
  maxRows: number;
  maxPerRow: number;
  captionHeight: number;
  maxAspectRatio: number;
}

export const MAX_HIGHLIGHT_ASPECT = 2;

const DEFAULT_OPTIONS: HighlightRowOptions = {
  rowGap: 8,
  itemGap: 8,
  maxRows: 2,
  maxPerRow: 6,
  captionHeight: 52,
  maxAspectRatio: MAX_HIGHLIGHT_ASPECT,
};

export function aspectRatioOf(photo: HighlightSizedPhoto | undefined | null, fallback = 1.5): number {
  if (!photo) return fallback;
  return photo.height > 0 ? photo.width / photo.height : fallback;
}

export function cappedAspectRatio(photo: HighlightSizedPhoto | undefined | null, maxAspectRatio = MAX_HIGHLIGHT_ASPECT): number {
  return Math.min(aspectRatioOf(photo), maxAspectRatio);
}

/**
 * Splits photos into rows for a full-height justified grid.
 *
 * Every row shares the same height, so an image only keeps its natural aspect
 * ratio (zero cropping) when the row's summed aspect ratios fill the row width.
 * The returned grouping picks the row sizes that bring each row's summed aspect
 * ratio closest to that target, adding more images per row on wide screens and
 * fewer on narrow ones.
 */
export function getHighlightRows<T extends HighlightSizedPhoto>(
  photos: T[],
  containerWidth: number,
  containerHeight: number,
  options: Partial<HighlightRowOptions> = {},
): T[][] {
  const { rowGap, itemGap, maxRows, maxPerRow, captionHeight, maxAspectRatio } = { ...DEFAULT_OPTIONS, ...options };

  if (photos.length === 0 || containerWidth <= 0 || containerHeight <= 0) {
    return [];
  }

  if (maxRows < 1 || maxPerRow < 1) {
    return [[...photos]];
  }

  const ratios = photos.map((photo) => cappedAspectRatio(photo, maxAspectRatio));
  const pool = photos.slice(0, maxRows * maxPerRow);

  let bestRows: T[][] = [];
  let bestScore = Number.POSITIVE_INFINITY;
  let bestUsed = 0;

  function consider(boundaries: number[]) {
    const rows: T[][] = [];
    let start = 0;

    for (const end of boundaries) {
      const count = end - start;
      if (count <= 0 || count > maxPerRow) {
        return;
      }
      rows.push(pool.slice(start, end));
      start = end;
    }

    if (rows.length === 0 || rows.length > maxRows) {
      return;
    }

    if (pool.length >= maxRows && rows.length !== maxRows) {
      return;
    }

    const rowCount = rows.length;
    const rowHeight = (containerHeight - rowGap * (rowCount - 1)) / rowCount;
    const imageHeight = rowHeight - captionHeight;
    if (imageHeight <= 0) {
      return;
    }
    const targetFor = (count: number) => (containerWidth - itemGap * (count - 1)) / imageHeight;

    let score = 0;
    start = 0;
    for (const end of boundaries) {
      let sum = 0;
      for (let i = start; i < end; i++) sum += ratios[i];
      score += Math.abs(sum - targetFor(end - start));
      start = end;
    }

    const used = rows.reduce((total, row) => total + row.length, 0);
    const isBetter = score < bestScore || (score === bestScore && used > bestUsed);
    if (isBetter) {
      bestRows = rows;
      bestScore = score;
      bestUsed = used;
    }
  }

  function search(rowIndex: number, start: number, boundaries: number[]) {
    consider(boundaries);
    if (rowIndex >= maxRows) return;
    const maxEnd = Math.min(pool.length, start + maxPerRow);
    for (let end = start + 1; end <= maxEnd; end++) {
      search(rowIndex + 1, end, [...boundaries, end]);
    }
  }

  search(0, 0, []);

  if (bestRows.length === 0 && pool.length > 0) {
    return [pool.slice(0, maxPerRow)];
  }

  return bestRows;
}
