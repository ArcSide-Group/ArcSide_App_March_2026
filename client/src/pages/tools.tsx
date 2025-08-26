
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wrench, Calculator, Ruler, Weight, DollarSign, Clock } from "lucide-react";

const toolCategories = [
  {
    title: "Welding Calculators",
    description: "Essential calculations for welding parameters",
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
    tools: [
      { name: "Metal Weight", href: "/calculators/metal-weight", icon: Weight },
      { name: "Bend Allowance", href: "/calculators/bend-allowance", icon: Ruler },
    ]
  },
  {
    title: "Project Calculators",
    description: "Project planning and cost estimation",
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
          <h1 className="text-2xl font-bold mb-2">Professional Tools</h1>
          <p className="text-muted-foreground">
            Comprehensive welding and fabrication calculators for professionals
          </p>
        </div>

        <div className="space-y-6">
          {toolCategories.map((category, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {category.tools.map((tool, toolIndex) => (
                    <Link key={toolIndex} href={tool.href}>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-auto py-3"
                      >
                        <tool.icon className="h-4 w-4 text-[#4CAF50]" />
                        <span>{tool.name}</span>
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 bg-gradient-to-r from-[#4CAF50]/20 to-blue-500/20 border-[#4CAF50]/30">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need More Tools?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Premium for access to advanced calculators and features
            </p>
            <Link href="/subscription">
              <Button className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                View Plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
