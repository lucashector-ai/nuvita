import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Nuvita — Diagnóstico de Peptídeos",
  description:
    "Diagnóstico personalizado de peptídeos, plataforma de acompanhamento e IA. Para quem quer resultado com método.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>{children}</body>
    </html>
  );
}
