# Components Reference - PhotoFrontEnd

Documentation for reusable React components in the PhotoFrontEnd application.

---

## Overview

Components are located in `src/components/` and divided into:
- **Layout**: Navigation, structure
- **Gallery**: Image display and interaction
- **UI**: Modal dialogs, animations
- **Images**: Specialized image components

---

## Layout Components

### NavBar

**File:** `src/components/NavBar.tsx`

Main navigation component. Displays site logo, navigation links, and handles mobile responsiveness.

**Features:**
- Logo/branding
- Navigation links to main pages
- Mobile menu toggle (stub)

**Usage:**
```typescript
<NavBar />
```

### Footer

**File:** `src/components/Footer.tsx`

Footer component with social links and copyright information.

**Features:**
- Social media links
- Copyright text
- Contact information

**Usage:**
```typescript
<Footer />
```

### Layout

**File:** `src/components/Layout.tsx`

Wrapper component providing consistent page structure.

**Features:**
- Header/NavBar integration
- Footer integration
- Main content area
- Responsive padding/spacing

**Usage:**
```typescript
<Layout>
  <PageContent />
</Layout>
```

---

## Gallery Components

### GalleryBanner

**File:** `src/components/GalleryBanner.tsx`

Large banner image displayed at the top of gallery pages.

**Props:**
```typescript
interface GalleryBannerProps {
  albumName: string;  // Album name to display
  imageUrl?: string;  // Optional banner image
}
```

**Features:**
- Full-width image
- Album name overlay
- Framer Motion entrance animation

**Usage:**
```typescript
<GalleryBanner 
  albumName="Landscapes"
  imageUrl={require('../assets/Landscapes/hero.webp')}
/>
```

### GalleryImage

**File:** `src/components/GalleryImage.tsx`

Individual gallery image with overlay and click handling.

**Props:**
```typescript
interface GalleryImageProps {
  src: string;
  alt: string;
  unitWidth?: number;    // CSS grid span-x
  unitHeight?: number;   // CSS grid span-y
  onClick?: () => void;  // Click handler
}
```

**Features:**
- Lazy loading
- Hover overlay effect
- Click-to-expand support
- Responsive grid sizing

**Usage:**
```typescript
<GalleryImage
  src={image.url}
  alt={image.id}
  unitWidth={2}
  unitHeight={1}
  onClick={() => showModal(image)}
/>
```

### SingleAlbumImage

**File:** `src/components/SingleAlbumImage.tsx`

Gallery image with grid-based layout integration.

**Props:**
```typescript
interface SingleAlbumImageProps {
  image: ImageData;
  onClick?: (image: ImageData) => void;
}
```

**Usage:**
```typescript
<SingleAlbumImage
  image={imageData}
  onClick={handleImageClick}
/>
```

---

## Modal & Overlay Components

### ImageModal

**File:** `src/components/ImageModal.tsx`

Full-screen image viewer modal with zoom and navigation.

**Props:**
```typescript
interface ImageModalProps {
  isOpen: boolean;
  image?: ImageData;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}
```

**Features:**
- Full-screen display
- Zoom in/out animations
- Click outside to close
- Escape key support
- Body scroll lock (prevents background scroll)
- Optional navigation arrows

**Usage:**
```typescript
const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

<ImageModal
  isOpen={!!selectedImage}
  image={selectedImage}
  onClose={() => setSelectedImage(null)}
/>
```

### ImageSwitcher

**File:** `src/components/ImageSwitcher.tsx`

Component for switching between different album views or image sets.

**Features:**
- Album selector
- Smooth transitions
- State management

---

## Animation Components

### DownArrow

**File:** `src/components/DownArrow.tsx`

Animated down arrow indicating scrollable content.

**Features:**
- Smooth bounce animation
- Click to scroll down
- Framer Motion integration

**Usage:**
```typescript
<DownArrow onClick={() => window.scrollBy(0, 500)} />
```

### WelcomeImage

**File:** `src/components/WelcomeImage.tsx`

Hero image component with entrance animations.

**Features:**
- Fade-in animation
- Parallax scroll effect
- Responsive sizing

---

## Grid Layout System

Images are displayed in a CSS Grid with automatic span calculation:

```typescript
// Landscape images: 2 columns × 1 row
unitWidth: 2
unitHeight: 1

// Portrait images: 1 column × 2 rows
unitWidth: 1
unitHeight: 2

// Generates CSS:
// col-span-1 | col-span-2
// row-span-1 | row-span-2
```

**Why:** Creates a masonry-like gallery that adapts to image aspect ratios.

---

## Component Tree Example

```
HomePage
├── Layout
│   ├── NavBar
│   ├── WelcomeImage
│   ├── DownArrow
│   ├── GalleryBanner
│   ├── Grid (mapped useImageGallery)
│   │   └── GalleryImage × N
│   ├── ImageSwitcher
│   └── Footer
```

---

## Animation Library

All animations use **Framer Motion** with:
- Spring animations for natural feel
- Fade-in/out transitions
- Staggered item animations
- Click/hover interactions

See `tailwind.config.js` for animation timing curves.
