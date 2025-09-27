import { ethers } from 'ethers';
import { HermesClient } from '@pythnetwork/hermes-client';

// Configuration for Hedera Testnet
const RPC_URL = "https://testnet.hashio.io/api";
const CONTRACT_ADDRESS = "0xb619f10d6b38227bbb0abf2787f7e2822d75a8aa";

// Price feed IDs from Pyth
const PRICE_FEED_IDS = [
  "0x236b30dd09a9c00dfeec156c7b1efd646c0f01825a1758e3e4a0679e3bdff179", // VOO/USD
  "0xe4ff71a60c3d5d5d37c1bba559c2e92745c1501ebd81a97d150cf7cd5119aa9c", // LQD/USD
  "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", // XAU/USD (Gold)
  "0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd"  // HBAR/USD
];

// Asset information mapping with decimal places
export const ASSETS = {
  0: { name: 'VOO', description: 'Vanguard S&P 500 ETF', decimals: 5 },
  1: { name: 'LQD', description: 'iShares iBoxx Investment Grade Corporate Bond ETF', decimals: 5 },
  2: { name: 'Gold', description: 'Gold (XAU/USD)', decimals: 5 },
  3: { name: 'HBAR', description: 'Hedera Hashgraph', decimals: 8 }
};

// AllWeatherEscrow Contract ABI (expanded to include buy and sell functions)
const ESCROW_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "latestPrices",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAum",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes[]",
        "name": "priceUpdateData",
        "type": "bytes[]"
      },
      {
        "internalType": "uint256[3]",
        "name": "weights",
        "type": "uint256[3]"
      }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountHbar",
        "type": "uint256"
      },
      {
        "internalType": "bytes[]",
        "name": "priceUpdateData",
        "type": "bytes[]"
      }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PRICE_ORACLE",
    "outputs": [
      {
        "internalType": "contract AllWeatherPriceOracle",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Price Oracle ABI (minimal, just for getting update fee)
const PRICE_ORACLE_ABI = [
  {
    "inputs": [
      {
        "internalType": "bytes[]",
        "name": "priceUpdateData",
        "type": "bytes[]"
      }
    ],
    "name": "getUpdateFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface AssetPrice {
  name: string;
  description: string;
  price: string;
  rawPrice: bigint;
  decimals: number;
}

export class ContractService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private hermesClient: HermesClient;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ESCROW_CONTRACT_ABI,
      this.provider
    );
    this.hermesClient = new HermesClient("https://hermes.pyth.network", {});
  }

  /**
   * Get latest prices for all assets
   */
  async getLatestPrices(): Promise<AssetPrice[]> {
    console.log(`\nLatest Prices:`);
    const prices: AssetPrice[] = [];
    
    for (let i = 0; i < 4; i++) {
      try {
        const price = await this.contract.latestPrices(i);
        const asset = ASSETS[i as keyof typeof ASSETS];
        console.log(`  ${asset.name}: ${price.toString()}`);
        
        prices.push({
          name: asset.name,
          description: asset.description,
          price: price.toString(),
          rawPrice: price,
          decimals: asset.decimals
        });
      } catch (e) {
        console.log(`  Asset ${i}: Unable to fetch price`);
        const asset = ASSETS[i as keyof typeof ASSETS];
        prices.push({
          name: asset.name,
          description: asset.description,
          price: "N/A",
          rawPrice: BigInt(0),
          decimals: asset.decimals
        });
      }
    }
    
    return prices;
  }

  /**
   * Get Assets Under Management (AUM)
   */
  async getAUM(): Promise<string> {
    try {
      const aum = await this.contract.getAum();
      return ethers.formatEther(aum);
    } catch (error) {
      console.error("Failed to get AUM:", error);
      return "0";
    }
  }

  /**
   * Get latest price updates from Hermes
   */
  async getLatestPriceUpdates(): Promise<string[]> {
    try {
      console.log("Fetching latest price updates from Hermes...");
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates(PRICE_FEED_IDS);
      console.log(`Received ${priceUpdates.binary.data.length} price updates`);
      
      // Convert each price update to proper hex format for ethers.js
      const formattedUpdates = priceUpdates.binary.data.map(update => {
        // If update is already a string, ensure it has 0x prefix
        if (typeof update === 'string') {
          return update.startsWith('0x') ? update : `0x${update}`;
        }
        // If update is a Buffer or Uint8Array, convert to hex
        return `0x${Buffer.from(update).toString('hex')}`;
      });
      
      return formattedUpdates;
    } catch (error) {
      console.error("Failed to fetch price updates:", error);
      throw error;
    }
  }

  /**
   * Buy ETF tokens with specified allocation weights
   * @param signer - Ethereum signer from wallet
   * @param hbarAmount - Amount of HBAR to send (in HBAR, e.g., "0.1")
   * @param weights - Array of 3 weights [S&P, Bonds, Gold] that sum to 100
   */
  async buyETF(signer: ethers.Signer, hbarAmount: string, weights: number[] = [40, 40, 20]): Promise<any> {
    try {
      // Validate weights
      const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
      if (weightSum !== 100) {
        throw new Error(`Weights must sum to 100, got ${weightSum}`);
      }

      console.log(`\n=== Buy ETF ===`);
      console.log(`Amount: ${hbarAmount} HBAR`);
      console.log(`Allocation: S&P ${weights[0]}%, Bonds ${weights[1]}%, Gold ${weights[2]}%`);

      // Create contract instance with signer
      const contractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESS,
        ESCROW_CONTRACT_ABI,
        signer
      );

      // Get latest price updates
      const priceUpdateData = await this.getLatestPriceUpdates();
      
      // Get price oracle address and create contract instance
      const priceOracleAddress = await this.contract.PRICE_ORACLE();
      const priceOracleContract = new ethers.Contract(
        priceOracleAddress,
        PRICE_ORACLE_ABI,
        this.provider
      );

      // Get update fee
      const updateFee = await priceOracleContract.getUpdateFee(priceUpdateData);
      console.log(`Price update fee: ${ethers.formatEther(updateFee)} HBAR`);

      // Calculate total value to send (HBAR amount + update fee)
      const hbarValue = ethers.parseEther(hbarAmount);
      const totalValue = hbarValue + updateFee;
      
      console.log(`Total transaction value: ${ethers.formatEther(totalValue)} HBAR`);

      // Check wallet balance
      const balance = await signer.provider?.getBalance(await signer.getAddress());
      if (!balance || balance < totalValue) {
        throw new Error(`Insufficient balance. Required: ${ethers.formatEther(totalValue)} HBAR`);
      }

      // Get gas estimation
      const gasLimit = await (contractWithSigner as any).buy.estimateGas(priceUpdateData, weights, {
        value: totalValue
      });
      
      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? feeData.gasPrice * BigInt(110) / BigInt(100) : undefined; // 10% buffer
      
      console.log(`Estimated gas: ${gasLimit.toString()}`);
      if (gasPrice) {
        console.log(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      }

      // Send buy transaction
      console.log("Sending buy transaction...");
      const tx = await (contractWithSigner as any).buy(priceUpdateData, weights, {
        value: totalValue,
        gasLimit: gasLimit,
        ...(gasPrice && { gasPrice })
      });
      
      console.log(`Transaction sent: ${tx.hash}`);
      
      return { tx, totalValue: ethers.formatEther(totalValue) };
    } catch (error) {
      console.error("Failed to buy ETF:", error);
      throw error;
    }
  }

  /**
   * Sell ETF tokens
   * @param signer - Ethereum signer from wallet
   * @param tokenAmount - Amount of tokens to sell (in HBAR/ETH units)
   */
  async sellETF(signer: ethers.Signer, tokenAmount: string): Promise<any> {
    try {
      console.log(`\n=== Sell ETF ===`);
      console.log(`Token amount: ${tokenAmount} HBAR`);

      // Create contract instance with signer
      const contractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESS,
        ESCROW_CONTRACT_ABI,
        signer
      );

      // Get latest price updates
      const priceUpdateData = await this.getLatestPriceUpdates();
      
      // Get price oracle address and create contract instance
      const priceOracleAddress = await this.contract.PRICE_ORACLE();
      const priceOracleContract = new ethers.Contract(
        priceOracleAddress,
        PRICE_ORACLE_ABI,
        this.provider
      );

      // Get update fee
      const updateFee = await priceOracleContract.getUpdateFee(priceUpdateData);
      console.log(`Price update fee: ${ethers.formatEther(updateFee)} HBAR`);

      // Check wallet balance for update fee
      const balance = await signer.provider?.getBalance(await signer.getAddress());
      if (!balance || balance < updateFee) {
        throw new Error(`Insufficient balance for price update fee. Required: ${ethers.formatEther(updateFee)} HBAR`);
      }

      // Convert token amount to wei
      const tokenAmountWei = ethers.parseEther(tokenAmount);

      // Get gas estimation
      const gasLimit = await (contractWithSigner as any).sell.estimateGas(tokenAmountWei, priceUpdateData, {
        value: updateFee
      });
      
      // Get current gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? feeData.gasPrice * BigInt(110) / BigInt(100) : undefined; // 10% buffer
      
      console.log(`Estimated gas: ${gasLimit.toString()}`);
      if (gasPrice) {
        console.log(`Gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`);
      }

      // Send sell transaction
      console.log("Sending sell transaction...");
      const tx = await (contractWithSigner as any).sell(tokenAmountWei, priceUpdateData, {
        value: updateFee,
        gasLimit: gasLimit,
        ...(gasPrice && { gasPrice })
      });
      
      console.log(`Transaction sent: ${tx.hash}`);
      
      return { tx, updateFee: ethers.formatEther(updateFee) };
    } catch (error) {
      console.error("Failed to sell ETF:", error);
      throw error;
    }
  }

  /**
   * Get signer from MetaMask/wallet
   */
  async getSigner(): Promise<ethers.Signer> {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      return provider.getSigner();
    }
    throw new Error("No wallet connected");
  }

  /**
   * Format price for display (assuming 8 decimal places like most price feeds)
   */
  static formatPrice(rawPrice: bigint, decimals: number = 8): string {
    if (rawPrice === BigInt(0)) return "N/A";
    
    try {
      const formatted = Number(rawPrice) / Math.pow(10, decimals);
      return formatted.toFixed(2);
    } catch (error) {
      return rawPrice.toString();
    }
  }
}

// Singleton instance
export const contractService = new ContractService();