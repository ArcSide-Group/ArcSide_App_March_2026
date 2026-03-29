import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mobile-container">
        {children}
      </div>
    </div>
  );
}
