import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { useState } from "react";

const COLORS = {
  "Skip it": "#ff6384", // Coral pink
  TimePass: "#ffb703", // Yellow-orange
  "Go for it": "#00d284", // Mint green
  Perfection: "#a855f7", // Purple
};

const ORDER = ["Skip it", "TimePass", "Go for it", "Perfection"];

const renderActiveShape = (props) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    cornerRadius,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={cornerRadius}
        style={{
          filter: `drop-shadow(0px 4px 12px ${fill}60)`,
          transition: "all 0.3s ease",
        }}
      />
    </g>
  );
};

export default function RatingSemiPie({ stats, total }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!stats || total === 0) return null;

  const data = ORDER.map((key) => ({
    name: key,
    value: stats[key] || 0,
  }));

  const highest = data.reduce((max, item) =>
    item.value > max.value ? item : max,
  );

  const displayed = activeIndex !== null ? data[activeIndex] : highest;
  const percentage = Math.round(displayed.value);
  const segmentVotes = Math.round((displayed.value / 100) * total);

  return (
    <div
      style={{
        width: "100%",
        height: 350,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Chart Section */}
      <div style={{ width: "100%", height: 260, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              tabIndex={-1}
              data={data}
              dataKey="value"
              startAngle={180}
              endAngle={0}
              cx="50%"
              cy="80%"
              innerRadius={140}
              outerRadius={170}
              paddingAngle={2}
              cornerRadius={0}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={COLORS[entry.name]}
                  style={{
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    opacity:
                      activeIndex !== null &&
                      activeIndex !== data.indexOf(entry)
                        ? 0.6
                        : 1,
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Info exactly like the image */}
        <div
          style={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <h2
            style={{
              fontSize: 38,
              fontWeight: 500,
              margin: 0,
              color: COLORS[displayed.name],
              transition: "color 0.3s ease",
              lineHeight: 1,
            }}
          >
            {percentage}%
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#e2e8f0",
              margin: "8px 0 0 0",
              fontWeight: 400,
            }}
          >
            {segmentVotes}/{total} Votes
          </p>
        </div>
      </div>

      {/* Simple Legend dots at the bottom as requested */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 24,
          marginTop: 10,
        }}
      >
        {data.map((item, index) => {
          const isActive = activeIndex === index;
          const isFaded = activeIndex !== null && !isActive;

          return (
            <div
              key={item.name}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: isFaded ? 0.4 : 1,
                transform: isActive ? "translateY(-3px)" : "translateY(0)",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: COLORS[item.name],
                  boxShadow: isActive
                    ? `0 0 12px ${COLORS[item.name]}`
                    : "none",
                  transition: "all 0.3s ease",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: isActive ? "#ffffff" : "#a0a0a0",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.3s ease",
                }}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
