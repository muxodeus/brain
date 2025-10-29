"use client";

import { useEffect, useMemo, useState } from "react";
import mqtt from "mqtt";

type Meter = {
  id: number;
  name: string;
  ip: string;
  port: number;
  slave_id: number;
  brand: string;
  model: string;
  gateway_out: string;
};

type Gateway = {
  id: number;
  name: string;
  site: string;
  gwId: string;
};

export default function GatewaysPage() {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGw, setNewGw] = useState<Partial<Gateway>>({});

  const mqttClient = useMemo(
    () =>
      mqtt.connect("wss://e410daf6a96e4f55b37e2ec3223aaa47.s1.eu.hivemq.cloud:8884/mqtt", {
        username: "hivemq.webclient.1760898820730",
        password: "d.K0o1?BA!la9;uiWV2Z",
        reconnectPeriod: 2000,
      }),
    []
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const gwRes = await fetch("/api/gateways");
      const gwData = await gwRes.json();
      setGateways(gwData);

      const mRes = await fetch("/api/meters");
      const mData = await mRes.json();
      setMeters(mData);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const publishConfig = (gw: Gateway) => {
    const gwMeters = meters.filter((m) => m.gateway_out === gw.gwId);
    const config = {
      site: gw.site,
      gw: gw.gwId,
      meters: gwMeters.map((m) => ({
        meter: m.name,
        ip: m.ip,
        port: m.port,
        unitId: m.slave_id,
        brand: m.brand,
        model: m.model,
      })),
    };
    mqttClient.publish(`config/${gw.gwId}/meters`, JSON.stringify(config), { qos: 1 });
    alert(`Configuración publicada a config/${gw.gwId}/meters`);
  };

  const handleSave = async () => {
    await fetch("/api/gateways", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newGw),
    });
    setShowModal(false);
    setNewGw({});
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white/90 border-b border-white/10 pb-2">
          🌐 Configuración — Gateways
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-teal-600 rounded hover:bg-teal-700"
        >
          ➕ Nuevo Gateway
        </button>
      </header>

      {loading ? (
        <p className="text-white/50 animate-pulse">Cargando gateways…</p>
      ) : (
        <table className="w-full border border-white/10 rounded-lg overflow-hidden">
          <thead className="bg-slate-800/60">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Site</th>
              <th className="p-2 text-left">GW ID</th>
              <th className="p-2 text-left">Medidores asociados</th>
              <th className="p-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((gw) => {
              const gwMeters = meters.filter((m) => m.gateway_out === gw.gwId);
              return (
                <tr key={gw.id} className="border-t border-white/10 align-top">
                  <td className="p-2">{gw.name}</td>
                  <td className="p-2">{gw.site}</td>
                  <td className="p-2">{gw.gwId}</td>
                  <td className="p-2">
                    {gwMeters.length === 0 ? (
                      <span className="text-white/50">—</span>
                    ) : (
                      <ul className="text-sm">
                        {gwMeters.map((m) => (
                          <li key={m.id}>
                            {m.name} ({m.brand} {m.model})
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => publishConfig(gw)}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      📡 Publicar configuración
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-800 p-6 rounded-lg w-96 space-y-4">
            <h2 className="text-xl font-bold">➕ Nuevo Gateway</h2>
            <input
              type="text"
              placeholder="Nombre"
              value={newGw.name || ""}
              onChange={(e) => setNewGw({ ...newGw, name: e.target.value })}
              className="w-full p-2 rounded bg-slate-700"
            />
            <input
              type="text"
              placeholder="Site"
              value={newGw.site || ""}
              onChange={(e) => setNewGw({ ...newGw, site: e.target.value })}
              className="w-full p-2 rounded bg-slate-700"
            />
            <input
              type="text"
              placeholder="GW ID"
              value={newGw.gwId || ""}
              onChange={(e) => setNewGw({ ...newGw, gwId: e.target.value })}
              className="w-full p-2 rounded bg-slate-700"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-slate-600 rounded hover:bg-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-teal-600 rounded hover:bg-teal-700"
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