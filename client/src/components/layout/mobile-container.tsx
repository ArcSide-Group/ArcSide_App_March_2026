import { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex justify-center">
      <div className="mobile-container w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
