import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

const GENRE_COLORS = {
  "Sci-Fi": "#3498db",
  "Science Fiction": "#3498db",
  Action: "#e74c3c",
  Drama: "#f1c40f",
  Comedy: "#2ecc71",
  Horror: "#2c3e50",
  Romance: "#e91e63",
  Thriller: "#8e44ad",
  Animation: "#ff9f43",
  Fantasy: "#9b59b6",
  Adventure: "#16a085",
  Mystery: "#34495e",
  Crime: "#c0392b",
  Documentary: "#7f8c8d",
  Family: "#f39c12",
  History: "#d35400",
  Music: "#1abc9c",
  War: "#95a5a6",
  Western: "#d35400",
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

  const [activeindex, setActiveIndex] = useState(null);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const getGenreColor = (name, index) => {
    return GENRE_COLORS[name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  return (
    <div
      className="vibe-chart-container"
      style={{
        width: "100%",
        backgroundColor: "#212529",
        color: "#fff",
        padding: "30px",
        borderRadius: "28px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "100",
          marginBottom: "20px",
          color: "var(--color-text-main)",
        }}
      >
        Vibe Chart
      </h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="percent"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={105}
              paddingAngle={2}
              stroke="none"
              activeIndex={activeindex}
              activeOuterRadius={120}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell
                  style={{
                    filter:
                      activeindex === index
                        ? "drop-shadow(0 0 12px rgba(255,255,255,0.4))"
                        : "none",
                  }}
                  key={`cell-${index}`}
                  fill={getGenreColor(entry.name, index)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "8px 16px",
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
          flexDirection: "column",
          gap: "18px",
          marginTop: "30px",
          padding: "0 10px",
        }}
      >
        {data.map((entry, index) => (
          <div
            key={`legend-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: getGenreColor(entry.name, index),
                  boxShadow: `0 0 10px ${getGenreColor(entry.name, index)}66`,
                }}
              />
              <span
                style={{ fontSize: "1.1rem", fontWeight: "500", color: "#bbb" }}
              >
                {entry.name}
              </span>
            </div>
            <span
              style={{
                fontSize: "1.1rem",
                fontWeight: "700",
                color: "#fff",
              }}
            >
              {entry.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
