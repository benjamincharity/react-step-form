import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReducedMotion } from '../hooks/use-reduced-motion';

describe('useReducedMotion', () => {
  let mediaQueryList: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    window.matchMedia = vi.fn().mockImplementation((query) => {
      expect(query).toBe('(prefers-reduced-motion: reduce)');
      return mediaQueryList;
    });
  });

  it('should return initial reduced motion preference', () => {
    mediaQueryList.matches = true;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('should handle changes to reduced motion preference', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      const [eventName, handler] = mediaQueryList.addEventListener.mock.calls[0];
      expect(eventName).toBe('change');
      handler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('should clean up event listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should handle multiple instances correctly', () => {
    // Create two hook instances
    const hook1 = renderHook(() => useReducedMotion());
    const hook2 = renderHook(() => useReducedMotion());

    expect(hook1.result.current).toBe(false);
    expect(hook2.result.current).toBe(false);

    // Simulate media query change
    act(() => {
      mediaQueryList.matches = true;
      // Call all registered handlers
      mediaQueryList.addEventListener.mock.calls.forEach(([eventName, handler]) => {
        expect(eventName).toBe('change');
        handler({ matches: true });
      });
    });

    expect(hook1.result.current).toBe(true);
    expect(hook2.result.current).toBe(true);

    // Clean up
    hook1.unmount();
    hook2.unmount();
  });
});
