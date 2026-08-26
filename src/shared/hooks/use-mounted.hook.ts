"use client";

import { useEffect, useState } from "react";

/**
 * Hook that returns true after the component has been mounted on the client.
 * Useful for avoiding hydration mismatches by delaying client‑only rendering
 * until after the initial server render.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return mounted;
}
