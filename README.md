# PhotoFrontEnd

Personal photography portfolio website built with React, Vite, and Tailwind CSS.

**Live:** www.michalguzy.com  
**Deployment:** Azure Static Web App

---

## Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/Gooozeee/PhotoFrontEnd.git
cd PhotoFrontEnd

# Install dependencies
npm install

# Start development server
npm run dev
```

Development server runs on `http://localhost:5173`

Local `.env.local` should define:

```bash
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Production builds must set `VITE_API_BASE_URL`. Discovery, search, highlights, and similar-photo routes use that same API base.

### Build

```bash
npm run build
npm run preview
```

---

## Documentation

- **[HOOKS_REFERENCE.md](./HOOKS_REFERENCE.md)** - Custom React hooks
- **[COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)** - React components
- **[UTILITIES_REFERENCE.md](./UTILITIES_REFERENCE.md)** - Utility functions
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All docs guide

For architecture and planning details, see the knowledge base (private).

## Admin

- `/admin` signs in with Supabase GitHub OAuth.
- `/admin/upload`, `/admin/albums`, and `/admin/photos` require an active Supabase session.
- The backend still enforces the final allowlist with `ADMIN_USER_ID`.
- The frontend reads Supabase config from `silent-mountain/.env.local`, but the backend does not. Local backend auth still needs `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_USER_ID` in `jolly-harbor/.env` or process environment variables.
- If admin access is denied or the session expires, the app signs out and redirects home with a visible status message.

## Deployment

- Frontend production hosting is Azure Static Web Apps.
- The frontend can use a custom domain while calling the backend on its default Azure App Service hostname.
- Set these SWA GitHub secrets before production deploys:

```bash
VITE_API_BASE_URL=https://your-api-app.azurewebsites.net
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- Supabase GitHub OAuth redirect URLs should point at the frontend domain, for example:

```text
https://your-frontend-domain/admin
https://your-static-web-app-hostname/admin
```

- `staticwebapp.config.json` now ships baseline security headers and SPA fallback routing for Azure Static Web Apps.

## Gallery

- The homepage album filters are generated from the live published album list.
- Single album pages load photos from the backend API.
- Public gallery captions only render when a photo has an explicit description. Raw filenames like `IMG_7886.jpg` are not shown as visible captions.

---

## Tech Stack

- **React** 18.3 - UI framework
- **Vite** 6.4 - Build tool & dev server
- **Tailwind CSS** 3.4 - Styling
- **Framer Motion** 11.2 - Animations
- **TypeScript** 4.9 - Type safety
- **React Router** 6.30 - Routing

---

## Development (Optional Tools)

### OpenCode

If using [OpenCode](https://opencode.ai) for enhanced development:

```bash
# Initialize OpenCode in the project
opencode init

# Load UI/UX Pro Max skill (press ctrl+p in OpenCode)
# Type: "Load Skill" → Select "ui-ux-pro-max"
```

This is completely optional - the project works without it.

---

## Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── hooks/         # Custom hooks
├── utils/         # Utility functions
├── assets/        # Images and media
└── App.tsx        # Router setup
```

---

## License

This project is part of a personal portfolio. See LICENSE for details.
