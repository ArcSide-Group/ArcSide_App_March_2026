import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/tools" && location.startsWith("/tools")) return true;
    return location === path;
  };

  return (
    <div className="bottom-nav bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        <Link href="/">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center p-2 h-auto ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
            data-testid="nav-home"
          >
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Home</span>
          </Button>
        </Link>
        
        <Link href="/tools/defect-analyzer">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center p-2 h-auto ${isActive("/tools") ? "text-primary" : "text-muted-foreground"}`}
            data-testid="nav-tools"
          >
            <i className="fas fa-tools text-lg mb-1"></i>
            <span className="text-xs">Tools</span>
          </Button>
        </Link>
        
        <Link href="/projects">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center p-2 h-auto ${isActive("/projects") ? "text-primary" : "text-muted-foreground"}`}
            data-testid="nav-projects"
          >
            <i className="fas fa-folder text-lg mb-1"></i>
            <span className="text-xs">Projects</span>
          </Button>
        </Link>
        
        <Link href="/subscription">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center p-2 h-auto ${isActive("/subscription") ? "text-primary" : "text-muted-foreground"}`}
            data-testid="nav-subscription"
          >
            <i className="fas fa-crown text-lg mb-1"></i>
            <span className="text-xs">Premium</span>
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex flex-col items-center p-2 h-auto ${isActive("/settings") ? "text-primary" : "text-muted-foreground"}`}
            data-testid="nav-settings"
          >
            <i className="fas fa-cog text-lg mb-1"></i>
            <span className="text-xs">Settings</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
