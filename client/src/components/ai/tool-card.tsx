import { Card, CardContent } from "@/components/ui/card";

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
  onClick,
}: ToolCardProps) {
  return (
    <Card
      className="tool-card bg-card border-border cursor-pointer relative overflow-hidden"
      onClick={onClick}
      data-testid={`tool-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {premium && (
        <span
          className="absolute top-1.5 right-1.5 z-10 inline-flex items-center gap-0.5 rounded-full text-white font-semibold leading-none whitespace-nowrap shadow-sm"
          style={{
            backgroundColor: "#0047AB",
            fontSize: "10px",
            padding: "3px 6px",
          }}
          data-testid={`badge-pro-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <span aria-hidden="true">👑</span>
          <span>Pro</span>
        </span>
      )}
      <CardContent className="p-4">
        <div
          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mb-3 ${premium ? 'opacity-40' : ''}`}
        >
          <i className={`${icon} ${iconColor} text-lg`}></i>
        </div>
        <h4 className={`font-semibold text-sm mb-1 ${premium ? 'pr-12' : ''}`}>{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
