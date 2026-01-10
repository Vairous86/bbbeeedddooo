import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ServiceTypeCard } from "@/components/ServiceTypeCard";
import { Service, Platform } from "@/lib/localStorage";
import { getServices as fetchServices, getPlatforms as fetchPlatforms } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const PlatformServices = () => {
  const { platformId } = useParams<{ platformId: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    const load = async () => {
      if (!platformId) return;
      const platRes = await fetchPlatforms();
      const platArr = Array.isArray(platRes?.data) ? platRes.data : [];
      const p = platArr.find((x: any) => x.slug === platformId || x.id === platformId);
      if (!p) return navigate("/");
      setPlatform(p as Platform);
      const svcRes = await fetchServices();
      const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
      setServices(svcArr.filter((s: any) => s.platform === platformId));
    };
    load();
  }, [platformId, navigate]);

  if (!platform) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-12 px-4 hero-newyear">
        <div className="container mx-auto max-w-6xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToPlatforms")}
          </Button>
          
          <div className="flex items-center gap-6 animate-fade-in">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/6">
              <img 
                src={platform.image} 
                alt={platform.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2 glow-text">
                {platform.name} {t("platformServicesTitle")}
              </h1>
              <p className="text-xl text-white/80">
                {platform.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-8">
            {t("availableServices")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div 
                key={service.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ServiceTypeCard service={service} />
              </div>
            ))}
          </div>

          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t("noServicesAvailable")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PlatformServices;
