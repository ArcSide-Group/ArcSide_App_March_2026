import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { BRANDS, type BrandId } from "@/lib/brandingConfig";

export default function AdminPortal() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const isAdmin = (user as any)?.role === "admin";

  const { data: branding } = useQuery<{ brandId: BrandId }>({
    queryKey: ["/api/branding"],
    enabled: isAdmin,
  });
  const activeBrandId: BrandId = branding?.brandId ?? "arcside";

  const brandMutation = useMutation({
    mutationFn: (brandId: BrandId) => apiRequest("POST", "/api/admin/branding", { brandId }),
    onSuccess: async (_res, brandId) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/branding"] });
      toast({ title: "Brand Updated", description: `Now serving "${BRANDS[brandId].name}" to all users.` });
    },
    onError: () => {
      toast({ title: "Brand Update Failed", description: "Could not update brand setting.", variant: "destructive" });
    },
  });

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  if (!isAdmin) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Restricted Access</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="border border-primary/30 bg-slate-950 rounded-2xl p-4 md:p-6 shadow-[0_0_30px_hsl(var(--primary)/0.10)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Command Center</h1>
              <p className="text-slate-400 text-sm">Brand and white-label control</p>
            </div>
            <Button variant="outline" className="w-fit" onClick={() => navigate("/")}>Back</Button>
          </div>

          {/* Brand Toggle */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/40 p-4" data-testid="section-brand-toggle">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-white">Brand Toggle</h2>
                <p className="text-xs text-slate-400">Switches branding instantly for every user.</p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full border border-slate-700 text-slate-300"
                data-testid="text-active-brand"
              >
                Active: {BRANDS[activeBrandId].name}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => brandMutation.mutate("arcside")}
                disabled={brandMutation.isPending || activeBrandId === "arcside"}
                variant={activeBrandId === "arcside" ? "default" : "outline"}
                className="flex-1"
                data-testid="button-brand-arcside"
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: BRANDS.arcside.primaryColor }} />
                Set to ArcSide
              </Button>
              <Button
                onClick={() => brandMutation.mutate("afrox")}
                disabled={brandMutation.isPending || activeBrandId === "afrox"}
                variant={activeBrandId === "afrox" ? "default" : "outline"}
                className="flex-1"
                data-testid="button-brand-afrox"
              >
                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: BRANDS.afrox.primaryColor }} />
                Set to Afrox Demo
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}