import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Footer from "@/components/Footer";
import BackgroundEffect from "@/components/BackgroundEffect";

const queryClient = new QueryClient();

// 페이지 전환 시 스크롤 맨 위로 이동
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const Layout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <BackgroundEffect />
        <Toaster />
        <Sonner />
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default Layout;
