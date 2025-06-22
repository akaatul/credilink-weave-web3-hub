
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'student' | 'recruiter';

export interface User {
  id: string;
  address: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills?: string[];
  company?: string; // for recruiters
  experience?: string; // for students
  isVerified: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github', role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('credilink_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const connectMetaMask = async (): Promise<string> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[];
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      return accounts[0];
    } catch (error) {
      throw new Error('Failed to connect to MetaMask');
    }
  };

  const login = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const address = await connectMetaMask();
      
      // Create or get user profile
      const newUser: User = {
        id: address,
        address,
        name: `${role === 'student' ? 'Student' : 'Recruiter'} ${address.slice(0, 6)}...${address.slice(-4)}`,
        role,
        isVerified: false,
        createdAt: new Date(),
      };

      setUser(newUser);
      localStorage.setItem('credilink_user', JSON.stringify(newUser));
      
      toast({
        title: 'Login Successful!',
        description: `Welcome to CrediLink+ as a ${role}!`,
      });
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Failed to connect',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github', role: UserRole) => {
    setIsLoading(true);
    try {
      // Simulate OAuth login (in real app, this would integrate with actual OAuth providers)
      const mockUser: User = {
        id: `${provider}_${Date.now()}`,
        address: '',
        email: `user@${provider}.com`,
        name: `${provider} User`,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        isVerified: true,
        createdAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('credilink_user', JSON.stringify(mockUser));
      
      toast({
        title: 'Login Successful!',
        description: `Welcome to CrediLink+ via ${provider}!`,
      });
    } catch (error) {
      toast({
        title: 'OAuth Login Failed',
        description: `Failed to login with ${provider}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('credilink_user');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('credilink_user', JSON.stringify(updatedUser));
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      loginWithOAuth,
      logout,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
