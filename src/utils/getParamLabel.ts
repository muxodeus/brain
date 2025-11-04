import { paramAliases } from "@/config/paramAliases";

/**
 * Devuelve el alias legible, la unidad y un color sugerido para un parámetro.
 * Si no existe en paramAliases, genera un fallback automático.
 */
export function getParamLabel(
  field: string
): { label: string; unit: string; color: string } {
  if (paramAliases[field]) {
    return {
      ...paramAliases[field],
      color: getColorForParam(field),
    };
  }

  // Fallback: elimina sufijo "_mean" y lo convierte a mayúsculas
  const clean = field.replace(/_mean$/, "").replace(/_/g, " ");
  return {
    label: clean.charAt(0).toUpperCase() + clean.slice(1),
    unit: "",
    color: "#94a3b8", // gris neutro
  };
}

/**
 * Asigna colores por categoría de parámetro
 */
function getColorForParam(field: string): string {
  if (field.startsWith("voltage")) return "#38bdf8"; // azul
  if (field.startsWith("current")) return "#facc15"; // amarillo
  if (field.startsWith("p_act") || field.startsWith("p_app")) return "#34d399"; // verde
  if (field.startsWith("p_react")) return "#f472b6"; // rosa
  if (field.startsWith("energy")) return "#a78bfa"; // violeta
  if (field.startsWith("pf")) return "#22d3ee"; // cian
  if (field.startsWith("freq")) return "#fb923c"; // naranja
  if (field.includes("thd")) return "#ef4444"; // rojo
  return "#94a3b8"; // gris por defecto
}