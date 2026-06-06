import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const GENRE_IDS = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "Sci-Fi": 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
  "TV Movie": 10770,
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 4}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: `drop-shadow(0px 4px 12px ${fill}60)`,
          transition: "transform 0.3s ease",
          cursor: "pointer",
        }}
      />
    </g>
  );
};

export default function VibeChart({ data }) {
  const navigate = useNavigate();

  if (!data || data.length === 0) return null;

  const [activeindex, setActiveIndex] = useState(null);

  const getGenreColor = (name, index) => {
    return GENRE_COLORS[name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
  };

  const highest = data.reduce((max, item) =>
    item.percent > max.percent ? item : max,
  );

  const displayed = activeindex !== null ? data[activeindex] : highest;

  const handleGenreClick = (genreName) => {
    const genreId = GENRE_IDS[genreName];

    if (genreId) {
      navigate(`/genres/${genreId}`);
    }
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h2
        style={{
          width: "100%",
          fontSize: "1.5rem",
          fontWeight: "100",
          marginBottom: "20px",
          color: "var(--color-text-main)",
        }}
      >
        Vibe Chart
      </h2>

      <div style={{ width: "100%", height: 300, position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              cursor="pointer"
              onClick={(data, index) => handleGenreClick(data.name)}
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
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationBegin={0}
              isAnimationActive={true}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    opacity:
                      activeindex !== null && activeindex !== index ? 0.6 : 1,
                  }}
                  key={`cell-${index}`}
                  fill={getGenreColor(entry.name, index)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Info similar to RatingChart */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              fontSize: 32,
              fontWeight: 500,
              margin: 0,
              color: getGenreColor(
                displayed.name,
                data.findIndex((d) => d.name === displayed.name),
              ),
              transition: "color 0.3s ease",
              lineHeight: 1,
            }}
          >
            {displayed.percent}%
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "#e2e8f0",
              margin: "4px 0 0 0",
              fontWeight: 400,
            }}
          >
            {displayed.name}
          </p>
        </div>
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
          width: "100%",
        }}
      >
        {data.map((entry, index) => {
          const isActive = activeindex === index;
          const isFaded = activeindex !== null && !isActive;

          return (
            <div
              key={`legend-${index}`}
              onClick={() => handleGenreClick(entry.name)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isFaded ? 0.4 : 1,
                transform: isActive ? "translateX(6px)" : "translateX(0)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div
                  onClick={() => handleGenreClick(displayed.name)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: getGenreColor(entry.name, index),
                    boxShadow: isActive
                      ? `0 0 12px ${getGenreColor(entry.name, index)}`
                      : `0 0 10px ${getGenreColor(entry.name, index)}66`,
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#ffffff" : "#bbb",
                    transition: "all 0.3s ease",
                  }}
                >
                  {entry.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: isActive ? "#fff" : "#ddd",
                  transition: "all 0.3s ease",
                }}
              >
                {entry.percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
