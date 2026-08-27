import React from "react";
import { Clock, Eye, CheckCircle2, PauseCircle, XCircle, Layers } from "lucide-react";
import { motion } from "framer-motion";

const STATUS_CONFIG = [
  { id: "all", label: "All Items", icon: Layers, color: "#e4e4e7", key: "all" },
  { id: "want_to_watch", label: "Want to Watch", icon: Clock, color: "#3b82f6", key: "want_to_watch" },
  { id: "watching", label: "Watching", icon: Eye, color: "#f59e0b", key: "watching" },
  { id: "completed", label: "Completed", icon: CheckCircle2, color: "#22c55e", key: "completed" },
  { id: "on_hold", label: "On Hold", icon: PauseCircle, color: "#8b5cf6", key: "on_hold" },
  { id: "dropped", label: "Dropped", icon: XCircle, color: "#ef4444", key: "dropped" },
];

export default function WatchListStats({ statusCounts = {}, activeStatus = "all", onSelectStatus }) {
  return (
    <div className="watchlist-stats-bar">
      {STATUS_CONFIG.map((status) => {
        const Icon = status.icon;
        const count = statusCounts[status.key] || 0;
        const isActive = activeStatus === status.id;

        return (
          <motion.button
            key={status.id}
            className={`watchlist-stat-pill ${isActive ? "active" : ""}`}
            onClick={() => onSelectStatus(status.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="stat-icon-wrapper" style={{ color: status.color }}>
              <Icon size={16} />
            </div>

            <div className="stat-label-wrap">
              <span className="stat-title">{status.label}</span>
              <span className="stat-counter">{count}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
