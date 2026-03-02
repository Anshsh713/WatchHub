import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  Perfection: "#8b5cf6",
  "Go for it": "#22c55e",
  TimePass: "#facc15",
  "Skip it": "#ef4444",
};

export default function RatingSemiPie({ stats, total }) {
  if (!stats || total === 0) return null;

  const data = Object.entries(stats).map(([name, value]) => ({
    name,
    value,
  }));

  const highest = data.reduce((max, item) =>
    item.value > max.value ? item : max,
  );

  return (
    <div style={{ width: "100%", height: 300, position: "relative" }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            innerRadius={80}
            outerRadius={120}
            paddingAngle={3}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={COLORS[entry.name]}
                stroke={entry.name === highest.name ? "#fff" : "none"}
                strokeWidth={entry.name === highest.name ? 3 : 0}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "white",
        }}
      >
        <h2>{total}</h2>
        <p style={{ fontSize: 12, color: "#aaa" }}>Total Reviews</p>
        <p style={{ fontSize: 14, fontWeight: 600 }}>{highest.name}</p>
      </div>
    </div>
  );
}
