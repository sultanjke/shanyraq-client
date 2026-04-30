"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/lib/domain";

const languageLabels: Record<Locale, string> = {
  en: "English",
  ru: "Russian",
  kk: "Kazakh",
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 border-border bg-card px-3">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium uppercase">{locale}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((item) => {
          const target = pathname.match(/^\/(en|ru|kk)(\/|$)/)
            ? pathname.replace(/^\/(en|ru|kk)/, `/${item}`)
            : `/${item}${pathname}`;

          return (
            <DropdownMenuItem key={item} asChild className="cursor-pointer p-0">
              <Link href={target} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 px-2 py-1.5">
                <span className="truncate">{languageLabels[item]}</span>
                <span className="grid grid-cols-[2rem_1rem] items-center gap-2">
                  <span className="text-xs uppercase text-muted-foreground">{item}</span>
                  <span className="flex h-4 w-4 items-center justify-center">
                    {item === locale ? <Check className="h-4 w-4" /> : null}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
