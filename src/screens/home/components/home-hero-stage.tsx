"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { IconMaisonRochevalLogo } from "@/shared/components/icons/maison-rocheval-logo";
import { Picture } from "@/shared/components/ui/picture";
import { cn } from "@/shared/lib/utils";
import { HOME_HERO } from "../constants/home.constant";

const DESKTOP_MEDIA = "(min-width: 1024px)";
const JOURNEY_ATTR = "data-home-hero-journey";

export interface HomeHeroStageProps {
  imageAlt: string;
  title: string;
}

export function HomeHeroStage({ imageAlt, title }: HomeHeroStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const { scrollY, scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroHeight = useMotionTemplate`calc(var(--home-hero-compact) + (100svh - var(--home-hero-compact)) * ${heroScale})`;

  // The hero logo morphs into the header logo slot (svg 84x40, center y=40)
  // across the full collapse, then parks there for the sticky pin window.
  const logoTarget = isDesktop ? HOME_HERO.logo.desktop : HOME_HERO.logo.mobile;
  const logoScale = useTransform(scrollYProgress, [0, 1], [1, logoTarget.scale]);
  const logoY = useTransform(scrollYProgress, [0, 1], [0, logoTarget.translateY]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  // While the collapse journey is active (scrolled into the hero and the
  // compact band has not fully left the viewport yet), flag <html> so the
  // header keeps its transparent background and hides its own logo — the
  // hero logo is morphing into that slot. The flag only drops once the band
  // is completely out of view, so the header's transparent → solid flip
  // happens over white Section 2 instead of over the still-visible hero
  // image. Discrete toggles only, no per-frame React state.
  useEffect(() => {
    const root = document.documentElement;
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const update = (scrollPosition: number) => {
      const wasActive = root.hasAttribute(JOURNEY_ATTR);
      let active = false;

      if (!reduceMotion) {
        const outOfView = stage.getBoundingClientRect().bottom <= 80;
        active = scrollPosition > HOME_HERO.journeyStart && !outOfView;
      }

      if (active !== wasActive) {
        root.toggleAttribute(JOURNEY_ATTR, active);
        // State flipped — let other scroll listeners (e.g. the Header)
        // re-evaluate immediately instead of waiting for the next scroll
        // event (listener registration order is not guaranteed).
        window.dispatchEvent(new Event("scroll"));
      }
    };

    const unsubscribe = scrollY.on("change", update);
    update(scrollY.get());

    return () => {
      unsubscribe();
      root.removeAttribute(JOURNEY_ATTR);
      window.dispatchEvent(new Event("scroll"));
    };
  }, [scrollY, reduceMotion]);

  return (
    <div
      ref={containerRef}
      data-slot="home-hero-container"
      className="relative -mt-20 h-[calc(200svh-var(--home-hero-compact))] w-full"
    >
      <motion.section
        ref={stageRef}
        aria-labelledby="home-title"
        data-slot="home-hero-stage"
        data-plumb-id="frame-2085667109"
        className={cn(
          "z-10 h-[100svh] w-full overflow-hidden",
          reduceMotion ? "relative" : "sticky top-0",
        )}
        style={reduceMotion ? undefined : { height: heroHeight }}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100svh]">
          <Picture
            basePath="/images/home/hero-caviar-pearls"
            fallbackExtension="jpg"
            alt={imageAlt}
            priority
            width={1400}
            height={800}
            sizes="100vw"
            pictureClassName="block size-full"
            className="size-full object-cover"
            data-plumb-asset="67cbdac6eacb88d9fe0feed8f11c819741458892"
          />
        </div>

        <motion.div
          className="absolute inset-x-0 top-[56px] z-10 flex h-[200px] flex-col items-center justify-center lg:top-[96px]"
          data-plumb-id="frame-2085667110"
          style={reduceMotion ? undefined : { scale: logoScale, y: logoY }}
        >
          <h1 id="home-title" className="sr-only">
            {title}
          </h1>
          <IconMaisonRochevalLogo
            className="h-[100px] w-[211px] lg:h-[120px] lg:w-[253px]"
            aria-hidden="true"
            focusable="false"
            data-plumb-id="group-9"
          />
        </motion.div>
      </motion.section>
    </div>
  );
}
