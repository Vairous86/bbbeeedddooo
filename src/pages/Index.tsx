import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { PlatformCard } from "@/components/PlatformCard";
import { Platform, Service } from "@/lib/localStorage";
import {
  getPlatforms as fetchPlatforms,
  getMostRequested as fetchMostRequested,
  getServices as fetchServices,
} from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Search, Shield, Clock, Award, Headphones, Instagram, Facebook, Send } from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";

const Index = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [most, setMost] = useState<Array<{ service_id: string; visible: boolean }>>([]);
  const [services, setServices] = useState<Service[]>([]);
  const { t, locale } = useLocale();

  useEffect(() => {
    document.title =
      locale === "ar"
        ? "bedo elmasry | تزويد متابعين | خدمات سوشيال ميديا"
        : "bedo elmasry | Social Media Growth Services";

    const desc =
      locale === "ar"
        ? "bedo elmasry: تزويد متابعين، زيادة تفاعل، لايكات ومشاهدات، دعم حسابات، تسويق إلكتروني، وإعلانات ممولة. الرد عبر واتساب."
        : "bedo elmasry: followers, likes, views, account support, content marketing, and paid ads. Reply via WhatsApp.";

    const metaDesc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (metaDesc) metaDesc.content = desc;
  }, [locale]);

  useEffect(() => {
    const load = async () => {
      const platRes = await fetchPlatforms();
      const platArr = Array.isArray(platRes?.data) ? (platRes.data as Platform[]) : [];
      const normalize = (value: string) =>
        (value || "")
          .toLowerCase()
          .replace(/[\s\-_]+/g, "")
          .trim();

      const preferred = [
        ["instagram", "instagram", "انستجرام", "انستجرام"],
        ["tiktok", "tik tok", "تيك توك", "تيكتوك"],
        ["facebook", "face book", "فيس بوك", "فيسبوك"],
        ["youtube", "you tube", "يوتيوب"],
        ["snapchat", "snap chat", "سناب شات", "سنابشات"],
        ["whatsapp", "what'sapp", "واتس اب", "واتساب"],
      ].map((aliases) => aliases.map(normalize));

      const getPreferredRank = (p: Platform) => {
        const n = normalize(`${p.name} ${p.description}`);
        const idx = preferred.findIndex((aliases) =>
          aliases.some((a) => a && n.includes(a))
        );
        return idx === -1 ? preferred.length : idx;
      };

      const sortedPlatforms = platArr
        .map((p, idx) => ({ p, idx, rank: getPreferredRank(p) }))
        .sort((a, b) => a.rank - b.rank || a.idx - b.idx)
        .map((x) => x.p);

      setPlatforms(sortedPlatforms);
      const mostRes = await fetchMostRequested();
      const mostArr = Array.isArray(mostRes?.data)
        ? (mostRes.data as Array<{ service_id: string; visible: boolean }>)
        : [];
      setMost(mostArr);
      const svcRes = await fetchServices();
      const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
      setServices(svcArr);
    };
    load();
  }, []);

  const filteredPlatforms = platforms.filter(
    (platform) =>
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 hero-newyear">
        <div className="container mx-auto max-w-6xl text-center animate-fade-in relative">
          {/* Subtle sparkles */}
          <span className="hero-sparkle s1" aria-hidden />
          <span className="hero-sparkle s2" aria-hidden />
          <span className="hero-sparkle s3" aria-hidden />
          <span className="hero-sparkle s4" aria-hidden />

          <h1 className="text-4xl md:text-5xl lg:text-5xl font-heading font-bold text-white mb-4 glow-text">
            {t("homeHeroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6">
            {t("homeHeroDesc")}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-border shadow-card"
            />
          </div>

          {/* Most Requested inside hero */}
          <div className="mt-6">
            <div className="flex items-center justify-between max-w-6xl mx-auto mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t("mostRequestedTitle")}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              {most
                .slice(0, 6)
                .map((m) => {
                  const s = services.find((x) => x.id === (m as any).service_id);
                  if (!s || !m.visible) return null;
                  return (
                    <Link key={s.id} to={`/service/${s.id}`} className="block">
                      <Card className="p-3 shadow-card hover:shadow-lg rounded-lg bg-card">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-foreground">
                              {s.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("avgDeliveryLabel")} {s.deliveryTime}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
            {t("choosePlatformTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlatforms.map((platform, index) => (
              <div
                key={platform.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PlatformCard platform={platform} />
              </div>
            ))}
          </div>

          {filteredPlatforms.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {t("noPlatformsFound")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-heading font-bold text-foreground text-center mb-12">
            {t("whyChooseUsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center animate-scale-in">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-newyear-gold" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {t("fastDeliveryTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("fastDeliveryDesc")}
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-newyear-gold" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {t("safeTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("safeDesc")}
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-newyear-gold" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {t("qualityTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("qualityDesc")}
              </p>
            </div>
            <div
              className="text-center animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Headphones className="w-8 h-8 text-newyear-gold" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">
                {t("supportTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("supportDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="animate-scale-in">
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                50K+
              </div>
              <div className="text-muted-foreground">{t("happyCustomers")}</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                99%
              </div>
              <div className="text-muted-foreground">{t("satisfactionRate")}</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                1M+
              </div>
              <div className="text-muted-foreground">{t("ordersCompleted")}</div>
            </div>
            <div
              className="animate-scale-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="text-4xl font-heading font-bold text-primary mb-2">
                100%
              </div>
              <div className="text-muted-foreground">{t("safeSecure")}</div>
            </div>
          </div>
        </div>
      </section>
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl flex items-center justify-center gap-6">
          <a
            href="https://www.instagram.com/bedo_elmasry_9/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://www.facebook.com/profile.php?id=61570478468069"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://t.me/bedo_elmasry_9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <Send className="w-6 h-6" />
          </a>

          {/* Minimal festive decoration */}
          <div className="hidden sm:flex items-center gap-2 text-muted-foreground ml-4">
            <span className="text-newyear-gold">✨</span>
            <span className="text-white/70">Happy New Year</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
