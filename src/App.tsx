
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NewAuthProvider } from "./contexts/NewAuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { useEffect } from "react";
import visitorService from "./services/visitor.service";

// Pages
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Announcements from "./pages/Announcements";
import FAQ from "./pages/FAQ";
import Login from "./pages/NewLogin";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Sitemap from "./pages/Sitemap";

const queryClient = new QueryClient();

const App = () => {
  // Record visitor when app loads
  useEffect(() => {
    const recordVisit = async () => {
      try {
        // The visitor service now handles errors internally
        const result = await visitorService.recordVisit();
        if (result?.data?.blocked) {
          // This is just for debugging - the app continues normally
          console.info("Visitor tracking may be blocked by browser extensions");
        }
      } catch (error) {
        // This should rarely happen now as errors are handled in the service
        console.warn("Unexpected error in visitor tracking:", error);
      }
    };

    // Only attempt to record visits in production or when explicitly enabled
    if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      recordVisit();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NewAuthProvider>
        <SocketProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/site-map.xml" element={<Sitemap />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </SocketProvider>
      </NewAuthProvider>
    </QueryClientProvider>
  );
};

export default App;
