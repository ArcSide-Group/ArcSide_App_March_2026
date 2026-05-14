import { Link, useLocation } from "wouter";
import { useBrand } from "@/hooks/useBrand";
import { useTranslation } from "@/lib/i18n";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { brand } = useBrand();
  const { t } = useTranslation();
  const showPoweredBy = brand.id !== "arcside";

  const navItems = [
    { href: "/", icon: "fas fa-home", label: t("nav.home"), testId: "home" },
    { href: "/tools", icon: "fas fa-wrench", label: t("nav.tools"), testId: "tools" },
    { href: "/ai-tools", icon: "fas fa-robot", label: t("nav.ai"), testId: "ai" },
    { href: "/settings", icon: "fas fa-cog", label: t("nav.settings"), testId: "settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="bottom-nav max-w-md mx-auto" style={{ backgroundColor: '#0a0a0a' }}>
      {showPoweredBy && (
        <div
          className="text-center text-[9px] tracking-[0.18em] uppercase text-slate-500/80 pt-1.5 pb-0.5 select-none"
          data-testid="text-powered-by-arcside"
        >
          Powered by <span className="text-primary/80 font-semibold">ArcSide</span>
        </div>
      )}
      <div className="grid grid-cols-4 items-center py-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <button
                className="flex flex-col items-center justify-center w-full py-2 min-h-[56px] transition-colors"
                data-testid={`nav-${item.testId}`}
                type="button"
              >
                <i
                  className={`${item.icon} text-xl mb-1`}
                  style={{ color: active ? 'hsl(var(--primary))' : '#b0b0b0' }}
                ></i>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: active ? 'hsl(var(--primary))' : '#b0b0b0' }}
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
