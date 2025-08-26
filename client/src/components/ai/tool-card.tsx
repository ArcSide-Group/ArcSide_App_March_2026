import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
  premium?: boolean;
  onClick?: () => void;
}

export default function ToolCard({ 
  icon, 
  title, 
  description, 
  iconColor, 
  bgColor, 
  premium = false,
  onClick 
}: ToolCardProps) {
  return (
    <Card 
      className="tool-card bg-card border-border cursor-pointer relative"
      onClick={onClick}
      data-testid={`tool-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardContent className="p-4">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3`}>
          <i className={`${icon} ${iconColor} text-lg`}></i>
        </div>
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          {premium && (
            <Badge variant="secondary" className="text-xs ml-1">
              <i className="fas fa-crown mr-1 text-accent"></i>
              Pro
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
