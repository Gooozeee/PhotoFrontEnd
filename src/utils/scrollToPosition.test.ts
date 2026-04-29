import { describe, expect, it, vi } from 'vitest';
import scrollToPosition from './scrollToPosition';

describe('scrollToPosition', () => {
  it('scrolls the window smoothly to the requested position', () => {
    const scrollToMock = vi.fn();
    vi.stubGlobal('scrollTo', scrollToMock);

    scrollToPosition(240);

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 240,
      behavior: 'smooth',
    });
  });
});
