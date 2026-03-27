import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lightbulb, BookOpen } from "lucide-react";

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

            {/* Defect Type & Severity */}
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

            {/* Recommended Solutions */}
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

            {/* Prevention Tips */}
            {result.preventionTips && result.preventionTips.length > 0 && (
              <div className="mb-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Prevention Tips
                </h4>
                <ul className="space-y-1.5">
                  {result.preventionTips.map((tip: string, index: number) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Standards Reference */}
            {result.standards && (
              <div className="bg-secondary/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Standards Reference
                </h4>
                <p className="text-xs text-muted-foreground">{result.standards}</p>
              </div>
            )}
          </>
        )}

        {type === 'terminology' && result && (
          <>
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-primary mb-1">{result.term}</h4>
              <p className="text-sm text-muted-foreground">{result.definition}</p>
            </div>

            {result.example && (
              <div className="mb-4 bg-secondary/20 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Example
                </h4>
                <p className="text-xs text-muted-foreground">{result.example}</p>
              </div>
            )}

            {result.tips && result.tips.length > 0 && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-2">Pro Tips</h4>
                <ul className="space-y-1.5">
                  {result.tips.map((tip: string, index: number) => (
                    <li key={index} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.standard && (
              <div className="mt-3 bg-secondary/30 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Standard
                </h4>
                <p className="text-xs text-muted-foreground">{result.standard}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
