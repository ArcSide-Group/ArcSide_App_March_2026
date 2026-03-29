import { Link, useLocation } from "wouter";

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
    if (path === "/calculators" && location.startsWith("/calculators")) return true;
    if (path === "/projects" && location.startsWith("/projects")) return true;
    return location === path;
  };

  return (
    <div className="bottom-nav bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around py-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`
                  relative flex flex-col items-center justify-center px-4 py-2 min-w-[60px] min-h-[56px] rounded-xl transition-all duration-200
                  ${active
                    ? "text-primary bg-primary/10"
                    : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  }
                `}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <i className={`${item.icon} text-xl mb-1 ${active ? "text-primary" : "text-foreground/70"}`}></i>
                <span className={`text-[11px] font-semibold tracking-wide ${active ? "text-primary" : "text-foreground/60"}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute bottom-1.5 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
