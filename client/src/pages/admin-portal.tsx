import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface WhitelistEntry {
  id: string;
  email: string;
  addedBy: string | null;
  addedAt: string | null;
}

export default function AdminPortal() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");

  const isAdmin = (user as any)?.email?.toLowerCase() === "info@arcside.co.za";

  const { data: whitelist = [], isLoading } = useQuery<WhitelistEntry[]>({
    queryKey: ["/api/admin/whitelist"],
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest("POST", "/api/admin/whitelist", { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      setNewEmail("");
      toast({ title: "Access Granted", description: `${newEmail} has been added to the whitelist.` });
    },
    onError: async (err: any) => {
      const body = await err.response?.json?.().catch(() => ({}));
      toast({
        title: "Failed to Add",
        description: body?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/whitelist/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      toast({ title: "Access Revoked", description: "Email removed from whitelist." });
    },
    onError: () => {
      toast({ title: "Failed to Remove", description: "Could not remove that entry.", variant: "destructive" });
    },
  });

  const handleAdd = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    addMutation.mutate(trimmed);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-cyan-400 text-sm animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Restricted Access</h1>
          <p className="text-slate-400 text-sm mb-6">This area is reserved for ArcSide administrators.</p>
          <button onClick={() => navigate("/")} className="text-cyan-400 text-sm hover:underline">← Back to App</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-slate-800 bg-black/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <span className="text-cyan-400 text-xs font-bold">A</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">
                ArcSide™ <span className="text-cyan-400">Command Center</span>
              </h1>
              <p className="text-[10px] text-slate-500 leading-tight">Admin Portal — Restricted Access</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            data-testid="link-admin-back"
          >
            ← Back to App
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Stats Banner */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4">
            <p className="text-2xl font-bold text-cyan-400">{whitelist.length}</p>
            <p className="text-xs text-slate-400 mt-1">Authorised Accounts</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-5 py-4">
            <p className="text-2xl font-bold text-emerald-400">Active</p>
            <p className="text-xs text-slate-400 mt-1">Beta Access Status</p>
          </div>
        </div>

        {/* Add New Email */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Grant Beta Access</h2>
          <p className="text-xs text-slate-500 mb-4">Add an email address to allow that person to sign in.</p>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="newuser@example.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500"
              data-testid="input-whitelist-email"
            />
            <Button
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 shrink-0"
              data-testid="button-add-whitelist"
            >
              {addMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </div>
        </div>

        {/* Whitelist Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Current Whitelist</h2>
            <span className="text-xs text-slate-500">{whitelist.length} {whitelist.length === 1 ? "entry" : "entries"}</span>
          </div>

          {isLoading ? (
            <div className="px-6 py-8 text-center text-slate-500 text-sm animate-pulse">Loading whitelist…</div>
          ) : whitelist.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500 text-sm">No emails in whitelist yet.</div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {whitelist.map((entry) => (
                <div
                  key={entry.id}
                  className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors group"
                  data-testid={`row-whitelist-${entry.id}`}
                >
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{entry.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Added by {entry.addedBy ?? "system"}
                      {entry.addedAt ? ` · ${new Date(entry.addedAt).toLocaleDateString("en-ZA")}` : ""}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(entry.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs ml-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-remove-whitelist-${entry.id}`}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600">
          ArcSide™ Admin Portal · Authorised personnel only
        </p>
      </div>
    </div>
  );
}
