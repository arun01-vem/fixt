import Image from "next/image";

type SiteLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function SiteLogo({ size = 28, className = "", priority = false }: SiteLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="FIXT"
        width={size}
        height={size}
        className="h-full w-full rounded-full object-cover"
        priority={priority}
      />
    </span>
  );
}
