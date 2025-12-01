import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisResultProps {
  title: string;
  result: any;
  type: 'defect-analysis' | 'material-check' | 'terminology' | 'assistant';
  imageUrl?: string;
}

export default function AnalysisResult({ title, result, type, imageUrl }: AnalysisResultProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-chart-2 text-accent-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-robot text-primary"></i>
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground">Analysis completed</p>
          </div>
        </div>

        {type === 'defect-analysis' && result && (
          <>
            {/* Uploaded Image */}
            {imageUrl && (
              <div className="mb-4">
                <img 
                  src={imageUrl} 
                  alt="Analyzed weld defect" 
                  className="w-full rounded-lg max-h-48 object-cover"
                  data-testid="img-analysis-result"
                />
              </div>
            )}

            {/* Defect Type */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-accent">
                  Defect Identified: {result.defectType}
                </h4>
                {result.severity && (
                  <Badge className={getSeverityColor(result.severity)}>
                    {result.severity}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </div>

            {/* Probable Causes */}
            {result.causes && result.causes.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Probable Causes</h4>
                <ul className="space-y-2">
                  {result.causes.map((cause: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Solutions */}
            {result.solutions && result.solutions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Recommended Solutions</h4>
                <ul className="space-y-2">
                  {result.solutions.map((solution: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Standards Reference */}
            {result.standards && (
              <div className="bg-secondary/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1">Standards Reference</h4>
                <p className="text-xs text-muted-foreground">{result.standards}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
