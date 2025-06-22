
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { reverseResolveENS, formatAddress } from '@/utils/ensUtils';

export type UserRole = 'student' | 'recruiter';

export interface User {
  id: string;
  address: string;
  ensName?: string;
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
  walletType?: string; // track which wallet was used
  chainId?: number; // track current chain
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (walletId: string, role: UserRole) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'github', role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchChain: (chainId: number) => Promise<void>;
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

  const connectWallet = async (walletId: string): Promise<{ address: string; chainId: number }> => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
    }

    try {
      let accounts: string[];
      
      switch (walletId) {
        case 'metamask':
          if (!window.ethereum.isMetaMask) {
            throw new Error('MetaMask not detected');
          }
          accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
          break;
          
        case 'walletconnect':
          // TODO: Implement WalletConnect integration
          // This would use the @web3modal/wagmi connector
          throw new Error('WalletConnect integration coming soon');
          
        case 'coinbase':
          // TODO: Implement Coinbase Wallet integration  
          // This would use the coinbaseWallet connector
          throw new Error('Coinbase Wallet integration coming soon');
          
        default:
          // Fallback to generic wallet connection
          accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          }) as string[];
      }
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      // Get current chain ID
      const chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      }) as string;
      
      return {
        address: accounts[0],
        chainId: parseInt(chainId, 16)
      };
    } catch (error) {
      throw new Error(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const login = async (walletId: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { address, chainId } = await connectWallet(walletId);
      
      // Try to resolve ENS name
      const ensName = await reverseResolveENS(address);
      
      // Create or get user profile
      const newUser: User = {
        id: address,
        address,
        ensName: ensName || undefined,
        name: ensName || `${role === 'student' ? 'Student' : 'Recruiter'} ${formatAddress(address)}`,
        role,
        isVerified: false,
        createdAt: new Date(),
        walletType: walletId,
        chainId,
      };

      setUser(newUser);
      localStorage.setItem('credilink_user', JSON.stringify(newUser));
      
      toast({
        title: 'Login Successful!',
        description: `Welcome to CrediLink+ as a ${role}${ensName ? ` (${ensName})` : ''}!`,
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

  const switchChain = async (targetChainId: number) => {
    if (!window.ethereum || !user) return;
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      
      // Update user's chain ID
      const updatedUser = { ...user, chainId: targetChainId };
      setUser(updatedUser);
      localStorage.setItem('credilink_user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Chain Switched',
        description: `Switched to chain ${targetChainId}`,
      });
    } catch (error) {
      toast({
        title: 'Chain Switch Failed',
        description: 'Failed to switch blockchain network',
        variant: 'destructive',
      });
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
      switchChain,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
