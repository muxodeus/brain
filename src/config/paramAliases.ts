// Alias de parámetros industriales comunes
export const paramAliases: Record<string, { label: string; unit: string }> = {
  // Voltajes
  voltage_mean: { label: "Voltaje RMS", unit: "V" },
  voltage_a_mean: { label: "Voltaje Fase A", unit: "V" },
  voltage_b_mean: { label: "Voltaje Fase B", unit: "V" },
  voltage_c_mean: { label: "Voltaje Fase C", unit: "V" },
  vthd_mean: { label: "THD Voltaje", unit: "%" },

  // Corrientes
  current_mean: { label: "Corriente RMS", unit: "A" },
  current_a_mean: { label: "Corriente Fase A", unit: "A" },
  current_b_mean: { label: "Corriente Fase B", unit: "A" },
  current_c_mean: { label: "Corriente Fase C", unit: "A" },
  ithd_mean: { label: "THD Corriente", unit: "%" },

  // Potencias
  p_act_mean: { label: "Potencia Activa", unit: "kW" },
  p_react_mean: { label: "Potencia Reactiva", unit: "kVAr" },
  p_app_mean: { label: "Potencia Aparente", unit: "kVA" },

  // Energías
  energy_kWh_mean: { label: "Energía Activa", unit: "kWh" },
  energy_kVArh_mean: { label: "Energía Reactiva", unit: "kVArh" },

  // Otros
  pf_mean: { label: "Factor de Potencia", unit: "" },
  frequency_mean: { label: "Frecuencia", unit: "Hz" },
};