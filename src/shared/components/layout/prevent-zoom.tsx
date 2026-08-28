"use client";

import { useEffect } from "react";

export function PreventZoom() {
  useEffect(() => {
    const preventMultiTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    document.addEventListener("touchstart", preventMultiTouch, {
      passive: false,
    });

    document.addEventListener("touchmove", preventMultiTouch, {
      passive: false,
    });

    document.addEventListener("gesturestart", preventGesture, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", preventMultiTouch);
      document.removeEventListener("touchmove", preventMultiTouch);
      document.removeEventListener("gesturestart", preventGesture);
    };
  }, []);

  return null;
}
