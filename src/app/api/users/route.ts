// src/app/api/users/route.ts
import { NextResponse } from "next/server";

type Role = "admin" | "engineer" | "viewer";

type Permissions = {
  dashboard: boolean;
  tendencias: boolean;
  energia: boolean;
  alarmas: boolean;
  unifilar: boolean;
  ai: boolean;
  estadisticas: boolean;
  configuracion_medidores: boolean;
  configuracion_tarifas: boolean;
  configuracion_usuarios: boolean;
};

type AppUser = {
  id: number;
  email: string;
  role: Role;
  permissions: Permissions;
};

// Defaults y helpers
const defaultPermissions: Permissions = {
  dashboard: false,
  tendencias: false,
  energia: false,
  alarmas: false,
  unifilar: false,
  ai: false,
  estadisticas: false,
  configuracion_medidores: false,
  configuracion_tarifas: false,
  configuracion_usuarios: false,
};

function roleDefaults(role: Role): Permissions {
  switch (role) {
    case "admin":
      return {
        dashboard: true,
        tendencias: true,
        energia: true,
        alarmas: true,
        unifilar: true,
        ai: true,
        estadisticas: true,
        configuracion_medidores: true,
        configuracion_tarifas: true,
        configuracion_usuarios: true,
      };
    case "engineer":
      return {
        dashboard: true,
        tendencias: true,
        energia: true,
        alarmas: true,
        unifilar: true,
        ai: false,
        estadisticas: true,
        configuracion_medidores: true,
        configuracion_tarifas: false,
        configuracion_usuarios: false,
      };
    case "viewer":
    default:
      return {
        dashboard: true,
        tendencias: true,
        energia: false,
        alarmas: false,
        unifilar: false,
        ai: false,
        estadisticas: true,
        configuracion_medidores: false,
        configuracion_tarifas: false,
        configuracion_usuarios: false,
      };
  }
}

// Mock en memoria
let users: AppUser[] = [
  {
    id: 1,
    email: "demo@mail.com",
    role: "admin",
    permissions: roleDefaults("admin"),
  },
  {
    id: 2,
    email: "eng@mail.com",
    role: "engineer",
    permissions: roleDefaults("engineer"),
  },
  {
    id: 3,
    email: "view@mail.com",
    role: "viewer",
    permissions: roleDefaults("viewer"),
  },
];

// GET: listar usuarios
export async function GET() {
  return NextResponse.json(users);
}

// POST: crear usuario
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<AppUser>;
    const email = (body.email || "").trim();
    const role = (body.role as Role) || "viewer";
    const permissions =
      body.permissions ??
      roleDefaults(role); // si no mandan permisos, se usan los del rol

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // id simple (en memoria)
    const id =
      users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    const newUser: AppUser = {
      id,
      email,
      role,
      permissions: {
        ...defaultPermissions,
        ...permissions,
      },
    };

    users.push(newUser);
    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    );
  }
}

// PUT: actualizar usuario (email, role, permissions)
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<AppUser>;
    const { id } = body;

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "ID inválido o faltante" },
        { status: 400 }
      );
    }

    const existing = users.find((u) => u.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const nextRole = (body.role as Role) ?? existing.role;
    const nextPermissions =
      body.permissions ??
      existing.permissions; // si no mandan permisos, se mantiene

    const updated: AppUser = {
      id,
      email: (body.email ?? existing.email).trim(),
      role: nextRole,
      permissions: {
        ...existing.permissions,
        ...nextPermissions,
      },
    };

    users = users.map((u) => (u.id === id ? updated : u));
    return NextResponse.json({ success: true, user: updated });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}

// DELETE: eliminar usuario
export async function DELETE(req: Request) {
  try {
    const body = (await req.json()) as { id?: number };
    const id = body.id;

    if (typeof id !== "number") {
      return NextResponse.json(
        { error: "ID inválido o faltante" },
        { status: 400 }
      );
    }

    const exists = users.some((u) => u.id === id);
    if (!exists) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    users = users.filter((u) => u.id !== id);
    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    );
  }
}