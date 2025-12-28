import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { setAuthTokenGetter } from './queryClient';

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
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, getToken: getClerkToken } = useClerkAuth();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        fullName: clerkUser.fullName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      }
    : null;

  const login = () => {
    window.location.href = '/sign-in';
  };

  const logout = async () => {
    await signOut();
  };

  const signup = () => {
    window.location.href = '/sign-up';
  };

  const getToken = async (): Promise<string | null> => {
    try {
      const token = await getClerkToken();
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Set the token getter for the query client
  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading: !isLoaded, 
        login, 
        logout, 
        signup, 
        getToken 
      }}
    >
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
