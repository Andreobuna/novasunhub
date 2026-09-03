import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RouteProgressBar } from "@/components/layout/route-progress-bar";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NovaSunHub — Premium Solar Energy Systems",
    template: "%s | NovaSunHub",
  },
  description:
    "Shop premium solar panels, hybrid inverters, lithium batteries and complete solar kits. Engineered energy independence, delivered and supported across Nigeria.",
  openGraph: {
    title: "NovaSunHub — Premium Solar Energy Systems",
    description:
      "Shop premium solar panels, hybrid inverters, lithium batteries and complete solar kits.",
    siteName: "NovaSunHub",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

const noFlashScript = `
try {
  var stored = localStorage.getItem('nsh-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  if (theme === 'dark') document.documentElement.classList.add('dark');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevents a light-mode flash before hydration determines the stored theme. */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <RouteProgressBar />
          </Suspense>
          <Navbar />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgb(var(--surface))",
              color: "rgb(var(--text))",
              border: "1px solid rgb(var(--border))",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
