import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  getPaymentSettings,
  getCurrencySymbol,
  Currency,
  getServiceById,
  getOrders,
} from "@/lib/localStorage";
import { addOrder } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  CreditCard,
  Smartphone,
  Copy,
} from "lucide-react";
import { fetchPaymentSettings, uploadPaymentScreenshot } from "@/lib/db";

interface OrderData {
  serviceId?: string;
  serviceName?: string;
  platform?: string;
  accountUrl?: string;
  quantity?: number;
  whatsappNumber?: string;
  price?: number;
  currency?: Currency;
  // optional cart
  cart?: Array<{
    packageId: string;
    serviceId: string;
    units: number;
    price: number;
  }>;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocale();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [noState, setNoState] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "stcpay" | "alrajhi" | "vodafone" | "instapay"
  >("stcpay");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [paymentSettings, setPaymentSettings] = useState(getPaymentSettings());

  useEffect(() => {
    fetchPaymentSettings()
      .then((s) => setPaymentSettings(s))
      .catch(() => setPaymentSettings(getPaymentSettings()));
    if (location.state) {
      const data = location.state as OrderData;
      // If cart exists and serviceName not provided, try to fetch name for first item
      if ((data as any).cart && Array.isArray((data as any).cart)) {
        const cart = (data as any).cart as Array<any>;
        if (!data.serviceName && cart.length > 0) {
          const svc = getServiceById(cart[0].serviceId);
          data.serviceName = svc ? svc.title : "Multiple Services";
        }
      }
      setOrderData(data);
      // Set default payment method based on currency
      if (data.currency === "EGP") {
        if (paymentSettings.vodafoneActive) setPaymentMethod("vodafone");
        else if (paymentSettings.instaPayActive) setPaymentMethod("instapay");
      } else {
        if (paymentSettings.stcPayActive) setPaymentMethod("stcpay");
        else if (paymentSettings.alRajhiActive) setPaymentMethod("alrajhi");
      }
    } else {
      // If user navigated directly, try to prefill using the last order in storage
      const orders = getOrders();
      const last = orders.length ? orders[orders.length - 1] : null;
      if (last) {
        setOrderData({
          serviceId: last.serviceId,
          serviceName: last.serviceName,
          platform: last.platform,
          accountUrl: last.accountUrl,
          quantity: last.quantity,
          whatsappNumber: last.whatsappNumber,
          price: last.price,
          currency: last.currency as Currency,
        });
        // set default payment method based on currency
        if (last.currency === "EGP") {
          if (paymentSettings.vodafoneActive) setPaymentMethod("vodafone");
          else if (paymentSettings.instaPayActive) setPaymentMethod("instapay");
        } else {
          if (paymentSettings.stcPayActive) setPaymentMethod("stcpay");
          else if (paymentSettings.alRajhiActive) setPaymentMethod("alrajhi");
        }
      } else {
        // No order context — render helpful page instead of redirecting
        setNoState(true);
      }
    }
  }, [location.state, navigate]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = async () => {
    if (!orderData) return;

    if (!screenshot) {
      toast({
        title: t("screenshotRequired"),
        description: t("screenshotRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    if (!screenshotFile) {
      toast({
        title: t("screenshotRequired"),
        description: t("screenshotRequiredDesc"),
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const url = await uploadPaymentScreenshot(screenshotFile);
      if (!url) {
        toast({
          title: t("uploadFailedTitle"),
          description: t("uploadFailedDesc"),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create orders and collect their IDs so we can show a confirmation page
      // We intentionally persist orders and then redirect by IDs so that
      // the confirmation page can reliably fetch details even after refresh.
      const createdIds: string[] = [];

      if (orderData!.cart && orderData!.cart.length > 0) {
        const created = await Promise.all(
          orderData!.cart.map((ci) =>
            addOrder({
              serviceId: ci.serviceId,
              serviceName: orderData!.serviceName || "Service",
              platform: orderData!.platform || "",
              accountUrl: orderData!.accountUrl || "",
              quantity: ci.units,
              whatsappNumber: orderData!.whatsappNumber || "",
              price: ci.price,
              currency: orderData!.currency || "USD",
              paymentMethod: paymentMethod,
              paymentScreenshot: url,
              status: "pending",
            })
          )
        );
        created.forEach((c) => {
          if (c && (c as any).item && (c as any).item.id) createdIds.push((c as any).item.id);
        });
      } else {
        const c = await addOrder({
          serviceId: orderData!.serviceId || "",
          serviceName: orderData!.serviceName || "",
          platform: orderData!.platform || "",
          accountUrl: orderData!.accountUrl || "",
          quantity: orderData!.quantity || 0,
          whatsappNumber: orderData!.whatsappNumber || "",
          price: orderData!.price || 0,
          currency: orderData!.currency || "USD",
          paymentMethod: paymentMethod,
          paymentScreenshot: url,
          status: "pending",
        });
        if (c && (c as any).item && (c as any).item.id) createdIds.push((c as any).item.id);
      }

      setIsSubmitting(false);
      toast({ title: t("paymentSubmittedTitle"), description: t("paymentSubmittedDesc") });

      // Navigate to confirmation page with list of created ids so page can fetch them on refresh reliably
      if (createdIds.length > 0) {
        navigate(`/payment/confirmation?ids=${createdIds.join(",")}`);
      } else {
        // Fallback to homepage if creation failed unexpectedly
        navigate("/");
      }
    } catch (err) {
      toast({ title: t("uploadFailedTitle"), description: t("uploadFailedDesc"), variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  if (!orderData) {
    if (noState) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <section className="py-24 px-4">
            <div className="container mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-heading font-bold mb-4">
                {t("noActiveOrderTitle")}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t("noActiveOrderMsg")}
              </p>
              <div className="flex gap-3 justify-center">
                <a
                  href="/"
                  className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground"
                >
                  {t("goHome")}
                </a>
                <a
                  href="/"
                  className="inline-block px-4 py-2 rounded border border-border"
                >
                  {t("browseServices")}
                </a>
              </div>
            </div>
          </section>
        </div>
      );
    }
    return null;
  }

  const symbol = getCurrencySymbol(orderData.currency);

  // If this orderData contains a cart, compute display values
  const displayUnits =
    orderData.cart && orderData.cart.length > 0
      ? orderData.cart.reduce((s, it) => s + (it.units || 0), 0)
      : orderData.quantity || 0;

  const displayPrice =
    orderData.cart && orderData.cart.length > 0
      ? orderData.cart.reduce((s, it) => s + (it.price || 0), 0)
      : orderData.price || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back")}
          </Button>

          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {t("completePayment")}
            </h1>
            <p className="text-muted-foreground">{t("choosePaymentMethod")}</p>
          </div>

          {/* Order Summary */}
          <Card className="gradient-card mb-6 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">{t("orderSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("serviceLabel")}
                  </span>
                  <span className="font-medium">{orderData.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("quantityLabel")}
                  </span>
                  <span>{displayUnits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-heading font-bold">
                    {t("totalAmount")}
                  </span>
                  <span className="font-heading font-bold text-primary text-lg">
                    {symbol}
                    {displayPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card
            className="gradient-card mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                {t("selectPaymentMethodTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as "stcpay" | "alrajhi" | "vodafone" | "instapay")
                }
                className="space-y-4"
              >
                {orderData.currency === "EGP" ? (
                  <>
                    {paymentSettings.vodafoneActive && (
                      <div
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "vodafone"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value="vodafone" id="vodafone" />
                        <Label
                          htmlFor="vodafone"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <div className="font-medium">Vodafone Cash</div>
                            <div className="text-sm text-muted-foreground">
                              {t("mobileWalletPayment")}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}
                    {paymentSettings.instaPayActive && (
                      <div
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "instapay"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value="instapay" id="instapay" />
                        <Label
                          htmlFor="instapay"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-purple-500" />
                          </div>
                          <div>
                            <div className="font-medium">InstaPay</div>
                            <div className="text-sm text-muted-foreground">
                              Instant Bank Transfer
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {paymentSettings.stcPayActive && (
                      <div
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "stcpay"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value="stcpay" id="stcpay" />
                        <Label
                          htmlFor="stcpay"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">STC Pay</div>
                            <div className="text-sm text-muted-foreground">
                              {t("mobileWalletPayment")}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}

                    {paymentSettings.alRajhiActive && (
                      <div
                        className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${paymentMethod === "alrajhi"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                          }`}
                      >
                        <RadioGroupItem value="alrajhi" id="alrajhi" />
                        <Label
                          htmlFor="alrajhi"
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">Al Rajhi Bank</div>
                            <div className="text-sm text-muted-foreground">
                              {t("bankTransfer")}
                            </div>
                          </div>
                        </Label>
                      </div>
                    )}
                  </>
                )}

              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card
            className="gradient-card mb-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg">{t("paymentDetails")}</CardTitle>
              <CardDescription>{t("paymentDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {paymentMethod === "stcpay"
                        ? t("stcPayNumberLabel")
                        : paymentMethod === "alrajhi"
                          ? t("alRajhiAccountLabel")
                          : paymentMethod === "vodafone"
                            ? t("vodafoneCashNumberLabel")
                            : "InstaPay Account"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg" id="payment-account-number">
                        {paymentMethod === "stcpay"
                          ? paymentSettings.stcPayNumber
                          : paymentMethod === "alrajhi"
                            ? paymentSettings.alRajhiAccount
                            : paymentMethod === "vodafone"
                              ? paymentSettings.vodafoneCash
                              : paymentSettings.instaPayAccount}
                      </span>
                      {/* Copy button uses the Clipboard API for quick copy and shows a small toast on success */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const num = paymentMethod === "stcpay"
                            ? paymentSettings.stcPayNumber
                            : paymentMethod === "alrajhi"
                              ? paymentSettings.alRajhiAccount
                              : paymentMethod === "vodafone"
                                ? paymentSettings.vodafoneCash
                                : paymentSettings.instaPayAccount;
                          try {
                            await navigator.clipboard.writeText(num || "");
                            toast({ title: "Copied ✅", description: num });
                          } catch (err) {
                            toast({ title: "Copy failed", description: String(err) });
                          }
                        }}
                        aria-label={t("copyAccountNumber")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t("amountToSendLabel")}
                    </span>
                    <span className="font-heading font-bold text-primary text-xl">
                      {symbol}
                      {displayPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {(() => {
                const qr =
                  paymentMethod === "stcpay"
                    ? paymentSettings.stcPayQr
                    : paymentMethod === "alrajhi"
                      ? paymentSettings.alRajhiQr
                      : null;
                if (qr) {
                  return (
                    <div className="p-4 rounded-lg border border-border text-center">
                      <div className="text-sm text-muted-foreground mb-2">
                        {t("scanQrToPay")}
                      </div>
                      <img
                        src={qr}
                        alt="Payment QR"
                        className="mx-auto max-h-48 rounded"
                      />
                    </div>
                  );
                }
                return null;
              })()}

              {/* Screenshot Upload */}
              <div className="space-y-2">
                <Label>{t("uploadScreenshot")} *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {screenshot ? (
                      <div className="space-y-2">
                        <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                        <p className="text-sm text-muted-foreground">
                          {t("screenshotUploaded")}
                        </p>
                        <img
                          src={screenshot}
                          alt="Payment screenshot"
                          className="max-h-32 mx-auto rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {t("uploadScreenshot")}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg"
              >
                {isSubmitting ? t("processing") : t("confirmPayment")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Payment;
