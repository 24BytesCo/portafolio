import { Bricolage_Grotesque } from "next/font/google";

import "@/styles/globals.css";

import Script from "next/script";
import { metadata as meta } from "@/app/config";
import Loader from "@/app/loader";
import Providers from "@/app/providers";
import { RouteProgress } from "@/components/system/route-progress";
import { env } from "@/env";
import { createMetadata } from "@/lib/metadata";

import { Toaster } from "@repo/ui/sonner";

// https://iamsteve.me/blog/the-best-ink-trap-typefaces-for-websites
const bricolage_grotesque = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata = createMetadata({
  title: {
    absolute: meta.site.title,
    template: `%s | ${meta.site.title}`,
  },
  description: meta.site.description,
  twitter: {
    title: meta.site.title,
    description: meta.site.description,
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {env.NODE_ENV === "development" ? (
          <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        ) : null}
        {env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible" &&
        env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? (
          <Script
            src="https://plausible.io/js/script.js"
            data-domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            strategy="afterInteractive"
          />
        ) : null}
        {env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "cloudflare" &&
        env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN ? (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={`{"token":"${env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN}"}`}
          />
        ) : null}
        {env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "umami" &&
        env.NEXT_PUBLIC_UMAMI_SRC &&
        env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          <Script
            src={env.NEXT_PUBLIC_UMAMI_SRC}
            strategy="afterInteractive"
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        ) : null}
      </head>
      <body className={`${bricolage_grotesque.className} antialiased`}>
        <Providers>
          <RouteProgress />
          <Loader />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
