import { useRef, useState, useEffect, useCallback, Children } from 'react';

export function Carousel({
  children,
  className = '',
  itemClassName = 'w-[85vw] max-w-[320px] sm:max-w-none sm:w-[350px] md:w-[380px] shrink-0 snap-start flex flex-col',
  ariaLabel = 'Carrossel',
}) {
  const scrollerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    const timer = setTimeout(checkScroll, 100);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [checkScroll, children]);

  const scroll = (direction) => {
    const el = scrollerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const childCount = Children.count(children);
  if (childCount === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Item anterior"
          className="absolute -left-2.5 sm:-left-3.5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:bg-white hover:text-forest-700 hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-label={ariaLabel}
        className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 focus:outline-none focus:ring-1 focus:ring-forest-400 rounded-lg [scrollbar-width:thin] [scrollbar-color:#a8ddbf_transparent]"
      >
        {Children.map(children, (child, idx) => (
          <div key={child?.key || idx} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Próximo item"
          className="absolute -right-2.5 sm:-right-3.5 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:bg-white hover:text-forest-700 hover:border-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
