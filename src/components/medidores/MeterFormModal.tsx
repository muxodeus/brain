"use client";

import { useEffect, useMemo, useState } from "react";

type Register = {
  address: number;
  label: string;
  type: "float32" | "uint32" | "int16" | "uint16";
};

type MeterForm = {
  id?: number;
  name: string;
  ip: string;
  port: number;
  slave_id: number | string;
  gateway_out: string;
  brand: string;
  model: string;
  mapping_template: string;
  registers: Register[];
};

type MeterFormModalProps = {
  initialData?: Partial<MeterForm>;
  onClose: () => void;
  onSave: (data: MeterForm) => void;
};

export default function MeterFormModal({ initialData, onClose, onSave }: MeterFormModalProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState<boolean>(true);
  const [form, setForm] = useState<MeterForm>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    ip: initialData?.ip ?? "",
    port: Number(initialData?.port ?? 502),
    slave_id: initialData?.slave_id ?? "",
    gateway_out: initialData?.gateway_out ?? "",
    brand: initialData?.brand ?? "",
    model: initialData?.model ?? "",
    mapping_template: initialData?.mapping_template ?? "",
    registers: (initialData?.registers as Register[]) ?? [],
  });

  const [customRegister, setCustomRegister] = useState<Register>({
    address: Number(""),
    label: "",
    type: "float32",
  });

  // Fetch templates from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTemplates(true);
        const res = await fetch("/api/meter-templates");
        const data = await res.json();
        setTemplates(data);
      } catch (e) {
        setTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  // Derived lists for brand/model pickers
  const brands = useMemo(() => {
    const set = new Set<string>();
    templates.forEach((t: any) => set.add(t.brand));
    return Array.from(set);
  }, [templates]);

  const modelsForBrand = useMemo(() => {
    return templates.filter((t: any) => t.brand === form.brand).map((t: any) => t.model);
  }, [templates, form.brand]);

  // When brand/model changes, apply template or clear
  const handleTemplateSelect = (brand: string, model: string) => {
    const template = templates.find((t: any) => t.brand === brand && t.model === model);
    if (template) {
      setForm((prev) => ({
        ...prev,
        brand,
        model,
        mapping_template: template.templateId ?? `${brand}_${model}`.toLowerCase(),
        registers: Array.isArray(template.registers) ? template.registers : [],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        brand,
        model,
        mapping_template: "",
        registers: [],
      }));
    }
  };

  // Add manual register
  const addCustomRegister = () => {
    if (!customRegister.address || !customRegister.label) return;
    setForm((prev) => ({
      ...prev,
      registers: [
        ...prev.registers,
        {
          address: Number(customRegister.address),
          label: customRegister.label.trim(),
          type: customRegister.type,
        },
      ],
    }));
    setCustomRegister({ address: Number(""), label: "", type: "float32" });
  };

  // Remove register
  const removeRegister = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      registers: prev.registers.filter((_, i) => i !== idx),
    }));
  };

  // Update register inline
  const updateRegister = (idx: number, patch: Partial<Register>) => {
    setForm((prev) => ({
      ...prev,
      registers: prev.registers.map((r, i) =>
        i === idx ? { ...r, ...patch, address: patch.address !== undefined ? Number(patch.address) : r.address } : r
      ),
    }));
  };

  const handleSubmit = () => {
    const payload: MeterForm = {
      id: form.id,
      name: form.name.trim(),
      ip: form.ip.trim(),
      port: Number(form.port),
      slave_id: Number(form.slave_id),
      gateway_out: form.gateway_out.trim(),
      brand: form.brand,
      model: form.model,
      mapping_template: form.mapping_template,
      registers: form.registers,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 text-white rounded-lg shadow-lg w-full max-w-4xl p-6 space-y-5">
        <h2 className="text-xl font-bold border-b border-white/10 pb-3">
          {form.id ? "Editar medidor" : "Nuevo medidor"}
        </h2>

        {/* Basics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-white/70">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="Ej. Medidor Planta Sur"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Gateway</label>
            <input
              type="text"
              value={form.gateway_out}
              onChange={(e) => setForm({ ...form, gateway_out: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="Ej. GW-01"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Slave ID</label>
            <input
              type="number"
              value={form.slave_id}
              onChange={(e) => setForm({ ...form, slave_id: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="Ej. 1"
            />
          </div>
        </div>

        {/* Network */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-white/70">IP</label>
            <input
              type="text"
              value={form.ip}
              onChange={(e) => setForm({ ...form, ip: e.target.value })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="192.168.1.50"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Puerto</label>
            <input
              type="number"
              value={form.port}
              onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              placeholder="502"
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-white/50">
              Usa Modbus TCP. Asegura firewall y NAT si el gateway está remoto.
            </div>
          </div>
        </div>

        {/* Brand / Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/70">Marca</label>
            <select
              value={form.brand}
              onChange={(e) => {
                const brand = e.target.value;
                handleTemplateSelect(brand, "");
              }}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              disabled={loadingTemplates}
            >
              <option value="">{loadingTemplates ? "Cargando…" : "Selecciona marca"}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-white/70">Modelo</label>
            <select
              value={form.model}
              onChange={(e) => handleTemplateSelect(form.brand, e.target.value)}
              className="mt-1 p-2 rounded bg-slate-700 w-full"
              disabled={!form.brand || loadingTemplates}
            >
              <option value="">{!form.brand ? "Selecciona marca primero" : "Selecciona modelo"}</option>
              {modelsForBrand.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Template id */}
        <div>
          <label className="text-sm text-white/70">Plantilla / Template ID</label>
          <input
            type="text"
            value={form.mapping_template}
            onChange={(e) => setForm({ ...form, mapping_template: e.target.value })}
            className="mt-1 p-2 rounded bg-slate-700 w-full"
            placeholder="schneider_pm8000_v1"
          />
          <p className="text-xs text-white/40 mt-1">
            Si usas modelo personalizado, define un ID único para versionar tu mapa.
          </p>
        </div>

        {/* Registers preview + inline editing */}
        <div>
          <h3 className="font-semibold mb-2">Mapa de registros Modbus</h3>
          {form.registers.length === 0 ? (
            <div className="text-white/60">Sin registros. Selecciona una plantilla o agrega manualmente.</div>
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
                        onChange={(e) => updateRegister(idx, { type: e.target.value as Register["type"] })}
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

        {/* Add manual register */}
        <div>
          <h4 className="font-semibold mb-2">Agregar registro manual</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <input
              type="number"
              placeholder="Dirección"
              value={Number.isNaN(customRegister.address) ? "" : customRegister.address}
              onChange={(e) => setCustomRegister({ ...customRegister, address: Number(e.target.value) })}
              className="p-2 rounded bg-slate-700"
            />
            <input
              type="text"
              placeholder="Etiqueta"
              value={customRegister.label}
              onChange={(e) => setCustomRegister({ ...customRegister, label: e.target.value })}
              className="p-2 rounded bg-slate-700"
            />
            <select
              value={customRegister.type}
              onChange={(e) => setCustomRegister({ ...customRegister, type: e.target.value as Register["type"] })}
              className="p-2 rounded bg-slate-700"
            >
              <option value="float32">Float32</option>
              <option value="uint32">UInt32</option>
              <option value="int16">Int16</option>
              <option value="uint16">UInt16</option>
            </select>
            <button
              onClick={addCustomRegister}
              className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        {/* Actions */}
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