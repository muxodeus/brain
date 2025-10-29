export type Direccion = "debajo" | "arriba";
export type Operacion =
  | "umbral"
  | "percentil"
  | "agregado"
  | "comparar"
  | "superponer"
  | "tendencia"
  | "histograma"
  | "barras_diarias"
  | "correlacion";

export type EspecificacionAnalisis = {
  operacion: Operacion;
  campos: string[];
  rango: string;
  direccion?: Direccion;
  umbral?: number;
  percentil?: number;
  agregado?: "media" | "minimo" | "maximo" | "mediana" | "desviacion";
  intervalo?: string;
  agrupadoPor?: "dia" | "hora";
  rangoComparacion?: string;
};