import "./globals.css";
import { ConfigProvider } from "@/context/ConfigContext";
import { MeterProvider } from "@/context/MeterContext";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "PQGenius",
  description: "Industrial analytics",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white">
        <ConfigProvider>
          <MeterProvider>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </MeterProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}