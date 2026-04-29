import { describe, expect, it } from 'vitest';
import { splitArray } from './SplitArrayIntoParts';

describe('splitArray', () => {
  it('splits items evenly when the array divides cleanly', () => {
    expect(splitArray([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]);
  });

  it('distributes the remainder across the first parts', () => {
    expect(splitArray([1, 2, 3, 4, 5], 3)).toEqual([[1, 2], [3, 4], [5]]);
  });
});
