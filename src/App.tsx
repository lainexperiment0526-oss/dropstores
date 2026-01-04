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
import ScrollToTop from "@/components/ScrollToTop";
import { PiAuthTest } from "@/components/PiAuthTest";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RedeemGiftCard from "./pages/RedeemGiftCard";
import Dashboard from "./pages/Dashboard";
import CreateStore from "./pages/CreateStore";
import StoreManagement from "./pages/StoreManagement";
import PublicStore from "./pages/PublicStore";
import StorePage from "./pages/StorePage";
import StoreDirectory from "./pages/StoreDirectory";
import Subscription from "./pages/Subscription";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import AdminPayouts from "./pages/AdminPayouts";
import AdminReports from "./pages/AdminReports";
import AdminMrwain from "./pages/AdminMrwain";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import ExternalRedirect from "./pages/ExternalRedirect";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Business from "./pages/Business";
import Prohibited from "./pages/Prohibited";
import Support from "./pages/Support";
import Help from "./pages/Help";
import AboutPiSupplier from "./pages/AboutPiSupplier";
import GDPR from "./pages/GDPR";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <AuthProvider>
            <PiAuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/stores" element={<StoreDirectory />} />
                <Route path="/create-store" element={<CreateStore />} />
                <Route path="/store/:storeId" element={<StoreManagement />} />
                <Route path="/shop/:slug" element={<PublicStore />} />
                <Route path="/shop/:slug/page/:pageSlug" element={<StorePage />} />
                <Route path="/subscription" element={<Subscription />} />
                <Route path="/redeem-gift-card" element={<RedeemGiftCard />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/support" element={<Support />} />
                <Route path="/help" element={<Help />} />
                <Route path="/gdpr" element={<GDPR />} />
                                <Route path="/pi-test" element={<PiAuthTest />} />
                <Route path="/admin-payouts" element={<AdminPayouts />} />
                <Route path="/admin-reports" element={<AdminReports />} />
                <Route path="/store/:storeId/analytics" element={<AdvancedAnalytics />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin-mrwain" element={<AdminMrwain />} />
                {/* Privacy Policy and Terms of Service local pages */}
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/business" element={<Business />} />
                <Route path="/prohibited" element={<Prohibited />} />
                <Route path="/about" element={<ExternalRedirect to="https://www.droplink.space/about" />} />
                              <Route path="/AboutPiSupplier" element={<AboutPiSupplier />} />
                <Route path="/careers" element={<ExternalRedirect to="https://www.droplink.space/careers" />} />
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