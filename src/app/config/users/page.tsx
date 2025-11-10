"use client";

import { useState, useEffect } from "react";

type AppUser = {
  id: number;
  email: string;
  role: "admin" | "engineer" | "viewer";
};

export default function UsersPage() {
  const [userList, setUserList] = useState<AppUser[]>([]);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">👥 Gestión de Usuarios</h1>

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
            <label className="block text-sm text-gray-300">
              Email:
              <input
                type="text"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              />
            </label>
            <label className="block text-sm text-gray-300">
              Rol:
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    role: e.target.value as AppUser["role"],
                  })
                }
                className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
              >
                <option value="admin">Admin</option>
                <option value="engineer">Engineer</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}