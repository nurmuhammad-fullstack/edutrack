import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EduTrack",
  description: "Sport trenerlar uchun o'quvchilarni boshqarish tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uz" className={`${sans.variable} h-full antialiased`}>
      {/* Telegram Mini App SDK — must load before hydration so the Mini App
          can call ready()/expand() and read the student's Telegram user. */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
