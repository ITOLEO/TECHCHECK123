import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  fallbackText?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackText,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error when src changes
  React.useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  if (!src || hasError) {
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
      src={src}
      alt={alt}
      loading={loading}
      onLoad={() => setIsLoaded(true)}
      onError={() => setHasError(true)}
      className={`${className} ${!isLoaded ? 'opacity-80 blur-2xs' : 'opacity-100'} transition-opacity duration-300`}
      {...props}
    />
  );
};
