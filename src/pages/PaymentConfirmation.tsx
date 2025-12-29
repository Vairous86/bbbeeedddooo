import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/db";
import type { Order } from "@/lib/localStorage";
import { useLocale } from "@/contexts/LocaleContext";

const PaymentConfirmation = () => {
  const [params] = useSearchParams();
  const idsParam = params.get("ids") || "";
  const ids = idsParam ? idsParam.split(",") : [];
  const [orders, setOrders] = useState<Order[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (ids.length === 0) return;
      const results: Order[] = [];
      for (const id of ids) {
        try {
          const res = await getOrderById(id);
          if (res && (res as any).item) results.push((res as any).item);
        } catch (e) {
          // ignore
        }
      }
      if (mounted) setOrders(results);
    })();
    return () => { mounted = false; };
  }, [ids]);

  if (!ids.length) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-heading font-bold mb-4">{t("paymentConfirmation")}</h2>
            <p className="text-muted-foreground mb-6">{t("noPaymentFound")}</p>
            <Link to="/" className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground">{t("goHome")}</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-heading font-bold mb-6">{t("paymentConfirmation")}</h1>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <Card className="gradient-card">
                <CardContent>
                  <p className="text-muted-foreground">{t("loading")}</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((o) => (
                <Card key={o.id} className="gradient-card">
                  <CardHeader>
                    <CardTitle>{o.serviceName || "Order"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-2">
                      <div className="text-muted-foreground">{t("paymentMethod")}</div>
                      <div>{o.paymentMethod}</div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <div className="text-muted-foreground">{t("amount")}</div>
                      <div>{o.currency} {o.price.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between mb-2">
                      <div className="text-muted-foreground">{t("reference")}</div>
                      <div className="font-mono">{o.accountUrl || o.whatsappNumber || "-"}</div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-muted-foreground">
                        {o.status === "pending" ? t("paymentUnderReview") : t("paymentReceived")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => window.location.reload()} variant="ghost">{t("refresh")}</Button>
                        <Link to="/" className="inline-block">
                          <Button>{t("goHome")}</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PaymentConfirmation;
