"use client";

import { useState } from "react";

type Register = { address: number; label: string; type: string };

type TemplateForm = {
  id?: number;
  brand: string;
  model: string;
  templateId: string;
  registers: Register[];
};

export default function TemplateFormModal({
  initialData,
  onClose,
  onSave,
}: {
  initialData?: Partial<TemplateForm>;
  onClose: () => void;
  onSave: (data: TemplateForm) => void;
}) {
  const [form, setForm] = useState<TemplateForm>({
    id: initialData?.id,
    brand: initialData?.brand ?? "",
    model: initialData?.model ?? "",
    templateId: initialData?.templateId ?? "",
    registers: initialData?.registers ?? [],
  });

  const [newRegister, setNewRegister] = useState<Register>({
    address: 0,
    label: "",
    type: "float32",
  });

  const addRegister = () => {
    if (!newRegister.address || !newRegister.label.trim()) return;
    setForm((prev) => ({
      ...prev,
      registers: [...prev.registers, { ...newRegister, address: Number(newRegister.address) }],
    }));
    setNewRegister({ address: 0, label: "", type: "float32" });
  };

  const updateRegister = (idx: number, patch: Partial<Register>) => {
    setForm((prev) => ({
      ...prev,
      registers: prev.registers.map((r, i) =>
        i === idx
          ? {
              ...r,
              ...patch,
              address: patch.address !== undefined ? Number(patch.address) : r.address,
            }
          : r
      ),
    }));
  };

  const removeRegister = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      registers: prev.registers.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = () => {
    if (!form.brand.trim() || !form.model.trim() || !form.templateId.trim()) return;
    onSave({
      id: form.id,
      brand: form.brand.trim(),
      model: form.model.trim(),
      templateId: form.templateId.trim(),
      registers: form.registers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white rounded-lg shadow-lg w-full max-w-3xl p-6 space-y-4">
        <h2 className="text-xl font-bold">
          {form.id ? "Editar plantilla" : "Nueva plantilla"}
        </h2>

        {/* Marca / Modelo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/70">Marca</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="Schneider"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Modelo</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="PM8000"
            />
          </div>
        </div>

        {/* Template ID */}
        <div>
          <label className="text-sm text-white/70">Template ID</label>
          <input
            type="text"
            value={form.templateId}
            onChange={(e) => setForm({ ...form, templateId: e.target.value })}
            className="mt-1 p-2 rounded bg-slate-700 w-full"
            placeholder="schneider_pm8000_v1"
          />
          <p className="text-xs text-white/40 mt-1">
            Usa un ID único por versión para controlar cambios.
          </p>
        </div>

        {/* Registros */}
        <div>
          <h3 className="font-semibold mb-2">Registros Modbus</h3>
          {form.registers.length === 0 ? (
            <div className="text-white/60">Sin registros. Agrega los que necesites.</div>
          ) : (
            <table className="w-full text-sm border border-white/10">
              <thead>
                <tr className="bg-slate-700">
                  <th className="p-2 text-left w-32">Dirección</th>
                  <th className="p-2 text-left">Etiqueta</th>
                  <th className="p-2 text-left w-40">Tipo</th>
                  <th className="p-2 text-left w-20">Acción</th>
                </tr>
              </thead>
              <tbody>
                {form.registers.map((r, idx) => (
                  <tr key={`${r.address}-${idx}`} className="border-t border-white/10">
                    <td className="p-2">
                      <input
                        type="number"
                        value={r.address}
                        onChange={(e) => updateRegister(idx, { address: Number(e.target.value) })}
                        className="p-2 rounded bg-slate-700 w-full"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={r.label}
                        onChange={(e) => updateRegister(idx, { label: e.target.value })}
                        className="p-2 rounded bg-slate-700 w-full"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={r.type}
                        onChange={(e) => updateRegister(idx, { type: e.target.value })}
                        className="p-2 rounded bg-slate-700 w-full"
                      >
                        <option value="float32">Float32</option>
                        <option value="uint32">UInt32</option>
                        <option value="int16">Int16</option>
                        <option value="uint16">UInt16</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => removeRegister(idx)}
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
        </div>

        {/* Agregar registro */}
        <div className="grid grid-cols-4 gap-2">
          <input
            type="number"
            placeholder="Dirección"
            value={newRegister.address}
            onChange={(e) => setNewRegister({ ...newRegister, address: Number(e.target.value) })}
            className="p-2 rounded bg-slate-700"
          />
          <input
            type="text"
            placeholder="Etiqueta"
            value={newRegister.label}
            onChange={(e) => setNewRegister({ ...newRegister, label: e.target.value })}
            className="p-2 rounded bg-slate-700"
          />
          <select
            value={newRegister.type}
            onChange={(e) => setNewRegister({ ...newRegister, type: e.target.value })}
            className="p-2 rounded bg-slate-700"
          >
            <option value="float32">Float32</option>
            <option value="uint32">UInt32</option>
            <option value="int16">Int16</option>
            <option value="uint16">UInt16</option>
          </select>
          <button onClick={addRegister} className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700">
            ➕
          </button>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded hover:bg-slate-500">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-teal-600 rounded hover:bg-teal-700">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}