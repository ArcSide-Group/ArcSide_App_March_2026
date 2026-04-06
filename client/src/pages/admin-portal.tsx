import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";

interface WhitelistEntry {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  lastLoggedOn: string | null;
  isActive: boolean;
}

export default function AdminPortal() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");

  const email = (user as any)?.email?.toLowerCase?.() ?? "";
  const isAdmin = ["info@arcside.co.za", "arcside.group@gmail.com"].includes(email);

  const { data = [], isFetching } = useQuery<WhitelistEntry[]>({
    queryKey: ["/api/admin/whitelist"],
    enabled: isAdmin,
  });

  const addMutation = useMutation({
    mutationFn: (email: string) => apiRequest("POST", "/api/admin/whitelist", { email }),
    onSuccess: async (_, email) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] });
      setNewEmail("");
      toast({ title: "Access Added", description: `${email} was added to the whitelist.` });
    },
    onError: async (error: any) => {
      const message = await error?.response?.json?.().catch(() => null);
      toast({ title: "Could Not Add", description: message?.message ?? "That email may already be in the list." , variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => apiRequest("PATCH", `/api/admin/whitelist/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/whitelist"] }),
  });

  const handleAdd = () => {
    const value = newEmail.trim().toLowerCase();
    if (!value.includes("@")) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    addMutation.mutate(value);
  };

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;
  if (!isAdmin) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Restricted Access</div>;

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="border border-cyan-500/30 bg-slate-950 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)]">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Admin Command Center</h1>
              <p className="text-slate-400 text-sm">Whitelist management and access control</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>Back</Button>
          </div>

          <div className="flex gap-3 mb-6">
            <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Add user email" className="bg-black border-slate-700" />
            <Button onClick={handleAdd} disabled={addMutation.isPending}>Add User</Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-slate-300">
                <tr>
                  <th className="text-left p-3">First Name</th>
                  <th className="text-left p-3">Surname</th>
                  <th className="text-left p-3">Email Address</th>
                  <th className="text-left p-3">Access Toggle</th>
                  <th className="text-left p-3">Last Logged On</th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  <tr><td className="p-4 text-slate-400" colSpan={5}>Loading…</td></tr>
                ) : data.map((row) => (
                  <tr key={row.id} className="border-t border-slate-800">
                    <td className="p-3">{row.firstName || "Pending"}</td>
                    <td className="p-3">{row.lastName || "Pending"}</td>
                    <td className="p-3">{row.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <Switch checked={row.isActive} onCheckedChange={(checked) => toggleMutation.mutate({ id: row.id, isActive: checked })} />
                        <span className="text-xs text-slate-400">{row.isActive ? "On" : "Off"}</span>
                      </div>
                    </td>
                    <td className="p-3">{row.lastLoggedOn ? new Date(row.lastLoggedOn).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
