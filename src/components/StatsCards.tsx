export default function StatsCards({ stats }: { stats: any }) {
  const cards = [
    { label: "Mínimo", value: stats.min?.toFixed(3), color: "bg-green-600" },
    { label: "Promedio", value: stats.avg?.toFixed(3), color: "bg-blue-600" },
    { label: "Máximo", value: stats.max?.toFixed(3), color: "bg-red-600" },
    { label: "P5", value: stats.p5?.toFixed(3), color: "bg-purple-600" },
    { label: "P95", value: stats.p95?.toFixed(3), color: "bg-orange-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`p-4 rounded text-white shadow ${c.color}`}>
          <p className="text-sm">{c.label}</p>
          <p className="text-lg font-bold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}