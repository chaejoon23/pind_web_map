import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/env';
import type { Location } from '../types';

export interface VideoHistory {
  id: string;
  title: string;
  date: string;
  thumbnail: string;
  url: string;
  checked: boolean;
  locations: Location[];
}

interface ApiVideoHistory {
  id: string;
  title: string;
  created_at: string;
  thumbnail_url?: string;
  youtube_url: string;
  places: Array<{
    name: string;
    lat: number | null;
    lng: number | null;
  }>;
}

//상태관리 훅
export const useVideoHistory = () => {
  const [videoHistory, setVideoHistory] = useState<VideoHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();

  // Fetch video history from API
  const fetchVideoHistory = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setVideoHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.YOUTUBE.HISTORY, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.status}`);
      }

      const apiHistory: ApiVideoHistory[] = await response.json();
      
      // Transform API response to internal format
      const transformedHistory: VideoHistory[] = apiHistory.map((item) => ({
        id: item.id,
        title: item.title,
        date: new Date(item.created_at).toISOString().split('T')[0],
        thumbnail: item.thumbnail_url || '',
        url: item.youtube_url,
        checked: false, // Default to unchecked
        locations: item.places.filter(place => 
          place.lat !== null && place.lng !== null
        ).map(place => ({
          name: place.name,
          lat: place.lat!,
          lng: place.lng!,
        })),
      }));

      setVideoHistory(transformedHistory);
    } catch (err) {
      console.error('Error fetching video history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch video history');
      
      // Set fallback mock data for development
      setVideoHistory([
        {
          id: '1',
          title: 'Amazing Seoul Food Tour - Best Korean...',
          date: '2024-01-15',
          thumbnail: '',
          url: 'https://youtube.com/watch?v=example1',
          checked: true,
          locations: [
            { name: 'Myeongdong Kyoja', lat: 37.5633, lng: 126.9982 },
            { name: 'Gwangjang Market', lat: 37.5701, lng: 126.9996 }
          ]
        },
        {
          id: '2',
          title: 'Hidden Gems in Busan - Local\'s Guide',
          date: '2024-01-10',
          thumbnail: '',
          url: 'https://youtube.com/watch?v=example2',
          checked: false,
          locations: [
            { name: 'Gamcheon Culture Village', lat: 35.0975, lng: 129.0105 },
            { name: 'Jagalchi Fish Market', lat: 35.0966, lng: 129.0306 }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  // Load history when authenticated
  useEffect(() => {
    fetchVideoHistory();
  }, [fetchVideoHistory]);

  // Handle video check/uncheck
  const handleVideoCheck = useCallback((videoId: string, checked: boolean) => {
    setVideoHistory(prev => 
      prev.map(video => 
        video.id === videoId ? { ...video, checked } : video
      )
    );
  }, []);

  // Get all locations from checked videos
  const getVisibleLocations = useCallback((): Location[] => {
    return videoHistory
      .filter(video => video.checked)
      .flatMap(video => video.locations);
  }, [videoHistory]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh history (useful after new video processing)
  const refreshHistory = useCallback(() => {
    fetchVideoHistory();
  }, [fetchVideoHistory]);

  return {
    videoHistory,
    isLoading,
    error,
    handleVideoCheck,
    getVisibleLocations,
    clearError,
    refreshHistory,
  };
};