import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/env';
import type { Location } from '../types';

// Backend API response types
type ApiPlace = { 
  name: string; 
  lat: number | null; 
  lng: number | null; 
};

type ApiResponse = { 
  mode: string; // "db" or "new"
  places: ApiPlace[]; 
};

export const useUrlHandler = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  // Check for URL parameters on mount (for extension integration)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationsParam = urlParams.get('locations');
    
    if (locationsParam) {
      try {
        const locationsData = JSON.parse(decodeURIComponent(locationsParam));
        if (locationsData && locationsData.places) {
          const validLocations: Location[] = locationsData.places.filter(
            (place: ApiPlace): place is Location => place.lat !== null && place.lng !== null
          );
          setLocations(validLocations);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing locations from URL:', error);
      }
    }
  }, []);

  const processUrl = async (url: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Choose endpoint based on authentication status
      const endpoint = isAuthenticated 
        ? API_ENDPOINTS.YOUTUBE.PROCESS_WITH_LOGIN
        : API_ENDPOINTS.YOUTUBE.PROCESS_WITHOUT_LOGIN;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if authenticated
      if (isAuthenticated && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log(`Processing URL with ${isAuthenticated ? 'authentication' : 'guest mode'}: ${endpoint}`);
      console.log(`URL to process: ${url}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        let errorMsg = `서버 오류 (상태 코드: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorData.error || errorMsg;
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMsg);
      }
      
      const responseData: ApiResponse = await response.json();
      console.log('Response data:', responseData);

      if (!responseData || !Array.isArray(responseData.places)) {
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }
      
      // Filter out locations with null coordinates
      const validLocations: Location[] = responseData.places.filter(
        (place): place is Location => place.lat !== null && place.lng !== null
      );
      
      console.log(`Found ${validLocations.length} valid locations`);
      setLocations(validLocations);

      if (validLocations.length === 0) {
        setError("이 영상에서 좌표 정보가 있는 장소를 찾을 수 없습니다. 다른 영상을 시도해보세요.");
      }

    } catch (err) {
      console.error('API call error:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    locations,
    isLoading,
    error,
    processUrl,
    clearError: () => setError(null),
    clearLocations: () => setLocations([]),
  };
};