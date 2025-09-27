import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { 
  switchToHederaTestnet, 
  getHbarBalance, 
  isConnectedToHederaTestnet 
} from "@/lib/hedera";
import { useWallet } from "@/contexts/WalletContext";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    account, 
    hbarBalance, 
    isConnecting, 
    setAccount, 
    setHbarBalance, 
    setIsConnecting,
    refreshBalance 
  } = useWallet();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Check for existing connection on component mount
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      checkConnection();
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    
    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Refresh balance when account changes
  useEffect(() => {
    if (account) {
      refreshBalance();
    } else {
      setHbarBalance("0");
    }
  }, [account]);

  const checkConnection = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        // Check if on Hedera testnet, if not, try to switch
        const isOnHedera = await isConnectedToHederaTestnet();
        if (!isOnHedera) {
          await switchToHederaTestnet();
        }
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount("");
    }
  };

  const handleChainChanged = async () => {
    // Refresh the page when chain changes to ensure proper state
    window.location.reload();
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Please install MetaMask to connect your wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // First, try to switch to Hedera testnet
      const switched = await switchToHederaTestnet();
      if (!switched) {
        alert('Please switch to Hedera Testnet to continue');
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(accounts[0]);
      
      // Get initial balance
      const balance = await getHbarBalance(accounts[0]);
      setHbarBalance(balance);
      
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect to MetaMask.');
      } else {
        alert('Error connecting to MetaMask');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount("");
    setHbarBalance("0");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getActiveTab = () => {
    if (location.pathname === "/rebalance") return "Rebalance";
    return "Dashboard";
  };

  const handleTabClick = (tab: string) => {
    if (tab === "Dashboard") {
      navigate("/");
    } else if (tab === "Rebalance") {
      navigate("/rebalance");
    }
  };

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold text-foreground">
            AllWeatherFi
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-8">
            {["Dashboard", "Rebalance"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  getActiveTab() === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Wallet Connect Button */}
          {account ? (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-muted-foreground">
                {hbarBalance} HBAR
              </div>
              <Button 
                variant="outline"
                onClick={disconnectWallet}
                className="text-sm"
              >
                {formatAddress(account)}
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};