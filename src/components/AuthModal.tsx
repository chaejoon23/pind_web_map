import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedAsGuest: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal = ({ isOpen, onClose, onProceedAsGuest }: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login, register, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register' && password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'register') {
        await register(email, password);
      }
      onClose();
    } catch (error) {
      // Error is handled by the auth context
      console.error('Auth error:', error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {mode === 'login' && '로그인'}
            {mode === 'register' && '회원가입'}
            {mode === 'forgot' && '비밀번호 찾기'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              required
              disabled={isLoading}
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                required
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                처리 중...
              </>
            ) : (
              <>
                {mode === 'login' && '로그인'}
                {mode === 'register' && '회원가입'}
                {mode === 'forgot' && '재설정 링크 보내기'}
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {mode === 'login' && (
            <>
              <p className="mb-2">
                계정이 없으신가요?{' '}
                <button
                  onClick={() => switchMode('register')}
                  className="text-primary hover:underline"
                  disabled={isLoading}
                >
                  회원가입
                </button>
              </p>
              <button
                onClick={() => switchMode('forgot')}
                className="text-muted-foreground hover:text-foreground hover:underline"
                disabled={isLoading}
              >
                비밀번호를 잊으셨나요?
              </button>
            </>
          )}

          {mode === 'register' && (
            <p>
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                로그인
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p>
              로그인으로 돌아가기{' '}
              <button
                onClick={() => switchMode('login')}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                로그인
              </button>
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={onProceedAsGuest}
            className="w-full text-muted-foreground hover:text-foreground text-sm py-2"
            disabled={isLoading}
          >
            로그인 없이 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};