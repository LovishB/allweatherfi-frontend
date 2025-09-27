import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AllocationChart } from "@/components/AllocationChart";
import { AllocationSliders } from "@/components/AllocationSliders";
import { RebalanceLogic } from "@/components/RebalanceLogic";
import { useWallet } from "@/contexts/WalletContext";
import { ApiService, GetPortfolioRequest } from "@/lib/api";
import { ContractService } from "@/lib/contract";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function Rebalance() {
  const { account } = useWallet();
  const [allocations, setAllocations] = useState({
    equity: 60,
    gold: 25,
    bonds: 15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllocationChange = (asset: string, value: number) => {
    setAllocations(prev => ({
      ...prev,
      [asset]: value
    }));
  };

  // Fetch latest allocation from backend
  const fetchLatestAllocation = async () => {
    if (!account) {
      console.log("No wallet connected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get latest prices from contract
      const contractService = new ContractService();
      const prices = await contractService.getLatestPrices();
      
      // Map prices to the API format (assuming prices array contains [VOO, LQD, Gold, HBAR])
      // Convert string prices to numbers and handle potential scaling based on decimals
      const parsePrice = (priceData: any, fallback: number) => {
        if (!priceData?.price || priceData.price === "N/A") return fallback;
        const numPrice = parseFloat(priceData.price);
        // If the price seems to be in wei or has high decimals, scale it down
        if (numPrice > 1000000) {
          return numPrice / Math.pow(10, priceData.decimals || 18);
        }
        return numPrice;
      };

      const priceEquity = parsePrice(prices[0], 1.2); // VOO price
      const priceBonds = parsePrice(prices[1], 1.0);  // LQD price  
      const priceGold = parsePrice(prices[2], 2.5);   // Gold price

      // Call backend API
      const request: GetPortfolioRequest = {
        userWallet: account,
        priceEquity,
        priceBonds,
        priceGold,
      };

      const portfolioResponse = await ApiService.getPortfolio(request);
      
      // Round the allocations to ensure they sum to 100%
      const roundedAllocations = ApiService.roundAllocationsToHundred({
        equity: portfolioResponse.weights.equity * 100, // Convert from decimal to percentage
        bonds: portfolioResponse.weights.bonds * 100,
        gold: portfolioResponse.weights.gold * 100,
      });

      setAllocations(roundedAllocations);
      
    } catch (err) {
      console.error("Error fetching portfolio:", err);
      setError("Failed to fetch latest portfolio allocation. Using default values.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch allocation on component mount and when account changes
  useEffect(() => {
    fetchLatestAllocation();
  }, [account]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="w-full py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-foreground">Customised your Portfolio</span>
            <span className="text-muted-foreground"> - </span>
            <span className="text-primary">Different investors, Different needs</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Rebalance your portfolio to match your investment strategy
          </p>
          
          {/* Refresh Button */}
          {account && (
            <div className="flex justify-center mb-8">
              <Button 
                onClick={fetchLatestAllocation} 
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Fetching Latest Allocation...' : 'Refresh Portfolio Allocation'}
              </Button>
            </div>
          )}
          
          {/* Wallet Connection Prompt */}
          {!account && (
            <div className="flex justify-center mb-8">
              <p className="text-muted-foreground text-sm">
                Connect your wallet to fetch your latest portfolio allocation
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground text-sm">
              Fetching latest portfolio allocation...
            </p>
          </div>
        )}

        <div className="grid grid-cols-10 gap-6">
          {/* Left Side - Chart and Sliders (70%) */}
          <div className="col-span-7 space-y-6">
            <AllocationChart allocations={allocations} />
            <AllocationSliders 
              allocations={allocations} 
              onAllocationChange={handleAllocationChange}
            />
          </div>

          {/* Right Side - Rebalance Logic (30%) */}
          <div className="col-span-3">
            <RebalanceLogic currentAllocations={allocations} />
          </div>
        </div>
      </div>
    </div>
  );
}