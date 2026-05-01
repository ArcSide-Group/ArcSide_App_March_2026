import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Wrench, Bot, FolderOpen, Settings, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";

const navigationItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/ai-tools", icon: Bot, label: "AI Tools" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/subscription", icon: CreditCard, label: "Subscription" },
];

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { brand } = useBrand();
  const isAdmin = (user as any)?.role === "admin";

  const BrandMark = ({ size, testId }: { size: "header" | "menu"; testId: string }) => {
    if (brand.logo) {
      return (
        <img
          src={brand.logo}
          alt={brand.name}
          className={`${size === "header" ? "h-11" : "h-12"} w-auto object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity logo-glow`}
          data-testid={testId}
        />
      );
    }
    return (
      <span
        className={`${size === "header" ? "text-base" : "text-lg"} font-extrabold tracking-tight text-primary cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap`}
        data-testid={testId}
      >
        {brand.name}
      </span>
    );
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? location === "/" || location === "/dashboard"
      : location.startsWith(href);

  const NavLink = ({ href, icon: Icon, label, mobile = false }: { href: string; icon: any; label: string; mobile?: boolean }) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={mobile ? `w-full justify-start gap-3 px-4 py-3 h-auto text-base rounded-md border transition-colors duration-200 ${isActive(href) ? 'bg-primary/30 text-primary font-semibold border-primary/40' : 'bg-slate-800/50 dark:bg-slate-700/40 text-slate-100 border-slate-600/60 hover:bg-primary/20 hover:text-primary hover:border-primary/30'}` : `gap-2 px-3 py-2 transition-colors duration-200 text-foreground hover:bg-primary/10 hover:text-primary ${isActive(href) ? 'bg-primary/20 text-primary font-semibold' : ''}`}
        onClick={() => mobile && setIsOpen(false)}
      >
        <>
          <Icon className={`${mobile ? 'h-5 w-5' : 'h-4 w-4'} shrink-0`} />
          <span className={mobile ? 'text-base' : 'text-sm font-medium'}>{label}</span>
        </>
      </Button>
    </Link>
  );

  return (
    <header className="header-professional">
      <div className="max-w-[600px] landscape:max-w-[900px] md:max-w-[800px] mx-auto">
        {user?.firstName && (
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/30 px-4 py-2">
            <p className="text-xs font-bold text-primary flex items-center gap-2">Welcome, <span className="text-foreground font-bold">{user.firstName}</span></p>
          </div>
        )}
        <div className="flex h-14 items-center justify-between px-3 border-b border-border relative gap-4">
          <div className="w-11" />
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <BrandMark size="header" testId="brand-mark-header" />
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.slice(1).map((item) => <NavLink key={item.href} {...item} />)}
            {isAdmin && <NavLink href="/admin-portal" icon={Settings} label="Admin" />}
          </nav>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden"><Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors h-11 w-11" data-testid="button-mobile-menu"><Menu className="h-6 w-6" /><span className="sr-only">Toggle menu</span></Button></SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-[#0a0a0a] dark:bg-[#111111] border-l border-[#2a2a2a]">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center justify-center gap-3 px-4 pb-4 border-b border-border"><BrandMark size="menu" testId="brand-mark-menu" /></div>
                <nav className="flex flex-col space-y-1 px-2">
                  {navigationItems.map((item) => <NavLink key={item.href} {...item} mobile />)}
                  {isAdmin && <NavLink href="/admin-portal" icon={Settings} label="Admin" mobile />}
                  <div className="mt-2 pt-2 border-t border-slate-700"><Link href="/disclaimer"><Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 h-auto text-base rounded-md border bg-slate-800/50 border-slate-600/60 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/30 transition-colors duration-200" onClick={() => setIsOpen(false)}><i className="fas fa-shield-alt h-5 w-5 shrink-0 text-sm"></i><span>Disclaimer</span></Button></Link></div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
