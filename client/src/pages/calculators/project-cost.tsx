
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';

interface ProjectCostResult {
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  profitAmount: number;
  totalCost: number;
  finalPrice: number;
  breakdown: {
    materials: string;
    labor: string;
    overhead: string;
    profit: string;
  };
  recommendations: string[];
}

interface Material {
  type: string;
  quantity: number;
  unitCost: number;
}

export default function ProjectCost() {
  const [formData, setFormData] = useState({
    laborHours: '40',
    laborRate: '550',
    overhead: '0.15',
    profit: '0.20'
  });

  const [materials, setMaterials] = useState<Material[]>([
    { type: 'Steel Plate', quantity: 10, unitCost: 250 }
  ]);

  const calculateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/calculators/project-cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Calculation failed');
      return response.json();
    },
  });

  const addMaterial = () => {
    setMaterials([...materials, { type: '', quantity: 0, unitCost: 0 }]);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof Material, value: string | number) => {
    const updatedMaterials = materials.map((material, i) => 
      i === index ? { ...material, [field]: value } : material
    );
    setMaterials(updatedMaterials);
  };

  const handleCalculate = () => {
    const calculationData = {
      materials: materials.filter(m => m.type && m.quantity > 0 && m.unitCost > 0),
      laborHours: parseFloat(formData.laborHours),
      laborRate: parseFloat(formData.laborRate),
      overhead: parseFloat(formData.overhead),
      profit: parseFloat(formData.profit)
    };
    calculateMutation.mutate(calculationData);
  };

  const result = calculateMutation.data?.result as ProjectCostResult;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/calculators">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Project Cost</h1>
              <p className="text-xs text-muted-foreground">Estimate total project costs</p>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="px-6 space-y-4">
          {/* Materials */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Materials</h3>
                <Button variant="outline" size="sm" onClick={addMaterial}>
                  <i className="fas fa-plus mr-1"></i>
                  Add
                </Button>
              </div>
              
              {materials.map((material, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Material {index + 1}</Label>
                    {materials.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeMaterial(index)}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    placeholder="Material type"
                    value={material.type}
                    onChange={(e) => updateMaterial(index, 'type', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      placeholder="Unit cost (R)"
                      value={material.unitCost}
                      onChange={(e) => updateMaterial(index, 'unitCost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Labor & Costs */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Labor & Costs</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Labor Hours</Label>
                  <Input
                    type="number"
                    value={formData.laborHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, laborHours: e.target.value }))}
                    placeholder="Hours"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate (R/hr)</Label>
                  <Input
                    type="number"
                    value={formData.laborRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, laborRate: e.target.value }))}
                    placeholder="550"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Overhead (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.overhead}
                    onChange={(e) => setFormData(prev => ({ ...prev, overhead: e.target.value }))}
                    placeholder="0.15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profit (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.profit}
                    onChange={(e) => setFormData(prev => ({ ...prev, profit: e.target.value }))}
                    placeholder="0.20"
                  />
                </div>
              </div>

              <Button 
                onClick={handleCalculate} 
                disabled={calculateMutation.isPending}
                className="w-full"
              >
                {calculateMutation.isPending ? 'Calculating...' : 'Calculate Project Cost'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Cost Breakdown</h3>
                  <Badge variant="secondary">
                    <i className="fas fa-check mr-1"></i>
                    Calculated
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-background rounded-lg p-3">
                    <div className="text-2xl font-bold text-primary">R {result.finalPrice.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Project Price</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-background rounded p-2">
                      <div className="font-semibold">R {result.materialCost.toFixed(2)}</div>
                      <div className="text-muted-foreground">Materials ({result.breakdown.materials})</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="font-semibold">R {result.laborCost.toFixed(2)}</div>
                      <div className="text-muted-foreground">Labor ({result.breakdown.labor})</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="font-semibold">R {result.overheadCost.toFixed(2)}</div>
                      <div className="text-muted-foreground">Overhead ({result.breakdown.overhead})</div>
                    </div>
                    <div className="bg-background rounded p-2">
                      <div className="font-semibold">R {result.profitAmount.toFixed(2)}</div>
                      <div className="text-muted-foreground">Profit ({result.breakdown.profit})</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Recommendations:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start">
                        <i className="fas fa-check-circle text-primary mr-2 mt-0.5"></i>
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
