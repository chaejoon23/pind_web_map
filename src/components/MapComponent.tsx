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
}

export const MapComponent = ({ apiKey, locations }: MapComponentProps) => {
  if (locations.length === 0) {
    return <div className="message">표시할 장소가 없습니다.</div>;
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapId="pind-map"
      >
        {locations.map((loc, index) => (
          <Marker
            // 이름이 중복될 수 있으므로 index를 추가하여 고유한 키를 보장합니다.
            key={`${loc.name}-${index}`}
            position={{ lat: loc.lat, lng: loc.lng }}
            title={loc.name}
          />
        ))}
        <MapBoundaryFitter locations={locations} />
      </Map>
    </APIProvider>
  );
};
