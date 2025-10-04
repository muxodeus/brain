import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export const metadata = {
  title: "PQGenius",
  description: "Platforma de Análisis Energético",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}