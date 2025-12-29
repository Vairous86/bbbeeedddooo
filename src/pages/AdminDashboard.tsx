import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Service, Order, PaymentSettings, Platform } from "@/lib/localStorage";
import {
  getServices as fetchServices,
  addService as createService,
  updateService as editService,
  deleteService as removeService,
  getAllPackages as fetchAllPackages,
  addPackage as createPackage,
  updatePackage as editPackage,
  deletePackage as removePackage,
  getMostRequested as fetchMostRequested,
  upsertMostRequested,
  getPlatforms as fetchPlatforms,
  fetchPaymentSettings,
  savePaymentSettings,
  getAllOrders,
  updateOrderStatus as updateOrderStatusApi,
  deleteOrder as deleteOrderApi,
} from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/contexts/LocaleContext";
import {
  Plus,
  Pencil,
  Trash2,
  LogOut,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPaymentSettings as fetchPaymentSettingsAlias, savePaymentSettings as savePaymentSettingsAlias, uploadServiceImage, uploadPaymentQr } from "@/lib/db";

const AdminDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stcPayNumber: "",
    alRajhiAccount: "",
    vodafoneCash: "",
    stcPayQr: "",
    alRajhiQr: "",
    vodafoneQr: "",
  });
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    priceSAR: "",
    priceEGP: "",
    priceUSD: "",
    deliveryTime: "",
    guarantee: "",
    image: "",
    platform: "",
    serviceType: "",
    submissionType: "url",
    requiresPayment: true,
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [mostRequested, setMostRequestedState] = useState<{ serviceId: string; visible: boolean }[]>([]);
  const { t } = useLocale();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-refresh interval (seconds). 0 = off. Persist in localStorage.
  const [refreshSeconds, setRefreshSeconds] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem("admin_refresh_seconds") || "5");
    } catch {
      return 5;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("admin_refresh_seconds", String(refreshSeconds));
    } catch {}
  }, [refreshSeconds]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      navigate("/super-secret-admin-panel-x99");
    } else {
      loadData();
      loadPackages();
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      const platRes = await fetchPlatforms();
      const platArr = Array.isArray(platRes?.data) ? (platRes.data as Platform[]) : [];
      setPlatforms(platArr);
    } catch {}
    try {
      const svcRes = await fetchServices();
      const svcArr = Array.isArray(svcRes?.data) ? (svcRes.data as Service[]) : [];
      setServices(svcArr);
    } catch {
      setServices([]);
    }
    try {
      const res = await getAllOrders();
      const arr = Array.isArray(res?.data) ? (res.data as any[]) : [];
      setOrders(
        arr.map((o) => ({
          id: o.id,
          serviceId: o.service_id || o.serviceId,
          serviceName: o.service_name || o.serviceName,
          platform: o.platform,
          accountUrl: o.account_url || o.accountUrl,
          quantity: o.quantity,
          whatsappNumber: o.whatsapp_number || o.whatsappNumber,
          price: o.price,
          currency: o.currency,
          paymentMethod: o.payment_method || o.paymentMethod,
          paymentScreenshot: o.payment_screenshot || o.paymentScreenshot,
          status: o.status,
          createdAt: o.created_at || o.createdAt,
        }))
      );
    } catch {
      setOrders([]);
    }
    try {
      const s = await fetchPaymentSettingsAlias();
      setPaymentSettings(s);
    } catch {
      setPaymentSettings({
        stcPayNumber: "",
        alRajhiAccount: "",
        vodafoneCash: "",
        stcPayQr: "",
        alRajhiQr: "",
        vodafoneQr: "",
      });
    }
  };
  const loadPackages = async () => {
    try {
      const pkgRes = await fetchAllPackages();
      const pkgArr = Array.isArray(pkgRes?.data) ? pkgRes.data : [];
      setPackages(pkgArr);
    } catch {
      setPackages([]);
    }
    try {
      const mostRes = await fetchMostRequested();
      const rows = Array.isArray(mostRes?.data) ? mostRes.data : [];
      setMostRequestedState(
        rows.map((r: any) => ({ serviceId: r.service_id || r.id, visible: !!r.visible }))
      );
    } catch {
      setMostRequestedState([]);
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem("admin_logged_in");
    navigate("/super-secret-admin-panel-x99");
  };

  const openAddDialog = () => {
    setEditingService(null);
    setFormData({
      title: "",
      description: "",
      fullDescription: "",
      priceSAR: "",
      priceEGP: "",
      priceUSD: "",
      deliveryTime: "",
      guarantee: "",
      image: "",
      platform: "",
      serviceType: "",
      submissionType: "url",
      requiresPayment: true,
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      fullDescription: service.fullDescription,
      priceSAR: (service.prices?.SAR ?? "").toString(),
      priceEGP: (service.prices?.EGP ?? "").toString(),
      priceUSD: (service.prices?.USD ?? "").toString(),
      deliveryTime: service.deliveryTime,
      guarantee: service.guarantee,
      image: service.image,
      platform: service.platform,
      serviceType: service.serviceType,
      submissionType: service.submissionType ?? "url",
      requiresPayment: service.requiresPayment ?? true,
    });
    setImageFile(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let imageUrl = formData.image;
    if (imageFile) {
      const uploaded = await uploadServiceImage(imageFile);
      if (!uploaded) {
        toast({ title: t("uploadImageFailed") });
        return;
      }
      imageUrl = uploaded;
    } else if (!editingService) {
      toast({ title: t("uploadImageRequired") });
      return;
    }
    const serviceData = {
      title: formData.title,
      description: formData.description,
      fullDescription: formData.fullDescription,
      prices: {
        SAR: parseFloat(formData.priceSAR),
        EGP: parseFloat(formData.priceEGP),
        USD: parseFloat(formData.priceUSD),
      },
      deliveryTime: formData.deliveryTime,
      guarantee: formData.guarantee,
      image: imageUrl,
      platform: formData.platform,
      serviceType: formData.serviceType,
      submissionType: formData.submissionType as "url" | "text",
      requiresPayment: !!formData.requiresPayment,
    };
    if (editingService) {
      await editService(editingService.id, serviceData as any);
      toast({ title: t("serviceUpdated") });
    } else {
      const res = await createService(serviceData as any);
      if (!res?.ok) {
        toast({ title: t("failedAddService") });
      } else {
        toast({ title: t("serviceAdded") });
      }
    }
    setDialogOpen(false);
    await loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      removeService(id);
      toast({ title: t("deleted") });
      loadData();
    }
  };
  const handleAddPackage = (serviceId: string) => {
    const units = parseInt(prompt("الوحدات (مثال: 100، 500، 1000)") || "100");
    const priceSAR = parseFloat(prompt("السعر بالريال") || "0");
    const priceEGP = parseFloat(prompt("السعر بالجنيه") || "0");
    const priceUSD = parseFloat(prompt("السعر بالدولار") || "0");
    const label = prompt("تسمية اختيارية (مثال: موصى به)") || "";
    const visible = confirm(
      "هل تكون هذه الباقة مرئية للعملاء؟ موافق = نعم"
    )
      ? true
      : false;
    if (!units || (!priceSAR && !priceEGP && !priceUSD))
      return toast({ title: t("invalidInput") });
    createPackage({
      serviceId,
      units,
      price: { SAR: priceSAR, EGP: priceEGP, USD: priceUSD },
      visible,
      label,
      description: "",
    });
    toast({ title: t("packageAdded") });
    loadPackages();
  };

  const handleDeletePackage = (id: string) => {
    if (window.confirm("هل تريد حذف هذه الباقة؟")) {
      removePackage(id);
      toast({ title: t("packageDeleted") });
      loadPackages();
    }
  };

  // Delete an order (admin only) with confirmation and optimistic UI update
  const handleDeleteOrder = async (id: string) => {
    const isAdmin = sessionStorage.getItem("admin_logged_in");
    if (!isAdmin) return toast({ title: "Unauthorized" });

    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا الطلب؟ هذه العملية لا يمكن التراجع عنها.")) return;

    // Optimistically remove from UI
    const previous = orders;
    setOrders((prev) => prev.filter((o) => o.id !== id));

    const res = await deleteOrderApi(id);
    if (!res?.ok) {
      toast({ title: t("failedDelete") || "Failed to delete order" });
      setOrders(previous); // revert UI
      return;
    }

    toast({ title: t("deleted") });
  };

  const handleEditPackage = (id: string) => {
    const all = packages;
    const p = all.find((x) => x.id === id);
    if (!p) return;
    const units = parseInt(
      prompt("الوحدات", p.units.toString()) || p.units.toString()
    );
    const priceSAR = parseFloat(
      prompt("السعر بالريال", p.price.SAR.toString()) || p.price.SAR.toString()
    );
    const priceEGP = parseFloat(
      prompt("السعر بالجنيه", p.price.EGP.toString()) || p.price.EGP.toString()
    );
    const priceUSD = parseFloat(
      prompt("السعر بالدولار", p.price.USD.toString()) || p.price.USD.toString()
    );
    const label = prompt("تسمية اختيارية", p.label || "") || "";
    const visible = confirm("مرئية للعملاء؟ موافق = نعم") ? true : false;
    editPackage(id, {
      units,
      price: { SAR: priceSAR, EGP: priceEGP, USD: priceUSD },
      label,
      visible,
    });
    toast({ title: t("packageUpdated") });
    loadPackages();
  };

  // Drag & drop reordering support
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDropOnPackage = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (!draggedId || draggedId === targetId) return;
    const all = packages;
    const dragged = all.find((x) => x.id === draggedId);
    const target = all.find((x) => x.id === targetId);
    if (!dragged || !target) return;
    // swap orderIndex
    const di = dragged.orderIndex ?? dragged.units;
    const ti = target.orderIndex ?? target.units;
    editPackage(dragged.id, { orderIndex: ti } as any);
    editPackage(target.id, { orderIndex: di } as any);
    toast({ title: t("packageOrderUpdated") });
    loadPackages();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const movePackage = (id: string, dir: number) => {
    const all = packages.filter((p: any) => p.serviceId === id || true);
    // For simplicity, operate on the service-specific list when invoked via buttons below
  };

  const handleToggleMost = (serviceId: string) => {
    const list = [...mostRequested];
    const found = list.find((l) => l.serviceId === serviceId);
    if (found) {
      found.visible = !found.visible;
    } else {
      list.push({ serviceId, visible: true });
    }
    setMostRequestedState(list);
    upsertMostRequested([{ service_id: serviceId, visible: !!list.find((l) => l.serviceId === serviceId)?.visible }]);
    toast({ title: t("mostRequestedUpdated") });
  };

  const moveMost = (index: number, dir: number) => {
    const list = [...mostRequested];
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= list.length) return;
    const tmp = list[newIndex];
    list[newIndex] = list[index];
    list[index] = tmp;
    setMostRequestedState(list);
    upsertMostRequested(
      list.map((it) => ({ service_id: it.serviceId, visible: it.visible }))
    );
    toast({ title: "Order updated" });
  };

  // Refresh orders in background without visible flicker: fetch and update only when changed
  const refreshOrders = async () => {
    try {
      const res = await getAllOrders();
      const arr = Array.isArray(res?.data) ? (res.data as any[]) : [];
      const newOrders = arr.map((o) => ({
        id: o.id,
        serviceId: o.service_id || o.serviceId,
        serviceName: o.service_name || o.serviceName,
        platform: o.platform,
        accountUrl: o.account_url || o.accountUrl,
        quantity: o.quantity,
        whatsappNumber: o.whatsapp_number || o.whatsappNumber,
        price: o.price,
        currency: o.currency,
        paymentMethod: o.payment_method || o.paymentMethod,
        paymentScreenshot: o.payment_screenshot || o.paymentScreenshot,
        status: o.status,
        createdAt: o.created_at || o.createdAt,
      }));

      setOrders((prev) => {
        try {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(newOrders);
          if (prevStr === newStr) return prev; // no change -> avoid re-render
        } catch {}
        return newOrders;
      });
    } catch {}
  };

  useEffect(() => {
    if (!refreshSeconds || refreshSeconds <= 0) return;
    // initial fetch
    refreshOrders();
    const id = setInterval(refreshOrders, refreshSeconds * 1000);
    return () => clearInterval(id);
  }, [refreshSeconds]);

  const handleOrderStatusChange = (
    orderId: string,
    status: Order["status"]
  ) => {
    updateOrderStatusApi(orderId, status);
    toast({ title: t("orderUpdated") });
    loadData();
  };
  const handlePaymentSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePaymentSettingsAlias(paymentSettings);
    } catch {
      // Fallback handled in db.ts savePaymentSettings
    }
    toast({ title: t("settingsSaved") });
  };

  const getStatusBadge = (status: Order["status"]) => {
    const styles = {
      pending: "bg-yellow-500/10 text-yellow-600",
      confirmed: "bg-blue-500/10 text-blue-600",
      completed: "bg-green-500/10 text-green-600",
      cancelled: "bg-red-500/10 text-red-600",
    };
    return (
      <Badge variant="outline" className={styles[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold text-primary">
              {t("adminPanel")}
            </span>
          </Link>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            {t("logout")}
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="services">{t("services")}</TabsTrigger>
            <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
            <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
            <TabsTrigger value="manage">
              {t("packagesAndMostRequested")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-heading font-bold">
                {t("services")}
              </h1>
              <Button onClick={openAddDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                {t("addService")}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <img
                      src={service.image}
                      alt={service.title}
                      className="aspect-video w-full rounded-lg object-cover mb-3"
                    />
                    <div className="flex gap-2 mb-2">
                      <Badge>{service.platform}</Badge>
                      <Badge variant="outline">{service.serviceType}</Badge>
                    </div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1 mb-4">
                      <div className="flex justify-between">
                        <span>ريال:</span>
                        <span className="font-bold">{service.prices?.SAR ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>جنيه:</span>
                        <span className="font-bold">{service.prices?.EGP ?? 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>دولار:</span>
                        <span className="font-bold">{service.prices?.USD ?? 0}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEditDialog(service)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(service.id)}
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <h2 className="text-2xl font-heading font-bold">
              {t("packagesAndMostRequested")}
            </h2>
            <p className="text-muted-foreground">
              {t("managePackagesText")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">{t("services")}</h3>
                {services.map((s) => (
                  <Card key={s.id} className="mb-3">
                    <CardHeader>
                      <CardTitle className="text-lg">{s.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">
                          {s.platform}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddPackage(s.id)}
                          >
                            {t("addPackage")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleMost(s.id)}
                          >
                            {mostRequested.find(
                              (m) => m.serviceId === s.id && m.visible
                            )
                              ? t("unfeature")
                              : t("feature")}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {packages
                          .filter((p) => p.serviceId === s.id)
                          .sort(
                            (a, b) =>
                              (a.orderIndex ?? a.units) -
                              (b.orderIndex ?? b.units)
                          )
                          .map((p) => (
                            <div
                              key={p.id}
                              className="flex items-center justify-between text-sm p-2 rounded border border-border"
                              draggable
                              onDragStart={(e) => handleDragStart(e, p.id)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDropOnPackage(e, p.id)}
                            >
                              <div>
                                <div className="font-medium">
                                  {p.units.toLocaleString()}{" "}
                                  {p.label ? `— ${p.label}` : ""}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  SAR {p.price?.SAR ?? 0} / EGP {p.price?.EGP ?? 0} / USD{" "}
                                  {p.price?.USD ?? 0}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditPackage(p.id)}
                                >
                                  {t("edit")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    editPackage(p.id, {
                                      visible: !p.visible,
                                    } as any);
                                    toast({
                                      title: p.visible ? t("hide") : t("show"),
                                    });
                                    loadPackages();
                                  }}
                                >
                                  {p.visible ? t("hide") : t("show")}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeletePackage(p.id)}
                                >
                                  {t("delete")}
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t("mostRequestedOrder")}</h3>
                <div className="space-y-2">
                  {mostRequested.map((m, idx) => {
                    const svc = services.find((s) => s.id === m.serviceId);
                    if (!svc) return null;
                    return (
                      <div
                        key={m.serviceId}
                        className="flex items-center justify-between p-2 rounded border border-border"
                      >
                        <div>
                          <div className="font-medium">{svc.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {m.visible ? t("show") : t("hide")}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveMost(idx, -1)}
                          >
                            ↑
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => moveMost(idx, 1)}
                          >
                            ↓
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleMost(m.serviceId)}
                          >
                            {m.visible ? t("hide") : t("show")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-heading font-bold">{t("orders")}</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">تحديث تلقائي</span>
                <Select value={String(refreshSeconds)} onValueChange={(v) => setRefreshSeconds(parseInt(v))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">متوقف</SelectItem>
                    <SelectItem value="2">كل 2 ثانية</SelectItem>
                    <SelectItem value="5">كل 5 ثواني</SelectItem>
                    <SelectItem value="10">كل 10 ثواني</SelectItem>
                    <SelectItem value="30">كل 30 ثانية</SelectItem>
                    <SelectItem value="60">كل 60 ثانية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">{t("noOrdersYet")}</p>
            ) : (
              orders.map((order) => {
                const service = services.find(s => s.id === order.serviceId);
                const isTextService = service?.submissionType === 'text' || order.accountUrl?.startsWith('TEXT:');
                const content = isTextService 
                    ? (order.accountUrl || "").replace(/^TEXT:/, '') 
                    : order.accountUrl;

                return (
                <Card key={order.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{order.serviceName}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="space-y-1 mb-3">
                         {isTextService ? (
                            <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap border border-border">
                                <span className="font-semibold block mb-1 text-xs text-muted-foreground">{t("serviceTextLabel")}:</span>
                                {content}
                            </div>
                         ) : (
                            <p className="text-sm">
                                <span className="text-muted-foreground">{t("accountUrlLabel")}: </span>
                                <a href={content} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium break-all">
                                    {content}
                                </a>
                            </p>
                         )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>
                           {t("quantityLabel")}: <span className="font-medium text-foreground">{order.quantity}</span>
                        </span>
                        <span>|</span>
                        <span>
                           {t("price")}: <span className="font-medium text-foreground">{order.currency} {order.price.toFixed(2)}</span>
                        </span>
                        <span>|</span>
                        <span>
                           واتساب: <span className="font-medium text-foreground" dir="ltr">{order.whatsappNumber}</span>
                        </span>
                      </div>
                      
                      {order.paymentScreenshot && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">إيصال الدفع:</p>
                            <div 
                                className="relative group cursor-zoom-in inline-block"
                                onClick={() => setPreviewImage(order.paymentScreenshot as string)}
                            >
                                <img 
                                    src={order.paymentScreenshot} 
                                    alt="Payment Receipt" 
                                    className="h-24 w-auto rounded border border-border object-cover transition-transform hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded" />
                            </div>
                        </div>
                      )}
                    </div>

                    <div className="min-w-[140px] flex flex-col items-stretch gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(v) =>
                            handleOrderStatusChange(order.id, v as Order["status"])
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="confirmed">مؤكد</SelectItem>
                            <SelectItem value="completed">مكتمل</SelectItem>
                            <SelectItem value="cancelled">ملغي</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="ml-2"
                            title="Delete order"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              )})
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>{t("paymentSettings")}</CardTitle>
                <CardDescription>
                  Configure payment methods for different regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handlePaymentSettingsUpdate}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    {t("saudiArabia")}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t("stcPayNumber")}</Label>
                    <Input
                      value={paymentSettings.stcPayNumber}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          stcPayNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("stcPayQr")}</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="stc-qr-upload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadPaymentQr("STC Pay", file);
                          if (!url) {
                            toast({ title: t("uploadImageFailed") });
                            return;
                          }
                          setPaymentSettings({
                            ...paymentSettings,
                            stcPayQr: url,
                          });
                        }}
                      />
                      <label
                        htmlFor="stc-qr-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        {paymentSettings.stcPayQr ? t("replaceQr") : t("uploadQr")}
                      </label>
                      {paymentSettings.stcPayQr && (
                        <img
                          src={paymentSettings.stcPayQr}
                          alt={t("stcPayQr")}
                          className="mt-3 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("alRajhiAccount")}</Label>
                    <Input
                      value={paymentSettings.alRajhiAccount}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          alRajhiAccount: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("alRajhiQr")}</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        id="alrajhi-qr-upload"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadPaymentQr("Al Rajhi", file);
                          if (!url) {
                            toast({ title: t("uploadImageFailed") });
                            return;
                          }
                          setPaymentSettings({
                            ...paymentSettings,
                            alRajhiQr: url,
                          });
                        }}
                      />
                      <label
                        htmlFor="alrajhi-qr-upload"
                        className="cursor-pointer text-sm text-muted-foreground"
                      >
                        {paymentSettings.alRajhiQr ? t("replaceQr") : t("uploadQr")}
                      </label>
                      {paymentSettings.alRajhiQr && (
                        <img
                          src={paymentSettings.alRajhiQr}
                          alt={t("alRajhiQr")}
                          className="mt-3 max-h-32 rounded"
                        />
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-muted-foreground pt-4">
                    {t("egypt")}
                  </h3>
                  <div className="space-y-2">
                    <Label>{t("vodafoneCashNumber")}</Label>
                    <Input
                      value={paymentSettings.vodafoneCash}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          vodafoneCash: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button type="submit" className="mt-4">
                    {t("saveSettings")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? t("edit") : t("addService")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("titleLabel")}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("platformLabel")}</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) =>
                    setFormData({ ...formData, platform: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("serviceTypeLabel")}</Label>
                <Input
                  value={formData.serviceType}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceType: e.target.value })
                  }
                  placeholder={t("serviceTypePlaceholder")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("imageUploadLabel")}</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    id="service-image-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                    }}
                  />
                  <label
                    htmlFor="service-image-upload"
                    className="cursor-pointer text-sm text-muted-foreground"
                  >
                    {imageFile ? t("replaceImage") : t("uploadImage")}
                  </label>
                  {(imageFile || editingService?.image) && (
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : (editingService?.image as string)}
                      alt={t("imagePreviewAlt")}
                      className="mt-3 max-h-32 rounded"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("submissionTypeLabel")}</Label>
                <Select
                  value={formData.submissionType}
                  onValueChange={(v) =>
                    setFormData({ ...formData, submissionType: v as "url" | "text" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">{t("submissionTypeUrl")}</SelectItem>
                    <SelectItem value="text">{t("submissionTypeText")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("requiresPaymentLabel")}</Label>
                <div className="flex items-center gap-3 p-3 rounded border border-border">
                  <input
                    type="checkbox"
                    id="requires-payment"
                    checked={formData.requiresPayment}
                    onChange={(e) =>
                      setFormData({ ...formData, requiresPayment: e.target.checked })
                    }
                  />
                  <label htmlFor="requires-payment" className="text-sm text-muted-foreground">
                    {formData.requiresPayment ? t("paidService") : t("freeService")}
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("shortDescription")}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t("fullDescription")}</Label>
              <Textarea
                value={formData.fullDescription}
                onChange={(e) =>
                  setFormData({ ...formData, fullDescription: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t("priceSarPerThousand")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceSAR}
                  onChange={(e) =>
                    setFormData({ ...formData, priceSAR: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("priceEgpPerThousand")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceEGP}
                  onChange={(e) =>
                    setFormData({ ...formData, priceEGP: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("priceUsdPerThousand")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceUSD}
                  onChange={(e) =>
                    setFormData({ ...formData, priceUSD: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("deliveryTimeLabel")}</Label>
                <Input
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("guaranteeLabel")}</Label>
                <Input
                  value={formData.guarantee}
                  onChange={(e) =>
                    setFormData({ ...formData, guarantee: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingService ? t("update") : t("add")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex justify-center items-center">
            {previewImage && (
                <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                />
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
