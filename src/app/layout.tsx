import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { fetchBusinessConfig } from "@/lib/fetch-functions/business";
import { getBaseUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchBusinessConfig().catch(() => null);
  const baseUrl = getBaseUrl() ?? "https://passao.com.co";
  const siteName = config?.name ?? "Passao";
  const description = config?.slogan ?? "Las mejores arepas, perros, patacones y más de Montería";
  const ogImage = config?.logoUrl ?? "/images/logo.png";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${siteName} - Comida Rápida en ${config?.city ?? "Montería"}`,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      `comida rápida ${config?.city ?? "Montería"}`,
      `arepas ${config?.city ?? "Montería"}`,
      `domicilios ${config?.city ?? "Montería"}`,
      "perros calientes",
      "patacones",
      siteName,
    ],
    icons: { icon: config?.logoUrl || "/images/logo.png" },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName,
      title: `${siteName} - Comida Rápida en ${config?.city ?? "Montería"}`,
      description,
      images: [{ url: ogImage, width: 800, height: 600, alt: `Logo ${siteName}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Comida Rápida`,
      description,
      images: [ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
