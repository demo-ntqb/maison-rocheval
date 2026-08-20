import { useEffect, useState } from "react";

export function useHeaderScroll(enabled: boolean) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkScroll = () => {
      const heroJourneyActive = document.documentElement.hasAttribute(
        "data-home-hero-journey"
      );
      setIsScrolled(window.scrollY > 50 && !heroJourneyActive);
    };

    checkScroll();

    window.addEventListener("scroll", checkScroll, { passive: true });

    // MutationObserver monitors data-home-hero-journey changes on <html>
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-home-hero-journey"
        ) {
          checkScroll();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-home-hero-journey"],
    });

    return () => {
      window.removeEventListener("scroll", checkScroll);
      observer.disconnect();
      setIsScrolled(false);
    };
  }, [enabled]);

  return enabled ? isScrolled : false;
}
