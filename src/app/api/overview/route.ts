import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    planta: "Planta Avícola San Salvador",
    medidores: [
      {
        id: 1,
        nombre: "Medidor Principal",
        ubicacion: "Subestación Norte",
        lat: 13.6929,
        lng: -89.2182,
        estado: "activo",
      },
      {
        id: 2,
        nombre: "Medidor Secundario",
        ubicacion: "Subestación Sur",
        lat: 13.70,
        lng: -89.22,
        estado: "activo",
      },
    ],
    usuario: {
      nombre: "José Recinos",
      rol: "Administrador",
      jerarquia: "Nivel 1",
      correo: "jose@energetica.sv",
      telefono: "+503 7894 5439",
    },
    alarmasPendientes: 3,
    horaLocal: new Date().toLocaleString("es-SV"),
  });
}