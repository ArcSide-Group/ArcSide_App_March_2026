import arcsideLogo from "@assets/ICON_-_Mobile_App_1778667338095.png";

export type BrandId = "arcside" | "afrox";

export interface Brand {
  id: BrandId;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  slogan?: string;
  version?: string;
  description?: string;
}

export const BRANDS: Record<BrandId, Brand> = {
  arcside: {
    id: "arcside",
    name: "ArcSide",
    logo: arcsideLogo,
    // Metallic Electric Blue (cyan highlight) over deep navy chrome — matches
    // the ICON - Mobile App.png brand mark.
    primaryColor: "#5DBBFF",
    secondaryColor: "#0B1B3A",
    slogan: "Made by Tradesmen for Tradesmen",
    version: "v1.0.0",
    description:
      "Built by Tradesmen, For Tradesmen.\nAI-powered welding & fabrication assistant.",
  },
  afrox: {
    id: "afrox",
    name: "Afrox",
    logo: "/afrox-logo.png",
    primaryColor: "#e31e24",
    secondaryColor: "#0a0a0a",
    slogan: "",
    version: "Afrox Edition v1.0",
    description:
      "Afrox Welding Companion.\nIndustrial welding & gas expertise for South African fabricators.",
  },
};

export const DEFAULT_BRAND_ID: BrandId = "arcside";

export const currentBrand: Brand = BRANDS[DEFAULT_BRAND_ID];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(
    cleaned.length === 3
      ? cleaned.split("").map((c) => c + c).join("")
      : cleaned,
    16,
  );
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function setOrCreateLink(rel: string, href: string, type?: string) {
  if (typeof document === "undefined") return;
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement("link");
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
  if (type) link.type = type;
}

function inferIconType(href: string): string | undefined {
  const lower = href.split("?")[0].toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".ico")) return "image/x-icon";
  return undefined;
}

export function applyBrandToDocument(brand: Brand) {
  if (typeof document === "undefined") return;
  const { h, s, l } = hexToHsl(brand.primaryColor);
  const hsl = `${h} ${s}% ${l}%`;
  const root = document.documentElement;
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--accent", hsl);
  root.style.setProperty("--ring", hsl);
  root.style.setProperty("--sidebar-primary", hsl);
  root.style.setProperty("--sidebar-accent", hsl);
  root.style.setProperty("--sidebar-ring", hsl);
  root.style.setProperty("--chart-1", hsl);
  root.style.setProperty("--brand-primary", brand.primaryColor);
  root.style.setProperty("--brand-secondary", brand.secondaryColor);
  document.title = brand.name;

  if (brand.logo) {
    const iconType = inferIconType(brand.logo);
    setOrCreateLink("icon", brand.logo, iconType);
    setOrCreateLink("apple-touch-icon", brand.logo);
  }
}
