# PhotoFrontEnd Specialist - React 18 TypeScript

**Your Project:** React 18 SPA with TypeScript  
**Core Rule:** Container → Presentational → Services (data flows down, events up)

---

## 🏗️ Project Structure (THIS IS CRITICAL)

```
src/
├── components/
│   ├── common/                  # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── features/                # Feature-specific components
│   │   ├── PhotoUpload/
│   │   ├── PhotoGallery/
│   │   └── ...
│   │
│   └── layout/                  # Layout wrappers
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── MainLayout.tsx
│
├── hooks/                       # Custom React hooks (state logic)
│   ├── useAuth.ts
│   ├── usePhotos.ts
│   └── ...
│
├── services/                    # API calls, business logic
│   ├── photoService.ts
│   ├── authService.ts
│   └── ...
│
├── types/                       # TypeScript types & interfaces
│   └── index.ts
│
├── utils/                       # Helpers, utilities
│   └── formatters.ts
│
└── App.tsx

Tests/
├── components/
├── hooks/
├── services/
└── integration/
```

---

## ⚡ Component Rules (ENFORCE STRICTLY)

### ✅ Presentational Components (Dumb)
- Pure UI rendering
- Accept props only
- No business logic
- No API calls
- Example: `<Button>`, `<Card>`, `<Modal>`

### ✅ Container Components (Smart)
- Manage state with hooks
- Call services
- Pass data to presentational components
- Example: `<PhotoGalleryContainer>` loads photos, passes to `<PhotoGallery>`

### ❌ NEVER Do
- API calls in presentational components
- Business logic in UI components
- Mixing container & presentational in one file
- Props drilling (use hooks instead for complex state)

---

## 🎯 Data Flow

```
Service (photoService.ts)
    ↑
    ↓ (data)
Custom Hook (usePhotos.ts)
    ↑
    ↓ (state)
Container Component (PhotoGalleryContainer.tsx)
    ↓
Presentational Component (PhotoGallery.tsx)
    ↓
Common Components (Card.tsx, Button.tsx)
```

---

## 📁 What Goes Where

| Folder | Purpose | Example |
|--------|---------|---------|
| **components/common** | Reusable UI only | Button, Modal, Card, Input |
| **components/features** | Feature containers + presentational | PhotoUpload/, PhotoGallery/ |
| **components/layout** | Page structure | Header, Sidebar, MainLayout |
| **hooks** | State logic & side effects | usePhotos, useAuth, useForm |
| **services** | API calls, business logic | photoService.fetchPhotos() |
| **types** | TypeScript interfaces | Photo, User, ApiResponse |
| **utils** | Pure functions | formatDate(), truncateText() |

---

## ✅ Quick Checklist Before Coding

- [ ] Is this a UI component? → Put in `components/common` or `components/features`
- [ ] Does it manage state? → Use a custom hook in `hooks/`
- [ ] Is it an API call? → Put in `services/`
- [ ] Is it logic-only? → Use `utils/` or a custom hook
- [ ] Can I test this without React? → If it's in `services/` or `utils/`, YES
- [ ] Can I reuse this component? → If it's presentational, YES

---

## 🚀 Folder Naming

- **Presentational component file:** `Photo.tsx`
- **Container component file:** `PhotoContainer.tsx`
- **Custom hook file:** `usePhotos.ts`
- **Service file:** `photoService.ts`
- **Type file:** `photo.types.ts`

---

## 🔄 When Adding a New Feature

1. **Create types in `types/`**
2. **Create service in `services/`** (API calls)
3. **Create custom hook in `hooks/`** (state logic)
4. **Create container in `components/features/`** (uses hook)
5. **Create presentational in `components/features/`** (receives props)
6. **Create common components as needed** (reusable UI)

---

**That's it. Keep components simple and data flow clear.**
