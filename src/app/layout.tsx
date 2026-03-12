import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { fetchBusinessConfig } from "@/lib/fetch-functions/business";

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://passao.com.co";
  const siteName = config?.name ?? "Passao";
  const city = config?.city ?? "Montería";
  const slogan = config?.slogan ?? "Las mejores arepas, perros y patacones";

  // OG title: 50-60 chars — "Passao Fast Food - Arepas y Más en Montería" = ~44
  const ogTitle = `${siteName} Fast Food - Arepas, Perros y Patacones en ${city}`;

  // OG description: 110-160 chars — enrich short slogans with keyword context
  const ogDescription =
    slogan.length >= 110
      ? slogan
      : `${slogan}. Pedidos a domicilio y para recoger en nuestro local de ${city}. ¡Ordena ahora y recibe en minutos!`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: ogTitle,
      template: `%s | ${siteName}`,
    },
    description: ogDescription,
    keywords: [
      `comida rápida ${city}`,
      `arepas ${city}`,
      `domicilios ${city}`,
      "perros calientes",
      "patacones",
      siteName,
    ],
    icons: { icon: config?.logoUrl || "/images/logo.png" },
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName,
      title: ogTitle,
      description: ogDescription,
      // opengraph-image.tsx is picked up automatically by Next.js
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
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
