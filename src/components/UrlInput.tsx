import { useState } from "react";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput = ({ onSubmit, isLoading }: UrlInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const urlIsValid = url.trim() === "" || isValidYouTubeUrl(url);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTube URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors ${
              !urlIsValid ? "border-destructive focus:ring-destructive/50 focus:border-destructive" : "border-border"
            }`}
            disabled={isLoading}
          />
          {!urlIsValid && (
            <p className="absolute top-full left-0 mt-1 text-sm text-destructive">
              올바른 YouTube URL을 입력해 주세요.
            </p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={!url.trim() || !urlIsValid || isLoading}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              장소 정보 추출 중...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              장소 정보 추출하기
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-medium text-sm mb-2">💡 사용 방법</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• YouTube 영상 URL을 입력하면 영상에 언급된 장소 정보를 추출합니다</li>
          <li>• 추출된 장소들이 지도에 마커로 표시됩니다</li>
          <li>• 좌표 정보가 있는 장소만 지도에 표시됩니다</li>
        </ul>
      </div>
    </div>
  );
};