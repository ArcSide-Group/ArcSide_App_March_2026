import { Link, useLocation } from "wouter";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: "fas fa-home", label: "Home" },
    { href: "/tools", icon: "fas fa-wrench", label: "Tools" },
    { href: "/ai-tools", icon: "fas fa-robot", label: "AI" },
    { href: "/settings", icon: "fas fa-cog", label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bottom-nav" style={{ backgroundColor: '#0f172a' }}>
      <div className="grid grid-cols-4 items-center py-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button
                className="flex flex-col items-center justify-center w-full py-2 min-h-[56px] transition-colors"
                data-testid={`nav-${item.label.toLowerCase()}`}
                type="button"
              >
                <i
                  className={`${item.icon} text-xl mb-1`}
                  style={{ color: active ? '#38bdf8' : '#94a3b8' }}
                ></i>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: active ? '#38bdf8' : '#94a3b8' }}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
