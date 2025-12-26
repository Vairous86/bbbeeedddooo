import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Service } from "@/lib/localStorage";
import { getServices as fetchServices, getAllPackages as fetchAllPackages, addAnalytics, addOrder } from "@/lib/db";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/contexts/LocaleContext";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Clock, Shield, CreditCard } from "lucide-react";
import { z } from "zod";

const urlOrderSchema = z.object({
  accountUrl: z.string().url({ message: "Please enter a valid URL" }),
  quantity: z
    .number()
    .min(100, { message: "Minimum quantity is 100" })
    .max(100000, { message: "Maximum quantity is 100,000" }),
  whatsappNumber: z
    .string()
    .min(10, { message: "Please enter a valid WhatsApp number" })
    .max(15, { message: "Phone number too long" }),
});
const textOrderSchema = z.object({
  serviceText: z.string().min(5, { message: "Please enter valid text" }),
  whatsappNumber: z
    .string()
    .min(10, { message: "Please enter a valid WhatsApp number" })
    .max(15, { message: "Phone number too long" }),
});

const ServiceOrder = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency, symbol } = useCurrency();
  const { t, locale } = useLocale();
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    accountUrl: "",
    serviceText: "",
    quantity: 1000,
    whatsappNumber: "",
  });
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      if (!serviceId) return navigate("/");
      try {
        const svcRes = await fetchServices();
        const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
        const s = svcArr.find((x) => x.id === serviceId);
        if (!s) return navigate("/");
        setService(s);
        const pkgRes = await fetchAllPackages();
        const pkgArr = Array.isArray(pkgRes?.data) ? (pkgRes.data as any[]) : [];
        // Sort packages by units (ascending) so smallest packages appear first
        const list = pkgArr
          .filter((p) => p.serviceId === s.id)
          .sort((a, b) => (Number(a.units || 0) - Number(b.units || 0)));
        setPackages(list);
        const pk = list[0];
        if (pk) setSelectedPackageId(pk.id);
      } catch {
        navigate("/");
      }
    };
    load();
  }, [serviceId, navigate]);

  useEffect(() => {
    if (!service) return;
    document.title =
      locale === "ar"
        ? `${service.title} | bedo elmasry`
        : `${service.title} | bedo elmasry`;
  }, [service, locale]);

  if (!service) return null;

  const pricePerThousand = service?.prices?.[currency] ?? 0;
  const selectedPackage = packages.find((p) => p.id === selectedPackageId);
  const selectedPrice = selectedPackage
    ? selectedPackage.price?.[currency] ?? ((selectedPackage.units || 0) / 1000) * pricePerThousand
    : (formData.quantity / 1000) * pricePerThousand;
  const totalPrice = selectedPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (service.submissionType === "text") {
        textOrderSchema.parse({
          serviceText: formData.serviceText,
          whatsappNumber: formData.whatsappNumber,
        });
      } else {
        urlOrderSchema.parse({
          accountUrl: formData.accountUrl,
          quantity: formData.quantity,
          whatsappNumber: formData.whatsappNumber,
        });
      }

      const isText = service.submissionType === "text";
      const isFree = isText || service.requiresPayment === false;

      if (isFree) {
        const quantity = 0;
        const price = 0;
        const accountOrText = isText ? `TEXT:${formData.serviceText}` : formData.accountUrl;

        if (isText) {
          toast({
            title: t("requestSubmitted") || "تم استلام طلبك",
            description: t("whatsappReplyMsg") || "تم الطلب وسوف يتم الرد عليك من خلال واتس اب",
          });
        }

        addAnalytics({ type: "purchase", serviceId: service.id, meta: { quantity, price, free: true } } as any);
        addOrder({
          serviceId: service.id,
          serviceName: service.title,
          platform: service.platform,
          accountUrl: accountOrText,
          quantity,
          whatsappNumber: formData.whatsappNumber,
          price,
          currency,
          paymentMethod: "stcpay" as any,
          paymentScreenshot: null as any,
          status: "pending",
        } as any);
        setTimeout(() => {
          navigate(`/platform/${service.platform}`);
        }, 300);
        return;
      }

      const packagesShown = !isText && service.requiresPayment !== false;
      if (packagesShown && !selectedPackage) {
        setErrors({ quantity: "Please select a package" });
        return;
      }
      if (packagesShown && selectedPackage) {
        const item = {
          packageId: selectedPackage.id,
          serviceId: service.id,
          units: selectedPackage.units,
          price:
            selectedPackage.price?.[currency] ??
            ((selectedPackage.units || 0) / 1000) * pricePerThousand,
        };
        addAnalytics({ type: "add_to_cart", serviceId: service.id, meta: item } as any);
        navigate("/payment", {
          state: {
            serviceId: service.id,
            serviceName: service.title,
            platform: service.platform,
            cart: [item],
            accountUrl: formData.accountUrl,
            whatsappNumber: formData.whatsappNumber,
            currency,
          },
        });
        return;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate(`/platform/${service.platform}`)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("backToServices")}
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Service Image */}
            <div className="animate-fade-in">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-lg mb-6">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-xl font-heading">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {service.fullDescription}
                  </p>

                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {service.deliveryTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        {service.guarantee}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Order Form */}
            <div className="animate-slide-up">
              <Card className="gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-heading flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                    {t("placeYourOrder")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      {service.submissionType !== "text" ? (
                        <>
                          <Label htmlFor="accountUrl">{t("accountUrlLabel")}</Label>
                          <Input
                            id="accountUrl"
                            type="url"
                            placeholder="https://instagram.com/your-profile"
                            value={formData.accountUrl}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                accountUrl: e.target.value,
                              })
                            }
                            className={
                              errors.accountUrl ? "border-destructive" : ""
                            }
                          />
                          {errors.accountUrl && (
                            <p className="text-destructive text-sm">
                              {errors.accountUrl}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <Label htmlFor="serviceText">{t("serviceTextLabel")}</Label>
                          <textarea
                            id="serviceText"
                            rows={5}
                            placeholder={t("serviceTextPlaceholder")}
                            value={formData.serviceText}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                serviceText: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 rounded border border-border bg-card dark:bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                              errors.serviceText ? "border-destructive" : ""
                            }`}
                          />
                          {errors.serviceText && (
                            <p className="text-destructive text-sm">
                              {errors.serviceText}
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {service.submissionType !== "text" && service.requiresPayment !== false && (
                      <div className="space-y-2">
                        <Label htmlFor="package">{t("choosePackage")}</Label>
                        <select
                          id="package"
                          value={selectedPackageId || ""}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className={`w-full h-12 px-3 rounded border border-border bg-card dark:bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            errors.quantity ? "border-destructive" : ""
                          }`}
                        >
                          {packages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {Number(p.units || 0).toLocaleString()} {service.serviceType} —{" "}
                              {symbol}
                              {Number(
                                p.price?.[currency] ??
                                  ((p.units || 0) / 1000) * pricePerThousand
                              ).toFixed(2)}
                              {p.label ? ` — ${p.label}` : ""}
                            </option>
                          ))}
                        </select>
                        {packages.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            {t("noPackagesMsg")}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {t("priceNote")}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">
                        {t("whatsappLabel")}
                      </Label>
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        placeholder="+966 5XX XXX XXXX"
                        value={formData.whatsappNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            whatsappNumber: e.target.value,
                          })
                        }
                        className={
                          errors.whatsappNumber ? "border-destructive" : ""
                        }
                      />
                      {errors.whatsappNumber && (
                        <p className="text-destructive text-sm">
                          {errors.whatsappNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <Button type="submit" className="w-full h-12 bg-primary">
                        {service.requiresPayment === false ? t("submitOrder") : t("proceedPayment")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServiceOrder;
