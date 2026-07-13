import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MotionFx from "@/components/MotionFx";
import BottomTabs from "@/components/BottomTabs";
import AuthModal from "@/components/AuthModal";
import ProfileSync from "@/components/ProfileSync";

export const metadata: Metadata = {
  title: "VetPath — A clear gameplan for life after service",
  description:
    "VetPath turns a veteran's goals, life stage, and status into a personalized 30/60/90-day gameplan. A planning and education tool — not the VA. Sample data only.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "VetPath" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16324D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Registers the offline/app-shell service worker on real hosts (and localhost for testing).
const SW_REGISTER = `
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="professional">
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/tabler-icons/3.34.0/tabler-icons.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <StoreProvider>
            <MotionFx />
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <BottomTabs />
            <ProfileSync />
            <AuthModal />
          </StoreProvider>
        </AuthProvider>
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTER }} />
      </body>
    </html>
  );
}
