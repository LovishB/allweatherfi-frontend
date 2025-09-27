import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { contractService, AssetPrice, ContractService } from "@/lib/contract";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const PriceDisplay = () => {
  const [prices, setPrices] = useState<AssetPrice[]>([]);
  const [aum, setAum] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [latestPrices, aumValue] = await Promise.all([
        contractService.getLatestPrices(),
        contractService.getAUM()
      ]);
      
      setPrices(latestPrices);
      setAum(aumValue);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError("Failed to fetch latest prices from contract");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getAssetIcon = (name: string) => {
    switch (name) {
      case 'VOO':
        return '📈'; // S&P 500 ETF
      case 'LQD':
        return '🏛️'; // Corporate Bonds
      case 'Gold':
        return '🥇'; // Gold
      case 'HBAR':
        return '⚡'; // HBAR
      default:
        return '💰';
    }
  };

  if (loading && prices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Asset Prices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-24 h-3 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-16 h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Asset Prices
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin ml-auto" />
          )}
        </CardTitle>
        {aum !== "0" && (
          <p className="text-sm text-muted-foreground">
            Total AUM: {parseFloat(aum).toFixed(4)} ETH
          </p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
            <button 
              onClick={fetchPrices}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((asset, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getAssetIcon(asset.name)}
                  </div>
                  <div>
                    <h4 className="font-medium">{asset.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {asset.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {asset.price === "N/A" ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : (
                      <span>
                        ${ContractService.formatPrice(asset.rawPrice, asset.decimals)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">USD</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <button 
            onClick={fetchPrices}
            disabled={loading}
            className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Refreshing..." : "Refresh Prices"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};