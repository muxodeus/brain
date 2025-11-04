"use client";

import { useEffect, useState } from "react";
import TemplateFormModal from "@core/components/medidores/TemplateFormModal";

type Register = { address: number; label: string; type: string };
type Template = {
  id?: number;
  brand: string;
  model: string;
  templateId: string;
  registers: Register[];
};

export default function PlantillasPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    const res = await fetch("/api/meter-templates");
    const data = await res.json();
    setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (data: Template) => {
    const method = data.id ? "PUT" : "POST";
    await fetch("/api/meter-templates", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    setEditTemplate(null);
    fetchTemplates();
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await fetch("/api/meter-templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTemplates();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          🧩 Plantillas de modelos Modbus
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-teal-600 rounded hover:bg-teal-700"
        >
          ➕ Nueva plantilla
        </button>
      </header>

      {loading ? (
        <p className="text-white/50 animate-pulse">Cargando plantillas…</p>
      ) : templates.length === 0 ? (
        <p className="text-white/60">No hay plantillas registradas.</p>
      ) : (
        <table className="w-full border border-white/10 rounded-lg overflow-hidden text-sm">
          <thead className="bg-slate-800/60">
            <tr>
              <th className="p-2 text-left">Marca</th>
              <th className="p-2 text-left">Modelo</th>
              <th className="p-2 text-left">Template ID</th>
              <th className="p-2 text-left">Registros</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id ?? `${t.brand}-${t.model}-${t.templateId}`} className="border-t border-white/10">
                <td className="p-2">{t.brand}</td>
                <td className="p-2">{t.model}</td>
                <td className="p-2">{t.templateId}</td>
                <td className="p-2">{t.registers?.length ?? 0}</td>
                <td className="p-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditTemplate(t);
                      setShowModal(true);
                    }}
                    className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <TemplateFormModal
          initialData={editTemplate ?? undefined}
          onClose={() => {
            setShowModal(false);
            setEditTemplate(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}