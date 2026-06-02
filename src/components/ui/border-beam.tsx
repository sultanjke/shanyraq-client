"use client"

import React, { CSSProperties, useEffect, useRef } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

interface BorderBeamProps {
  lightWidth?: number
  duration?: number
  lightColor?: string
  borderWidth?: number
  /** Px to grow (negative) or shrink the overlay. Use a negative value to ride the outer border box. */
  inset?: number
  className?: string
  [key: string]: unknown
}

export function BorderBeam({
  lightWidth = 200,
  duration = 10,
  lightColor = "#FAFAFA",
  borderWidth = 1,
  inset = 0,
  className,
  ...props
}: BorderBeamProps) {
  const pathRef = useRef<HTMLDivElement>(null)

  const updatePath = () => {
    if (pathRef.current) {
      const div = pathRef.current
      const w = div.offsetWidth
      const h = div.offsetHeight
      // Follow the element's actual rounded corners so the beam rides the outline.
      const radius = parseFloat(getComputedStyle(div).borderTopLeftRadius) || 0
      const r = Math.min(radius, w / 2, h / 2)
      const path =
        r > 0
          ? `path("M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z")`
          : `path("M 0 0 H ${w} V ${h} H 0 V 0")`
      div.style.setProperty("--path", path)
    }
  }

  useEffect(() => {
    updatePath()
    window.addEventListener("resize", updatePath)

    return () => {
      window.removeEventListener("resize", updatePath)
    }
  }, [])

  return (
    <div
      style={
        {
          "--duration": duration,
          "--border-width": `${borderWidth}px`,
          inset: `${inset}px`,
        } as CSSProperties
      }
      ref={pathRef}
      className={cn(
        `absolute z-0 rounded-[inherit]`,
        `after:absolute after:inset-[var(--border-width)] after:rounded-[inherit] after:content-['']`,
        "border-[length:var(--border-width)] ![mask-clip:padding-box,border-box]",
        "![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(red,red)]",
        `before:absolute before:inset-0 before:z-[-1] before:rounded-[inherit] before:border-[length:var(--border-width)] before:border-black/10 dark:before:border-white/10`,
        className
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 aspect-square bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)]"
        style={
          {
            "--light-color": lightColor,
            "--light-width": `${lightWidth}px`,
            width: "var(--light-width)",
            offsetPath: "var(--path)",
          } as CSSProperties
        }
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  )
}
