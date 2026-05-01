import arcsideLogo from "@assets/image_1773535782481(2)_1774714538260.jpg";

export type BrandId = "arcside" | "afrox";

export interface Brand {
  id: BrandId;
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export const BRANDS: Record<BrandId, Brand> = {
  arcside: {
    id: "arcside",
    name: "ArcSide",
    logo: arcsideLogo,
    primaryColor: "#007bff",
    secondaryColor: "#0a0a0a",
  },
  afrox: {
    id: "afrox",
    name: "Afrox Powered by ArcSide",
    primaryColor: "#e31e24",
    secondaryColor: "#0a0a0a",
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
}
