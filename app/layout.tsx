import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WhatsApp Clone - Mesajlaşma Uygulaması",
  description: "Gmail ile giriş yaparak arkadaşlarınızla sohbet edin",
  keywords: ["chat", "messaging", "whatsapp", "firebase", "nextjs"],
  authors: [{ name: "WhatsApp Clone" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#00a884",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
