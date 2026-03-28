
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wrench, Calculator, Ruler, Weight, DollarSign, Clock, ChevronRight } from "lucide-react";

const toolCategories = [
  {
    title: "Welding Calculators",
    description: "Essential calculations for welding parameters",
    accentClass: "text-primary",
    bgClass: "bg-primary/10",
    tools: [
      { name: "Voltage & Amperage", href: "/calculators/voltage-amperage", icon: Calculator },
      { name: "Wire Feed Speed", href: "/calculators/wire-feed-speed", icon: Ruler },
      { name: "Heat Input", href: "/calculators/heat-input", icon: Wrench },
      { name: "Gas Flow Rate", href: "/calculators/gas-flow", icon: Calculator },
    ]
  },
  {
    title: "Fabrication Calculators",
    description: "Material and fabrication calculations",
    accentClass: "text-accent",
    bgClass: "bg-accent/10",
    tools: [
      { name: "Metal Weight", href: "/calculators/metal-weight", icon: Weight },
      { name: "Bend Allowance", href: "/calculators/bend-allowance", icon: Ruler },
    ]
  },
  {
    title: "Project Calculators",
    description: "Project planning and cost estimation",
    accentClass: "text-primary",
    bgClass: "bg-primary/10",
    tools: [
      { name: "Project Cost", href: "/calculators/project-cost", icon: DollarSign },
      { name: "Weld Time Estimator", href: "/calculators/weld-time", icon: Clock },
    ]
  }
];

export default function Tools() {
  return (
    <div className="min-h-screen bg-background pt-16 pb-20">
      <div className="max-w-sm mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Professional Tools</h1>
          <p className="text-sm text-muted-foreground">
            Welding and fabrication calculators built for the field
          </p>
        </div>

        <div className="space-y-5">
          {toolCategories.map((category, index) => (
            <Card key={index} className="border-border">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-6 rounded-full ${index === 1 ? 'bg-accent' : 'bg-primary'}`}></div>
                  <CardTitle className="text-base">{category.title}</CardTitle>
                </div>
                <CardDescription className="text-xs ml-4">{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-1 gap-2">
                  {category.tools.map((tool, toolIndex) => (
                    <Link key={toolIndex} href={tool.href}>
                      <Button
                        variant="outline"
                        className="w-full justify-between gap-3 h-12 px-4 text-sm border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <tool.icon className={`h-4 w-4 shrink-0 ${category.accentClass}`} />
                          <span className="font-medium">{tool.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upgrade CTA — Steel Orange accent */}
        <Card className="mt-6 bg-gradient-to-r from-primary/10 to-accent/10 border-accent/30">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-crown text-accent text-lg"></i>
            </div>
            <h3 className="font-semibold mb-1.5">Unlock Premium Tools</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Preheat calculator, cut list optimizer, project cost — and more
            </p>
            <Link href="/subscription">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
