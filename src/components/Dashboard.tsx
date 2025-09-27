import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationChart } from "./AllocationChart";
import { AllocationSliders } from "./AllocationSliders";
import { TradingInterface } from "./TradingInterface";
import { PriceDisplay } from "./PriceDisplay";

export const Dashboard = () => {
  const [allocations, setAllocations] = useState({
    equity: 40,
    gold: 30,
    bonds: 30,
  });

  const handleAllocationChange = useCallback((asset: string, value: number) => {
    setAllocations(prev => {
      const newAllocations = { ...prev, [asset]: value };
      
      // Auto-adjust other allocations to maintain 100% total
      const total = Object.values(newAllocations).reduce((sum, val) => sum + val, 0);
      
      if (total > 100) {
        // If over 100%, proportionally reduce other assets
        const excess = total - 100;
        const otherAssets = Object.keys(newAllocations).filter(key => key !== asset);
        const otherTotal = otherAssets.reduce((sum, key) => sum + newAllocations[key as keyof typeof newAllocations], 0);
        
        if (otherTotal > 0) {
          otherAssets.forEach(key => {
            const proportion = newAllocations[key as keyof typeof newAllocations] / otherTotal;
            newAllocations[key as keyof typeof newAllocations] = Math.max(0, 
              newAllocations[key as keyof typeof newAllocations] - (excess * proportion)
            );
          });
        }
      }
      
      return newAllocations;
    });
  }, []);

  return (
    <section className="w-full py-8 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left side - Portfolio Allocation (70%) */}
          <div className="lg:col-span-7">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <AllocationChart allocations={allocations} />
                  </div>
                  <div>
                    <AllocationSliders 
                      allocations={allocations}
                      onAllocationChange={handleAllocationChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Trading Interface and Prices (30%) */}
          <div className="lg:col-span-3 space-y-6">
            <TradingInterface allocations={allocations} />
            <PriceDisplay />
          </div>
        </div>
      </div>
    </section>
  );
};