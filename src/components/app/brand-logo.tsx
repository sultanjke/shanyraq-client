import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className = "",
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  if (variant === "mark") {
    return (
      <>
        <Image
          src="/logo/shanyraq-black.svg"
          alt="Shanyraq"
          width={205}
          height={117}
          priority
          className={cn("h-auto w-14 object-contain dark:hidden", className)}
        />
        <Image
          src="/logo/shanyraq-white.svg"
          alt="Shanyraq"
          width={229}
          height={117}
          priority
          className={cn("hidden h-auto w-14 object-contain dark:block", className)}
        />
      </>
    );
  }

  return (
    <>
      <Image
        src="/logo/shanyraq-black.svg"
        alt="Shanyraq"
        width={229}
        height={117}
        priority
        className={cn("h-auto w-40 object-contain dark:hidden", className)}
      />
      <Image
        src="/logo/shanyraq-white.svg"
        alt="Shanyraq"
        width={364}
        height={116}
        priority
        className={cn("hidden h-auto w-40 object-contain dark:block", className)}
      />
    </>
  );
}
