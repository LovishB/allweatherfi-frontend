// Hedera Testnet Configuration
export const HEDERA_TESTNET_CONFIG = {
  chainId: "0x128", // 296 in hex (Hedera Testnet chain ID)
  chainName: "Hedera Testnet",
  rpcUrls: ["https://testnet.hashio.io/api"],
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  blockExplorerUrls: ["https://hashscan.io/testnet"],
};

export const RPC_URL = "https://testnet.hashio.io/api";

// Add Hedera Testnet to MetaMask
export const addHederaTestnetToMetaMask = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [HEDERA_TESTNET_CONFIG],
      });
      return true;
    } catch (error) {
      console.error("Failed to add Hedera Testnet:", error);
      return false;
    }
  }
  return false;
};

// Switch to Hedera Testnet
export const switchToHederaTestnet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HEDERA_TESTNET_CONFIG.chainId }],
      });
      return true;
    } catch (error: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (error.code === 4902) {
        return await addHederaTestnetToMetaMask();
      }
      console.error("Failed to switch to Hedera Testnet:", error);
      return false;
    }
  }
  return false;
};

// Get HBAR balance
export const getHbarBalance = async (address: string): Promise<string> => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      // Convert from wei to HBAR (18 decimals)
      const hbarBalance = parseInt(balance, 16) / Math.pow(10, 18);
      return hbarBalance.toFixed(4);
    } catch (error) {
      console.error("Failed to get HBAR balance:", error);
      return "0";
    }
  }
  return "0";
};

// Check if connected to Hedera Testnet
export const isConnectedToHederaTestnet = async (): Promise<boolean> => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      return chainId === HEDERA_TESTNET_CONFIG.chainId;
    } catch (error) {
      console.error("Failed to check chain ID:", error);
      return false;
    }
  }
  return false;
};