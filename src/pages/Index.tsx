import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold animate-fade-in">
          Sentinel Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
          Advanced Admin Panel for Managing Users, Deals, and Revenue Analytics
        </p>
        <div className="animate-fade-in flex gap-4 justify-center">
          <Button className="text-lg px-8 py-6" onClick={() => window.location.href = '/auth'}>
            Admin Login
          </Button>
          <Button variant="outline" className="text-lg px-8 py-6" onClick={() => window.location.href = '/admin'}>
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
