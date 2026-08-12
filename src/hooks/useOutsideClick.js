import { useEffect } from "react";

/** Fires callback when user clicks outside the given ref */
export function useOutsideClick(ref, callback) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) callback(e);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, callback]);
}
