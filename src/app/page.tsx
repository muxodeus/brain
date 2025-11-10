"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Usuario o clave incorrectos");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      router.push("/overview");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Error de conexión con el servidor");
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
      {/* Logo + título */}
      <div className="text-center mb-12 animate-fadeIn">
        <img
          src="/logo.png"
          alt="PQGenius Logo"
          className="h-20 w-auto mx-auto mb-4 animate-slideUp"
        />
        <h1 className="text-5xl font-extrabold mb-2 animate-pulse">
          <span className="text-orange-500">PQ</span>
          <span className="text-cyan-400">Genius</span>
        </h1>
        <p className="text-lg text-slate-300 animate-fadeIn delay-200">
          Power Quality as a Service – MultiVendor
        </p>
      </div>

      {/* Formulario de login */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md animate-fadeIn delay-300">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Acceso a la plataforma
        </h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Usuario</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Clave</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu clave"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Ingresar
          </button>
          {error && (
            <p className="text-red-400 text-sm text-center mt-2">{error}</p>
          )}
        </form>
      </div>

      {/* Ventajas del sistema */}
      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4">
        <div className="bg-slate-800 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">MultiVendor</h3>
          <p className="text-gray-300 text-sm">
            Integración con múltiples fabricantes y equipos, sin depender de un solo proveedor.
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-orange-400 mb-2">Escalable</h3>
          <p className="text-gray-300 text-sm">
            Crece contigo: desde un sitio único hasta una red industrial completa.
          </p>
        </div>
        <div className="bg-slate-800 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-green-400 mb-2">Analítica Avanzada</h3>
          <p className="text-gray-300 text-sm">
            Dashboards dinámicos, alarmas inteligentes y reportes configurables en tiempo real.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-gray-500 text-sm animate-fadeIn delay-500">
        © {new Date().getFullYear()} PQGenius · Todos los derechos reservados
      </footer>
    </div>
  );
}