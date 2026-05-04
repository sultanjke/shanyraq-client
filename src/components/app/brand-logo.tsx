import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  const baseClassName = variant === "mark" ? "w-14" : "w-40";

  if (variant === "mark") {
    return (
      <span className={cn("relative inline-grid items-center", baseClassName, className)}>
        <Image
          src="/logo/shanyraq-black.svg"
          alt="Shanyraq"
          width={205}
          height={117}
          priority
          className="col-start-1 row-start-1 h-auto w-full object-contain opacity-100 transition-opacity duration-200 dark:opacity-0"
        />
        <Image
          src="/logo/shanyraq-white.svg"
          alt="Shanyraq"
          width={229}
          height={117}
          priority
          className="col-start-1 row-start-1 h-auto w-full object-contain opacity-0 transition-opacity duration-200 dark:opacity-100"
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-grid items-center", baseClassName, className)}>
      <Image
        src="/logo/shanyraq-black.svg"
        alt="Shanyraq"
        width={229}
        height={117}
        priority
        className="col-start-1 row-start-1 h-auto w-full object-contain opacity-100 transition-opacity duration-200 dark:opacity-0"
      />
      <Image
        src="/logo/shanyraq-white.svg"
        alt="Shanyraq"
        width={364}
        height={116}
        priority
        className="col-start-1 row-start-1 h-auto w-full object-contain opacity-0 transition-opacity duration-200 dark:opacity-100"
      />
    </span>
  );
}
