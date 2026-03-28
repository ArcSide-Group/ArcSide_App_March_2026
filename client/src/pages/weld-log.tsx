import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  ArrowLeft,
  Download,
  CalendarDays,
  Layers,
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project, WeldLogEntry } from "@shared/schema";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const entrySchema = z.object({
  projectId: z.string().min(1, "Please select a project"),
  weldJoint: z.string().min(1, "Weld joint is required"),
  dimensions: z.string().optional(),
  fillerMetal: z.string().optional(),
  inspectionResult: z.enum(["pass", "fail", "conditional"]).default("pass"),
  notes: z.string().optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

function getInspectionBadge(result: string | null | undefined) {
  switch (result) {
    case "pass":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Pass
        </Badge>
      );
    case "fail":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
          <XCircle className="h-3 w-3 mr-1" /> Fail
        </Badge>
      );
    case "conditional":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800">
          <AlertTriangle className="h-3 w-3 mr-1" /> Conditional
        </Badge>
      );
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function exportWeldLogPdf(entries: WeldLogEntry[], projects: Project[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(2, 28, 71);
  doc.rect(0, 0, pageWidth, 28, "F");
  doc.setTextColor(0, 188, 212);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ArcSide", 14, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Made by Tradesmen for Tradesmen", 14, 19);
  doc.setTextColor(0, 188, 212);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Weld Log Report", pageWidth - 14, 12, { align: "right" });
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 19, { align: "right" });

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  autoTable(doc, {
    startY: 36,
    margin: { left: 14, right: 14 },
    head: [["Date", "Project", "Weld Joint", "Filler Metal", "Dimensions", "Inspection", "Notes"]],
    body: entries.map((e) => [
      e.entryDate ? new Date(e.entryDate).toLocaleDateString() : "-",
      projectMap[e.projectId] || e.projectId,
      e.weldJoint || "-",
      e.fillerMetal || "-",
      e.dimensions || "-",
      ((e.inspectionResults as any)?.result || "-").toUpperCase(),
      e.notes || "-",
    ]),
    headStyles: { fillColor: [2, 28, 71], textColor: [255, 255, 255], fontSize: 7 },
    bodyStyles: { fontSize: 7, textColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 28 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
    },
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(245, 247, 250);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text("ArcSide™ — Professional Welding Tools", 14, pageHeight - 4);
  doc.text(`Total entries: ${entries.length}`, pageWidth - 14, pageHeight - 4, { align: "right" });

  doc.save(`Weld_Log_${new Date().toISOString().split("T")[0]}.pdf`);
}

export default function WeldLog() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: entries = [], isLoading } = useQuery<WeldLogEntry[]>({
    queryKey: ["/api/weld-log"],
  });

  const form = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      projectId: "",
      weldJoint: "",
      dimensions: "",
      fillerMetal: "",
      inspectionResult: "pass",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: EntryForm) => {
      const payload = {
        ...data,
        inspectionResults: { result: data.inspectionResult },
      };
      const res = await apiRequest("POST", "/api/weld-log", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weld-log"] });
      toast({ title: "Entry added", description: "Weld log entry saved successfully." });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to save entry", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/weld-log/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weld-log"] });
      toast({ title: "Entry deleted" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const filteredEntries =
    projectFilter === "all"
      ? entries
      : entries.filter((e) => e.projectId === projectFilter);

  const passCount = filteredEntries.filter(
    (e) => (e.inspectionResults as any)?.result === "pass"
  ).length;
  const failCount = filteredEntries.filter(
    (e) => (e.inspectionResults as any)?.result === "fail"
  ).length;

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Weld Log</h1>
              <p className="text-muted-foreground text-sm">Track every weld you make</p>
            </div>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="mb-4">
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects ({entries.length})</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({entries.filter((e) => e.projectId === p.id).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Bar */}
        {filteredEntries.length > 0 && (
          <Card className="mb-4 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{filteredEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Total Welds</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{passCount}</p>
                  <p className="text-xs text-muted-foreground">Passed</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">{failCount}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Button */}
        {filteredEntries.length > 0 && (
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => {
              exportWeldLogPdf(filteredEntries, projects);
              toast({ title: "PDF Downloaded", description: "Your weld log has been exported." });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Log as PDF
          </Button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Entries */}
        {!isLoading && filteredEntries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Log Entries Yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {projects.length === 0
                  ? "Create a project first, then start logging your welds"
                  : "Tap Add to log your first weld entry"}
              </p>
              {projects.length === 0 ? (
                <Link href="/projects">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Go to Projects
                  </Button>
                </Link>
              ) : (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Entry
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredEntries.length > 0 && (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{entry.weldJoint}</span>
                        {getInspectionBadge((entry.inspectionResults as any)?.result)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {projectMap[entry.projectId] || "Unknown Project"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(entry.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                    {entry.fillerMetal && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="h-3 w-3" />
                        {entry.fillerMetal}
                      </div>
                    )}
                    {entry.dimensions && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="font-medium">Dim:</span> {entry.dimensions}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                      <CalendarDays className="h-3 w-3" />
                      {entry.entryDate
                        ? new Date(entry.entryDate).toLocaleDateString(undefined, {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "Today"}
                    </div>
                  </div>

                  {entry.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border line-clamp-2">
                      {entry.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log a Weld Entry</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Project *</Label>
              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No projects yet.{" "}
                  <Link href="/projects" className="text-primary underline">
                    Create one first.
                  </Link>
                </p>
              ) : (
                <Select
                  value={form.watch("projectId")}
                  onValueChange={(val) => form.setValue("projectId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {form.formState.errors.projectId && (
                <p className="text-xs text-destructive">{form.formState.errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weldJoint">Weld Joint *</Label>
              <Input
                id="weldJoint"
                placeholder="e.g. Butt joint, T-joint, flange weld"
                {...form.register("weldJoint")}
              />
              {form.formState.errors.weldJoint && (
                <p className="text-xs text-destructive">{form.formState.errors.weldJoint.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="fillerMetal">Filler Metal</Label>
                <Input
                  id="fillerMetal"
                  placeholder="e.g. ER70S-6"
                  {...form.register("fillerMetal")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  placeholder="e.g. 6mm × 150mm"
                  {...form.register("dimensions")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Inspection Result</Label>
              <Select
                value={form.watch("inspectionResult")}
                onValueChange={(val) => form.setValue("inspectionResult", val as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">✅ Pass</SelectItem>
                  <SelectItem value="fail">❌ Fail</SelectItem>
                  <SelectItem value="conditional">⚠️ Conditional Pass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this weld..."
                rows={3}
                {...form.register("notes")}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={createMutation.isPending || projects.length === 0}
              >
                {createMutation.isPending ? "Saving..." : "Save Entry"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This weld log entry will be permanently removed and can't be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
