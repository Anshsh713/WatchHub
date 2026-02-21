import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const GENRE_COLORS = {
  "Sci-Fi": "#3498db",
  "Science Fiction": "#3498db",
  "Action": "#e74c3c",
  "Drama": "#f1c40f",
  "Comedy": "#2ecc71",
  "Horror": "#2c3e50",
  "Romance": "#e91e63",
  "Thriller": "#8e44ad",
  "Animation": "#ff9f43",
  "Fantasy": "#9b59b6",
  "Adventure": "#16a085",
  "Mystery": "#34495e",
  "Crime": "#c0392b",
  "Documentary": "#7f8c8d",
  "Family": "#f39c12",
  "History": "#d35400",
  "Music": "#1abc9c",
  "War": "#95a5a6",
  "Western": "#d35400",
  "TV Movie": "#bdc3c7",
};

const DEFAULT_COLORS = [
  "#e50914",
  "#ff7675",
  "#46d1fd",
  "#8e44ad",
  "#f1c40f",
  "#2ecc71",
];

export default function VibeChart({ data }) {
  if (!data || data.length === 0) return null;

  const getGenreColor = (name, index) => {
    return GENRE_COLORS[name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  return (
    <div className="vibe-chart-container" style={{ width: "100%", color: "#fff" }}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="percent"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getGenreColor(entry.name, index)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "8px 12px",
                textAlign: "center",
              }}
              itemStyle={{
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "600",
              }}
              cursor={{ fill: "transparent" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend section */}
      <div
        className="chart-legend"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "15px",
          marginTop: "20px",
          padding: "0 10px",
        }}
      >
        {data.map((entry, index) => (
          <div
            key={`legend-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "4px 10px",
              borderRadius: "20px",
              border: `1px solid ${getGenreColor(entry.name, index)}44`,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: getGenreColor(entry.name, index),
              }}
            />
            <span style={{ fontWeight: "500", opacity: 0.9 }}>{entry.name}</span>
            <span style={{ fontWeight: "700", color: getGenreColor(entry.name, index) }}>
              {entry.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
