import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type BackgroundColor =
  | "accent-background-strong"
  | "brand-background-weak"
  | "page-background"
  | "static-transparent"
  | string;

type GradientOptions = {
  display?: boolean;
  opacity?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  tilt?: number;
  colorStart?: BackgroundColor;
  colorEnd?: BackgroundColor;
};

type LinesOptions = {
  display?: boolean;
  opacity?: number;
  size?: number | string;
  thickness?: number;
  angle?: number;
  color?: BackgroundColor;
};

type DotsOptions = {
  display?: boolean;
  opacity?: number;
  size?: number | string;
  color?: BackgroundColor;
};

type BackgroundProps = {
  className?: string;
  position?: "absolute" | "relative";
  fill?: boolean;
  height?: number | string;
  gradient?: GradientOptions;
  lines?: LinesOptions;
  dots?: DotsOptions;
};

function resolveColor(color: BackgroundColor | undefined) {
  switch (color) {
    case "accent-background-strong":
      return "rgb(37 99 235 / 0.38)";
    case "brand-background-weak":
      return "rgb(37 99 235 / 0.16)";
    case "page-background":
      return "var(--background)";
    case "static-transparent":
      return "transparent";
    default:
      return color ?? "rgb(37 99 235 / 0.22)";
  }
}

function resolveSize(size: number | string | undefined, fallback: number) {
  const value = size ?? fallback;
  return typeof value === "number" || /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

function resolveHeight(height: number | string | undefined) {
  if (height === undefined) {
    return undefined;
  }

  if (typeof height === "number") {
    return `${height * 0.25}rem`;
  }

  return /^\d+(\.\d+)?$/.test(height) ? `${Number(height) * 0.25}rem` : height;
}

export function Background({ className, position = "relative", fill, height, gradient, lines, dots }: BackgroundProps) {
  const lineSize = resolveSize(lines?.size, 16);
  const dotSize = resolveSize(dots?.size, 6);
  const adjustedGradientX = gradient?.x != null ? 37.5 + (gradient.x / 100) * 25 : 50;
  const adjustedGradientY = gradient?.y != null ? 37.5 + (gradient.y / 100) * 25 : 50;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none inset-x-0 overflow-hidden",
        position === "absolute" ? "absolute" : "relative",
        fill && "w-full",
        className,
      )}
      style={{ height: resolveHeight(height) } as CSSProperties}
    >
      {gradient?.display && (
        <span
          className="absolute h-[400%] w-[400%] origin-center"
          style={
            {
              opacity: gradient.opacity ?? 1,
              left: "-150%",
              top: "-150%",
              transform: `rotate(${gradient.tilt ?? 0}deg)`,
              background: `radial-gradient(ellipse ${(gradient.width ?? 100) / 4}% ${(gradient.height ?? 100) / 4}% at ${adjustedGradientX}% ${adjustedGradientY}%, ${resolveColor(
                gradient.colorStart,
              )}, ${resolveColor(gradient.colorEnd)})`,
            } as CSSProperties
          }
        />
      )}
      {lines?.display && (
        <span
          className="absolute inset-0"
          style={
            {
              opacity: lines.opacity ?? 1,
              backgroundImage: `repeating-linear-gradient(${lines.angle ?? 90}deg, ${resolveColor(lines.color)} 0 ${lines.thickness ?? 1}px, transparent ${
                lines.thickness ?? 1
              }px ${lineSize})`,
            } as CSSProperties
          }
        />
      )}
      {dots?.display && (
        <span
          className="absolute inset-0"
          style={
            {
              opacity: dots.opacity ?? 1,
              backgroundImage: `radial-gradient(${resolveColor(dots.color)} 1px, transparent 1px)`,
              backgroundSize: `${dotSize} ${dotSize}`,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
