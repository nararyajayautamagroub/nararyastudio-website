import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { I18nProvider } from "@/components/i18n-provider";

export const metadata: Metadata = {
  title: "NARARYA STUDIO | Digital Creative Studio",
  description: "Digital products, design services, animation, 3D and custom creative requests.",
  openGraph: {
    title: "NARARYA STUDIO",
    description: "Digital Creative Studio, Digital Product Store & Custom Request",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" dir="ltr">
      <body>
        <script src="/js/nararya-gateway.js" defer></script>
        <I18nProvider>
          <Header />
          {children}
        </I18nProvider>
        <footer className="border-t border-violet-100 mt-20">
          <div className="container-ns py-10 flex flex-col md:flex-row gap-4 justify-between text-sm text-neutral-500">
            <span>© 2026 NARARYA STUDIO. All rights reserved.</span>
            <span>Digital Creative Studio · Indonesia</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
