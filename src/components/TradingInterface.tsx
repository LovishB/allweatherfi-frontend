import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@/contexts/WalletContext";
import { contractService } from "@/lib/contract";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TradingInterface = () => {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const { account, hbarBalance, refreshBalance } = useWallet();
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  const handleBuy = async () => {
    if (!buyAmount || !account) return;

    setIsBuying(true);
    try {
      toast({
        title: "Processing Buy Order",
        description: "Getting price updates and preparing transaction...",
      });

      // Get signer from wallet
      const signer = await contractService.getSigner();
      
      // Default allocation: 40% S&P, 40% Bonds, 20% Gold
      const weights = [40, 40, 20];
      
      // Call buy function
      const result = await contractService.buyETF(signer, buyAmount, weights);
      
      toast({
        title: "Transaction Sent",
        description: `Buy order submitted! Transaction hash: ${result.tx.hash}`,
      });

      // Wait for transaction confirmation
      const receipt = await result.tx.wait();
      
      toast({
        title: "Buy Order Successful",
        description: `Transaction confirmed! Block: ${receipt.blockNumber}`,
      });

      setBuyAmount("");
      await refreshBalance();
    } catch (error: any) {
      console.error("Buy failed:", error);
      toast({
        title: "Buy Order Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBuying(false);
    }
  };

  const handleSell = async () => {
    if (!sellAmount || !account) return;

    setIsSelling(true);
    try {
      toast({
        title: "Processing Sell Order",
        description: "Getting price updates and preparing transaction...",
      });

      // Get signer from wallet
      const signer = await contractService.getSigner();
      
      // Call sell function
      const result = await contractService.sellETF(signer, sellAmount);
      
      toast({
        title: "Transaction Sent",
        description: `Sell order submitted! Transaction hash: ${result.tx.hash}`,
      });

      // Wait for transaction confirmation
      const receipt = await result.tx.wait();
      
      toast({
        title: "Sell Order Successful",
        description: `Transaction confirmed! Block: ${receipt.blockNumber}`,
      });

      setSellAmount("");
      await refreshBalance();
    } catch (error: any) {
      console.error("Sell failed:", error);
      toast({
        title: "Sell Order Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSelling(false);
    }
  };

  const isSellMode = activeTab === "sell";

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">Trading</CardTitle>
            {account && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  Balance: {hbarBalance} HBAR
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!account ? (
          <div className="text-center py-8 text-muted-foreground">
            Please connect your wallet to start trading
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="buy"
                className={activeTab === "buy" ? "bg-primary text-primary-foreground" : ""}
              >
                Buy
              </TabsTrigger>
              <TabsTrigger 
                value="sell"
                className={activeTab === "sell" ? "bg-destructive text-destructive-foreground" : ""}
              >
                Sell
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="buy-amount">Amount (HBAR)</Label>
                <Input
                  id="buy-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  max={hbarBalance}
                />
                <div className="text-xs text-muted-foreground">
                  Available: {hbarBalance} HBAR
                </div>
              </div>
              <Button 
                onClick={handleBuy} 
                className="w-full"
                disabled={!buyAmount || parseFloat(buyAmount) > parseFloat(hbarBalance) || isBuying}
              >
                {isBuying ? "Processing..." : "Buy Portfolio"}
              </Button>
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sell-amount">Amount (HBAR)</Label>
                <Input
                  id="sell-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleSell} 
                className="w-full"
                disabled={!sellAmount || isSelling}
                variant={isSellMode ? "destructive" : "default"}
              >
                {isSelling ? "Processing..." : "Sell Portfolio"}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};