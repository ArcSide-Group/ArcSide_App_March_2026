import { ReactNode } from "react";
import StatusBar from "./status-bar";

interface MobileContainerProps {
  children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mobile-container">
        <StatusBar />
        {children}
      </div>
    </div>
  );
}
