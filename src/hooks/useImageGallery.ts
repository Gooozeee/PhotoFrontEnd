import { useEffect, useState, useCallback } from 'react';
import { apiCache } from '../utils/ApiCache';

export interface ImageData {
  url: string;
  id: string;
  caption: string;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  unitWidth: number;
  unitHeight: number;
}

interface UseImageGalleryOptions {
  albumName: string;
  pageSize?: number; // Images per page/batch
  cacheKey?: string;
  cacheTTL?: number; // Cache time-to-live in milliseconds
}

/**
 * Hook to fetch and manage image gallery data with caching and pagination
 * Designed for both local imports and future API integration
 */
export const useImageGallery = ({
  albumName,
  pageSize = 12, // Load 12 images at a time
  cacheKey = `album-${albumName}`,
  cacheTTL = 60 * 60 * 1000, // 1 hour cache
}: UseImageGalleryOptions) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);

      // Try to get from cache first
      const cacheData = apiCache.get<ImageData[]>(cacheKey);
      if (cacheData) {
        setImages(cacheData);
        setLoading(false);
        return;
      }

      // TODO: Replace with API call in the future
      // Example API call structure:
      // const response = await fetch(`/api/gallery/${albumName}?page=${page}&pageSize=${pageSize}`);
      // const data = await response.json();

      // For now, use the local import system
      let imagesGlob: Record<string, () => Promise<{ default: string }>>;

      switch (albumName) {
        case 'Birds':
          imagesGlob = import.meta.glob('../assets/Birds/*') as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case 'Rally':
          imagesGlob = import.meta.glob('../assets/Rally/*') as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case 'Cities':
          imagesGlob = import.meta.glob('../assets/Cities/*') as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        case 'Landscapes':
          imagesGlob = import.meta.glob('../assets/Landscapes/*') as Record<
            string,
            () => Promise<{ default: string }>
          >;
          break;
        default:
          setError('Album not found');
          setLoading(false);
          return;
      }

      const imageInfos: ImageData[] = await Promise.all(
        Object.entries(imagesGlob).map(
          async ([key, loadImage]) => {
            const module = await loadImage();
            const url = module.default;
            const caption = key.split('/').pop()?.replace(/\.[^.]+$/, '') || url.split('/').pop() || url;
            return new Promise<ImageData>((resolve) => {
              const img = new Image();
              img.onload = () => {
                const aspectRatio = img.width / img.height;
                const orientation = aspectRatio < 1 ? 'portrait' : 'landscape';
                const unitWidth = orientation === 'portrait' ? 1 : 2;
                const unitHeight = orientation === 'portrait' ? 2 : 1;

                resolve({
                  url,
                  id: key,
                  caption,
                  width: img.width,
                  height: img.height,
                  orientation,
                  unitWidth,
                  unitHeight,
                });
              };
              img.onerror = () => {
                resolve({
                  url,
                  id: key,
                  caption,
                  width: 400,
                  height: 300,
                  orientation: 'landscape',
                  unitWidth: 2,
                  unitHeight: 1,
                });
              };
              img.src = url;
            });
          }
        )
      );

      // Sort images
      imageInfos.sort((a, b) => b.unitWidth - a.unitWidth);

      // Cache the results
      apiCache.set(cacheKey, imageInfos, cacheTTL);

      setImages(imageInfos);
      setHasMore(imageInfos.length >= pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [albumName, pageSize, cacheKey, cacheTTL]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const loadMore = useCallback(() => {
    // TODO: Implement pagination
    // setPage((p) => p + 1);
    // Fetch next page of images
  }, []);

  const clearCache = useCallback(() => {
    apiCache.clear(cacheKey);
  }, [cacheKey]);

  return {
    images,
    loading,
    error,
    page,
    hasMore,
    loadMore,
    clearCache,
  };
};
