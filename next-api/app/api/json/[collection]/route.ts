const NextResponse = {
  json: (body: any, init?: { status?: number; headers?: Record<string, string> }) =>
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    }),
};
import { promises as fs } from "fs";
import path from "path";

const defaultPlatforms = [
  {
    id: "facebook",
    name: "Facebook",
    description: "Boost your Facebook presence with likes, followers, and engagement",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    color: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Grow your Instagram with real followers, likes, and views",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    color: "#E4405F",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Viral TikTok growth with followers, views, and engagement",
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    color: "#000000",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Increase YouTube subscribers, views, and watch time",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    color: "#FF0000",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Build your Twitter following with quality engagement",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    color: "#1DA1F2",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "Grow your Snapchat with real followers and views",
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    color: "#FFFC00",
  },
];
const defaultServices = [
  {
    id: "fb-likes",
    title: "Facebook Page Likes",
    description: "Increase your Facebook page likes with real users",
    fullDescription: "Boost your Facebook page credibility with genuine page likes from real, active users.",
    prices: { SAR: 75, EGP: 500, USD: 20 },
    deliveryTime: "24-48 hours",
    guarantee: "30-day refill guarantee",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    platform: "facebook",
    serviceType: "Likes",
  },
  {
    id: "ig-followers",
    title: "Instagram Followers",
    description: "Grow your Instagram with real followers",
    fullDescription: "Build your Instagram presence with high-quality followers from real accounts.",
    prices: { SAR: 85, EGP: 550, USD: 23 },
    deliveryTime: "24-48 hours",
    guarantee: "60-day refill guarantee",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    platform: "instagram",
    serviceType: "Followers",
  },
  {
    id: "tt-likes",
    title: "TikTok Likes",
    description: "Boost your TikTok videos with likes",
    fullDescription: "Increase engagement on your TikTok videos with real likes from active users.",
    prices: { SAR: 45, EGP: 300, USD: 12 },
    deliveryTime: "1-12 hours",
    guarantee: "30-day refill guarantee",
    image: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    platform: "tiktok",
    serviceType: "Likes",
  },
  {
    id: "yt-views",
    title: "YouTube Views",
    description: "Increase your video views",
    fullDescription: "Boost your YouTube video performance with real, high-retention views.",
    prices: { SAR: 80, EGP: 520, USD: 21 },
    deliveryTime: "24-48 hours",
    guarantee: "90-day retention guarantee",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    platform: "youtube",
    serviceType: "Views",
  },
  {
    id: "tw-followers",
    title: "Twitter Followers",
    description: "Build your Twitter audience",
    fullDescription: "Grow your Twitter influence with high-quality followers interested in your content.",
    prices: { SAR: 70, EGP: 450, USD: 19 },
    deliveryTime: "24-48 hours",
    guarantee: "30-day refill guarantee",
    image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    platform: "twitter",
    serviceType: "Followers",
  },
  {
    id: "sc-views",
    title: "Snapchat Story Views",
    description: "Get more views on your stories",
    fullDescription: "Boost your Snapchat story views with real viewers.",
    prices: { SAR: 35, EGP: 230, USD: 9 },
    deliveryTime: "1-12 hours",
    guarantee: "Quality guarantee",
    image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    platform: "snapchat",
    serviceType: "Views",
  },
];
const defaultPaymentSettings = [
  { method: "STC Pay", account_number: "0500000000", qr_url: "", currency: "SAR" },
  { method: "Al Rajhi", account_number: "1234567890123456", qr_url: "", currency: "SAR" },
  { method: "Vodafone Cash", account_number: "01000000000", qr_url: "", currency: "EGP" },
];
const defaultAdminCredentials = [{ username: "admin", password: "admin123" }];
const buildDefaultPackages = (services: any[]) => {
  const out: any[] = [];
  for (const s of services) {
    for (const units of [100, 1000]) {
      out.push({
        id: `${s.id}-${units}`,
        serviceId: s.id,
        units,
        price: {
          SAR: (units / 1000) * s.prices.SAR,
          EGP: (units / 1000) * s.prices.EGP,
          USD: (units / 1000) * s.prices.USD,
        },
        visible: true,
        orderIndex: units === 100 ? 0 : 1,
        label: units === 1000 ? "Recommended" : "",
        description: "",
      });
    }
  }
  return out;
};
const buildDefaultMostRequested = (services: any[]) =>
  services.slice(0, 6).map((s: any) => ({ id: s.id, service_id: s.id, visible: true }));
const defaultOrders = [
  {
    id: "order-1",
    service_id: "ig-followers",
    service_name: "Instagram Followers",
    platform: "instagram",
    account_url: "https://instagram.com/example",
    quantity: 1000,
    whatsapp_number: "+201000000000",
    price: 550,
    currency: "EGP",
    payment_method: "Vodafone Cash",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];
const defaultAnalytics = [
  { id: "a1", type: "page_view", timestamp: new Date().toISOString(), meta: { page: "/" } },
];

const allowed = new Set([
  "services",
  "platforms",
  "packages",
  "orders",
  "analytics",
  "payment_settings",
  "most_requested",
  "admin_credentials",
]);

const filePath = (name: string) =>
  path.join(process.cwd(), "next-api", "storage", `${name}.json`);

const readJson = async (p: string) => {
  try {
    const s = await fs.readFile(p, "utf-8");
    const j = s ? JSON.parse(s) : [];
    return Array.isArray(j) ? j : [];
  } catch {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
    return [];
  }
};

const writeJson = async (p: string, data: any[]) => {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data));
};

export async function GET(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  if (name === "platforms" && data.length === 0) {
    await writeJson(p, defaultPlatforms as any[]);
    return NextResponse.json({ ok: true, data: defaultPlatforms });
  }
  if (name === "services" && data.length === 0) {
    await writeJson(p, defaultServices as any[]);
    return NextResponse.json({ ok: true, data: defaultServices });
  }
  if (name === "packages" && data.length === 0) {
    const sp = filePath("services");
    let services = await readJson(sp);
    if (services.length === 0) {
      await writeJson(sp, defaultServices as any[]);
      services = defaultServices as any[];
    }
    const pkgs = buildDefaultPackages(services);
    await writeJson(p, pkgs);
    return NextResponse.json({ ok: true, data: pkgs });
  }
  if (name === "most_requested" && data.length === 0) {
    const sp = filePath("services");
    let services = await readJson(sp);
    if (services.length === 0) {
      await writeJson(sp, defaultServices as any[]);
      services = defaultServices as any[];
    }
    const most = buildDefaultMostRequested(services);
    await writeJson(p, most);
    return NextResponse.json({ ok: true, data: most });
  }
  if (name === "payment_settings" && data.length === 0) {
    await writeJson(p, defaultPaymentSettings as any[]);
    return NextResponse.json({ ok: true, data: defaultPaymentSettings });
  }
  if (name === "admin_credentials" && data.length === 0) {
    await writeJson(p, defaultAdminCredentials as any[]);
    return NextResponse.json({ ok: true, data: defaultAdminCredentials });
  }
  if (name === "orders" && data.length === 0) {
    const sp = filePath("services");
    let services = await readJson(sp);
    if (services.length === 0) {
      await writeJson(sp, defaultServices as any[]);
      services = defaultServices as any[];
    }
    await writeJson(p, defaultOrders as any[]);
    return NextResponse.json({ ok: true, data: defaultOrders });
  }
  if (name === "analytics" && data.length === 0) {
    await writeJson(p, defaultAnalytics as any[]);
    return NextResponse.json({ ok: true, data: defaultAnalytics });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  const p = filePath(name);
  const data = await readJson(p);
  const id =
    (body?.id as string) ||
    (globalThis as any)?.crypto?.randomUUID?.() ||
    (Date.now() + Math.floor(Math.random() * 1000000)).toString();
  const item = { id, ...body };
  const next = [...data, item];
  await writeJson(p, next);
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function PUT(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  if (!body?.id)
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  const idx = data.findIndex((r: any) => r.id === body.id);
  if (idx === -1)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  const updated = { ...data[idx], ...body };
  data[idx] = updated;
  await writeJson(p, data);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  if (!body?.id)
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  const exists = data.some((r: any) => r.id === body.id);
  if (!exists)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  const next = data.filter((r: any) => r.id !== body.id);
  await writeJson(p, next);
  return NextResponse.json({ ok: true, id: body.id });
}
