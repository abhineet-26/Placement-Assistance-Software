import { ReactNode, createContext, useContext, useState, useEffect } from 'react';

type Role = 'student' | 'company' | 'admin';

interface User {
  id: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        let payloadBase64 = token.split('.')[1];
        // Convert from Base64url to Base64
        payloadBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        // Pad with '=' so it's a multiple of 4
        while (payloadBase64.length % 4) {
          payloadBase64 += '=';
        }
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        setUser({ id: payload.sub, role: payload.role as Role });
      } catch (e) {
        console.error('Failed to parse token', e);
        logout();
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
