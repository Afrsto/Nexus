import { useEffect, useRef, useCallback } from "react";

const NEAR_BOTTOM_THRESHOLD = 120;

/** Auto-scrolls when deps change if user is near the bottom */
export function useScrollToBottom(deps = []) {
  const ref = useRef(null);

  const scrollToBottom = useCallback((force = false) => {
    const el = ref.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_THRESHOLD;
    if (force || nearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
