import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { Weight } from 'lucide-react';

interface FillerResult {
  depositedWeight: number;
  fillerRequired: number;
  weldVolume: number;
  depositEfficiency: number;
  electrodesEstimate: number | null;
  unit: string;
  recommendations: string[];
}

export default function FillerConsumption() {
  const [formData, setFormData] = useState({
    jointType: 'fillet',
    weldLength: '60',
    legSize: '0.25',
    plateThickness: '0.5',
    grooveAngle: '60',
    passes: '1',
    process: 'GMAW',
  });

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/calculators/filler-consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Calculation failed');
      return res.json();
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate({
      jointType: formData.jointType,
      weldLength: parseFloat(formData.weldLength),
      legSize: parseFloat(formData.legSize),
      plateThickness: parseFloat(formData.plateThickness),
      grooveAngle: parseFloat(formData.grooveAngle),
      passes: parseInt(formData.passes),
      process: formData.process,
    });
  };

  const result = calculateMutation.data?.result as FillerResult | undefined;
  const isButt = formData.jointType === 'butt-vgroove';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">

        <div className="flex items-center space-x-3 p-6 pb-4">
          <Link href="/calculators">
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
              <i className="fas fa-arrow-left text-sm"></i>
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold">Filler Consumption</h1>
            <p className="text-xs text-muted-foreground">Estimate filler metal usage</p>
          </div>
        </div>

        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">

              <div className="space-y-2">
                <Label>Joint Type</Label>
                <Select value={formData.jointType} onValueChange={(v) => setFormData(p => ({ ...p, jointType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fillet">Fillet Weld</SelectItem>
                    <SelectItem value="butt-vgroove">Butt V-Groove</SelectItem>
                    <SelectItem value="lap">Lap Joint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Welding Process</Label>
                <Select value={formData.process} onValueChange={(v) => setFormData(p => ({ ...p, process: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GMAW">GMAW (MIG) — 93% eff.</SelectItem>
                    <SelectItem value="FCAW">FCAW (Flux Core) — 86% eff.</SelectItem>
                    <SelectItem value="SMAW">SMAW (Stick) — 68% eff.</SelectItem>
                    <SelectItem value="GTAW">GTAW (TIG) — 98% eff.</SelectItem>
                    <SelectItem value="SAW">SAW — 99% eff.</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Total Weld Length (inches)</Label>
                <Input
                  type="number"
                  value={formData.weldLength}
                  onChange={(e) => setFormData(p => ({ ...p, weldLength: e.target.value }))}
                  placeholder="e.g. 60"
                />
              </div>

              {isButt ? (
                <>
                  <div className="space-y-2">
                    <Label>Plate Thickness (inches)</Label>
                    <Input
                      type="number"
                      step="0.0625"
                      value={formData.plateThickness}
                      onChange={(e) => setFormData(p => ({ ...p, plateThickness: e.target.value }))}
                      placeholder="e.g. 0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Groove Angle (degrees)</Label>
                    <Input
                      type="number"
                      value={formData.grooveAngle}
                      onChange={(e) => setFormData(p => ({ ...p, grooveAngle: e.target.value }))}
                      placeholder="e.g. 60"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>Fillet Leg Size (inches)</Label>
                  <Input
                    type="number"
                    step="0.0625"
                    value={formData.legSize}
                    onChange={(e) => setFormData(p => ({ ...p, legSize: e.target.value }))}
                    placeholder="e.g. 0.25"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Number of Passes</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.passes}
                  onChange={(e) => setFormData(p => ({ ...p, passes: e.target.value }))}
                  placeholder="e.g. 1"
                />
              </div>

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full">
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Filler Needed'}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Filler Metal Results</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Weight className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-2xl font-bold text-primary">{result.fillerRequired}</div>
                    <div className="text-xs text-muted-foreground">lbs required</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-chart-1">{result.depositedWeight}</div>
                    <div className="text-xs text-muted-foreground">lbs deposited</div>
                    <div className="text-xs text-muted-foreground">{result.depositEfficiency}% efficiency</div>
                  </div>
                </div>

                {result.electrodesEstimate && (
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Estimated Electrodes</div>
                    <div className="text-2xl font-bold text-primary">~{result.electrodesEstimate}</div>
                    <div className="text-xs text-muted-foreground">3/32"–1/8" 7018 sticks</div>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                        <i className="fas fa-check-circle text-primary mt-0.5 shrink-0"></i>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
