import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shanyraq",
  description:
    "A role-based apartment construction and management transparency MVP for Kazakhstan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <Script id="theme-init" strategy="beforeInteractive">
        {`
          try {
            const saved = localStorage.getItem('shanyraq-theme');
            const theme = saved === 'light' ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark', theme === 'dark');
          } catch (_) {
            document.documentElement.classList.add('dark');
          }
        `}
      </Script>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
