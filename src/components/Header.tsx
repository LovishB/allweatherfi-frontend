import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname === "/rebalance") return "Rebalance";
    return "Dashboard";
  };

  const handleTabClick = (tab: string) => {
    if (tab === "Dashboard") {
      navigate("/");
    } else if (tab === "Rebalance") {
      navigate("/rebalance");
    }
  };

  return (
    <header className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold text-foreground">
            AllWeatherFi
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-8">
            {["Dashboard", "Rebalance"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  getActiveTab() === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Wallet Connect Button */}
          <Button>
            Wallet Connect
          </Button>
        </div>
      </div>
    </header>
  );
};