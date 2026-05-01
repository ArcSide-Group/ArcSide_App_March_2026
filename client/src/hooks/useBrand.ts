import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BRANDS, DEFAULT_BRAND_ID, applyBrandToDocument, type Brand, type BrandId } from "@/lib/brandingConfig";

interface BrandingResponse {
  brandId: BrandId;
}

export function useBrand(options: { poll?: boolean } = {}): { brand: Brand; brandId: BrandId; isLoading: boolean } {
  const { poll = false } = options;
  const { data, isLoading } = useQuery<BrandingResponse>({
    queryKey: ["/api/branding"],
    refetchInterval: poll ? 3000 : false,
    refetchOnWindowFocus: poll,
    staleTime: poll ? 0 : Infinity,
  });

  const brandId: BrandId = (data?.brandId && BRANDS[data.brandId]) ? data.brandId : DEFAULT_BRAND_ID;
  const brand = BRANDS[brandId];

  useEffect(() => {
    applyBrandToDocument(brand);
  }, [brand]);

  return { brand, brandId, isLoading };
}
