
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Wrench, Bot, FolderOpen, Settings, CreditCard } from "lucide-react";

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
          text-white hover:bg-white/10 hover:text-white transition-colors duration-200
          ${isActive(href) ? 'bg-white/20 text-white' : ''}
        `}
        onClick={() => mobile && setIsOpen(false)}
      >
        {href === "/" && !mobile ? (
          <img
            src="/attached_assets/ArcSide Professional Logo_20250826_195657_0000_1756232563353.png"
            alt="ArcSide Professional"
            className="h-8 w-auto"
          />
        ) : (
          <>
            <Icon className={`${mobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
            <span className={mobile ? 'text-base' : 'text-sm font-medium'}>{label}</span>
          </>
        )}
      </Button>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900 backdrop-blur supports-[backdrop-filter]:bg-gray-900/95">
      <div className="max-w-sm mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo/Home Link */}
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src="/attached_assets/ArcSide Professional Logo_20250826_195657_0000_1756232563353.png"
                alt="ArcSide Professional"
                className="h-10 w-auto"
              />
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.slice(1).map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-gray-900 border-l border-gray-800">
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 pb-4">
                  <img
                    src="/attached_assets/ArcSide Professional Logo_20250826_195657_0000_1756232563353.png"
                    alt="ArcSide Professional"
                    className="h-8 w-auto"
                  />
                  <span className="font-semibold text-white">ArcSide™</span>
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
