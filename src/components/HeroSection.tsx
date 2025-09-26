import { Badge } from "@/components/ui/badge";
import { Shield, Settings, Coins } from "lucide-react";

export const HeroSection = () => {
  const features = [
    { name: "Diversified", icon: Shield },
    { name: "Customised", icon: Settings },
    { name: "Tokenised", icon: Coins },
  ];

  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">
          <span className="text-foreground">All Weather RWAs</span>
          <span className="text-muted-foreground"> - </span>
          <span className="text-primary">Invest in S&P 500, Gold, Bonds</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Diversify your on-chain portfolio
        </p>
        
        <div className="flex items-center justify-center gap-4">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <Badge
                key={feature.name}
                variant="secondary"
                className="px-4 py-2 text-sm font-medium bg-muted text-muted-foreground flex items-center gap-2"
              >
                <IconComponent className="w-4 h-4" />
                {feature.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </section>
  );
};