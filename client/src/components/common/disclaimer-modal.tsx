import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

interface DisclaimerModalProps {
  onAccepted: () => void;
}

export default function DisclaimerModal({ onAccepted }: DisclaimerModalProps) {
  const queryClient = useQueryClient();
  const [checked, setChecked] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/accept-disclaimer"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      onAccepted();
    },
  });

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(5, 12, 30, 0.97)" }}
      data-testid="modal-disclaimer"
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-5 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <i className="fas fa-shield-alt text-white text-base"></i>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Safety &amp; Liability Disclaimer
            </h2>
          </div>
          <p className="text-xs text-white/70 ml-12">
            Please read carefully before continuing
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">

          {/* Section 1 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5">
              <i className="fas fa-hard-hat text-primary text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                Professional Responsibility
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All calculations and AI-generated parameters are{" "}
                <span className="font-semibold text-foreground">recommendations only</span>.
                The user (Qualified Artisan/Welder) remains{" "}
                <span className="font-semibold text-foreground">solely responsible</span> for
                verifying settings and performing test welds (WPS/PQR) prior to production.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
              <i className="fas fa-exclamation-triangle text-destructive text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                No Liability
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">ArcSide Solutions</span> and its
                affiliates are{" "}
                <span className="font-semibold text-foreground">not liable</span> for any
                structural failures, equipment damage, or personal injury resulting from the use
                of this application.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center shrink-0 mt-0.5">
              <i className="fas fa-book text-accent text-sm"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground mb-1">
                South African Standards
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Users must ensure all work complies with{" "}
                <span className="font-semibold text-foreground">SANS and ISO</span> safety
                standards applicable to the specific project. This application is designed
                for use by qualified welding professionals.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="industrial-divider" />

          {/* Checkbox */}
          <label
            htmlFor="disclaimer-check"
            className="flex items-start gap-3 cursor-pointer group"
            data-testid="label-disclaimer-check"
          >
            <Checkbox
              id="disclaimer-check"
              checked={checked}
              onCheckedChange={(v) => setChecked(!!v)}
              className="mt-0.5 shrink-0 border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-disclaimer"
            />
            <p className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
              I confirm that I am a <span className="font-semibold text-foreground">qualified welding professional</span>,
              I have read and understood this disclaimer, and I accept full responsibility
              for verifying all parameters before use.
            </p>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 shrink-0 border-t border-border bg-card">
          <Button
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-wide rounded-xl shadow-lg transition-all duration-200 disabled:opacity-40"
            disabled={!checked || acceptMutation.isPending}
            onClick={() => acceptMutation.mutate()}
            data-testid="button-accept-disclaimer"
          >
            {acceptMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Saving…
              </>
            ) : (
              <>
                <i className="fas fa-check-circle mr-2"></i>
                I Understand &amp; Accept
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            This notice will only appear once.
          </p>
        </div>
      </div>
    </div>
  );
}
