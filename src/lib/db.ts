import type {
  PaymentSettings,
  Service,
  Platform,
  PackageOption,
  Order,
  AnalyticsEvent,
} from "./localStorage";
import { supabase } from "./supabaseClient";

export const fetchPaymentSettings = async (): Promise<PaymentSettings> => {
  const { data } = await supabase.from("payment_settings").select("*");
  const rows = Array.isArray(data) ? data : [];
  const find = (m: string, c: string) =>
    rows.find((r: any) => r.method === m && r.currency === c);

  const stc = find("STC Pay", "SAR");
  const rajhi = find("Al Rajhi", "SAR");
  const voda = find("Vodafone Cash", "EGP");
  const insta = find("InstaPay", "EGP");

  return {
    stcPayNumber: stc?.account_number || "",
    stcPayQr: stc?.qr_url || "",
    stcPayActive: stc?.is_active ?? true,

    alRajhiAccount: rajhi?.account_number || "",
    alRajhiQr: rajhi?.qr_url || "",
    alRajhiActive: rajhi?.is_active ?? true,

    vodafoneCash: voda?.account_number || "",
    vodafoneQr: voda?.qr_url || "",
    vodafoneActive: voda?.is_active ?? true,

    instaPayAccount: insta?.account_number || "",
    instaPayActive: insta?.is_active ?? true,
  };
};

export const savePaymentSettings = async (s: PaymentSettings): Promise<void> => {
  const upsertOrUpdate = async (
    method: string,
    currency: "SAR" | "EGP",
    fields: { account_number: string; qr_url?: string; is_active: boolean }
  ) => {
    const { data } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("method", method)
      .eq("currency", currency)
      .limit(1);
    const exists = Array.isArray(data) && data.length > 0;
    if (exists) {
      await supabase
        .from("payment_settings")
        .update(fields)
        .eq("method", method)
        .eq("currency", currency);
    } else {
      await supabase
        .from("payment_settings")
        .insert({ method, currency, ...fields });
    }
  };

  await upsertOrUpdate("STC Pay", "SAR", {
    account_number: s.stcPayNumber,
    qr_url: s.stcPayQr || "",
    is_active: s.stcPayActive,
  });
  await upsertOrUpdate("Al Rajhi", "SAR", {
    account_number: s.alRajhiAccount,
    qr_url: s.alRajhiQr || "",
    is_active: s.alRajhiActive,
  });
  await upsertOrUpdate("Vodafone Cash", "EGP", {
    account_number: s.vodafoneCash,
    qr_url: "", // No QR for Vodafone usually
    is_active: s.vodafoneActive,
  });
  await upsertOrUpdate("InstaPay", "EGP", {
    account_number: s.instaPayAccount,
    qr_url: "",
    is_active: s.instaPayActive,
  });
};

/* =======================
   Analytics Functions
======================= */

export interface VisitLog {
  ip_address: string;
  country: string;
  city?: string;
  page_url: string;
  user_agent: string;
  referrer_source?: string;
  created_at?: string;
  timestamp?: string;
}

export const logVisit = async (visit: VisitLog) => {
  try {
    await supabase.from("analytics_visits").insert([{
      ip_address: visit.ip_address,
      country: visit.country,
      city: visit.city,
      page_url: visit.page_url,
      user_agent: visit.user_agent,
      referrer_source: visit.referrer_source
    }]);
  } catch { }
};

export const getVisits = async () => {
  const { data, error } = await supabase
    .from("analytics_visits")
    .select("*")
    .order("created_at", { ascending: false });
  return { ok: !error, data: Array.isArray(data) ? data : [] };
};

export async function getPlatforms() {
  const { data, error } = await supabase.from("platforms").select("*");
  const rows = Array.isArray(data) ? data : [];
  const mapped = rows.map((r: any) => ({
    id: r.id,
    slug: r.slug ?? r.id,
    name: r.name,
    description: r.description,
    image: r.image,
    color: r.color,
  })) as Platform[];
  return { ok: !error, data: mapped as any };
}

export async function addPlatform(payload: any) {
  const { data, error } = await supabase.from("platforms").insert(payload).select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function uploadServiceImage(file: File): Promise<string | null> {
  try {
    const bucket = "services";
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `service-images/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });
    if (upErr) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}

export async function uploadPaymentQr(
  method: "STC Pay" | "Al Rajhi",
  file: File
): Promise<string | null> {
  try {
    const bucket = "services";
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const safeMethod = method.replace(/\s+/g, "-").toLowerCase();
    const path = `payment-qrs/${safeMethod}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });
    if (upErr) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data?.publicUrl || null;
    if (!publicUrl) return null;
    const currency: "SAR" = "SAR";
    const { data: rows } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("method", method)
      .eq("currency", currency)
      .limit(1);
    const exists = Array.isArray(rows) && rows.length > 0;
    const account_number = exists ? rows[0]?.account_number || "" : "";
    if (exists) {
      await supabase
        .from("payment_settings")
        .update({ account_number, qr_url: publicUrl })
        .eq("method", method)
        .eq("currency", currency);
    } else {
      await supabase
        .from("payment_settings")
        .insert({ method, currency, account_number, qr_url: publicUrl });
    }
    return publicUrl;
  } catch {
    return null;
  }
}

export async function uploadPaymentScreenshot(file: File): Promise<string | null> {
  try {
    const bucket = "services";
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const path = `payment-screenshots/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type || `image/${ext}`,
    });
    if (upErr) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch {
    return null;
  }
}

export async function getServices() {
  const { data, error } = await supabase.from("services").select("*");
  const rows = Array.isArray(data) ? data : [];
  const mapped = rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    fullDescription: r.fullDescription ?? r.full_description,
    prices: r.prices,
    deliveryTime: r.deliveryTime ?? r.delivery_time,
    guarantee: r.guarantee,
    image: r.image,
    platform: r.platform ?? r.platform_id ?? r.platformId,
    serviceType: r.serviceType ?? r.service_type,
    submissionType: r.submissionType ?? r.submission_type ?? "url",
    requiresPayment: r.requiresPayment ?? r.requires_payment ?? true,
  })) as Service[];
  return { ok: !error, data: mapped };
}

export async function addService(payload: Omit<Service, "id">) {
  const id =
    (globalThis as any)?.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const row = {
    id,
    title: payload.title,
    description: payload.description,
    full_description: payload.fullDescription,
    prices: payload.prices,
    delivery_time: payload.deliveryTime,
    guarantee: payload.guarantee,
    image: payload.image,
    platform: payload.platform,
    service_type: payload.serviceType,
    submission_type: (payload as any).submissionType ?? "url",
    requires_payment: (payload as any).requiresPayment ?? true,
  };
  const { data, error } = await supabase.from("services").insert(row).select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function updateService(id: string, updates: Partial<Service>) {
  const converted: any = {};
  if (updates.title !== undefined) converted.title = updates.title;
  if (updates.description !== undefined) converted.description = updates.description;
  if (updates.fullDescription !== undefined) converted.full_description = updates.fullDescription;
  if (updates.prices !== undefined) converted.prices = updates.prices;
  if (updates.deliveryTime !== undefined) converted.delivery_time = updates.deliveryTime;
  if (updates.guarantee !== undefined) converted.guarantee = updates.guarantee;
  if (updates.image !== undefined) converted.image = updates.image;
  if (updates.platform !== undefined) converted.platform = updates.platform;
  if (updates.serviceType !== undefined) converted.service_type = updates.serviceType;
  if (updates.submissionType !== undefined) converted.submission_type = updates.submissionType;
  if (updates.requiresPayment !== undefined) converted.requires_payment = updates.requiresPayment;
  const { data, error } = await supabase
    .from("services")
    .update(converted)
    .eq("id", id)
    .select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  return { ok: !error, id };
}

export async function getAllPackages() {
  const { data, error } = await supabase.from("service_packages").select("*");
  const rows = Array.isArray(data) ? data : [];
  const mapped = rows.map((r: any) => ({
    id: r.id,
    serviceId: r.serviceId ?? r.service_id,
    units: r.units,
    price: r.price,
    visible: r.visible,
    orderIndex: r.orderIndex ?? r.order_index,
    label: r.label,
    description: r.description,
  })) as PackageOption[];
  return { ok: !error, data: mapped };
}

export async function addPackage(pkg: Omit<PackageOption, "id">) {
  const serviceId = (pkg as any).service_id ?? pkg.serviceId;
  const id = `${serviceId}-${pkg.units}`;
  const row = {
    id,
    service_id: serviceId,
    units: pkg.units,
    price: pkg.price,
    visible: pkg.visible,
    order_index: pkg.orderIndex ?? null,
    label: pkg.label ?? null,
    description: pkg.description ?? null,
  };
  const { data, error } = await supabase.from("service_packages").insert(row).select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function updatePackage(id: string, updates: Partial<PackageOption>) {
  const converted: any = {};
  if ((updates as any).service_id !== undefined || updates.serviceId !== undefined)
    converted.service_id = (updates as any).service_id ?? updates.serviceId;
  if (updates.units !== undefined) converted.units = updates.units;
  if (updates.price !== undefined) converted.price = updates.price;
  if (updates.visible !== undefined) converted.visible = updates.visible;
  if (updates.orderIndex !== undefined) converted.order_index = updates.orderIndex;
  if (updates.label !== undefined) converted.label = updates.label;
  if (updates.description !== undefined) converted.description = updates.description;
  const { data, error } = await supabase
    .from("service_packages")
    .update(converted)
    .eq("id", id)
    .select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function deletePackage(id: string) {
  const { error } = await supabase.from("service_packages").delete().eq("id", id);
  return { ok: !error, id };
}

export async function getMostRequested() {
  const { data, error } = await supabase.from("most_requested").select("*");
  if (error) {
    return { ok: false, data: [] };
  }
  return { ok: true, data: Array.isArray(data) ? data : [] };
}

export async function upsertMostRequested(
  items: { service_id: string; visible: boolean; position?: number }[]
) {
  for (const it of items) {
    await supabase
      .from("most_requested")
      .upsert({ id: it.service_id, service_id: it.service_id, visible: it.visible, position: it.position ?? null });
  }
}

export async function getOrdersByUser(userId: string) {
  const { data, error } = await supabase.from("orders").select("*").eq("user_id", userId);
  return { ok: !error, data: Array.isArray(data) ? data : [] };
}

export async function getAllOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return { ok: !error, data: Array.isArray(data) ? data : [] };
}

export async function getOrderById(id: string) {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).limit(1);
  const item = Array.isArray(data) && data.length > 0 ? data[0] : null;
  return { ok: !error, item };
}

export async function addOrder(order: Omit<Order, "id" | "createdAt">) {
  const normalizePaymentMethod = (pm: string | undefined) => {
    if (!pm) return null;
    switch (pm) {
      case "stcpay":
        return "STC Pay";
      case "alrajhi":
        return "Al Rajhi";
      case "vodafone":
        return "Vodafone Cash";
      case "free":
        return "Free";
      default:
        return pm;
    }
  };
  const row = {
    service_id: order.serviceId,
    service_name: order.serviceName,
    platform: order.platform,
    account_url: order.accountUrl,
    quantity: order.quantity,
    whatsapp_number: order.whatsappNumber,
    price: order.price,
    currency: order.currency,
    payment_method: normalizePaymentMethod(order.paymentMethod),
    payment_screenshot: order.paymentScreenshot || null,
    status: order.status,
    created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("orders").insert(row).select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

export async function updateOrderStatus(id: string, status: Order["status"]) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}

// Delete an order by id. This is intended for admin use only.
export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  return { ok: !error, id };
}

export async function addAnalytics(event: Omit<AnalyticsEvent, "id" | "timestamp">) {
  const row = {
    type: event.type,
    service_id: event.serviceId ?? null,
    timestamp: new Date().toISOString(),
    meta: event.meta ?? null,
  };
  const { data, error } = await supabase.from("analytics_events").insert(row).select();
  return { ok: !error, item: Array.isArray(data) ? data[0] : null };
}
