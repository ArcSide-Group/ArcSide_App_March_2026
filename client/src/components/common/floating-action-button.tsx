import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function FloatingActionButton() {
  return (
    <div className="floating-action">
      <Link href="/tools/weld-assistant">
        <Button
          size="lg"
          className="w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-[0_4px_20px_hsl(var(--primary)/0.5)] hover:scale-110 hover:shadow-[0_6px_28px_hsl(var(--primary)/0.65)] transition-all duration-200 p-0 border-2 border-white/20"
          data-testid="fab-weld-assistant"
          title="AI Weld Assistant"
        >
          <Sparkles className="h-[30px] w-[30px]" />
        </Button>
      </Link>
    </div>
  );
}
