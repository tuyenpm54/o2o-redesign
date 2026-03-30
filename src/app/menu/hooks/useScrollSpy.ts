"use client";

import { useState, useEffect, useRef, useCallback, MutableRefObject } from 'react';

interface UseScrollSpyOptions {
  /** Offset from top for scroll-to behavior (px) */
  headerOffset?: number;
  /** Scroll threshold to show the category bar (px) */
  categoryBarThreshold?: number;
  /** Scroll threshold to show the fixed overlay header (px) */
  fixedOverlayThreshold?: number;
  /** IntersectionObserver rootMargin for detecting active section */
  rootMargin?: string;
}

interface UseScrollSpyReturn {
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  showCategoryBar: boolean;
  isHeaderHidden: boolean;
  categoryRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  scrollToCategory: (cat: string) => void;
}

export function useScrollSpy(
  categories: string[],
  options: UseScrollSpyOptions = {}
): UseScrollSpyReturn {
  const {
    headerOffset = 130,
    categoryBarThreshold = 10,
    fixedOverlayThreshold = 120,
    rootMargin = '-140px 0px -80% 0px',
  } = options;

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [showCategoryBar, setShowCategoryBar] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll-based header visibility
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setShowCategoryBar(currentScrollY > categoryBarThreshold);

          if (currentScrollY > fixedOverlayThreshold) {
            setIsHeaderHidden(false);
          } else {
            setIsHeaderHidden(true);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categoryBarThreshold, fixedOverlayThreshold]);

  // IntersectionObserver for active category detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.getAttribute('data-category') || "");
          }
        });
      },
      { threshold: 0, rootMargin }
    );

    const sections = Object.values(categoryRefs.current);
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [categories, rootMargin]);

  // Set default active category
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const scrollToCategory = useCallback((cat: string) => {
    const section = categoryRefs.current[cat];
    if (section) {
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategory(cat);
    }
  }, [headerOffset]);

  return {
    activeCategory,
    setActiveCategory,
    showCategoryBar,
    isHeaderHidden,
    categoryRefs,
    scrollToCategory,
  };
}
