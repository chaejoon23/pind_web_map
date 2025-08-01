import { useEffect } from "react";
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import type { Location } from "../types";

interface MapBoundaryFitterProps {
  locations: Location[];
}

// 모든 마커가 보이도록 지도의 경계를 조정하는 헬퍼 컴포넌트
const MapBoundaryFitter = ({ locations }: MapBoundaryFitterProps) => {
  const map = useMap();
  useEffect(() => {
    if (!map || locations.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    locations.forEach((loc) => {
      bounds.extend(new window.google.maps.LatLng(loc.lat, loc.lng));
    });
    map.fitBounds(bounds, 100); // 100px padding
  }, [map, locations]);
  return null;
};

// 메인 지도 컴포넌트
interface MapComponentProps {
  apiKey: string;
  locations: Location[];
  selectedLocation?: Location | null;
  onLocationSelect?: (location: Location) => void;
}

export const MapComponent = ({ 
  apiKey, 
  locations, 
  onLocationSelect 
}: MapComponentProps) => {
  if (locations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-muted-foreground">표시할 장소가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <APIProvider apiKey={apiKey}>
        <Map
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          mapId="pind-map"
          className="w-full h-full"
        >
          {locations.map((loc, index) => (
            <Marker
              // 이름이 중복될 수 있으므로 index를 추가하여 고유한 키를 보장합니다.
              key={`${loc.name}-${index}`}
              position={{ lat: loc.lat, lng: loc.lng }}
              title={loc.name}
              onClick={() => onLocationSelect?.(loc)}
            />
          ))}
          <MapBoundaryFitter locations={locations} />
        </Map>
      </APIProvider>
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button className="w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-bold border">
          +
        </button>
        <button className="w-10 h-10 bg-white rounded-md shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors text-lg font-bold border">
          −
        </button>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white/90 px-2 py-1 rounded border backdrop-blur-sm">
        Map Data © Pind
      </div>
    </div>
  );
};
