import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, ViewRoute } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCarouselProps {
  products: Product[];
  onSelectProduct: (slug: string) => void;
  onSelectCategory?: (category: string) => void;
  onNavigate?: (route: ViewRoute) => void;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  onSelectProduct,
  onSelectCategory,
  onNavigate,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll boundary to disable/enable navigation buttons
  const checkScrollBounds = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    window.addEventListener('resize', checkScrollBounds);
    return () => window.removeEventListener('resize', checkScrollBounds);
  }, [checkScrollBounds, products]);

  // Scroll left or right strictly without infinite wrapping
  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 340; // Card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-10 text-center text-neutral-500 text-xs">
        No products available.
      </div>
    );
  }

  return (
    <div className="relative group/carousel px-2 sm:px-3">
      {/* Left Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
        aria-label="Scroll products left"
        className={`absolute -left-2 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-[#1C1E25]/95 backdrop-blur-md border border-[#E9E9E6] dark:border-[#2A2D38] shadow-lg text-[#111111] dark:text-neutral-100 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
          canScrollLeft
            ? 'hover:bg-[#FF6B00] hover:text-white dark:hover:bg-[#FF6B00] dark:hover:text-white hover:border-[#FF6B00] hover:scale-105 opacity-100'
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Right Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        aria-label="Scroll products right"
        className={`absolute -right-2 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-[#1C1E25]/95 backdrop-blur-md border border-[#E9E9E6] dark:border-[#2A2D38] shadow-lg text-[#111111] dark:text-neutral-100 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
          canScrollRight
            ? 'hover:bg-[#FF6B00] hover:text-white dark:hover:bg-[#FF6B00] dark:hover:text-white hover:border-[#FF6B00] hover:scale-105 opacity-100'
            : 'opacity-30 cursor-not-allowed pointer-events-none'
        }`}
      >
        <ChevronRight className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Horizontally Scrollable Linear Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollBounds}
        className="flex gap-6 overflow-x-auto scrollbar-none py-3 px-1 scroll-smooth snap-x snap-mandatory focus-visible:outline-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[290px] sm:w-[320px] md:w-[335px] shrink-0 h-[530px] sm:h-[560px] flex flex-col snap-start"
          >
            <ProductCard
              product={product}
              onSelectProduct={onSelectProduct}
              onSelectCategory={onSelectCategory}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
