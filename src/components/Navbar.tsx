import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 } from "@/components/ui/select";
 import { Currency } from "@/lib/localStorage";
 import NewYearBanner from "@/components/NewYearBanner";
const logoUrl = "https://btimnibnsoeotkomayte.supabase.co/storage/v1/object/public/services/payment-qrs/logo.png";

export const Navbar = () => {
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLocale();

  // Avoid hydration mismatch from next-themes
  useEffect(() => setMounted(true), []);

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logoUrl} alt="Logo" className="w-[150px] h-[70px] object-contain" />
          </Link>

          <div className="flex items-center gap-4">

            {/* Language toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
                className="text-muted-foreground hover:text-foreground"
                aria-label={
                  locale === "ar"
                    ? "التبديل إلى الإنجليزية"
                    : "Switch to Arabic"
                }
              >
                <span className="text-sm font-medium">
                  {locale === "ar" ? "ع" : "EN"}
                </span>
              </Button>
            )}
            {/* country/currency selector and admin buttons removed per request */}
          </div>
        </div>
      </div>
      {/* New Year banner - subtle, lightweight */}
      <NewYearBanner />
    </nav>
  );
};
