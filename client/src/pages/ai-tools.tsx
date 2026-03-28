
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bot, Search, FileText, Layers, BookOpen, MessageSquare, Zap, Crown } from "lucide-react";

const aiTools = [
  {
    name: "Defect Analyzer",
    description: "AI-powered weld defect detection and analysis",
    href: "/tools/defect-analyzer",
    icon: Search,
    isPremium: false,
    features: ["Image analysis", "Defect identification", "Solution recommendations"]
  },
  {
    name: "WPS Generator",
    description: "Generate welding procedure specifications automatically",
    href: "/tools/wps-generator",
    icon: FileText,
    isPremium: true,
    features: ["Auto-generated WPS", "Code compliance", "Custom parameters"]
  },
  {
    name: "Material Checker",
    description: "Analyze material compatibility for welding",
    href: "/tools/material-checker",
    icon: Layers,
    isPremium: false,
    features: ["Compatibility check", "Material properties", "Recommendations"]
  },
  {
    name: "Terminology Guide",
    description: "Comprehensive welding terms and definitions",
    href: "/tools/terminology",
    icon: BookOpen,
    isPremium: false,
    features: ["Searchable database", "Visual examples", "Industry standards"]
  },
  {
    name: "Weld Assistant",
    description: "AI chatbot for welding questions and guidance",
    href: "/tools/weld-assistant",
    icon: MessageSquare,
    isPremium: false,
    features: ["24/7 availability", "Expert knowledge", "Step-by-step guidance"]
  },
  {
    name: "Process Optimizer",
    description: "Optimize welding parameters with AI recommendations",
    href: "/tools/process-optimizer",
    icon: Zap,
    isPremium: true,
    features: ["Parameter optimization", "Quality prediction", "Cost analysis"]
  }
];

export default function AITools() {
  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            style={{ boxShadow: '0 8px 24px hsl(190 100% 50% / 0.25)' }}>
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1">AI-Powered Tools</h1>
          <p className="text-sm text-muted-foreground">
            Gemini 2.0 Flash — built for welding professionals
          </p>
        </div>

        <div className="space-y-3">
          {aiTools.map((tool, index) => (
            <Card
              key={index}
              className={`border-border ${tool.isPremium ? 'border-accent/30 bg-gradient-to-r from-accent/5 to-accent/10' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tool.isPremium ? 'bg-accent/20' : 'bg-primary/15'}`}>
                    <tool.icon className={`h-5 w-5 ${tool.isPremium ? 'text-accent' : 'text-primary'}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-semibold text-sm">{tool.name}</span>
                      {tool.isPremium && (
                        <Badge variant="secondary" className="bg-accent/15 text-accent border-accent/30 text-xs px-2 py-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{tool.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tool.features.map((feature, fi) => (
                        <Badge key={fi} variant="outline" className="text-[10px] px-1.5 py-0 border-border text-muted-foreground">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <Link href={tool.href}>
                      <Button
                        size="sm"
                        className={`w-full h-10 font-semibold text-sm ${tool.isPremium
                          ? 'bg-accent hover:bg-accent/90 text-accent-foreground'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        }`}
                      >
                        {tool.isPremium ? (
                          <><Crown className="h-3.5 w-3.5 mr-1.5" />Try Premium Tool</>
                        ) : (
                          <><i className="fas fa-rocket mr-1.5 text-xs"></i>Launch Tool</>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="mt-5 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-5 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-3">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1.5">Unlock Premium AI Tools</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Unlimited analyses, WPS generation, and advanced AI features
            </p>
            <Link href="/subscription">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
                Upgrade Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
