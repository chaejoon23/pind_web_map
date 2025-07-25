import { useEffect, useState } from "react";
import { MapComponent } from "./components/MapComponent";
import "./index.css";
import type { Location } from "./types";

// 백엔드 API 응답 데이터 타입 (좌표가 null일 수 있음)
type ApiLocation = { name: string; lat: number | null; lng: number | null };

type ApiResponse = { locations: ApiLocation[] };

function App() {
  const [locations, setLocations] = useState<Location[]>([]); // 화면에 표시될, 유효한 좌표를 가진 장소들
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const fetchTestLocations = async () => {
      try {
        // --- 핵심 수정: 새로운 백엔드 테스트 서버 주소로 변경합니다. ---
        //https://172.20.10.4:9000/extract-ylocations , https://192.168.18.124:9000/extract-ylocations
        const backendUrl = "https://192.168.18.124:9000/extract-ylocations";
        
        console.log(`백엔드 서버에 요청: ${backendUrl}`);
        // 서버가 POST 메서드를 기대하므로, fetch 옵션에 명시적으로 추가합니다.
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // 비어있는 JSON 객체를 body에 추가합니다.
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          // 백엔드에서 보낸 오류 메시지가 있다면 함께 표시합니다.
          let errorMsg = `백엔드 서버 오류 (상태 코드: ${response.status})`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // 응답이 JSON이 아닐 경우
          }
          // 405 에러에 대한 구체적인 메시지 추가
          if (response.status === 405) {
            errorMsg += " (허용되지 않는 메서드)";
          }
          throw new Error(errorMsg);
        }
        
        const responseData: ApiResponse = await response.json();

        if (!responseData || !Array.isArray(responseData.locations)) {
          throw new Error("백엔드 응답 형식이 올바르지 않습니다. 'locations' 배열이 필요합니다.");
        }
        
        // 좌표가 없는(null) 장소는 필터링하고, 타입을 Location으로 변환합니다.
        const validLocations: Location[] = responseData.locations.filter(
          (loc): loc is Location => loc.lat !== null && loc.lng !== null
        );
        setLocations(validLocations);

      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지, 네트워크 연결 및 CORS 설정을 확인해주세요.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestLocations();
  }, []); // 페이지가 처음 로드될 때 한 번만 실행됩니다.

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Pind: 지도 테스트</h1>
      </header>
      <main className="map-container">
        {isLoading && <div className="message">테스트 데이터를 불러오는 중입니다...</div>}
        {error && <div className="message error">오류: {error}</div>}
        {!isLoading && !error && apiKey && (
          <MapComponent apiKey={apiKey} locations={locations} />
        )}
        {!apiKey && <div className="message error">Google Maps API 키가 설정되지 않았습니다.</div>}
      </main>
    </div>
  );
}

export default App;
