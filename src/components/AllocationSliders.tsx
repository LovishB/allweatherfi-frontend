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
            onValueChange={(value) => onAllocationChange(slider.key, value[0])}
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