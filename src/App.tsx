import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { CurrencyProvider, useCurrency } from "@/contexts/CurrencyContext";
import Index from "./pages/Index";
import PlatformServices from "./pages/PlatformServices";
import ServiceOrder from "./pages/ServiceOrder";
import Payment from "./pages/Payment";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import NotFound from "./pages/NotFound";
import { MessageCircle } from "lucide-react";
import { logVisit } from "@/lib/db";
import { detectReferrerSource } from "@/lib/referrerUtils";

const queryClient = new QueryClient();

/* =======================
   Meta Pixel PageView
======================= */
const MetaPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "PageView");
    }

    // Log visit for internal analytics
    const log = async () => {
      const referrerSource = detectReferrerSource();
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        logVisit({
          ip_address: data.ip || "unknown",
          country: data.country || "unknown",
          city: data.city || "unknown",
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          referrer_source: referrerSource
        });
      } catch {
        // Fallback if ip API fails
        logVisit({
          ip_address: "unknown",
          country: "unknown",
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          referrer_source: referrerSource
        });
      }
    };
    log();

  }, [location.pathname]);

  return null;
};

/* =======================
   Google Translate
======================= */
const GoogleTranslate = () => {
  useEffect(() => {
    if (document.querySelector('script[src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"]')) return;

    const script = document.createElement("script");
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "ar", includedLanguages: "ar,en", layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <div
      id="google_translate_element"
      className="fixed bottom-24 right-4 z-40 bg-white/90 backdrop-blur rounded-lg shadow-sm p-1 border border-border opacity-80 hover:opacity-100 transition-opacity text-xs"
      style={{ transform: "scale(0.85)", transformOrigin: "bottom right" }}
    />
  );
};

/* =======================
   WhatsApp Floating Button
======================= */
const WhatsAppButton = () => {
  const { currency } = useCurrency();
  const number = currency === "EGP" ? "201092902885" : "966505163956";
  const href = `https://wa.me/${number}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full px-4 py-3 bg-green-500 text-white shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
};

/* =======================
   App
======================= */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          {/* 🔥 Meta Pixel PageView & Analytics & Google Translate */}
          <MetaPageView />
          <GoogleTranslate />

          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/platform/:platformId"
              element={<PlatformServices />}
            />
            <Route path="/service/:serviceId" element={<ServiceOrder />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/confirmation" element={<PaymentConfirmation />} />
            <Route
              path="/super-secret-admin-panel-x99"
              element={<AdminLogin />}
            />
            <Route
              path="/super-secret-admin-panel-x99/dashboard"
              element={<AdminDashboard />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <WhatsAppButton />
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
