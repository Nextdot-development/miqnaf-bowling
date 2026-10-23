import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brandAssets";

/** Product logo. Height is set by the caller; width follows the artwork. */
export function ProductLogo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  const { src, alt, width, height } = BRAND_ASSETS.productLogo;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      draggable={false}
      className={`w-auto select-none ${className}`}
    />
  );
}
