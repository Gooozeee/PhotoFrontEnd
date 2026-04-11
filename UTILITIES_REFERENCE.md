# Utilities Reference - PhotoFrontEnd

Documentation for utility functions and classes in the PhotoFrontEnd application.

---

## ApiCache

**File:** `src/utils/ApiCache.ts`

In-memory caching utility for storing data with automatic expiration (TTL). Used to reduce repeated API/asset loading and improve performance.

### Usage

```typescript
import { apiCache } from '../utils/ApiCache';
```

### Methods

#### `get<T>(key: string): T | null`

Retrieve cached data if it exists and hasn't expired.

```typescript
const cachedImages = apiCache.get<ImageData[]>('album-Landscapes');
if (cachedImages) {
  // Use cached data
} else {
  // Fetch fresh data
}
```

#### `set<T>(key: string, data: T, ttl?: number): void`

Store data in cache with optional time-to-live.

```typescript
apiCache.set('album-Landscapes', images, 60 * 60 * 1000); // 1 hour TTL
```

**Parameters:**
- `key`: Unique identifier for the cache entry
- `data`: Data to store (any type)
- `ttl`: Time-to-live in milliseconds (default: 1 hour = 3,600,000ms)

#### `clear(key: string): void`

Remove a specific cache entry.

```typescript
apiCache.clear('album-Landscapes');
```

#### `clearAll(): void`

Remove all cache entries.

```typescript
apiCache.clearAll(); // Nuclear option - clear everything
```

#### `fetchWithCache<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T>`

Automatically cache the result of an async operation.

```typescript
const albums = await apiCache.fetchWithCache(
  'all-albums',
  async () => {
    const res = await fetch('/api/albums');
    return res.json();
  },
  60 * 60 * 1000 // 1 hour
);
```

**Flow:**
1. Check if data is cached and not expired
2. If yes, return cached data immediately
3. If no, execute `fetchFn()`
4. Cache the result with TTL
5. Return the fresh data

### Expiration Behavior

- Cache entries automatically expire after their TTL passes
- Expired entries are cleaned up on the next `get()` call for that key
- Expired entries occupy memory until accessed (lazy cleanup)

### Example: Gallery Cache

```typescript
// In useImageGallery hook
const cacheKey = `album-${albumName}`;
const cacheTTL = 60 * 60 * 1000; // 1 hour

// Check cache first
const cached = apiCache.get<ImageData[]>(cacheKey);
if (cached) {
  setImages(cached);
  return;
}

// Load images...
const images = await loadImages();

// Store in cache
apiCache.set(cacheKey, images, cacheTTL);
```

### Performance Impact

- **Hit Rate**: Eliminates redundant image loads for repeated album views
- **Memory**: Stores up to ~100 images per album (minimal with modern browsers)
- **TTL Trade-off**: 1 hour default balances freshness with performance

---

## RetrieveNameFromFilePath

**File:** `src/utils/RetrieveNameFromFilePath.ts`

Extract a human-readable name from a file path.

```typescript
import { retrieveNameFromFilePath } from '../utils/RetrieveNameFromFilePath';

const name = retrieveNameFromFilePath('src/assets/Birds/eagle.webp');
// Returns: 'eagle'
```

---

## SplitArrayIntoParts

**File:** `src/utils/SplitArrayIntoParts.ts`

Split an array into chunks of specified size.

```typescript
import { splitArrayIntoParts } from '../utils/SplitArrayIntoParts';

const images = [1, 2, 3, 4, 5, 6, 7, 8];
const chunked = splitArrayIntoParts(images, 3);
// Returns: [[1, 2, 3], [4, 5, 6], [7, 8]]
```

---

## scrollToPosition

**File:** `src/utils/scrollToPosition.ts`

Smoothly scroll to a specific position on the page.

```typescript
import { scrollToPosition } from '../utils/scrollToPosition';

scrollToPosition(0); // Scroll to top
scrollToPosition(500); // Scroll to 500px down
```
