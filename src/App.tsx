import { useState, useEffect } from "react";
import { MapComponent } from "./components/MapComponent";
import { UrlInput } from "./components/UrlInput";
import { AuthModal } from "./components/AuthModal";
import { useAuth } from "./contexts/AuthContext";
import { useUrlHandler } from "./hooks/useUrlHandler";
import { useVideoHistory } from "./hooks/useVideoHistory";
import { env } from "./config/env";
import type { Location } from "./types";
import "./index.css";

type TabType = 'history' | 'locations';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { isAuthenticated, logout } = useAuth();
  const { locations, isLoading, error, processUrl, clearError } = useUrlHandler();
  const { 
    videoHistory, 
    isLoading: historyLoading, 
    error: historyError,
    handleVideoCheck, 
    getVisibleLocations,
    clearError: clearHistoryError,
    refreshHistory
  } = useVideoHistory();

  const apiKey = env.GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getAllVisibleLocations = () => {
    // Priority: new URL processing results > checked history videos
    if (locations.length > 0) return locations;
    return getVisibleLocations();
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleUrlSubmit = async (url: string) => {
    await processUrl(url);
    // Refresh history to include the new search
    refreshHistory();
    if (activeTab === 'history') {
      setActiveTab('locations');
    }
  };


  const handleProceedAsGuest = () => {
    setShowAuthModal(false);
  };

  if (!apiKey) {
    return (
      <div className="h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'}}>
        <div className="text-center p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pind</h1>
          <p className="text-gray-600 mb-6">Google Maps API 키가 설정되지 않았습니다.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const visibleLocations = getAllVisibleLocations();

  return (
    <div className="h-screen flex flex-col">
      {/* Mobile Header */}
      {isMobile && (
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">Pind</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 flex relative">
        {/* Desktop: Fixed Sidebar */}
        {!isMobile && (
          <div className="w-80 bg-white border-r flex flex-col">
            <SidebarContent 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              videoHistory={videoHistory}
              onVideoCheck={handleVideoCheck}
              visibleLocations={visibleLocations}
              onLocationClick={handleLocationClick}
              selectedLocation={selectedLocation}
              onUrlSubmit={handleUrlSubmit}
              isLoading={isLoading}
              error={error}
              clearError={clearError}
              isAuthenticated={isAuthenticated}
              logout={logout}
              historyLoading={historyLoading}
              historyError={historyError}
              clearHistoryError={clearHistoryError}
            />
          </div>
        )}

        {/* Mobile: Overlay Sidebar */}
        {isMobile && showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-[85%] bg-white z-50 overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <SidebarContent 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                videoHistory={videoHistory}
                onVideoCheck={handleVideoCheck}
                visibleLocations={visibleLocations}
                onLocationClick={handleLocationClick}
                selectedLocation={selectedLocation}
                onUrlSubmit={handleUrlSubmit}
                isLoading={isLoading}
                error={error}
                clearError={clearError}
                isAuthenticated={isAuthenticated}
                logout={logout}
                historyLoading={historyLoading}
                historyError={historyError}
                clearHistoryError={clearHistoryError}
              />
            </div>
          </>
        )}

        {/* Desktop: Details Panel */}
        {!isMobile && selectedLocation && (
          <div className="w-80 bg-white border-r animate-in slide-in-from-left-full duration-300">
            <PlaceDetails 
              location={selectedLocation}
              onClose={() => setSelectedLocation(null)}
            />
          </div>
        )}

        {/* Mobile: Details Modal */}
        {isMobile && selectedLocation && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedLocation(null)}
            />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 max-h-[80vh] overflow-hidden">
              <PlaceDetails 
                location={selectedLocation}
                onClose={() => setSelectedLocation(null)}
              />
            </div>
          </>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <MapComponent 
            apiKey={apiKey} 
            locations={visibleLocations}
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationClick}
          />
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onProceedAsGuest={handleProceedAsGuest}
      />
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({ 
  activeTab, 
  setActiveTab, 
  videoHistory, 
  onVideoCheck, 
  visibleLocations, 
  onLocationClick, 
  selectedLocation,
  onUrlSubmit,
  isLoading,
  error,
  clearError,
  isAuthenticated,
  logout,
  historyLoading,
  historyError,
  clearHistoryError
}: {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  videoHistory: import('./hooks/useVideoHistory').VideoHistory[];
  onVideoCheck: (id: string, checked: boolean) => void;
  visibleLocations: Location[];
  onLocationClick: (location: Location) => void;
  selectedLocation: Location | null;
  onUrlSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  isAuthenticated: boolean;
  logout: () => void;
  historyLoading: boolean;
  historyError: string | null;
  clearHistoryError: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Pind</h1>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100"
              >
                로그아웃
              </button>
            ) : (
              <button className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700">
                로그인
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'locations'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Locations
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'history' ? (
          <div className="p-4">
            <UrlInput onSubmit={onUrlSubmit} isLoading={isLoading} />
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-xs text-red-600 hover:text-red-800 mt-1 underline"
                >
                  닫기
                </button>
              </div>
            )}

            {historyError && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">히스토리 로드 실패: {historyError}</p>
                <button
                  onClick={clearHistoryError}
                  className="text-xs text-yellow-600 hover:text-yellow-800 mt-1 underline"
                >
                  닫기
                </button>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm">히스토리를 불러오는 중...</p>
                </div>
              ) : videoHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">아직 분석한 영상이 없습니다</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                    확장 프로그램 다운로드
                  </button>
                </div>
              ) : (
                videoHistory.map((video) => (
                  <div key={video.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={video.checked}
                      onChange={(e) => onVideoCheck(video.id, e.target.checked)}
                      className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div className="w-16 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{video.date}</p>
                    </div>
                  </div> 
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            {visibleLocations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">표시할 장소가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleLocations.map((location, index) => (
                  <div
                    key={index}
                    onClick={() => onLocationClick(location)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLocation?.name === location.name
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900">{location.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">Restaurant</p>
                        <p className="text-xs text-gray-400 mt-1">29 Myeongdong 10-gil, Jung-gu, Seoul</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Place Details Component
function PlaceDetails({ location, onClose }: { location: Location; onClose: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Place Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-2">{location.name}</h1>
        
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span className="text-sm text-gray-600">Restaurant</span>
        </div>
        
        <div className="flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600">29 Myeongdong 10-gil, Jung-gu, Seoul</span>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600">Famous for handmade noodles and dumplings since 1966</p>
        </div>
        
        <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors">
          View on Map
        </button>
      </div>
    </div>
  );
}

// Login Screen Component
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Authentication failed:', err);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'}}>
      <div className="text-center p-8 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border max-w-md mx-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Pind</h1>
        <p className="text-gray-600 mb-6">Discover places from your favorite YouTube videos</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 text-left">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 text-left">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Log In' : 'Sign Up'
            )}
          </button>
          
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 font-medium hover:underline"
              disabled={isLoading}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default App;
