import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import RevealRoot from "@/components/layout/RevealRoot";
import { siteConfig } from "@/config/site";
import { buildMetadata, dealerJsonLd, websiteJsonLd } from "@/lib/seo";

const sora = Sora({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata({
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    path: "/",
  }),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  themeColor: "#0C0F11",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <Header />
        <RevealRoot>
          <main id="conteudo">{children}</main>
        </RevealRoot>
        <Footer />
        <WhatsAppFloat />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
      </body>
    </html>
  );
}
