import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface AllocationSlidersProps {
  allocations: {
    equity: number;
    gold: number;
    bonds: number;
  };
  onAllocationChange: (asset: string, value: number) => void;
}

// Function to handle allocation changes while maintaining integer values and 100% sum
const handleAllocationAdjustment = (
  currentAllocations: { equity: number; gold: number; bonds: number },
  changedAsset: string,
  newValue: number,
  onAllocationChange: (asset: string, value: number) => void
) => {
  const roundedNewValue = Math.round(newValue);
  const assets = ['equity', 'gold', 'bonds'] as const;
  const otherAssets = assets.filter(asset => asset !== changedAsset);
  
  // Calculate the remaining allocation for other assets
  const remainingAllocation = 100 - roundedNewValue;
  
  if (remainingAllocation < 0) {
    // If new value exceeds 100%, set it to 100% and others to 0%
    onAllocationChange(changedAsset, 100);
    otherAssets.forEach(asset => onAllocationChange(asset, 0));
    return;
  }
  
  if (remainingAllocation === 0) {
    // If new value is 100%, set others to 0%
    onAllocationChange(changedAsset, 100);
    otherAssets.forEach(asset => onAllocationChange(asset, 0));
    return;
  }
  
  // Calculate current total of other assets
  const currentOtherTotal = otherAssets.reduce((sum, asset) => sum + currentAllocations[asset], 0);
  
  if (currentOtherTotal === 0) {
    // If other assets are 0, distribute remaining equally
    const equalShare = Math.floor(remainingAllocation / otherAssets.length);
    const remainder = remainingAllocation % otherAssets.length;
    
    onAllocationChange(changedAsset, roundedNewValue);
    otherAssets.forEach((asset, index) => {
      const value = equalShare + (index < remainder ? 1 : 0);
      onAllocationChange(asset, value);
    });
  } else {
    // Proportionally adjust other assets to maintain their relative ratios
    let adjustedAllocations = otherAssets.map(asset => {
      const proportion = currentAllocations[asset] / currentOtherTotal;
      return Math.floor(proportion * remainingAllocation);
    });
    
    // Handle rounding errors to ensure sum equals 100%
    const adjustedSum = adjustedAllocations.reduce((sum, val) => sum + val, 0);
    const difference = remainingAllocation - adjustedSum;
    
    // Distribute any remaining difference to the largest allocations
    if (difference > 0) {
      const sortedIndices = adjustedAllocations
        .map((val, idx) => ({ val, idx }))
        .sort((a, b) => b.val - a.val)
        .map(item => item.idx);
      
      for (let i = 0; i < difference; i++) {
        adjustedAllocations[sortedIndices[i % sortedIndices.length]]++;
      }
    }
    
    onAllocationChange(changedAsset, roundedNewValue);
    otherAssets.forEach((asset, index) => {
      onAllocationChange(asset, adjustedAllocations[index]);
    });
  }
};

export const AllocationSliders = ({ allocations, onAllocationChange }: AllocationSlidersProps) => {
  const sliderConfig = [
    {
      key: "equity",
      label: "Equity (S&P 500)",
      value: allocations.equity,
      color: "hsl(var(--equity))",
    },
    {
      key: "gold",
      label: "Gold",
      value: allocations.gold,
      color: "hsl(var(--gold))",
    },
    {
      key: "bonds",
      label: "Bonds",
      value: allocations.bonds,
      color: "hsl(var(--bonds))",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Allocation Settings</h3>
      
      {sliderConfig.map((slider) => (
        <div key={slider.key} className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor={slider.key} className="text-sm font-medium text-foreground">
              {slider.label}
            </Label>
            <span className="text-sm font-medium text-muted-foreground">
              {slider.value}%
            </span>
          </div>
          
          <Slider
            id={slider.key}
            min={0}
            max={100}
            step={1}
            value={[slider.value]}
            onValueChange={(value) => handleAllocationAdjustment(allocations, slider.key, value[0], onAllocationChange)}
            className="w-full"
            style={{
              "--slider-thumb-bg": slider.color,
              "--slider-track-bg": `${slider.color}40`,
            } as React.CSSProperties}
          />
        </div>
      ))}
      
      <div className="mt-4 p-3 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          Total: {allocations.equity + allocations.gold + allocations.bonds}%
        </p>
      </div>
    </div>
  );
};