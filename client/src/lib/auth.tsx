import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
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
  const { openSignIn, openSignUp, signOut } = useClerk();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        fullName: clerkUser.fullName || undefined,
        avatarUrl: clerkUser.imageUrl || undefined,
      }
    : null;

  const login = () => {
    openSignIn({ redirectUrl: '/' });
  };

  const logout = async () => {
    await signOut();
  };

  const signup = () => {
    openSignUp({ redirectUrl: '/' });
  };

  const getToken = async (): Promise<string | null> => {
    if (!clerkUser) return null;
    try {
      const token = await clerkUser.getToken();
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
