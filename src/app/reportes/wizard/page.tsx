"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportePDF from "@/components/ReportePDF"; // componente PDF que definimos antes

const steps = ["Portada", "Periodo", "Parámetros", "Estructura", "Normativa", "Final"];

export default function ReportWizard() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({
    logo: "",
    titulo: "Reporte de Energía",
    autor: "",
    fecha: new Date().toISOString().split("T")[0],
    inicio: "",
    fin: "",
    parametros: [],
    secciones: [],
    contacto: "",
  });

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="p-6 bg-slate-900 text-white min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">📑 Generador de Reportes PDF</h1>

      {/* Barra de pasos */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`px-3 py-1 rounded ${i === step ? "bg-blue-600" : "bg-slate-700"}`}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Paso actual */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl">Portada</h2>
          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="bg-slate-800 px-3 py-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Autor"
            value={formData.autor}
            onChange={(e) => setFormData({ ...formData, autor: e.target.value })}
            className="bg-slate-800 px-3 py-2 rounded w-full"
          />
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
            className="bg-slate-800 px-3 py-2 rounded"
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl">Periodo del reporte</h2>

          {/* Botones rápidos */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const hoy = new Date();
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 1);
                setFormData({
                  ...formData,
                  inicio: inicio.toISOString().split("T")[0],
                  fin: hoy.toISOString().split("T")[0],
                });
              }}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-blue-600"
            >
              1 día
            </button>
            <button
              onClick={() => {
                const hoy = new Date();
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 7);
                setFormData({
                  ...formData,
                  inicio: inicio.toISOString().split("T")[0],
                  fin: hoy.toISOString().split("T")[0],
                });
              }}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-blue-600"
            >
              7 días
            </button>
            <button
              onClick={() => {
                const hoy = new Date();
                const inicio = new Date(hoy);
                inicio.setDate(hoy.getDate() - 30);
                setFormData({
                  ...formData,
                  inicio: inicio.toISOString().split("T")[0],
                  fin: hoy.toISOString().split("T")[0],
                });
              }}
              className="px-4 py-2 bg-slate-700 rounded hover:bg-blue-600"
            >
              30 días
            </button>
          </div>

          {/* Rango personalizado */}
          <div className="flex gap-4 items-center">
            <div>
              <label className="text-sm text-slate-400">Inicio</label>
              <input
                type="date"
                value={formData.inicio || ""}
                onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                className="bg-slate-800 px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Fin</label>
              <input
                type="date"
                value={formData.fin || ""}
                onChange={(e) => setFormData({ ...formData, fin: e.target.value })}
                className="bg-slate-800 px-3 py-2 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl">Parámetros</h2>
          {["Voltaje", "Corriente", "Potencia Activa", "PF", "THD"].map((p) => (
            <label key={p} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.parametros.includes(p)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    parametros: checked
                      ? [...formData.parametros, p]
                      : formData.parametros.filter((x: string) => x !== p),
                  });
                }}
              />
              {p}
            </label>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl">Estructura del reporte</h2>
          {["Tendencias", "Histogramas", "Estadísticos", "Alarmas", "Comparativos"].map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.secciones.includes(s)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setFormData({
                    ...formData,
                    secciones: checked
                      ? [...formData.secciones, s]
                      : formData.secciones.filter((x: string) => x !== s),
                  });
                }}
              />
              {s}
            </label>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-xl">Normativa</h2>
          <p className="text-slate-400">
            Aquí se incluirán descripciones técnicas y normativas aplicables (ej. IEEE 519 para THD).
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <h2 className="text-xl">Página final</h2>
          <input
            type="text"
            placeholder="Datos de contacto"
            value={formData.contacto}
            onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
            className="bg-slate-800 px-3 py-2 rounded w-full"
          />

          {/* Exportar PDF */}
          <PDFDownloadLink
            document={<ReportePDF config={formData} />}
            fileName="reporte.pdf"
          >
            {({ loading }) =>
              loading ? (
                <button className="bg-slate-600 px-4 py-2 rounded">Generando PDF...</button>
              ) : (
                <button className="bg-green-600 px-4 py-2 rounded">Exportar PDF</button>
              )
            }
          </PDFDownloadLink>
        </div>
      )}

      {/* Navegación */}
      <div className="flex gap-4">
        {step > 0 && (
          <button onClick={prev} className="bg-slate-700 px-4 py-2 rounded">
            Atrás
          </button>
        )}
        {step < steps.length - 1 && (
          <button onClick={next} className="bg-blue-600 px-4 py-2 rounded">
            Siguiente
          </button>
        )}
      </div>
    </div>
  );
}