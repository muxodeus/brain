// Alias de canales industriales comunes
export const channelAliases: Record<string, string> = {
  "CH_A": "Canal A",
  "CH_B": "Canal B",
  "CH_C": "Canal C",
  "TOTAL": "Total",
  "TOTAL_ABC": "Total",
  "A": "Canal A",
  "B": "Canal B",
  "C": "Canal C",
  "L1": "Canal A",
  "L2": "Canal B",
  "L3": "Canal C",
};

// Función de limpieza
export function cleanChannelName(raw: string): string {
  if (!raw) return raw;
  return channelAliases[raw] || raw;
}