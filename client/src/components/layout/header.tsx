
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Wrench, Bot, FolderOpen, Settings, CreditCard } from "lucide-react";
import logoPath from "@assets/image_1773535782481(2)_1774714538260.jpg";

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/ai-tools", icon: Bot, label: "AI Tools" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/subscription", icon: CreditCard, label: "Subscription" },
];

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const NavLink = ({ href, icon: Icon, label, mobile = false }: {
    href: string;
    icon: any;
    label: string;
    mobile?: boolean;
  }) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={`
          ${mobile ? 'w-full justify-start gap-3 px-4 py-3 h-auto text-base' : 'gap-2 px-3 py-2'}
          text-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200
          ${isActive(href) ? 'bg-primary/20 text-primary font-semibold' : ''}
        `}
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
      <div className="max-w-sm mx-auto">
        {/* Single Navigation Bar — logo left, menu right */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          {/* Logo — left side of nav bar */}
          <Link href="/">
            <img
              src={logoPath}
              alt="ArcSide Mobile App"
              className="h-9 w-auto object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
              data-testid="img-arcside-logo-header"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.slice(1).map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Mobile Menu Button — 44px tap target */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors h-11 w-11"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card border-l border-border">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 px-4 pb-4 border-b border-border">
                  <img
                    src={logoPath}
                    alt="ArcSide Mobile App"
                    className="h-8 w-auto object-contain rounded"
                    data-testid="img-arcside-logo-menu"
                  />
                </div>
                <nav className="flex flex-col space-y-1 px-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.href} {...item} mobile />
                  ))}
                  <div className="mt-2 pt-2 border-t border-border">
                    <Link href="/disclaimer">
                      <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 h-auto text-base text-accent hover:bg-accent/10" onClick={() => setIsOpen(false)}>
                        <i className="fas fa-shield-alt h-5 w-5 shrink-0 text-sm"></i>
                        <span>Disclaimer</span>
                      </Button>
                    </Link>
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
