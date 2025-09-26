import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const RebalanceLogic = () => {
  const rebalanceData = `"trades": [
    { "sell": "BOND", "amount_tokens": 9, "expected_proceeds": 36 },
    { "sell": "GOLD", "amount_tokens": 4.33, "expected_proceeds": 78 },
    { "buy": "EQUITY", "amount_tokens": 9.5, "spend": 114 }
  ]`;

  const handleExecuteSwaps = () => {
    console.log("Executing swaps...");
    // Add swap execution logic here
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Rebalance Logic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={rebalanceData}
          readOnly
          className="min-h-[200px] font-mono text-sm"
        />
        <Button 
          onClick={handleExecuteSwaps}
          className="w-full"
        >
          Execute Swaps
        </Button>
      </CardContent>
    </Card>
  );
};