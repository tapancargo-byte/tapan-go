import { Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { V0Provider } from "@/lib/v0-context";
import localFont from "next/font/local";
import type { Notification as DashboardNotification, WidgetData } from "@/types/dashboard";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ThemeProvider } from "@/components/theme-provider";
import { RootShell } from "@/components/layout/root-shell";
import { Toaster } from "@/components/ui/toaster";

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
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

async function loadNotifications(): Promise<DashboardNotification[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("id, title, message, type, priority, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      return [];
    }

    const validTypes = new Set(["info", "warning", "success", "error"]);
    const validPriorities = new Set(["low", "medium", "high"]);

    return (data as any[]).map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      message: String(row.message ?? ""),
      timestamp:
        typeof row.created_at === "string"
          ? row.created_at
          : new Date().toISOString(),
      type: (validTypes.has(row.type)
        ? row.type
        : "info") as DashboardNotification["type"],
      priority: (validPriorities.has(row.priority)
        ? row.priority
        : "medium") as DashboardNotification["priority"],
      read: Boolean(row.is_read),
    }));
  } catch {
    return [];
  }
}
 
const appBaseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(appBaseUrl),
  title: {
    template: "%s – Tapan Go",
    default: "Tapan Go",
  },
  description:
    "Logistics and cargo management platform for seamless nationwide transportation.",
  generator: "v0.app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const notifications = await loadNotifications();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/Rebels-Fett.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${rebelGrotesk.variable} ${robotoMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <V0Provider isV0={isV0}>
            <RootShell
              notifications={notifications}
              defaultWidgetData={defaultWidgetData}
            >
              {children}
            </RootShell>
            <Toaster />
          </V0Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
