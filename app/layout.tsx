import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat App - Mesajlaşma",
  description: "Gerçek zamanlı sohbet uygulaması",
  manifest: "/manifest.json",
  themeColor: "#00a884",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Chat App",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
