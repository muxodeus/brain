// src/config/authConfig.ts
export type PermissionAction = "view" | "edit" | "export" | "configure";

export interface ModulePermission {
  module: string;
  actions: PermissionAction[];
}

export interface AuthUser {
  email: string;
  password: string;
  role: "admin" | "engineer" | "viewer" | "custom";
  permissions: ModulePermission[];
}

// Plantillas de permisos
export const permissionTemplates: Record<string, ModulePermission[]> = {
  admin: [
    { module: "dashboard", actions: ["view", "edit", "export", "configure"] },
    { module: "alarmas", actions: ["view", "edit", "export"] },
    { module: "configuracion", actions: ["view", "edit", "configure"] },
  ],
  engineer: [
    { module: "dashboard", actions: ["view", "edit"] },
    { module: "alarmas", actions: ["view", "edit"] },
    { module: "configuracion", actions: ["view"] },
  ],
  viewer: [
    { module: "dashboard", actions: ["view"] },
    { module: "alarmas", actions: ["view"] },
  ],
};
export type AppUser = {
  id: number;
  email: string;
  role: "admin" | "engineer" | "viewer";
};

export const users: AppUser[] = [
  { id: 1, email: "demo@mail.com", role: "admin" },
  { id: 2, email: "eng@mail.com", role: "engineer" },
  { id: 3, email: "view@mail.com", role: "viewer" },
];