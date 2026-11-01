import { lazy, Suspense } from "react";
import { useText } from "@/lib/translate";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import { LanguageProvider } from "@/lib/i18n";
import Index from "./pages/Index";
const Learning = lazy(() => import("./pages/Learning"));
const Quiz = lazy(() => import("./pages/Quiz"));
const ModuleSelection = lazy(() => import("./pages/ModuleSelection"));
const Auth = lazy(() => import("./pages/Auth"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const Legal = lazy(() => import("./pages/Legal"));
const Terms = lazy(() => import("./pages/Terms"));
const Market = lazy(() => import("./pages/Market"));
const NotFound = lazy(() => import("./pages/NotFound"));
import RouteExperience from "./components/RouteExperience";

const LoadingPage = () => {
  const tx = useText();
  return <div role="status" className="min-h-[60vh] flex items-center justify-center p-8 text-emerald-900">{tx("Loading page...")}</div>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <RouteExperience />
          <AnimatedBackground />
          <div className="site-content relative z-10">
          <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/market" element={<Market />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/modules" element={<ModuleSelection />} />
            <Route path="/role-selection" element={<Navigate to="/auth?mode=signup" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
