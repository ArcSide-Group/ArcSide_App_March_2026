
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Wrench, Bot, FolderOpen, Settings, CreditCard } from "lucide-react";
import logoPath from "@assets/ArcSide Professional Logo_20250826_195657_0000_1764605043277.png";

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
          ${mobile ? 'w-full justify-start gap-3 px-4 py-3 h-auto' : 'gap-2 px-3 py-2'}
          text-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-200
          ${isActive(href) ? 'bg-primary/20 text-primary' : ''}
        `}
        onClick={() => mobile && setIsOpen(false)}
      >
        <>
          <Icon className={`${mobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <span className={mobile ? 'text-base' : 'text-sm font-medium'}>{label}</span>
        </>
      </Button>
    </Link>
  );

  return (
    <header className="header-professional">
      <div className="max-w-sm mx-auto">
        {/* Full Width Banner Logo */}
        <Link href="/">
          <div className="w-full bg-gradient-to-r from-[#4CAF50]/10 via-blue-500/10 to-[#4CAF50]/10 py-4 px-4 cursor-pointer hover:opacity-90 transition-opacity border-b border-primary/20">
            <div className="flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4CAF50] to-blue-500 bg-clip-text text-transparent">
                ArcSide™
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Professional Welding Platform</p>
            </div>
          </div>
        </Link>

        {/* Navigation Bar */}
        <div className="flex h-12 items-center justify-between px-4 border-b border-border">
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-1 flex-1">
            {navigationItems.slice(1).map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-card border-l border-border">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-border pb-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg bg-gradient-to-r from-[#4CAF50] to-blue-500 bg-clip-text text-transparent">ArcSide™</span>
                    <span className="text-xs text-muted-foreground -mt-1">Professional</span>
                  </div>
                </div>
                <nav className="flex flex-col space-y-2">
                  {navigationItems.map((item) => (
                    <NavLink key={item.href} {...item} mobile />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
