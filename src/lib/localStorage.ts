// LocalStorage service for managing services data
export interface ServicePrice {
  SAR: number;
  EGP: number;
  USD: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  prices: ServicePrice;
  deliveryTime: string;
  guarantee: string;
  image: string;
  platform: string;
  serviceType: string;
  submissionType?: "url" | "text";
  requiresPayment?: boolean;
}

export interface Platform {
  id: string;
  name: string;
  description: string;
  image: string;
  color: string;
}

export interface Order {
  id: string;
  serviceId: string;
  serviceName: string;
  platform: string;
  accountUrl: string;
  quantity: number;
  whatsappNumber: string;
  price: number;
  currency: string;
  paymentMethod: string;
  paymentScreenshot?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface PackageOption {
  id: string;
  serviceId: string;
  units: number;
  price: { SAR: number; EGP: number; USD: number };
  visible: boolean;
  // orderIndex controls the order packages are shown in dropdowns
  orderIndex?: number;
  // optional short label shown in dropdown (e.g. "Recommended")
  label?: string;
  // longer description or tag (e.g. "Fast delivery")
  description?: string;
}

export interface AnalyticsEvent {
  id: string;
  type: string; // page_view | service_click | add_to_cart | purchase | refund
  serviceId?: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface PaymentSettings {
  stcPayNumber: string;
  stcPayQr?: string;
  stcPayActive: boolean;

  alRajhiAccount: string;
  alRajhiQr?: string;
  alRajhiActive: boolean;

  vodafoneCash: string;
  vodafoneQr?: string;
  vodafoneActive: boolean;

  instaPayAccount: string;
  instaPayActive: boolean;
}

const STORAGE_KEY = "social_media_services";
const PLATFORMS_KEY = "social_media_platforms";
const ORDERS_KEY = "social_media_orders";
const ADMIN_KEY = "admin_credentials";
const PAYMENT_SETTINGS_KEY = "payment_settings";
const PACKAGES_KEY = "social_media_packages";
const MOST_REQUESTED_KEY = "social_media_most_requested";
const ANALYTICS_KEY = "social_media_analytics";

const API_BASE = "/api/json";
const apiGet = async (name: string) => {
  const res = await fetch(`${API_BASE}/${name}`, { method: "GET" });
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
};
const apiPost = async (name: string, item: any) => {
  const res = await fetch(`${API_BASE}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  return json?.item;
};
const apiPut = async (name: string, item: any) => {
  const res = await fetch(`${API_BASE}/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  const json = await res.json();
  return json?.item;
};
const apiDelete = async (name: string, id: string) => {
  await fetch(`${API_BASE}/${name}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
};

// Default platforms
const defaultPlatforms: Platform[] = [
  {
    id: "facebook",
    name: "Facebook",
    description:
      "Boost your Facebook presence with likes, followers, and engagement",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    color: "#1877F2",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Grow your Instagram with real followers, likes, and views",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    color: "#E4405F",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Viral TikTok growth with followers, views, and engagement",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    color: "#000000",
  },
  {
    id: "youtube",
    name: "YouTube",
    description: "Increase YouTube subscribers, views, and watch time",
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    color: "#FF0000",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    description: "Build your Twitter following with quality engagement",
    image:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    color: "#1DA1F2",
  },
  {
    id: "snapchat",
    name: "Snapchat",
    description: "Grow your Snapchat with real followers and views",
    image:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    color: "#FFFC00",
  },
];

// Default demo services with multi-currency pricing
const defaultServices: Service[] = [
  // Facebook Services
  {
    id: "fb-likes",
    title: "Facebook Page Likes",
    description: "Increase your Facebook page likes with real users",
    fullDescription:
      "Boost your Facebook page credibility with genuine page likes from real, active users. Our service delivers authentic engagement to help grow your online presence.",
    prices: { SAR: 75, EGP: 500, USD: 20 },
    deliveryTime: "24-48 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    platform: "facebook",
    serviceType: "Likes",
  },
  {
    id: "fb-followers",
    title: "Facebook Followers",
    description: "Get real Facebook profile followers",
    fullDescription:
      "Grow your Facebook profile with authentic followers who are interested in your content. Perfect for building your personal brand.",
    prices: { SAR: 100, EGP: 650, USD: 27 },
    deliveryTime: "24-72 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    platform: "facebook",
    serviceType: "Followers",
  },
  {
    id: "fb-comments",
    title: "Facebook Comments",
    description: "Real comments on your Facebook posts",
    fullDescription:
      "Boost engagement on your posts with authentic comments from real users. Custom comments available upon request.",
    prices: { SAR: 150, EGP: 950, USD: 40 },
    deliveryTime: "12-24 hours",
    guarantee: "Quality guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&q=80",
    platform: "facebook",
    serviceType: "Comments",
  },
  // Instagram Services
  {
    id: "ig-likes",
    title: "Instagram Likes",
    description: "Get real Instagram likes on your posts",
    fullDescription:
      "Elevate your Instagram posts with authentic likes from real, active users. Improve your engagement rate and visibility.",
    prices: { SAR: 50, EGP: 350, USD: 13 },
    deliveryTime: "1-12 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    platform: "instagram",
    serviceType: "Likes",
  },
  {
    id: "ig-followers",
    title: "Instagram Followers",
    description: "Grow your Instagram with real followers",
    fullDescription:
      "Build your Instagram presence with high-quality followers from real accounts. Gradual delivery ensures account safety.",
    prices: { SAR: 85, EGP: 550, USD: 23 },
    deliveryTime: "24-48 hours",
    guarantee: "60-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    platform: "instagram",
    serviceType: "Followers",
  },
  {
    id: "ig-views",
    title: "Instagram Reels Views",
    description: "Boost your Reels with real views",
    fullDescription:
      "Increase your Instagram Reels visibility with genuine views from real users. Perfect for going viral.",
    prices: { SAR: 30, EGP: 200, USD: 8 },
    deliveryTime: "1-6 hours",
    guarantee: "Quality guarantee",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    platform: "instagram",
    serviceType: "Views",
  },
  // TikTok Services
  {
    id: "tt-followers",
    title: "TikTok Followers",
    description: "Get real TikTok followers fast",
    fullDescription:
      "Grow your TikTok presence with authentic followers who engage with your content. Perfect for creators and brands.",
    prices: { SAR: 90, EGP: 600, USD: 24 },
    deliveryTime: "24-48 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    platform: "tiktok",
    serviceType: "Followers",
  },
  {
    id: "tt-likes",
    title: "TikTok Likes",
    description: "Boost your TikTok videos with likes",
    fullDescription:
      "Increase engagement on your TikTok videos with real likes from active users. Help your content go viral.",
    prices: { SAR: 45, EGP: 300, USD: 12 },
    deliveryTime: "1-12 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    platform: "tiktok",
    serviceType: "Likes",
  },
  {
    id: "tt-views",
    title: "TikTok Views",
    description: "Get more views on your TikTok videos",
    fullDescription:
      "Boost your TikTok video views with real, high-retention views. Improve your chances of landing on the For You page.",
    prices: { SAR: 25, EGP: 170, USD: 7 },
    deliveryTime: "1-6 hours",
    guarantee: "Quality guarantee",
    image:
      "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=800&q=80",
    platform: "tiktok",
    serviceType: "Views",
  },
  // YouTube Services
  {
    id: "yt-subscribers",
    title: "YouTube Subscribers",
    description: "Grow your YouTube channel subscribers",
    fullDescription:
      "Build your YouTube channel with real subscribers who are interested in your content. Gradual delivery for natural growth.",
    prices: { SAR: 150, EGP: 1000, USD: 40 },
    deliveryTime: "48-72 hours",
    guarantee: "90-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    platform: "youtube",
    serviceType: "Subscribers",
  },
  {
    id: "yt-views",
    title: "YouTube Views",
    description: "Increase your video views",
    fullDescription:
      "Boost your YouTube video performance with real, high-retention views. Improve your video ranking and visibility.",
    prices: { SAR: 80, EGP: 520, USD: 21 },
    deliveryTime: "24-48 hours",
    guarantee: "90-day retention guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    platform: "youtube",
    serviceType: "Views",
  },
  {
    id: "yt-likes",
    title: "YouTube Likes",
    description: "Get real likes on your YouTube videos",
    fullDescription:
      "Increase engagement on your YouTube videos with authentic likes from real viewers.",
    prices: { SAR: 60, EGP: 400, USD: 16 },
    deliveryTime: "12-24 hours",
    guarantee: "60-day guarantee",
    image:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    platform: "youtube",
    serviceType: "Likes",
  },
  // Twitter Services
  {
    id: "tw-followers",
    title: "Twitter Followers",
    description: "Build your Twitter audience",
    fullDescription:
      "Grow your Twitter influence with high-quality followers interested in your content.",
    prices: { SAR: 70, EGP: 450, USD: 19 },
    deliveryTime: "24-48 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    platform: "twitter",
    serviceType: "Followers",
  },
  {
    id: "tw-likes",
    title: "Twitter Likes",
    description: "Get likes on your tweets",
    fullDescription:
      "Boost your tweet engagement with real likes from active Twitter users.",
    prices: { SAR: 40, EGP: 260, USD: 11 },
    deliveryTime: "1-12 hours",
    guarantee: "30-day guarantee",
    image:
      "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
    platform: "twitter",
    serviceType: "Likes",
  },
  // Snapchat Services
  {
    id: "sc-followers",
    title: "Snapchat Followers",
    description: "Grow your Snapchat following",
    fullDescription:
      "Increase your Snapchat presence with real followers who engage with your content.",
    prices: { SAR: 95, EGP: 620, USD: 25 },
    deliveryTime: "24-72 hours",
    guarantee: "30-day refill guarantee",
    image:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    platform: "snapchat",
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
    image:
      "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    platform: "snapchat",
    serviceType: "Views",
  },
];

const defaultPaymentSettings: PaymentSettings = {
  stcPayNumber: "0500000000",
  stcPayQr: "",
  stcPayActive: true,

  alRajhiAccount: "1234567890123456",
  alRajhiQr: "",
  alRajhiActive: true,

  vodafoneCash: "01000000000",
  vodafoneQr: "",
  vodafoneActive: true,

  instaPayAccount: "user@instapay",
  instaPayActive: true,
};

export const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultServices));
  }

  const platformsExist = localStorage.getItem(PLATFORMS_KEY);
  if (!platformsExist) {
    localStorage.setItem(PLATFORMS_KEY, JSON.stringify(defaultPlatforms));
  }

  const ordersExist = localStorage.getItem(ORDERS_KEY);
  if (!ordersExist) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }

  const paymentExists = localStorage.getItem(PAYMENT_SETTINGS_KEY);
  if (!paymentExists) {
    localStorage.setItem(
      PAYMENT_SETTINGS_KEY,
      JSON.stringify(defaultPaymentSettings)
    );
  }

  const adminExists = localStorage.getItem(ADMIN_KEY);
  if (!adminExists) {
    localStorage.setItem(
      ADMIN_KEY,
      JSON.stringify({ username: "admin", password: "admin123" })
    );
  }
  const packagesExist = localStorage.getItem(PACKAGES_KEY);
  if (!packagesExist) {
    // create sensible default packages for demo: 100, 500, 1000, 5000 for each service based on price/1000
    const services = getServices();
    const pkgs: PackageOption[] = [];
    services.forEach((s) => {
      const pricePerThousand = s.prices;
      let idx = 0;
      [100, 500, 1000, 5000].forEach((units) => {
        pkgs.push({
          id: `${s.id}-${units}`,
          serviceId: s.id,
          units,
          price: {
            SAR: (units / 1000) * pricePerThousand.SAR,
            EGP: (units / 1000) * pricePerThousand.EGP,
            USD: (units / 1000) * pricePerThousand.USD,
          },
          visible: true,
          orderIndex: idx++,
          label: "",
          description: "",
        });
      });
    });
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(pkgs));
  }

  const mostExist = localStorage.getItem(MOST_REQUESTED_KEY);
  if (!mostExist) {
    // default: first 6 services
    const services = getServices();
    const first6 = services
      .slice(0, 6)
      .map((s) => ({ serviceId: s.id, visible: true }));
    localStorage.setItem(MOST_REQUESTED_KEY, JSON.stringify(first6));
  }

  const analyticsExist = localStorage.getItem(ANALYTICS_KEY);
  if (!analyticsExist) {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify([]));
  }
};

// Platform functions
export const getPlatforms = (): Platform[] => {
  const raw = (window as any).__PLATFORMS__ as Platform[] | undefined;
  if (Array.isArray(raw) && raw.length) return raw;
  const data = (async () => {
    try {
      const rows = await apiGet("platforms");
      if (rows.length) return rows as Platform[];
      for (const p of defaultPlatforms) await apiPost("platforms", p);
      return defaultPlatforms;
    } catch {
      const ls = localStorage.getItem(PLATFORMS_KEY);
      return ls ? JSON.parse(ls) : defaultPlatforms;
    }
  })();
  (window as any).__PLATFORMS__ = undefined;
  throw new Error("getPlatforms must be awaited via async context");
};

export const getPlatformById = (id: string): Platform | undefined => {
  return undefined;
};

// Service functions
export const getServices = (): Service[] => {
  const raw = (async () => {
    try {
      const rows = await apiGet("services");
      if (rows.length) return rows as Service[];
      for (const s of defaultServices) await apiPost("services", s);
      return defaultServices;
    } catch {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : defaultServices;
    }
  })();
  throw new Error("getServices must be awaited via async context");
};

export const getServiceById = (id: string): Service | undefined => {
  return undefined;
};

export const getServicesByPlatform = (platformId: string): Service[] => {
  return [];
};

export const addService = (service: Omit<Service, "id">): Service => {
  const newService: Service = {
    ...service,
    id:
      (globalThis as any)?.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
  apiPost("services", newService);
  return newService;
};

export const updateService = (
  id: string,
  updates: Partial<Service>
): Service | null => {
  apiPut("services", { id, ...updates });
  return { id, title: "", description: "", fullDescription: "", prices: { SAR: 0, EGP: 0, USD: 0 }, deliveryTime: "", guarantee: "", image: "", platform: "", serviceType: "" };
};

// Package functions
export const getPackagesByService = (serviceId: string): PackageOption[] => {
  return [];
};

export const getAllPackages = (): PackageOption[] => {
  return [];
};

export const addPackage = (pkg: Omit<PackageOption, "id">): PackageOption => {
  const newPkg: PackageOption = {
    ...pkg,
    id: Date.now().toString(),
    orderIndex: typeof pkg.orderIndex === "number" ? pkg.orderIndex : 0,
  };
  apiPost("packages", newPkg);
  return newPkg;
};

export const updatePackage = (
  id: string,
  updates: Partial<PackageOption>
): PackageOption | null => {
  apiPut("packages", { id, ...updates });
  return { id, serviceId: "", units: 0, price: { SAR: 0, EGP: 0, USD: 0 }, visible: true };
};

export const deletePackage = (id: string): boolean => {
  apiDelete("packages", id);
  return true;
};

// Most Requested functions
export const getMostRequested = (): {
  serviceId: string;
  visible: boolean;
}[] => {
  return [];
};

export const setMostRequested = (
  list: { serviceId: string; visible: boolean }[]
) => {
  list.forEach((it) =>
    apiPost("most_requested", {
      id: it.serviceId,
      service_id: it.serviceId,
      visible: it.visible,
    })
  );
};

// Analytics
export const addAnalyticsEvent = (
  event: Omit<AnalyticsEvent, "id" | "timestamp">
) => {
  const ev: AnalyticsEvent = {
    id: Date.now().toString(),
    ...event,
    timestamp: new Date().toISOString(),
  } as AnalyticsEvent;
  apiPost("analytics", ev);
  return ev;
};

export const getAnalyticsEvents = (): AnalyticsEvent[] => {
  return [];
};

export const deleteService = (id: string): boolean => {
  apiDelete("services", id);
  return true;
};

// Order functions
export const getOrders = (): Order[] => {
  return [];
};

export const addOrder = (order: Omit<Order, "id" | "createdAt">): Order => {
  const newOrder: Order = {
    ...order,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  apiPost("orders", newOrder);
  return newOrder;
};

export const updateOrderStatus = (
  id: string,
  status: Order["status"]
): Order | null => {
  apiPut("orders", { id, status });
  return null;
};

// Payment settings
export const getPaymentSettings = (): PaymentSettings => {
  return {
    ...defaultPaymentSettings,
  };
};

export const updatePaymentSettings = (settings: PaymentSettings): void => {
  const payloads = [
    { method: "STC Pay", account_number: settings.stcPayNumber, qr_url: settings.stcPayQr || "", currency: "SAR" },
    { method: "Al Rajhi", account_number: settings.alRajhiAccount, qr_url: settings.alRajhiQr || "", currency: "SAR" },
    { method: "Vodafone Cash", account_number: settings.vodafoneCash, qr_url: settings.vodafoneQr || "", currency: "EGP" },
  ];
  payloads.forEach((p) => apiPost("payment_settings", p));
};

// Admin functions
export const checkAdminCredentials = (
  username: string,
  password: string
): boolean => {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    let creds: { username: string; password: string } | null = null;
    if (raw) {
      creds = JSON.parse(raw);
    } else {
      creds = { username: "admin", password: "admin123" };
      localStorage.setItem(ADMIN_KEY, JSON.stringify(creds));
      apiPost("admin_credentials", creds).catch(() => { });
    }
    return (
      !!creds &&
      username.trim() === creds.username &&
      password.trim() === creds.password
    );
  } catch {
    return username.trim() === "admin" && password.trim() === "admin123";
  }
};

// Currency detection based on user location
export type Currency = "SAR" | "EGP" | "USD";

export const detectUserCurrency = async (): Promise<Currency> => {
  try {
    const response = await fetch("https://ipwho.is/");
    const data = await response.json();
    const country = data.country_code;

    if (country === "EG") return "EGP";
    return "SAR";
  } catch {
    return "SAR";
  }
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case "SAR":
      return "SAR";
    case "EGP":
      return "EGP";
    case "USD":
      return "$";
    default:
      return "$";
  }
};
