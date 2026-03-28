import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Download } from "lucide-react";
import { exportMaterialCheckPdf } from "@/lib/pdf-export";

const materials = [
  "A36 Carbon Steel",
  "A572 Grade 50", 
  "304 Stainless Steel",
  "316L Stainless Steel",
  "6061-T6 Aluminum",
  "A514 HSLA",
  "Inconel 625",
  "Hastelloy C-276"
];

export default function MaterialChecker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [material1, setMaterial1] = useState("");
  const [material2, setMaterial2] = useState("");
  const [result, setResult] = useState<any>(null);

  const checkMutation = useMutation({
    mutationFn: async (data: { material1: string; material2: string }) => {
      const response = await apiRequest('POST', '/api/ai/check-compatibility', data);
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Material compatibility check completed",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Check Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const handleCheck = () => {
    if (!material1 || !material2) {
      toast({
        title: "Missing Materials",
        description: "Please select both materials to compare",
        variant: "destructive",
      });
      return;
    }
    if (material1 === material2) {
      toast({
        title: "Same Materials",
        description: "Please select two different materials to compare",
        variant: "destructive",
      });
      return;
    }
    checkMutation.mutate({ material1, material2 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compatible': return 'bg-primary text-primary-foreground';
      case 'caution': return 'bg-accent text-accent-foreground';
      case 'incompatible': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Material Compatibility</h1>
              <p className="text-xs text-muted-foreground">Check material combinations</p>
            </div>
          </div>
          <i className="fas fa-info-circle text-muted-foreground cursor-pointer"></i>
        </div>

        {/* Material Selection */}
        <div className="px-6 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Select Materials to Compare</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="material1">Primary Material</Label>
                  <div className="flex space-x-2">
                    <Select value={material1} onValueChange={setMaterial1}>
                      <SelectTrigger className="flex-1" data-testid="select-material-1">
                        <SelectValue placeholder="Select primary material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map(material => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="secondary" size="sm" className="w-10 h-10 p-0">
                      <i className="fas fa-barcode text-sm"></i>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-plus text-accent text-sm"></i>
                  </div>
                </div>

                <div>
                  <Label htmlFor="material2">Secondary Material</Label>
                  <div className="flex space-x-2">
                    <Select value={material2} onValueChange={setMaterial2}>
                      <SelectTrigger className="flex-1" data-testid="select-material-2">
                        <SelectValue placeholder="Select secondary material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map(material => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="secondary" size="sm" className="w-10 h-10 p-0">
                      <i className="fas fa-barcode text-sm"></i>
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheck}
                disabled={checkMutation.isPending || !material1 || !material2}
                className="w-full bg-primary text-primary-foreground mt-4"
                data-testid="button-check-compatibility"
              >
                {checkMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                ) : (
                  <i className="fas fa-flask mr-2"></i>
                )}
                Check Compatibility
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Compatibility Results */}
        {result && (
          <div className="px-6 mb-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <i className={`fas ${result.result?.status === 'compatible' ? 'fa-check' : result.result?.status === 'caution' ? 'fa-exclamation-triangle' : 'fa-times'} text-accent`}></i>
                  </div>
                  <div>
                    <h3 className="font-semibold">Compatibility Analysis</h3>
                    <p className="text-xs text-muted-foreground">{material1} + {material2}</p>
                  </div>
                </div>

                {/* Compatibility Status */}
                <div className="mb-4 p-3 rounded-lg border" style={{ 
                  backgroundColor: result.result?.status === 'compatible' ? 'hsl(var(--primary) / 0.1)' :
                                   result.result?.status === 'caution' ? 'hsl(var(--accent) / 0.1)' :
                                   'hsl(var(--destructive) / 0.1)',
                  borderColor: result.result?.status === 'compatible' ? 'hsl(var(--primary) / 0.3)' :
                               result.result?.status === 'caution' ? 'hsl(var(--accent) / 0.3)' :
                               'hsl(var(--destructive) / 0.3)'
                }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">Compatibility Status</span>
                    <Badge className={getStatusColor(result.result?.status || 'unknown')}>
                      {result.result?.status === 'compatible' ? 'Compatible' :
                       result.result?.status === 'caution' ? 'Caution Required' :
                       result.result?.status === 'incompatible' ? 'Not Recommended' : 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.result?.compatibility || "Analysis completed"}
                  </p>
                </div>

                {/* Recommendations */}
                {result.result?.recommendations && result.result.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-3">Welding Recommendations</h4>
                    <div className="space-y-3">
                      {result.result.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="text-primary text-xs font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{rec.title}</h5>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Potential Issues */}
                {result.result?.issues && result.result.issues.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2 text-destructive">Potential Issues</h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {result.result.issues.map((issue: string, index: number) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Export Button */}
                <Button
                  className="w-full bg-primary text-primary-foreground mt-4"
                  onClick={() => {
                    exportMaterialCheckPdf(result, material1, material2);
                    toast({ title: "PDF Downloaded", description: "Your compatibility report has been saved." });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Material Pairs */}
        {!result && (
          <div className="px-6 mb-6">
            <h3 className="font-semibold mb-3">Common Material Combinations</h3>
            <div className="space-y-2">
              {[
                ["A36 Carbon Steel", "304 Stainless Steel"],
                ["A572 Grade 50", "316L Stainless Steel"],
                ["304 Stainless Steel", "316L Stainless Steel"],
                ["A36 Carbon Steel", "6061-T6 Aluminum"]
              ].map(([mat1, mat2], index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3"
                  onClick={() => {
                    setMaterial1(mat1);
                    setMaterial2(mat2);
                  }}
                >
                  <span className="text-sm">{mat1} + {mat2}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
