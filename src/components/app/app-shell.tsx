"use client";

import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileArchive,
  Landmark,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/actions";
import { BrandLogo } from "@/components/app/brand-logo";
import { LanguageSwitcher } from "@/components/app/language-switcher";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Locale, SessionUser } from "@/lib/domain";
import { getDictionary, roleLabel } from "@/lib/i18n";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";

const nav = [
  { key: "dashboard", href: "dashboard", icon: BarChart3 },
  { key: "documents", href: "documents", icon: FileArchive },
  { key: "finance", href: "finance", icon: Landmark },
  { key: "approvals", href: "approvals", icon: ClipboardCheck },
  { key: "audit", href: "audit", icon: ShieldCheck },
  { key: "access", href: "access", icon: UserPlus, permission: "access:review", label: "Access" },
] as const;

function NavLinks({
  locale,
  labels,
  user,
  collapsed = false,
}: {
  locale: Locale;
  labels: ReturnType<typeof getDictionary>["nav"];
  user: SessionUser;
  collapsed?: boolean;
}) {
  return (
    <nav className="grid gap-1" aria-label="Main navigation">
      {nav.map((item) => {
        if ("permission" in item && !can(user.role, item.permission)) return null;
        const Icon = item.icon;
        const label = (labels as Record<string, string>)[item.key] ?? ("label" in item ? item.label : item.key);
        return (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            className={cn(
              "text-muted-foreground",
              collapsed ? "mx-auto h-10 w-10" : "justify-start gap-3 px-3",
            )}
            title={label}
          >
            <Link href={`/${locale}/${item.href}`}>
              <Icon className="h-4 w-4" />
              <span className={collapsed ? "sr-only" : ""}>{label}</span>
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  locale,
  user,
  dictionary,
  collapsed = false,
}: {
  locale: Locale;
  user: SessionUser;
  dictionary: ReturnType<typeof getDictionary>;
  collapsed?: boolean;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className={cn("grid gap-2 px-2", collapsed && "justify-items-center px-0 pt-2")}>
        <BrandLogo variant={collapsed ? "mark" : "full"} className={collapsed ? "w-14" : "w-36"} />
      </div>

      <Separator className="my-5" />
      <NavLinks locale={locale} labels={dictionary.nav} user={user} collapsed={collapsed} />

      <div
        className={cn(
          "mt-auto grid gap-4 rounded-md border border-border bg-card",
          collapsed ? "place-items-center p-2" : "p-4",
        )}
      >
        {collapsed ? (
          <>
            <Badge variant="secondary" className="h-8 w-8 justify-center rounded-md px-0 uppercase" title={user.name}>
              {user.name.slice(0, 1)}
            </Badge>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="outline" size="icon" title={dictionary.signOut}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">{dictionary.signOut}</span>
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant="secondary">{roleLabel(user.role, locale)}</Badge>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">{dictionary.roleCopy[user.role]}</p>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="outline" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                {dictionary.signOut}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function AppShell({
  locale,
  user,
  children,
}: {
  locale: Locale;
  user: SessionUser;
  children: React.ReactNode;
}) {
  const dictionary = getDictionary(locale);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("shanyraq-sidebar-collapsed");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    window.localStorage.setItem("shanyraq-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const mobileSidebar = <SidebarContent locale={locale} user={user} dictionary={dictionary} />;
  const ToggleIcon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden border-r border-border bg-card/60 transition-[width,padding] duration-200 lg:block",
          sidebarCollapsed ? "w-20 p-3" : "w-72 p-5",
        )}
      >
        <SidebarContent locale={locale} user={user} dictionary={dictionary} collapsed={sidebarCollapsed} />
      </aside>
      <div className={cn("transition-[padding] duration-200", sidebarCollapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="lg:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-5">
                {mobileSidebar}
              </SheetContent>
            </Sheet>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="hidden lg:inline-flex"
              onClick={() => setSidebarCollapsed((value) => !value)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ToggleIcon className="h-4 w-4" />
            </Button>
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Astana, Baiterek 24</p>
              <p className="text-xs text-muted-foreground">{dictionary.academicLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher locale={locale} />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
