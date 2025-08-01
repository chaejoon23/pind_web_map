# Integration Guide: pind_plasmo ↔ pind-web-map

This document explains how the browser extension (`pind_plasmo`) integrates with the web map application (`pind-web-map`).

## Architecture Overview

```
User clicks button → pind_plasmo extension → pind_server backend → pind-web-map app
```

## Integration Flow

### 1. Extension Flow (Authenticated User)
1. User watches YouTube video
2. Clicks Pind extension button in video player
3. Extension retrieves JWT token from `chrome.storage.local`
4. Extension sends POST request to `/api/v1/youtube/process` with Authorization header
5. Backend processes video and returns location data
6. Extension opens new tab: `http://localhost:5173?locations=<encoded_data>`
7. Web app receives and displays location data on map

### 2. Extension Flow (Guest User)
1. User clicks extension button without being logged in
2. Extension shows login modal
3. User can choose "로그인 없이 계속하기" (Continue without login)
4. Extension sends POST request to `/api/v1/youtube/without-login/process`
5. Backend processes video and returns location data
6. Extension opens new tab with location data
7. Web app displays locations on map

### 3. Direct Web App Usage
1. User navigates directly to `http://localhost:5173`
2. User can login or use as guest
3. User inputs YouTube URL manually
4. Web app processes URL using appropriate endpoint
5. Locations displayed on map

## Configuration

### Required Ports
- **Backend Server**: `localhost:9001` (pind_server)
- **Web Application**: `localhost:5173` (pind-web-map)
- **Extension**: Connects to both above

### Environment Variables (.env)
```bash
# Web App Configuration
VITE_BACKEND_URL=http://localhost:9001
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Extension Configuration (background.ts)
```javascript
const API_BASE_URL = "http://localhost:9001";
const WEB_MAP_BASE_URL = "http://localhost:5173";
```

## Authentication Integration

### Extension Authentication
- JWT tokens stored in `chrome.storage.local`
- Keys: `jwtToken`, `tokenType`
- Supports login/register/password reset

### Web App Authentication  
- JWT tokens stored in `localStorage`
- Keys: `auth_token`, `auth_token_type`, `auth_user`
- Same backend endpoints as extension

### API Endpoints Used

**Authentication:**
- `POST /auth/login` - User login (returns JWT)
- `POST /auth/register` - User registration

**YouTube Processing:**
- `POST /api/v1/youtube/process` - Authenticated requests
- `POST /api/v1/youtube/without-login/process` - Guest requests

## Data Flow

### Extension → Web App Data Transfer
Extension passes data via URL parameters:
```
http://localhost:5173?locations=<URL_encoded_JSON>
```

JSON Structure:
```json
{
  "mode": "db" | "new",
  "places": [
    {
      "name": "Location Name",
      "lat": 37.1234,
      "lng": 127.5678
    }
  ]
}
```

### Web App URL Parameter Handling
1. `useUrlHandler` hook checks for `locations` URL parameter on mount
2. Decodes and parses JSON data
3. Filters locations with valid coordinates
4. Displays on map
5. Cleans up URL (removes parameters)

## Testing Integration

### Manual Testing Steps

1. **Start Backend Server:**
   ```bash
   cd /Users/junchae/dev/pind_server
   # Start FastAPI server on localhost:9001
   ```

2. **Start Web Application:**
   ```bash
   cd /Users/junchae/dev/pind-web-map  
   npm run dev
   # Should run on localhost:5173
   ```

3. **Build and Load Extension:**
   ```bash
   cd /Users/junchae/dev/pind_plasmo
   pnpm dev
   # Load build/chrome-mv3-dev in Chrome developer mode
   ```

4. **Test Extension Integration:**
   - Navigate to any YouTube video
   - Click the Pind location button in video player
   - Should open new tab with map showing extracted locations

5. **Test Direct Web App:**
   - Navigate to `http://localhost:5173`
   - Input YouTube URL manually
   - Should display locations on map

### Verification Checklist

- [ ] Backend server runs on correct port (9001)
- [ ] Web app runs on correct port (5173) 
- [ ] Extension can communicate with backend
- [ ] Extension opens web app with correct URL parameters
- [ ] Web app receives and parses location data correctly
- [ ] Authentication works in both extension and web app
- [ ] Guest mode works in both applications
- [ ] Error handling works for connection issues
- [ ] Maps display correctly with location markers

## Troubleshooting

### Common Issues

1. **Extension can't connect to backend:**
   - Check if backend is running on localhost:9001
   - Verify CORS configuration in backend
   - Check browser console for errors

2. **Web app doesn't receive location data:**
   - Check browser console for URL parsing errors
   - Verify URL parameter format
   - Check if locations have valid coordinates

3. **Authentication issues:**
   - Clear localStorage and chrome.storage.local
   - Verify backend authentication endpoints
   - Check JWT token format

4. **Port conflicts:**
   - Update configuration in both projects
   - Restart all services after port changes

### Debug Information

**Extension Console:** Check background script and content script logs
**Web App Console:** Check for URL parsing and API call logs  
**Backend Logs:** Check FastAPI server logs for request processing
**Network Tab:** Verify API requests and responses

## Configuration Updates

When changing server addresses, update these files:

1. **Extension:** `/Users/junchae/dev/pind_plasmo/background.ts`
2. **Web App:** `/Users/junchae/dev/pind-web-map/.env`
3. **Documentation:** This file and project README files