import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { ApiService, GetPortfolioResponse, RebalanceCheckRequest } from "@/lib/api";

interface RebalanceLogicProps {
  currentAllocations?: {
    equity: number;
    gold: number;
    bonds: number;
  };
  portfolioData?: GetPortfolioResponse | null;
  currentPrices?: {
    equity: number;
    bonds: number;
    gold: number;
  };
}

export const RebalanceLogic = ({ currentAllocations, portfolioData, currentPrices }: RebalanceLogicProps) => {
  const { account } = useWallet();
  const [trades, setTrades] = useState<Array<{ trade: string; asset: string; amount: number }>>([
    { trade: "Sell", asset: "BOND", amount: 9 },
    { trade: "Sell", asset: "GOLD", amount: 4.33 },
    { trade: "Buy", asset: "EQUITY", amount: 9.5 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");

  const handleRebalance = async () => {
    if (!account || !portfolioData || !currentAllocations || !currentPrices) {
      console.log("Missing required data for rebalancing");
      return;
    }

    setIsLoading(true);

    try {
      // Debug: Log the portfolio data structure
      console.log("Portfolio data:", portfolioData);
      console.log("Balances:", portfolioData.balances);
      console.log("Is balances an array?", Array.isArray(portfolioData.balances));

      // Check if balances is an array, if not, use default values
      let equityBalance = 0;
      let goldBalance = 0;
      let bondsBalance = 0;

      if (Array.isArray(portfolioData.balances)) {
        equityBalance = portfolioData.balances.find(b => 
          b.tokenId.toLowerCase().includes('equity') || 
          b.tokenId.toLowerCase().includes('voo')
        )?.balance || 0;
        
        goldBalance = portfolioData.balances.find(b => 
          b.tokenId.toLowerCase().includes('gold') || 
          b.tokenId.toLowerCase().includes('xau')
        )?.balance || 0;
        
        bondsBalance = portfolioData.balances.find(b => 
          b.tokenId.toLowerCase().includes('bonds') || 
          b.tokenId.toLowerCase().includes('lqd')
        )?.balance || 0;
      } else {
        console.warn("portfolioData.balances is not an array, using default values");
        // If balances is not an array, we could try to extract values from the weights and total value
        // as a fallback approach
        equityBalance = (portfolioData.weights.equity * portfolioData.totalValue) / (currentPrices.equity || 1);
        goldBalance = (portfolioData.weights.gold * portfolioData.totalValue) / (currentPrices.gold || 1);
        bondsBalance = (portfolioData.weights.bonds * portfolioData.totalValue) / (currentPrices.bonds || 1);
      }

      // Prepare rebalance request
      const rebalanceRequest: RebalanceCheckRequest = {
        userWallet: account,
        balanceOfEquity: equityBalance,
        balanceOfGold: goldBalance,
        balanceOfBonds: bondsBalance,
        priceOfEquity: currentPrices.equity,
        priceOfGold: currentPrices.gold,
        priceOfBonds: currentPrices.bonds,
        currentWeightEquity: portfolioData.weights.equity,
        currentWeightGold: portfolioData.weights.gold,
        currentWeightBonds: portfolioData.weights.bonds,
        targetWeightEquity: currentAllocations.equity / 100, // Convert percentage to decimal
        targetWeightGold: currentAllocations.gold / 100,
        targetWeightBonds: currentAllocations.bonds / 100,
      };

      console.log("Rebalance request:", rebalanceRequest);

      const response = await ApiService.rebalanceCheck(rebalanceRequest);
      
      // Convert response to trades format
      const newTrades: Array<{ trade: string; asset: string; amount: number }> = [];
      
      // Add mint operations
      if (response.rebalancePlan.mint.equity > 0) {
        newTrades.push({ trade: "Buy", asset: "EQUITY", amount: response.rebalancePlan.mint.equity });
      }
      if (response.rebalancePlan.mint.gold > 0) {
        newTrades.push({ trade: "Buy", asset: "GOLD", amount: response.rebalancePlan.mint.gold });
      }
      if (response.rebalancePlan.mint.bonds > 0) {
        newTrades.push({ trade: "Buy", asset: "BONDS", amount: response.rebalancePlan.mint.bonds });
      }

      // Add burn operations
      if (response.rebalancePlan.burn.equity > 0) {
        newTrades.push({ trade: "Sell", asset: "EQUITY", amount: response.rebalancePlan.burn.equity });
      }
      if (response.rebalancePlan.burn.gold > 0) {
        newTrades.push({ trade: "Sell", asset: "GOLD", amount: response.rebalancePlan.burn.gold });
      }
      if (response.rebalancePlan.burn.bonds > 0) {
        newTrades.push({ trade: "Sell", asset: "BONDS", amount: response.rebalancePlan.burn.bonds });
      }

      setTrades(newTrades);
      setExplanation(response.explanation);

    } catch (error) {
      console.error("Error during rebalancing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Rebalance Logic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {explanation && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">Analysis:</p>
            <div className="text-muted-foreground whitespace-pre-line">
              {explanation}
            </div>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Trade</th>
                <th className="px-4 py-2 text-left">Asset</th>
                <th className="px-4 py-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-center text-muted-foreground">
                    Click "Rebalance" to calculate required trades
                  </td>
                </tr>
              ) : (
                trades.map((t, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{t.trade}</td>
                    <td className="px-4 py-2">{t.asset}</td>
                    <td className="px-4 py-2">{t.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Button 
          onClick={handleRebalance}
          className="w-full"
          disabled={isLoading || !account || !portfolioData}
        >
          {isLoading ? 'Calculating...' : 'Rebalance'}
        </Button>
      </CardContent>
    </Card>
  );
};
// ...existing code...