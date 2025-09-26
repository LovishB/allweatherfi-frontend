import { useState } from "react";
import { Header } from "@/components/Header";
import { AllocationChart } from "@/components/AllocationChart";
import { AllocationSliders } from "@/components/AllocationSliders";
import { RebalanceLogic } from "@/components/RebalanceLogic";

export default function Rebalance() {
  const [allocations, setAllocations] = useState({
    equity: 60,
    gold: 25,
    bonds: 15,
  });

  const handleAllocationChange = (asset: string, value: number) => {
    setAllocations(prev => ({
      ...prev,
      [asset]: value
    }));
  };

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
        </div>
      </section>

      {/* Dashboard Section */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
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
            <RebalanceLogic />
          </div>
        </div>
      </div>
    </div>
  );
}