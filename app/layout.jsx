import "./globals.css";
import { Header } from "@/components/header";
import { I18nProvider } from "@/components/i18n-provider";
import Script from "next/script";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "NARARYA STUDIO | Digital Creative Studio",
  description: "Digital products, design services, animation, 3D and custom creative requests.",
  openGraph: {
    title: "NARARYA STUDIO",
    description: "Digital Creative Studio, Digital Product Store & Custom Request",
    type: "website"
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" dir="ltr">
      <body>
        <Script src="/js/nararya-bootstrap.js" strategy="beforeInteractive" />
        <Script src="/js/nararya-gateway.js" strategy="afterInteractive" />
        <I18nProvider>
          <Header />
          {children}
        </I18nProvider>
        <SiteFooter />
      </body>
    </html>
  );
}
