# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reply

- Default to Korean, and only switch to English if I type 'in English'.

## Development Commands

**Start development server:**

```bash
npm run dev
```

- Runs Vite dev server with `--host` flag for network access
- Hot reload enabled for React components

**Build for production:**

```bash
npm run build
```

- TypeScript compilation followed by Vite build
- Build fails if TypeScript errors exist

**Lint code:**

```bash
npm run lint
```

- Uses ESLint with TypeScript, React Hooks, and React Refresh plugins
- No test runner configured in this project

**Preview production build:**

```bash
npm run preview
```

## Project Architecture

This is a React + TypeScript + Vite + Tailwind CSS application that extracts location information from YouTube videos and displays them on Google Maps, integrated with a FastAPI backend server (`pind_server`).

### Core Architecture Pattern

**Data Flow:**

1. User inputs YouTube URL via UrlInput component
2. App.tsx sends POST request to backend API (`pind_server`)
3. Backend processes YouTube URL and extracts location data using AI/NLP
4. Frontend filters out locations with null coordinates
5. Valid locations are displayed in sidebar list and rendered as map markers

**Backend API Integration:**

- **Authenticated**: Uses `/api/v1/youtube/process` with JWT token
- **Guest Mode**: Uses `/api/v1/youtube/without-login/process` endpoint
- Expects `{ url: string }` payload with YouTube URL
- Returns `{ mode: "db"|"new", places: Array<{name, lat, lng}> }` response
- Backend server URL configured via `VITE_BACKEND_URL` environment variable
- CORS is configured in backend to allow frontend requests
- All API endpoints centralized in `src/config/env.ts`
- **Extension Integration**: Receives location data via URL parameters

### Key Components

**App.tsx** (Main container)

- Manages application state with authentication context
- Features user authentication with login/logout functionality
- Handles both authenticated and guest mode URL processing
- Displays authentication status and user information
- Features sidebar with URL input and location list, main area with map
- Integrates with browser extension via URL parameters

**AuthModal.tsx** (Authentication interface)

- Multi-mode authentication (login/register/forgot password)
- Supports guest mode continuation
- Form validation and error handling
- JWT token management via localStorage

**UrlInput.tsx** (URL input interface)

- YouTube URL validation and input handling
- Loading states and user guidance
- Form submission with proper error handling

**AuthContext & useAuth** (Authentication management)

- Centralized authentication state management
- JWT token handling and API integration
- Persistent login state via localStorage
- Login, register, and logout functionality

**MapComponent.tsx** (Google Maps integration)

- Uses `@vis.gl/react-google-maps` library with Tailwind styling
- Includes MapBoundaryFitter helper component for auto-fitting map bounds
- Renders markers for all valid locations with map controls
- Enhanced empty states and visual improvements

**types.ts**

- Defines Location type with required lat/lng coordinates
- Backend API types defined in App.tsx for YouTube processing

### Environment Configuration

**Required Environment Variables:**

- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key for map rendering
- `VITE_BACKEND_URL` - Backend server URL (default: http://localhost:9001)

**Environment Setup:**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file with your configuration
# Update VITE_BACKEND_URL when server address changes
```

**Styling:**

- Uses Tailwind CSS v4 with design system integration
- OKLCH color system with CSS custom properties
- Dark mode support built-in
- Responsive design with mobile-first approach

### Development Notes

**Backend Dependencies:**

- Requires running `pind_server` FastAPI backend (URL configured in .env)
- Backend processes YouTube URLs and extracts location data using AI/NLP
- **Authentication Integration**: Full JWT-based authentication system
- Supports both authenticated and guest modes
- CORS properly configured for development
- Server address can be changed by updating `VITE_BACKEND_URL` in .env file

**Browser Extension Integration:**

- Integrates with `pind_plasmo` Chrome extension
- Receives location data via URL parameters from extension
- Extension runs on YouTube pages and sends processed data to web app
- Seamless handoff between extension and web application
- See `INTEGRATION.md` for detailed integration guide

**Styling System:**

- Modern Tailwind CSS v4 with PostCSS integration
- Design tokens from shadcn/ui design system
- Consistent spacing, typography, and color system
- Enhanced UI components with proper accessibility

**TypeScript Configuration:**

- Uses project references with separate app and node configurations
- Strict type checking enabled for React development
- Type-safe API integration with backend schemas
