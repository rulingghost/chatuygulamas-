import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chat App - Mesajlaşma",
  description: "Gerçek zamanlı sohbet uygulaması",
  themeColor: "#00a884",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#00a884" />
      </head>
      <body>{children}</body>
    </html>
  );
}
