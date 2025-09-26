import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <Dashboard />
    </div>
  );
};

export default Index;
