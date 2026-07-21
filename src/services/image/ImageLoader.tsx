import React, { useState, useEffect, useRef } from 'react';
import { getDirectImageUrl, isPlaceholderImage } from '../../lib/imageUtils';

interface ImageLoaderProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  skeletonClassName?: string;
  lazy?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

export const ImageSkeleton: React.FC<{ className?: string }> = ({
  className = 'w-full h-full',
}) => (
  <div
    className={`animate-pulse bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 ${className}`}
    aria-hidden="true"
  />
);

export const ImageLoader: React.FC<ImageLoaderProps> = ({
  src,
  alt,
  className = '',
  fallback,
  skeletonClassName,
  lazy = true,
  onError,
  onLoad,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [isVisible, setIsVisible] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);
  const directUrl = getDirectImageUrl(src);

  useEffect(() => {
    if (!lazy || isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [lazy, isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    if (isPlaceholderImage(directUrl)) {
      setStatus('error');
      return;
    }
    setStatus('loading');
  }, [directUrl, isVisible]);

  if (isPlaceholderImage(directUrl) || status === 'error') {
    return <>{fallback ?? <ImageSkeleton className={skeletonClassName || className} />}</>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {status === 'loading' && (
        <ImageSkeleton className={`absolute inset-0 ${skeletonClassName || ''}`} />
      )}
      {isVisible && (
        <img
          src={directUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          className={`${className} ${status !== 'loaded' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => {
            setStatus('loaded');
            onLoad?.();
          }}
          onError={() => {
            setStatus('error');
            onError?.();
          }}
        />
      )}
    </div>
  );
};

export default ImageLoader;
