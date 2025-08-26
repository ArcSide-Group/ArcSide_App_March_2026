import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function FloatingActionButton() {
  return (
    <div className="floating-action">
      <Link href="/tools/weld-assistant">
        <Button 
          size="lg"
          className="w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:scale-105 transition-transform p-0"
          data-testid="fab-weld-assistant"
        >
          <i className="fas fa-robot text-xl"></i>
        </Button>
      </Link>
    </div>
  );
}
