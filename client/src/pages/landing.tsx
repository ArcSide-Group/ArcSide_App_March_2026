import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Container */}
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border relative">
        
        {/* Hero Section */}
        <div className="text-center pt-12 pb-8 px-6 hero-section">
          <img 
            src={logoPath}
            alt="ArcSide Mobile App" 
            className="h-32 w-auto mx-auto mb-6 object-contain rounded-xl logo-glow"
            data-testid="img-arcside-logo-hero"
          />
          <Badge variant="secondary" className="text-xs bg-primary/20 text-primary border-primary/30">
            The App Made by Tradesmen for Tradesmen
          </Badge>
        </div>

        {/* Features */}
        <div className="px-6 mb-8">
          <div className="grid gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-search text-primary"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Defect Analysis</h3>
                    <p className="text-xs text-muted-foreground">Identify and solve weld defects with AI-powered analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-alt text-accent"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">WPS Generation</h3>
                    <p className="text-xs text-muted-foreground">Generate professional welding procedures automatically</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-chart-1/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-layer-group text-chart-1"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Material Compatibility</h3>
                    <p className="text-xs text-muted-foreground">Check material combinations and get expert recommendations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-robot text-primary-foreground"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">AI Weld Assistant</h3>
                    <p className="text-xs text-muted-foreground">Get instant answers to any welding question from our AI expert</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trusted By */}
        <div className="px-6 mb-8">
          <p className="text-center text-xs text-muted-foreground mb-4">Trusted by welding professionals worldwide</p>
          <div className="flex justify-center space-x-6 text-muted-foreground">
            <div className="text-center">
              <div className="text-lg font-bold">10K+</div>
              <div className="text-xs">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">50K+</div>
              <div className="text-xs">Analyses</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">1K+</div>
              <div className="text-xs">WPS Generated</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-8">
          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold"
            data-testid="button-login"
          >
            Get Started - Sign In
          </Button>
          
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-xs text-muted-foreground">Free Plan Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">No Credit Card Required</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Start with 5 free analyses daily. Upgrade anytime for unlimited access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs text-muted-foreground">
            © 2025 ArcSide™ - Professional Welding Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
