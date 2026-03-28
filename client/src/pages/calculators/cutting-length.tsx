import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';

interface Part {
  length: string;
  quantity: string;
}

interface CuttingResult {
  barsNeeded: number;
  totalCuts: number;
  totalCutLength: number;
  totalWaste: number;
  utilization: number;
  totalStockLength: number;
  recommendations: string[];
}

export default function CuttingLength() {
  const { labels, toImperial, fromImperial, defaults } = useUnits();

  const [stockLength, setStockLength] = useState(defaults.stockLength);
  const [kerfWidth, setKerfWidth] = useState('3');
  const [parts, setParts] = useState<Part[]>([
    { length: defaults.weldLength === '1500' ? '900' : '36', quantity: '4' },
    { length: defaults.weldLength === '1500' ? '600' : '24', quantity: '6' },
  ]);

  const addPart = () => setParts(p => [...p, { length: '', quantity: '1' }]);
  const removePart = (i: number) => setParts(p => p.filter((_, idx) => idx !== i));
  const updatePart = (i: number, field: keyof Part, value: string) => {
    setParts(p => p.map((part, idx) => idx === i ? { ...part, [field]: value } : part));
  };

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/calculators/cutting-length', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Calculation failed');
      return res.json();
    },
  });

  const handleCalculate = () => {
    const validParts = parts
      .filter(p => p.length && p.quantity && parseFloat(p.length) > 0 && parseInt(p.quantity) > 0)
      .map(p => ({ length: toImperial.length(parseFloat(p.length)), quantity: parseInt(p.quantity) }));

    if (!validParts.length) return;

    calculateMutation.mutate({
      stockLength: toImperial.length(parseFloat(stockLength)),
      kerfWidth: toImperial.length(parseFloat(kerfWidth)),
      parts: validParts,
    });
  };

  const result = calculateMutation.data?.result as CuttingResult | undefined;

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
            <h1 className="text-lg font-bold">Cut List Optimizer</h1>
            <p className="text-xs text-muted-foreground">Minimize waste from bar/tube stock</p>
          </div>
          <Badge variant="secondary" className="ml-auto text-xs">
            <i className="fas fa-crown mr-1 text-accent"></i>Pro
          </Badge>
        </div>

        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Stock Length ({labels.length})</Label>
                  <Input type="number" value={stockLength} onChange={(e) => setStockLength(e.target.value)} placeholder={defaults.stockLength} />
                </div>
                <div className="space-y-2">
                  <Label>Kerf Width ({labels.length})</Label>
                  <Input type="number" step="0.5" value={kerfWidth} onChange={(e) => setKerfWidth(e.target.value)} placeholder="3" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cut List</Label>
                  <Button variant="ghost" size="sm" onClick={addPart} className="h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Add Part
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2 text-xs text-muted-foreground px-1">
                    <span className="col-span-2">Length ({labels.length})</span>
                    <span className="col-span-2">Qty</span>
                    <span></span>
                  </div>
                  {parts.map((part, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 items-center">
                      <Input className="col-span-2 h-8 text-sm" type="number" step="0.5" value={part.length} onChange={(e) => updatePart(i, 'length', e.target.value)} placeholder="length" />
                      <Input className="col-span-2 h-8 text-sm" type="number" min="1" value={part.quantity} onChange={(e) => updatePart(i, 'quantity', e.target.value)} placeholder="1" />
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => removePart(i)} disabled={parts.length === 1}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleCalculate} disabled={calculateMutation.isPending} className="w-full">
                {calculateMutation.isPending ? 'Optimizing...' : 'Optimize Cut List'}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold">Cut List Results</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <Scissors className="h-5 w-5 text-primary mx-auto mb-1" />
                    <div className="text-2xl font-bold text-primary">{result.barsNeeded}</div>
                    <div className="text-xs text-muted-foreground">bars needed</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-chart-1">{result.utilization}%</div>
                    <div className="text-xs text-muted-foreground">material used</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-lg font-bold">{result.totalCuts}</div>
                    <div className="text-xs text-muted-foreground">total cuts</div>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-destructive">
                      {fromImperial.length(result.totalWaste)}{labels.length}
                    </div>
                    <div className="text-xs text-muted-foreground">waste</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Summary:</h4>
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
