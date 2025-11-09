"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* Logo con efecto de latido */}
        <div className="mx-auto mb-6 w-28 h-28 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo PQGenius - cerebro AI"
            className="w-28 h-28 animate-pulse"
          />
        </div>

        {/* Nombre PQGenius con colores */}
        <h1 className="text-5xl font-extrabold mb-4">
          <span className="text-orange-500">PQ</span>
          <span className="text-cyan-400">Genius</span>
        </h1>

        <p className="text-lg text-slate-300">
          Power Quality as a Service – MultiVendor
        </p>
      </div>

      {/* Formulario de acceso */}
      <div className="bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Acceso a la plataforma</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Usuario</label>
            <input
              type="text"
              placeholder="Ingresa tu usuario"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Clave</label>
            <input
              type="password"
              placeholder="Ingresa tu clave"
              className="w-full px-3 py-2 rounded bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Ingresar
          </button>
          <p className="text-sm text-slate-400 text-center mt-2 hover:text-blue-400 cursor-pointer">
            Olvidé mi clave
          </p>
        </form>
      </div>

      {/* Beneficios rápidos */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl text-center">
        <div className="p-4 bg-slate-800 rounded-lg">
          <p className="text-2xl mb-2">⚡</p>
          <p className="text-slate-300">Monitoreo en tiempo real</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg">
          <p className="text-2xl mb-2">🌐</p>
          <p className="text-slate-300">MultiVendor, integración abierta</p>
        </div>
        <div className="p-4 bg-slate-800 rounded-lg">
          <p className="text-2xl mb-2">🔒</p>
          <p className="text-slate-300">Seguridad y confiabilidad en la nube</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-slate-500 text-sm text-center">
        <p>© 2025 PQGenius — Todos los derechos reservados</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-blue-400">Soporte</a>
          <a href="#" className="hover:text-blue-400">Documentación</a>
          <a href="#" className="hover:text-blue-400">Contacto</a>
        </div>
      </footer>
    </div>
  );
}