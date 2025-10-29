export const meterTemplates = [
  {
    brand: "PQGenius",
    model: "PQG800",
    templateId: "pqgenius_pqg800",
    registers: [
      { address: 30001, label: "Voltaje", type: "float32" },
      { address: 30003, label: "Corriente", type: "float32" },
      { address: 30005, label: "Potencia", type: "float32" },
    ],
  },
  {
    brand: "Siemens",
    model: "PAC3200",
    templateId: "siemens_pac3200_v2",
    registers: [
      { address: 40001, label: "Voltaje L1", type: "float32" },
      { address: 40003, label: "Corriente L1", type: "float32" },
      { address: 40005, label: "Potencia L1", type: "float32" },
    ],
  },
  {
    brand: "ABB",
    model: "M2M",
    templateId: "abb_m2m_v1",
    registers: [
      { address: 31001, label: "Voltaje RMS", type: "float32" },
      { address: 31003, label: "Corriente RMS", type: "float32" },
    ],
  },
];