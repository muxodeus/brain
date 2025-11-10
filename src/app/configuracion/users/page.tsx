"use client";

import { useState, useEffect } from "react";

type AppUser = {
  id: number;
  email: string;
  role: "admin" | "engineer" | "viewer";
  permissions: {
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
};

export default function UsersPage() {
  const [userList, setUserList] = useState<AppUser[]>([]);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [newUser, setNewUser] = useState<AppUser | null>(null);

  // Cargar usuarios desde API
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUserList(data));
  }, []);

  const handleDelete = async (id: number) => {
    await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setUserList(userList.filter((u) => u.id !== id));
  };

  const handleEdit = (user: AppUser) => {
    setEditingUser(user);
  };

  const handleSave = async () => {
    if (editingUser) {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser),
      });
      setUserList(
        userList.map((u) => (u.id === editingUser.id ? editingUser : u))
      );
      setEditingUser(null);
    }
  };

  const handleCreate = async () => {
    if (newUser) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      setUserList([...userList, data.user]);
      setNewUser(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">👥 Gestión de Usuarios</h1>

      <button
        onClick={() =>
          setNewUser({
            id: Date.now(),
            email: "",
            role: "viewer",
            permissions: {
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
            },
          })
        }
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        ➕ Agregar Usuario
      </button>

      <table className="w-full border-collapse border border-gray-700 text-sm">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="border border-gray-700 px-4 py-2 text-left">ID</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Email</th>
            <th className="border border-gray-700 px-4 py-2 text-left">Rol</th>
            <th className="border border-gray-700 px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((u) => (
            <tr key={u.id} className="hover:bg-gray-800">
              <td className="border border-gray-700 px-4 py-2">{u.id}</td>
              <td className="border border-gray-700 px-4 py-2">{u.email}</td>
              <td className="border border-gray-700 px-4 py-2 capitalize">{u.role}</td>
              <td className="border border-gray-700 px-4 py-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(u)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de edición */}
      {editingUser && (
        <UserModal
          user={editingUser}
          onCancel={() => setEditingUser(null)}
          onSave={handleSave}
          setUser={setEditingUser}
        />
      )}

      {/* Modal de creación */}
      {newUser && (
        <UserModal
          user={newUser}
          onCancel={() => setNewUser(null)}
          onSave={handleCreate}
          setUser={setNewUser}
        />
      )}
    </div>
  );
}

// Reutilizamos el mismo modal para edición y creación
function UserModal({
  user,
  setUser,
  onCancel,
  onSave,
}: {
  user: AppUser;
  setUser: (u: AppUser) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg w-96 space-y-4">
        <h2 className="text-xl font-bold text-white">
          {user.id ? "Editar Usuario" : "Nuevo Usuario"}
        </h2>

        {/* Email */}
        <label className="block text-sm text-gray-300">
          Email:
          <input
            type="text"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
          />
        </label>

        {/* Rol */}
        <label className="block text-sm text-gray-300">
          Rol:
          <select
            value={user.role}
            onChange={(e) =>
              setUser({ ...user, role: e.target.value as AppUser["role"] })
            }
            className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
          >
            <option value="admin">Admin</option>
            <option value="engineer">Engineer</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>

        {/* Permisos */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Permisos</h3>
          {Object.entries(user.permissions).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setUser({
                    ...user,
                    permissions: {
                      ...user.permissions,
                      [key]: e.target.checked,
                    },
                  })
                }
              />
              {key.replace(/_/g, " ")}
            </label>
          ))}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}