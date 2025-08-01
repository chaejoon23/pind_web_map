import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { API_ENDPOINTS } from '../config/env';
import type { User, AuthResponse, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage or URL parameters
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for authentication from URL parameters (pind_plasmo integration)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlUserInfo = urlParams.get('user_info');
        
        if (urlToken && urlUserInfo) {
          // Auto-login from extension
          try {
            const userData = JSON.parse(decodeURIComponent(urlUserInfo));
            
            // Store auth data
            localStorage.setItem('auth_token', urlToken);
            localStorage.setItem('auth_token_type', 'Bearer');
            localStorage.setItem('auth_user', JSON.stringify(userData));
            
            setToken(urlToken);
            setUser(userData);
            
            // Clean up URL parameters
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('token');
            newUrl.searchParams.delete('user_info');
            window.history.replaceState({}, document.title, newUrl.toString());
            
            console.log('Auto-login successful from extension');
            return;
          } catch (error) {
            console.error('Error parsing URL auth parameters:', error);
          }
        }
        
        // Fallback to stored auth data
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email); // OAuth2 uses 'username' field for email
      formData.append('password', password);

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        body: formData, // Send as FormData, not JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const authData: AuthResponse = await response.json();
      
      // Store token and user info
      localStorage.setItem('auth_token', authData.access_token);
      localStorage.setItem('auth_token_type', authData.token_type);
      
      const userData: User = { email };
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setToken(authData.access_token);
      setUser(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      // After successful registration, automatically log in
      await login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_type');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};