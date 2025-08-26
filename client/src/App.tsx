import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import DefectAnalyzer from "@/pages/tools/defect-analyzer";
import WpsGenerator from "@/pages/tools/wps-generator";
import MaterialChecker from "@/pages/tools/material-checker";
import Terminology from "@/pages/tools/terminology";
import WeldAssistant from "@/pages/tools/weld-assistant";
import Calculators from "@/pages/calculators";
import VoltageAmperageCalculator from "@/pages/calculators/voltage-amperage";
import Projects from "@/pages/projects";
import Subscription from "@/pages/subscription";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Layout Components
import BottomNavigation from "@/components/layout/bottom-navigation";
import MobileContainer from "@/components/layout/mobile-container";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <MobileContainer>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/tools/defect-analyzer" component={DefectAnalyzer} />
            <Route path="/tools/wps-generator" component={WpsGenerator} />
            <Route path="/tools/material-checker" component={MaterialChecker} />
            <Route path="/tools/terminology" component={Terminology} />
            <Route path="/tools/weld-assistant" component={WeldAssistant} />
            <Route path="/calculators" component={Calculators} />
            <Route path="/calculators/voltage-amperage" component={VoltageAmperageCalculator} />
            <Route path="/projects" component={Projects} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/settings" component={Settings} />
            <BottomNavigation />
          </>
        )}
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </MobileContainer>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
