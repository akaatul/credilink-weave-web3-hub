
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ExternalLink, CheckCircle } from "lucide-react";
import { UserRole } from "@/contexts/AuthContext";

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  installed?: boolean;
}

interface WalletConnectorProps {
  onWalletSelect: (walletId: string) => void;
  isLoading: boolean;
  role: UserRole;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  onWalletSelect, 
  isLoading, 
  role 
}) => {
  const walletOptions: WalletOption[] = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet',
      installed: typeof window !== 'undefined' && window.ethereum?.isMetaMask,
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Connect with any mobile wallet',
      installed: true,
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect using Coinbase Wallet',
      installed: true,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Wallet</h3>
        <p className="text-sm text-gray-600">
          Connect your Web3 wallet to continue as a {role}
        </p>
      </div>

      <div className="space-y-3">
        {walletOptions.map((wallet) => (
          <motion.div
            key={wallet.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className={`cursor-pointer hover:shadow-md transition-all border-2 ${
                wallet.installed 
                  ? 'hover:border-blue-200 opacity-100' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => wallet.installed && onWalletSelect(wallet.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <div className="font-medium flex items-center space-x-2">
                        <span>{wallet.name}</span>
                        {wallet.installed && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{wallet.description}</p>
                    </div>
                  </div>
                  
                  {!wallet.installed && wallet.id === 'metamask' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://metamask.io/download/', '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Install
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Connecting wallet...</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
