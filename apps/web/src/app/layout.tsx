import { Bricolage_Grotesque } from "next/font/google";

import "@/styles/globals.css";

import Script from "next/script";
import { metadata as meta } from "@/app/config";
import Loader from "@/app/loader";
import Providers from "@/app/providers";
import { createMetadata } from "@/lib/metadata";

import { Toaster } from "@repo/ui/sonner";
import { RouteProgress } from "@/components/system/route-progress";

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
        {process.env.NODE_ENV === "development" ? (
          <Script src="https://unpkg.com/react-scan/dist/auto.global.js" />
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
