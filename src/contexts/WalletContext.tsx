import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getHbarBalance, isConnectedToHederaTestnet } from "@/lib/hedera";

interface WalletContextType {
  account: string;
  hbarBalance: string;
  isConnecting: boolean;
  setAccount: (account: string) => void;
  setHbarBalance: (balance: string) => void;
  setIsConnecting: (connecting: boolean) => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string>("");
  const [hbarBalance, setHbarBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);

  const refreshBalance = async () => {
    if (account) {
      const balance = await getHbarBalance(account);
      setHbarBalance(balance);
    }
  };

  // Auto-refresh balance when account changes
  useEffect(() => {
    if (account) {
      refreshBalance();
    } else {
      setHbarBalance("0");
    }
  }, [account]);

  const value = {
    account,
    hbarBalance,
    isConnecting,
    setAccount,
    setHbarBalance,
    setIsConnecting,
    refreshBalance
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};