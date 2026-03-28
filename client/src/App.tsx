
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { lazy } from "react";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import AITools from "@/pages/ai-tools";
import DefectAnalyzer from "@/pages/tools/defect-analyzer";
import WpsGenerator from "@/pages/tools/wps-generator";
import MaterialChecker from "@/pages/tools/material-checker";
import Terminology from "@/pages/tools/terminology";
import WeldAssistant from "@/pages/tools/weld-assistant";
import Calculators from "@/pages/calculators";
import VoltageAmperageCalculator from "@/pages/calculators/voltage-amperage";
import Projects from "@/pages/projects";
import WeldLog from "@/pages/weld-log";
import Subscription from "@/pages/subscription";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

// Layout Components
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import MobileContainer from "@/components/layout/mobile-container";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <MobileContainer>
      {isAuthenticated && !isLoading && <Header />}
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/tools" component={Tools} />
            <Route path="/ai-tools" component={AITools} />
            <Route path="/tools/defect-analyzer" component={DefectAnalyzer} />
            <Route path="/tools/wps-generator" component={WpsGenerator} />
            <Route path="/tools/material-checker" component={MaterialChecker} />
            <Route path="/tools/terminology" component={Terminology} />
            <Route path="/tools/weld-assistant" component={WeldAssistant} />
            <Route path="/calculators" component={Calculators} />
            <Route path="/calculators/voltage-amperage" component={VoltageAmperageCalculator} />
            <Route path="/calculators/wire-feed-speed" component={lazy(() => import('./pages/calculators/wire-feed-speed'))} />
            <Route path="/calculators/heat-input" component={lazy(() => import('./pages/calculators/heat-input'))} />
            <Route path="/calculators/gas-flow" component={lazy(() => import('./pages/calculators/gas-flow'))} />
            <Route path="/calculators/metal-weight" component={lazy(() => import('./pages/calculators/metal-weight'))} />
            <Route path="/calculators/bend-allowance" component={lazy(() => import('./pages/calculators/bend-allowance'))} />
            <Route path="/calculators/project-cost" component={lazy(() => import('./pages/calculators/project-cost'))} />
            <Route path="/calculators/history" component={lazy(() => import('./pages/calculators/history'))} />
            <Route path="/profile" component={lazy(() => import('./pages/profile'))} />
            <Route path="/projects" component={Projects} />
            <Route path="/weld-log" component={WeldLog} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/settings" component={Settings} />
            {isAuthenticated && !isLoading && <BottomNavigation />}
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
