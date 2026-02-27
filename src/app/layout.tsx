import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Проектное Бюро - Система управления проектами",
  description: "Современная система управления проектами для проектных организаций. Управление разделами, изысканиями, экспертизой.",
  keywords: ["Проектное бюро", "Управление проектами", "ГИП", "Проектирование"],
  authors: [{ name: "Project Bureau Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
