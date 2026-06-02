"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  Navbar,
  NavBody,
} from "@/components/ui/resizable-navbar";
import type { Locale } from "@/lib/domain";

interface SiteNavbarProps {
  locale: Locale;
  appName: string;
  navLabel: string;
  signInLabel: string;
  requestAccessLabel: string;
}

export function SiteNavbar({
  locale,
  appName,
  navLabel,
  signInLabel,
  requestAccessLabel,
}: SiteNavbarProps) {
  const [open, setOpen] = useState(false);

  const loginHref = `/${locale}/login`;
  const registerHref = `/${locale}/register`;

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody>
        <Link href={`/${locale}`} aria-label={appName} className="relative z-20 shrink-0">
          <BrandLogo className="w-20 m-2" />
        </Link>
        <nav aria-label={navLabel} className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href={loginHref}>{signInLabel}</Link>
          </Button>
          <Button asChild className="relative overflow-hidden">
            <Link href={registerHref}>
              <span className="relative z-10">{requestAccessLabel}</span>
              <BorderBeam
                className="before:hidden"
                lightColor="#2563eb"
                lightWidth={90}
                duration={5}
                borderWidth={1.5}
              />
            </Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher locale={locale} />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <Link href={`/${locale}`} aria-label={appName} className="shrink-0">
            <BrandLogo className="w-20 m-3" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} />
            <MobileNavToggle isOpen={open} onClick={() => setOpen((value) => !value)} />
          </div>
        </MobileNavHeader>
        <MobileNavMenu isOpen={open}>
          <Button asChild variant="ghost" className="w-full justify-center">
            <Link href={loginHref} onClick={() => setOpen(false)}>
              {signInLabel}
            </Link>
          </Button>
          <Button asChild className="w-full justify-center">
            <Link href={registerHref} onClick={() => setOpen(false)}>
              {requestAccessLabel}
            </Link>
          </Button>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
