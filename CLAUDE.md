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

- **Server URL**: Default `http://localhost:9001` (configured via `VITE_BACKEND_URL`)
- **API Base Path**: `/api/v1/youtube` for YouTube endpoints, `/auth` for authentication
- **Authentication**: JWT Bearer token authentication for protected endpoints
- **CORS**: Configured to allow frontend requests during development

**Available Endpoints:**

**YouTube Processing:**
- `POST /api/v1/youtube/process` (🔒 인증 필요)
  - 로그인 사용자용 YouTube URL 처리 및 히스토리 기록
  - Request: `{ url: string }`
  - Response: `{ mode: "db"|"new", places: Array<{name, lat?, lng?}> }`
  
- `POST /api/v1/youtube/without-login/process` (🌐 공개)
  - 게스트 사용자용 YouTube URL 처리 (히스토리 기록 없음)
  - Request: `{ url: string }`
  - Response: `{ mode: "db"|"new", places: Array<{name, lat?, lng?}> }`

- `GET /api/v1/youtube/history` (🔒 인증 필요)
  - 사용자 콘텐츠 기록 조회 (상세 정보 포함)
  - Response: `Array<{ id, title?, created_at, thumbnail_url?, youtube_url?, places }>`

- `GET /api/v1/youtube/places/{video_id}` (🌐 공개)
  - 특정 비디오의 장소 정보 조회
  - Response: `Array<{name, lat?, lng?}>`

**Authentication:**
- `POST /auth/register` - 사용자 등록
- `POST /auth/login` - 로그인 (JWT 토큰 반환)
- `POST /auth/request-password-reset` - 비밀번호 재설정 요청
- `POST /auth/reset-password` - 비밀번호 재설정

**Response Schemas:**
- **ApiVideoHistory**: `{ id: string, title?: string, created_at: datetime, thumbnail_url?: url, youtube_url?: url, places: Place[] }`
- **Place**: `{ name: string, lat?: number, lng?: number }`
- **PlaceResponse**: `{ mode: "db"|"new", places: Place[] }`

- **Extension Integration**: Receives location data via URL parameters

### Key Components

**App.tsx** (Main container)

- Manages application state with authentication context
- Features user authentication with login/logout functionality
- Handles both authenticated and guest mode URL processing
- Displays authentication status and user information
- Features sidebar with URL input and location list, main area with map
- **Video History Integration**: Uses `useVideoHistory` hook for user history management
- **Extension Integration**: Receives location data via URL parameters and processes authentication tokens
- **Auto-login**: Automatically processes authentication tokens from extension

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

**useVideoHistory** (Video history management)

- Fetches and manages user's video processing history
- Integrates with backend `/api/v1/youtube/history` endpoint
- Provides loading states and error handling
- Returns video metadata with associated location data
- Automatically refreshes when authentication state changes

**MapComponent.tsx** (Google Maps integration)

- Uses `@vis.gl/react-google-maps` library with Tailwind styling
- Includes MapBoundaryFitter helper component for auto-fitting map bounds
- Renders markers for all valid locations with map controls
- Enhanced empty states and visual improvements

**types.ts & API Types**

- **Location**: `{ name: string, lat: number, lng: number }` - Frontend location type with required coordinates
- **VideoHistory**: `{ id: string, title?: string, created_at: string, thumbnail_url?: string, youtube_url?: string, places: Location[] }` - Video history with metadata
- **PlaceResponse**: Backend API response for YouTube processing
- **URLRequest**: Backend API request for YouTube URL processing
- **AuthTypes**: User registration, login, and password reset schemas

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

- **Server**: Requires running `pind_server` FastAPI backend
- **Configuration**: Server URL configured via `VITE_BACKEND_URL` environment variable (default: `http://localhost:9001`)
- **Database**: SQLAlchemy ORM with SQLite/PostgreSQL database for user data and content history
- **AI Processing**: Backend extracts location data from YouTube videos using AI/NLP
- **Authentication**: JWT-based authentication with OAuth2PasswordBearer
- **Features**:
  - User registration and login system
  - Password reset functionality via email
  - Content history tracking for authenticated users  
  - YouTube metadata extraction (title, thumbnail, URL)
  - Location data caching to avoid reprocessing
- **Development**: CORS configured for frontend development
- **API Documentation**: Available at `http://localhost:9001/docs` (Swagger UI)

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
