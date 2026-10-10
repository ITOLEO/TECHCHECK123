import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackText?: string;
  containerClassName?: string;
  hideOnFallback?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackText,
  className = '',
  containerClassName = '',
  hideOnFallback = false,
  loading = 'lazy',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sanitize and reset error when src changes
  React.useEffect(() => {
    let cleanSrc = src;
    if (cleanSrc && cleanSrc.includes('/api/images/')) {
      cleanSrc = cleanSrc.replace(/\/api\/images\//g, '/uploads/');
    }
    setCurrentSrc(cleanSrc);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    if (currentSrc) {
      const cleanPath = currentSrc.split('?')[0];
      if (cleanPath.includes('/api/images/')) {
        setCurrentSrc(cleanPath.replace(/\/api\/images\//g, '/uploads/'));
        return;
      }
      if (cleanPath.startsWith('/uploads/')) {
        const filename = cleanPath.replace('/uploads/', '');
        // Fall back to root asset or images directory
        if (!currentSrc.includes('/images/') && !currentSrc.includes('/assets/')) {
          setCurrentSrc(`/images/${filename}`);
          return;
        }
      }
      if (cleanPath === '/hero-setup.jpg' || cleanPath === '/hero-setup.png') {
        setCurrentSrc('/hero-setup.webp');
        return;
      }
    }
    setHasError(true);
  };

  if (!currentSrc || hasError) {
    if (hideOnFallback) return null;
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-neutral-900 text-neutral-400 p-4 select-none ${containerClassName}`}
        role="img"
        aria-label={alt || 'Image unavailable'}
      >
        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#FF6B00] mb-2">
          <ImageIcon className="w-5 h-5 opacity-80" />
        </div>
        <span className="text-[11px] font-bold text-neutral-300 text-center line-clamp-1 max-w-[85%]">
          {fallbackText || alt || 'TechCheck Gear'}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold mt-0.5">
          Curated Setup Image
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      className={`${className} ${!isLoaded ? 'opacity-80 blur-2xs' : 'opacity-100'} transition-opacity duration-300`}
      {...props}
    />
  );
};
