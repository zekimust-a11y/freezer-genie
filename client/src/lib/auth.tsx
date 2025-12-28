import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  signup: () => void;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Netlify Identity
    netlifyIdentity.init();

    // Check if user is already logged in
    const currentUser = netlifyIdentity.currentUser();
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email || '',
        fullName: currentUser.user_metadata?.full_name,
        avatarUrl: currentUser.user_metadata?.avatar_url,
      });
    }
    setLoading(false);

    // Listen for login events
    netlifyIdentity.on('login', (user) => {
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          fullName: user.user_metadata?.full_name,
          avatarUrl: user.user_metadata?.avatar_url,
        });
        netlifyIdentity.close();
      }
    });

    // Listen for logout events
    netlifyIdentity.on('logout', () => {
      setUser(null);
    });

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login');
  };

  const logout = () => {
    netlifyIdentity.logout();
  };

  const signup = () => {
    netlifyIdentity.open('signup');
  };

  const getToken = async (): Promise<string | null> => {
    const currentUser = netlifyIdentity.currentUser();
    if (!currentUser) return null;

    try {
      const token = await currentUser.jwt();
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, getToken }}>
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

