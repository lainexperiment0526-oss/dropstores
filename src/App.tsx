import { useState } from "react";
import Admin from "./pages/Admin";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PiAuthProvider } from "@/contexts/PiAuthContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateStore from "./pages/CreateStore";
import StoreManagement from "./pages/StoreManagement";
import PublicStore from "./pages/PublicStore";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import AdminPayouts from "./pages/AdminPayouts";
import AdminMrwain from "./pages/AdminMrwain";
import ExternalRedirect from "./pages/ExternalRedirect";
import Support from "./pages/Support";
import Help from "./pages/Help";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <PiAuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-store" element={<CreateStore />} />
                <Route path="/store/:storeId" element={<StoreManagement />} />
                <Route path="/shop/:slug" element={<PublicStore />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />
                <Route path="/help" element={<Help />} />
                <Route path="/admin-payouts" element={<AdminPayouts />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-mrwain" element={<AdminMrwain />} />
                {/* Privacy Policy and Terms of Service external redirects */}
                <Route path="/privacy" element={<ExternalRedirect to="https://droplink.space/privacy" />} />
                <Route path="/terms" element={<ExternalRedirect to="https://droplink.space/terms" />} />
                <Route path="/about" element={<ExternalRedirect to="https://www.droplink.space/about" />} />
                <Route path="/careers" element={<ExternalRedirect to="https://www.droplink.space/careers" />} />
                <Route path="/help" element={<ExternalRedirect to="https://www.droplink.space/help" />} />
                <Route path="/community" element={<ExternalRedirect to="https://www.droplink.space/community-guidelines" />} />
                <Route path="/developers" element={<ExternalRedirect to="https://www.droplink.space/developers" />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PiAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;