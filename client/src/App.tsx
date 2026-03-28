
import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary, PageSuspenseFallback } from "@/components/ErrorBoundary";

// Eagerly-loaded pages (critical path)
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Layout Components
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import MobileContainer from "@/components/layout/mobile-container";

// Lazily-loaded pages — all wrapped in Suspense below
const Tools = lazy(() => import("@/pages/tools"));
const AITools = lazy(() => import("@/pages/ai-tools"));
const Calculators = lazy(() => import("@/pages/calculators"));
const Projects = lazy(() => import("@/pages/projects"));
const WeldLog = lazy(() => import("@/pages/weld-log"));
const Subscription = lazy(() => import("@/pages/subscription"));
const Settings = lazy(() => import("@/pages/settings"));
const Disclaimer = lazy(() => import("@/pages/disclaimer"));
const Profile = lazy(() => import("@/pages/profile"));
const BetaFeedback = lazy(() => import("@/pages/beta-feedback").then(m => ({ default: m.BetaFeedback })));

// AI Tool pages
const DefectAnalyzer = lazy(() => import("@/pages/tools/defect-analyzer"));
const WpsGenerator = lazy(() => import("@/pages/tools/wps-generator"));
const MaterialChecker = lazy(() => import("@/pages/tools/material-checker"));
const Terminology = lazy(() => import("@/pages/tools/terminology"));
const WeldAssistant = lazy(() => import("@/pages/tools/weld-assistant"));
const ProcessOptimizer = lazy(() => import("@/pages/tools/process-optimizer"));

// Calculator pages
const VoltageAmperageCalculator = lazy(() => import("@/pages/calculators/voltage-amperage"));
const WireFeedSpeed = lazy(() => import("@/pages/calculators/wire-feed-speed"));
const HeatInput = lazy(() => import("@/pages/calculators/heat-input"));
const GasFlow = lazy(() => import("@/pages/calculators/gas-flow"));
const MetalWeight = lazy(() => import("@/pages/calculators/metal-weight"));
const BendAllowance = lazy(() => import("@/pages/calculators/bend-allowance"));
const ProjectCost = lazy(() => import("@/pages/calculators/project-cost"));
const PreheatTemp = lazy(() => import("@/pages/calculators/preheat-temp"));
const FillerConsumption = lazy(() => import("@/pages/calculators/filler-consumption"));
const WeldTime = lazy(() => import("@/pages/calculators/weld-time"));
const CuttingLength = lazy(() => import("@/pages/calculators/cutting-length"));
const CalculatorHistory = lazy(() => import("@/pages/calculators/history"));

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageSuspenseFallback />;
  }

  if (!isAuthenticated) {
    return (
      <MobileContainer>
        <Switch>
          <Route path="/" component={Landing} />
          <Route component={NotFound} />
        </Switch>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <Header />
      <ErrorBoundary>
        <Suspense fallback={<PageSuspenseFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/tools" component={Tools} />
            <Route path="/ai-tools" component={AITools} />
            <Route path="/tools/defect-analyzer" component={DefectAnalyzer} />
            <Route path="/tools/wps-generator" component={WpsGenerator} />
            <Route path="/tools/material-checker" component={MaterialChecker} />
            <Route path="/tools/terminology" component={Terminology} />
            <Route path="/tools/weld-assistant" component={WeldAssistant} />
            <Route path="/tools/process-optimizer" component={ProcessOptimizer} />
            <Route path="/calculators" component={Calculators} />
            <Route path="/calculators/voltage-amperage" component={VoltageAmperageCalculator} />
            <Route path="/calculators/wire-feed-speed" component={WireFeedSpeed} />
            <Route path="/calculators/heat-input" component={HeatInput} />
            <Route path="/calculators/gas-flow" component={GasFlow} />
            <Route path="/calculators/metal-weight" component={MetalWeight} />
            <Route path="/calculators/bend-allowance" component={BendAllowance} />
            <Route path="/calculators/project-cost" component={ProjectCost} />
            <Route path="/calculators/preheat-temp" component={PreheatTemp} />
            <Route path="/calculators/filler-consumption" component={FillerConsumption} />
            <Route path="/calculators/weld-time" component={WeldTime} />
            <Route path="/calculators/cutting-length" component={CuttingLength} />
            <Route path="/calculators/history" component={CalculatorHistory} />
            <Route path="/projects" component={Projects} />
            <Route path="/weld-log" component={WeldLog} />
            <Route path="/profile" component={Profile} />
            <Route path="/subscription" component={Subscription} />
            <Route path="/settings" component={Settings} />
            <Route path="/beta-feedback" component={BetaFeedback} />
            <Route path="/disclaimer" component={Disclaimer} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </ErrorBoundary>
      <BottomNavigation />
    </MobileContainer>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
