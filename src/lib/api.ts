// API service for backend communication

const API_BASE_URL = 'http://localhost:3000';

export interface GetPortfolioRequest {
  userWallet: string;
  priceEquity: number;
  priceBonds: number;
  priceGold: number;
}

export interface TokenBalance {
  tokenId: string;
  balance: number;
  value: number;
}

export interface GetPortfolioResponse {
  userWallet: string;
  totalValue: number;
  weights: {
    equity: number;
    bonds: number;
    gold: number;
  };
  balances: TokenBalance[];
}

export interface RebalanceCheckRequest {
  userWallet: string;
  balanceOfEquity: number;
  balanceOfGold: number;
  balanceOfBonds: number;
  priceOfEquity: number;
  priceOfGold: number;
  priceOfBonds: number;
  currentWeightEquity: number;
  currentWeightGold: number;
  currentWeightBonds: number;
  targetWeightEquity: number;
  targetWeightGold: number;
  targetWeightBonds: number;
}

export interface RebalanceCheckResponse {
  userWallet: string;
  rebalancePlan: {
    mint: {
      equity: number;
      gold: number;
      bonds: number;
    };
    burn: {
      equity: number;
      gold: number;
      bonds: number;
    };
  };
  explanation: string;
}

export interface CheckMintRequest {
  userWalletAddress: string;
  amountHbar: number;
  priceHbar: number;
  priceEquity: number;
  priceBonds: number;
  priceGold: number;
  weightEquity: number;
  weightGold: number;
  weightBonds: number;
}

export interface CheckMintResponse {
  userWalletAddress: string;
  totalInvestmentUsd: number;
  allocations: {
    equity: number;
    gold: number;
    bonds: number;
  };
  tokensToMint: {
    equity: number;
    gold: number;
    bonds: number;
  };
  transactions?: {
    equity: {
      mintTxId: string;
      transferTxId: string;
      hashscanMintUrl: string;
      hashscanTransferUrl: string;
    };
    gold: {
      mintTxId: string;
      transferTxId: string;
      hashscanMintUrl: string;
      hashscanTransferUrl: string;
    };
    bonds: {
      mintTxId: string;
      transferTxId: string;
      hashscanMintUrl: string;
      hashscanTransferUrl: string;
    };
  };
}

export class ApiService {
  static async getPortfolio(request: GetPortfolioRequest): Promise<GetPortfolioResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/getPortfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }

  static async rebalanceCheck(request: RebalanceCheckRequest): Promise<RebalanceCheckResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/rebalanceCheck`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking rebalance:', error);
      throw error;
    }
  }

  static async checkMint(request: CheckMintRequest): Promise<CheckMintResponse> {
    try {
      console.log('CheckMint request:', request);
      const response = await fetch(`${API_BASE_URL}/checkMint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking mint:', error);
      throw error;
    }
  }

  // Helper function to round allocations while maintaining 100% total
  static roundAllocationsToHundred(weights: { equity: number; bonds: number; gold: number }) {
    // Round each value
    const rounded = {
      equity: Math.round(weights.equity),
      bonds: Math.round(weights.bonds),
      gold: Math.round(weights.gold),
    };

    // Calculate total and adjust if needed
    const total = rounded.equity + rounded.bonds + rounded.gold;
    const difference = 100 - total;

    if (difference !== 0) {
      // Find the largest allocation to adjust
      const assets = Object.entries(rounded) as [keyof typeof rounded, number][];
      assets.sort((a, b) => b[1] - a[1]);
      
      // Adjust the largest allocation
      const largestAsset = assets[0][0];
      rounded[largestAsset] += difference;
      
      // Ensure no negative values
      if (rounded[largestAsset] < 0) {
        rounded[largestAsset] = 0;
        const remaining = 100 - rounded.equity - rounded.bonds - rounded.gold;
        // Distribute remaining to other assets
        const otherAssets = assets.slice(1);
        if (otherAssets.length > 0) {
          otherAssets[0] && (rounded[otherAssets[0][0]] += remaining);
        }
      }
    }

    return rounded;
  }
}