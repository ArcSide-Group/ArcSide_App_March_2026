import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useUnits } from "@/hooks/useUnits";

interface CalculationResult {
  recommendedAmperage: number;
  recommendedVoltage: number;
  amperageRange: { min: number; max: number };
  voltageRange: { min: number; max: number };
}

export default function VoltageAmperageCalculator() {
  const { toast } = useToast();
  const { labels, toImperial, defaults } = useUnits();

  const [formData, setFormData] = useState({
    material: 'mild-steel',
    thickness: defaults.thickness,
    process: 'GMAW',
    position: 'flat',
    wireSize: '0.9',
    fillerSize: '3.2'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/voltage-amperage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast({ title: "Calculation Complete", description: "Parameters calculated successfully" });
    },
    onError: () => {
      toast({ title: "Calculation Failed", description: "Please check your inputs and try again", variant: "destructive" });
    }
  });

  const handleCalculate = () => {
    if (!formData.thickness) {
      toast({ title: "Missing Information", description: "Please enter material thickness", variant: "destructive" });
      return;
    }
    calculateMutation.mutate({
      ...formData,
      thickness: toImperial.length(parseFloat(formData.thickness)),
      wireSize: formData.wireSize ? parseFloat(formData.wireSize) : undefined
    });
  };

  const updateFormData = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/calculators">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Voltage & Amperage</h1>
              <p className="text-xs text-muted-foreground">Calculate welding parameters</p>
            </div>
          </div>
        </div>

        <div className="px-6 mb-6 space-y-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              <div>
                <Label>Welding Process</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["GMAW", "SMAW", "GTAW", "FCAW"].map((process) => (
                    <Button key={process} variant={formData.process === process ? "default" : "secondary"} size="sm" onClick={() => updateFormData('process', process)}>
                      {process}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Base Material</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["steel", "stainless", "aluminum", "other"].map((material) => (
                    <Button key={material} variant={formData.material === material ? "default" : "secondary"} size="sm" onClick={() => updateFormData('material', material)} className="capitalize">
                      {material}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="thickness">Material Thickness ({labels.length})</Label>
                <Input
                  id="thickness"
                  type="number"
                  step="0.1"
                  value={formData.thickness}
                  onChange={(e) => updateFormData('thickness', e.target.value)}
                  placeholder={`Enter thickness in ${labels.length}`}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Welding Position</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { value: "flat", label: "Flat (1G)" },
                    { value: "horizontal", label: "Horizontal (2G)" },
                    { value: "vertical", label: "Vertical (3G)" },
                    { value: "overhead", label: "Overhead (4G)" }
                  ].map((position) => (
                    <Button key={position.value} variant={formData.position === position.value ? "default" : "secondary"} size="sm" onClick={() => updateFormData('position', position.value)} className="text-xs">
                      {position.label}
                    </Button>
                  ))}
                </div>
              </div>

              {formData.process === 'SMAW' && (
                <div>
                  <Label htmlFor="fillerSize">Electrode Size (mm)</Label>
                  <Input id="fillerSize" type="number" step="0.1" value={formData.fillerSize} onChange={(e) => updateFormData('fillerSize', e.target.value)} placeholder="Enter electrode diameter" className="mt-2" />
                </div>
              )}

              {(formData.process === 'GMAW' || formData.process === 'FCAW') && (
                <div className="space-y-2">
                  <Label>Wire Size</Label>
                  <Select value={formData.wireSize} onValueChange={(value) => updateFormData('wireSize', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.6">0.6 mm</SelectItem>
                      <SelectItem value="0.8">0.8 mm</SelectItem>
                      <SelectItem value="0.9">0.9 mm</SelectItem>
                      <SelectItem value="1.0">1.0 mm</SelectItem>
                      <SelectItem value="1.2">1.2 mm</SelectItem>
                      <SelectItem value="1.4">1.4 mm</SelectItem>
                      <SelectItem value="1.6">1.6 mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full bg-primary text-primary-foreground">
                {calculateMutation.isPending ? <><i className="fas fa-spinner fa-spin mr-2"></i>Calculating...</> : <><i className="fas fa-calculator mr-2"></i>Calculate Parameters</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {result && (
          <div className="px-6 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm">Recommended Parameters</h3>
                  <Badge className="bg-chart-2 text-accent-foreground"><i className="fas fa-check mr-1"></i>Calculated</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{result.recommendedAmperage}</div>
                    <div className="text-xs text-muted-foreground">Amperage (A)</div>
                    <div className="text-xs text-muted-foreground mt-1">Range: {result.amperageRange.min}–{result.amperageRange.max}A</div>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{result.recommendedVoltage}</div>
                    <div className="text-xs text-muted-foreground">Voltage (V)</div>
                    <div className="text-xs text-muted-foreground mt-1">Range: {result.voltageRange.min}–{result.voltageRange.max}V</div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <i className="fas fa-info-circle text-primary text-sm mt-0.5"></i>
                    <div className="text-xs text-muted-foreground">
                      {formData.process} · {formData.material} · {formData.thickness}{labels.length} · {formData.position}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="px-6 mb-6">
          <Card className="bg-gradient-to-r from-secondary/20 to-muted/20 border-secondary/30">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <i className="fas fa-lightbulb text-secondary-foreground text-sm"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-2">Welding Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Start with recommended settings and adjust based on bead appearance</li>
                    <li>• Lower settings for out-of-position welding</li>
                    <li>• Always follow your WPS if available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
