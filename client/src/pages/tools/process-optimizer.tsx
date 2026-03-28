import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";
import { Crown, Zap, ChevronRight, TriangleAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

const PROCESSES = ["GMAW (MIG)", "SMAW (Stick)", "GTAW (TIG)", "FCAW", "SAW", "MCAW"];
const MATERIALS = ["Carbon Steel (A36)", "Carbon Steel (A516)", "Stainless 304", "Stainless 316", "Aluminum 6061", "Chrome-Moly (P91)", "Duplex Stainless", "Nickel Alloy"];
const JOINTS = ["Butt Joint", "T-Joint", "Lap Joint", "Corner Joint", "Edge Joint"];
const GOALS = [
  "Best overall weld quality",
  "Maximize travel speed / productivity",
  "Minimize distortion / heat input",
  "Reduce porosity / defects",
  "Improve fusion / penetration",
];

export default function ProcessOptimizer() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    process: "",
    material: "",
    thickness: "",
    jointType: "",
    currentParams: "",
    goal: "",
  });
  const [result, setResult] = useState<any>(null);

  const set = (key: string) => (value: string) => setForm(f => ({ ...f, [key]: value }));

  const optimizeMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const response = await apiRequest("POST", "/api/ai/optimize-process", data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast({ title: "Optimization Complete", description: "AI recommendations are ready." });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({ title: "Session expired", description: "Logging in again...", variant: "destructive" });
        setTimeout(() => { window.location.href = "/api/login"; }, 500);
        return;
      }
      const errorMsg = (error as Error).message || '';
      const isAIServiceError = errorMsg.includes('failed') || errorMsg.includes('capacity') || errorMsg.includes('retry');
      toast({
        title: isAIServiceError ? "AI Service Busy" : "Optimization Failed",
        description: isAIServiceError 
          ? "Google AI Services are currently over capacity. Retrying in a moment..."
          : errorMsg,
        variant: "destructive",
      });
    },
  });

  const canSubmit = form.process && form.material && form.thickness && form.jointType;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-border">
          <Link href="/ai-tools">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-secondary/50 shrink-0">
              <i className="fas fa-arrow-left text-sm"></i>
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Process Optimizer</h1>
              <Badge className="bg-accent/15 text-accent border-accent/30 text-xs px-2 py-0">
                <Crown className="h-3 w-3 mr-1" />Pro
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">AI parameter recommendations — Gemini 2.0 Flash</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 pt-5 space-y-4">
          {/* Process */}
          <div>
            <label className="field-label mb-1.5 block">Welding Process</label>
            <Select onValueChange={set("process")}>
              <SelectTrigger data-testid="select-process" className="h-11">
                <SelectValue placeholder="Select process…" />
              </SelectTrigger>
              <SelectContent>
                {PROCESSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Material */}
          <div>
            <label className="field-label mb-1.5 block">Base Material</label>
            <Select onValueChange={set("material")}>
              <SelectTrigger data-testid="select-material" className="h-11">
                <SelectValue placeholder="Select material…" />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Thickness */}
          <div>
            <label className="field-label mb-1.5 block">Material Thickness (inches)</label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder='e.g. 0.25 for ¼"'
              value={form.thickness}
              onChange={e => set("thickness")(e.target.value)}
              data-testid="input-thickness"
              className="h-11"
            />
          </div>

          {/* Joint Type */}
          <div>
            <label className="field-label mb-1.5 block">Joint Type</label>
            <Select onValueChange={set("jointType")}>
              <SelectTrigger data-testid="select-joint" className="h-11">
                <SelectValue placeholder="Select joint…" />
              </SelectTrigger>
              <SelectContent>
                {JOINTS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Optimization Goal */}
          <div>
            <label className="field-label mb-1.5 block">Optimization Goal</label>
            <Select onValueChange={set("goal")}>
              <SelectTrigger data-testid="select-goal" className="h-11">
                <SelectValue placeholder="Select goal…" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Current Parameters (optional) */}
          <div>
            <label className="field-label mb-1.5 block">Current Parameters <span className="normal-case font-normal text-muted-foreground">(optional)</span></label>
            <Textarea
              placeholder="Describe your current settings, e.g. 22V, 200A, 8 IPM, 75/25 Ar/CO₂…"
              value={form.currentParams}
              onChange={e => set("currentParams")(e.target.value)}
              data-testid="textarea-current-params"
              className="min-h-[80px] resize-none text-sm"
            />
          </div>

          <Button
            onClick={() => optimizeMutation.mutate(form)}
            disabled={!canSubmit || optimizeMutation.isPending}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base"
            data-testid="button-optimize"
          >
            {optimizeMutation.isPending ? (
              <><i className="fas fa-spinner fa-spin mr-2"></i>Analyzing with Gemini…</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" />Optimize My Process</>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="px-4 pt-6 space-y-4">
            <div className="industrial-divider mb-4" />

            {/* Summary */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-sm leading-relaxed">{result.summary}</p>
              </CardContent>
            </Card>

            {/* Optimized Parameters */}
            {result.optimizedParams && (
              <Card className="border-border">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-primary flex items-center gap-2">
                    <i className="fas fa-sliders-h text-xs"></i> Optimized Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(result.optimizedParams).map(([key, val]) => (
                      <div key={key} className="bg-secondary/40 rounded-lg p-2.5">
                        <p className="field-label text-[10px] mb-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm font-semibold">{String(val)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {result.improvements?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold px-1">Improvement Recommendations</h3>
                {result.improvements.map((imp: any, i: number) => (
                  <Card key={i} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">{imp.area}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{imp.recommendation}</p>
                          {imp.expectedBenefit && (
                            <p className="text-xs text-primary mt-1">→ {imp.expectedBenefit}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quality Prediction & Cost */}
            {(result.qualityPrediction || result.costSavings) && (
              <div className="grid grid-cols-1 gap-2">
                {result.qualityPrediction && (
                  <Card className="border-accent/30 bg-accent/5">
                    <CardContent className="p-3">
                      <p className="field-label text-xs mb-1">Quality Prediction</p>
                      <p className="text-sm">{result.qualityPrediction}</p>
                    </CardContent>
                  </Card>
                )}
                {result.costSavings && (
                  <Card className="border-border">
                    <CardContent className="p-3">
                      <p className="field-label text-xs mb-1">Efficiency Impact</p>
                      <p className="text-sm">{result.costSavings}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Warnings */}
            {result.warnings?.length > 0 && (
              <div className="warning-banner">
                <div className="flex items-start gap-2">
                  <TriangleAlert className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                  <div>
                    <p className="text-xs font-semibold mb-1">Important Warnings</p>
                    <ul className="space-y-1">
                      {result.warnings.map((w: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Reference */}
            {result.standard && (
              <p className="text-xs text-muted-foreground text-center pb-2">
                Reference: {result.standard}
              </p>
            )}

            <Button
              variant="outline"
              className="w-full h-11 mb-4"
              onClick={() => { setResult(null); setForm({ process: "", material: "", thickness: "", jointType: "", currentParams: "", goal: "" }); }}
            >
              Run New Optimization
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
