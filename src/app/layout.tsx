import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConfigProvider } from "@/context/ConfigContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PQGenius Dashboard",
  description: "Plataforma de Monitoreo Energético",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* ✅ Toda la app envuelta en ConfigProvider */}
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}