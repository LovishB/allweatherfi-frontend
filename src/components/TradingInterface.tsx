import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const TradingInterface = () => {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");

  const handleBuy = () => {
    if (buyAmount) {
      console.log("Buy amount:", buyAmount);
      // Add buy logic here
      setBuyAmount("");
    }
  };

  const handleSell = () => {
    if (sellAmount) {
      console.log("Sell amount:", sellAmount);
      // Add sell logic here
      setSellAmount("");
    }
  };

  const isSellMode = activeTab === "sell";

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Trading</CardTitle>
      </CardHeader>
      <CardContent>
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
              <Label htmlFor="buy-amount">Amount (USD)</Label>
              <Input
                id="buy-amount"
                type="number"
                placeholder="Enter amount"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleBuy} 
              className="w-full"
              disabled={!buyAmount}
            >
              Buy Portfolio
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="sell-amount">Amount (USD)</Label>
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
              disabled={!sellAmount}
              variant={isSellMode ? "destructive" : "default"}
            >
              Sell Portfolio
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};