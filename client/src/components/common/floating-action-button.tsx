import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <div className="floating-action">
      <Link href="/tools/weld-assistant">
        <Button
          size="lg"
          className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 hover:shadow-primary/40 transition-all duration-200 p-0"
          data-testid="fab-weld-assistant"
          title="AI Weld Assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
