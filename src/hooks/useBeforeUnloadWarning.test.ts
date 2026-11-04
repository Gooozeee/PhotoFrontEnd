import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useBeforeUnloadWarning } from './useBeforeUnloadWarning';

function dispatchBeforeUnload() {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

describe('useBeforeUnloadWarning', () => {
  it('blocks unload while active', () => {
    renderHook(() => useBeforeUnloadWarning(true));

    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('allows unload once the task finishes', () => {
    const { rerender } = renderHook(({ active }) => useBeforeUnloadWarning(active), {
      initialProps: { active: true },
    });

    rerender({ active: false });

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => useBeforeUnloadWarning(true));

    unmount();

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });
});
