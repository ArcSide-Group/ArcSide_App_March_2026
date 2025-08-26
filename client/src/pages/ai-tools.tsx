
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
        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#4CAF50] to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">AI-Powered Tools</h1>
          <p className="text-muted-foreground">
            Advanced artificial intelligence tools for welding professionals
          </p>
        </div>

        <div className="space-y-4">
          {aiTools.map((tool, index) => (
            <Card key={index} className={`${tool.isPremium ? 'border-amber-200 bg-gradient-to-r from-amber-50/50 to-yellow-50/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tool.isPremium ? 'bg-amber-100' : 'bg-[#4CAF50]/20'}`}>
                      <tool.icon className={`h-5 w-5 ${tool.isPremium ? 'text-amber-600' : 'text-[#4CAF50]'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {tool.name}
                        {tool.isPremium && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                  </div>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link href={tool.href}>
                    <Button 
                      className={`w-full ${tool.isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' : 'bg-[#4CAF50] hover:bg-[#45a049]'} text-white`}
                    >
                      {tool.isPremium ? 'Try Premium Tool' : 'Launch Tool'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-gradient-to-r from-[#4CAF50]/20 to-blue-500/20 border-[#4CAF50]/30">
          <CardContent className="p-6 text-center">
            <Bot className="h-12 w-12 text-[#4CAF50] mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Unlock Premium AI Tools</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get access to advanced AI features, unlimited usage, and priority support
            </p>
            <Link href="/subscription">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                Upgrade Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
