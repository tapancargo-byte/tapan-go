import { Inter, Merriweather, JetBrains_Mono, Roboto_Mono, Space_Grotesk, Golos_Text } from "next/font/google";
import "./globals.css";
// FullCalendar CSS is optional; remove if package paths are unavailable
// import "@fullcalendar/core/index.css";
// import "@fullcalendar/daygrid/main.css";
import { Metadata } from "next";
import { V0Provider } from "@/lib/v0-context";
import localFont from "next/font/local";
import type { Notification as DashboardNotification, WidgetData } from "@/types/dashboard";
import { ThemeProvider } from "@/components/theme-provider";
import { RootShell } from "@/components/layout/root-shell";
import TopLoader from "@/components/top-loader";
import { Toaster } from "@/components/ui/toaster";
import { LocationProvider } from "@/lib/location-context";
import { CommandPaletteProvider } from "@/components/kbar";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--display-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const golosText = Golos_Text({
  variable: "--text-family",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rebelGrotesk = localFont({
  src: "../public/fonts/Rebels-Fett.woff2",
  variable: "--font-rebels",
  display: "swap",
});

const isV0 = process.env["VERCEL_URL"]?.includes("vusercontent.net") ?? false;

const defaultWidgetData: WidgetData = {
  location: "New Delhi, India",
  timezone: "Asia/Kolkata",
  temperature: "30°C / Clear",
  weather: "Clear skies",
  date: new Date().toISOString(),
};

const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    template: "%s – Tapan Associate",
    default: "Tapan Associate",
  },
  description:
    "Logistics and cargo management platform for seamless nationwide transportation.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Don't block on notifications - load them client-side in RootShell
  const notifications: DashboardNotification[] = [];

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${golosText.variable}`}
    >
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/icons/css/all.min.css" />
        {/* FullCalendar CSS via CDN for calendar styling */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/main.min.css" />
      </head>
      <body
        className={`${rebelGrotesk.variable} ${robotoMono.variable} ${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LocationProvider>
            <V0Provider isV0={isV0}>
              <CommandPaletteProvider>
                <TopLoader />
                <RootShell
                  notifications={notifications}
                  defaultWidgetData={defaultWidgetData}
                >
                  {children}
                </RootShell>
                <Toaster />
              </CommandPaletteProvider>
            </V0Provider>
          </LocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
