# Hooks Reference - PhotoFrontEnd

Documentation for custom React hooks used in the PhotoFrontEnd application.

---

## useImageGallery

**File:** `src/hooks/useImageGallery.ts`

Custom hook for loading and managing image gallery data with caching support.

### Signature

```typescript
useImageGallery(options: UseImageGalleryOptions)
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `albumName` | string | required | Album to load (Birds, Cities, Landscapes, Rally) |
| `pageSize` | number | 12 | Images per page (for pagination) |
| `cacheKey` | string | `album-${albumName}` | Cache key for storing results |
| `cacheTTL` | number | 3600000 (1 hour) | Cache time-to-live in milliseconds |

### Returns

```typescript
{
  images: ImageData[];      // Array of loaded image data
  loading: boolean;         // Loading state
  error: string | null;     // Error message if any
  page: number;            // Current page
  hasMore: boolean;        // Whether more images available
  loadMore: () => void;    // Load next page (stub for future implementation)
  clearCache: () => void;  // Clear cached images
}
```

### ImageData Type

```typescript
interface ImageData {
  url: string;                           // Image URL (local asset)
  id: string;                            // Unique identifier
  width: number;                         // Image width in pixels
  height: number;                        // Image height in pixels
  orientation: 'portrait' | 'landscape'; // Image orientation
  unitWidth: number;                     // Grid span width (1 or 2)
  unitHeight: number;                    // Grid span height (1 or 2)
}
```

### How It Works

1. **Cache Check**: First checks in-memory cache using `ApiCache` utility
2. **Load Images**: Uses Vite's `import.meta.glob()` to dynamically import album images
3. **Extract Metadata**: Creates Image objects to detect dimensions
4. **Calculate Grid Layout**: Determines grid span (1x1, 1x2, 2x1, 2x2) based on aspect ratio
5. **Sort & Cache**: Sorts by width and caches results with TTL
6. **Return State**: Provides images and utilities for the component

### Usage Example

```typescript
import { useImageGallery } from '../hooks/useImageGallery';

function AlbumPage() {
  const { images, loading, error, clearCache } = useImageGallery({
    albumName: 'Landscapes',
    pageSize: 12,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.url}
          alt={img.id}
          className={`col-span-${img.unitWidth} row-span-${img.unitHeight}`}
        />
      ))}
    </div>
  );
}
```

### Caching Behavior

- **Cache Storage**: In-memory (`ApiCache` utility)
- **TTL**: 1 hour by default (configurable)
- **Auto-cleanup**: Expired entries are cleaned up automatically
- **Manual Clear**: Call `clearCache()` to manually clear cached images

### Future API Integration

This hook is designed to support future API integration. When the backend is ready:

```typescript
// Replace the import.meta.glob() section with:
const response = await fetch(
  `/api/albums/${albumName}?page=${page}&pageSize=${pageSize}`
);
const data = await response.json();
setImages(data.items);
```

### Limitations & TODOs

- [ ] Pagination loading (`loadMore`) is not implemented
- [ ] Currently only supports local asset imports (Vite glob)
- [ ] No error retry logic
- [ ] No request cancellation
