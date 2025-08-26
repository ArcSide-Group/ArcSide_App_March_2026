import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: "fas fa-home", label: "Home" },
    { href: "/calculators", icon: "fas fa-calculator", label: "Calculators" },
    { href: "/projects", icon: "fas fa-folder", label: "Projects" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path === "/tools" && location.startsWith("/tools")) return true;
    if (path === "/calculators" && location.startsWith("/calculators")) return true;
    return location === path;
  };

  return (
    <div className="bottom-nav bg-card border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center p-2 h-auto ${isActive(item.href) ? "text-primary" : "text-muted-foreground"}`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs">{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}