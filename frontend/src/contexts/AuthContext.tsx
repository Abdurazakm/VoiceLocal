import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location?: string;
  bio?: string;
  joinedAt: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'moderator';
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  redirectAfterLogin: string | null;
  setRedirectAfterLogin: (path: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('voicelocal_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('voicelocal_user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call with basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Mock successful login - in real app, this would be an API call
      const mockUser: User = {
        id: Date.now().toString(),
        username: email.split('@')[0],
        email: email,
        firstName: 'John', // In real app, this would come from API
        lastName: 'Doe',
        location: 'San Francisco, CA',
        joinedAt: new Date().toISOString(),
        isActive: true,
        role: email.includes('admin') ? 'admin' : 'user' // Simple admin check for demo
      };

      setUser(mockUser);
      localStorage.setItem('voicelocal_user', JSON.stringify(mockUser));
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API validation
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return { success: false, error: 'All required fields must be filled' };
      }

      if (data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // Mock successful registration
      const newUser: User = {
        id: Date.now().toString(),
        username: data.email.split('@')[0],
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        location: data.location,
        joinedAt: new Date().toISOString(),
        isActive: true,
        role: 'user'
      };

      setUser(newUser);
      localStorage.setItem('voicelocal_user', JSON.stringify(newUser));
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const updatedUser: User = {
        ...user,
        ...updates,
        id: user.id, // Prevent ID changes
        role: user.role, // Prevent role changes (admin only)
        joinedAt: user.joinedAt // Prevent join date changes
      };

      setUser(updatedUser);
      localStorage.setItem('voicelocal_user', JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  const logout = () => {
    setUser(null);
    setRedirectAfterLogin(null);
    localStorage.removeItem('voicelocal_user');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    redirectAfterLogin,
    setRedirectAfterLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
