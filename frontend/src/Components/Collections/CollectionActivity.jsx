import React, { useEffect } from "react";
import {
  Activity,
  PlusCircle,
  Trash2,
  FolderPlus,
  UserCheck,
  Star,
  Copy,
  Clock,
} from "lucide-react";
import { useCollections } from "../../Context/CollectionContext";

export default function CollectionActivity({ collectionId }) {
  const { collectionActivity, fetchActivity } = useCollections();

  useEffect(() => {
    if (collectionId) {
      fetchActivity(collectionId);
    }
  }, [collectionId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case "media_added":
        return <PlusCircle size={16} className="text-blue" />;
      case "media_removed":
        return <Trash2 size={16} className="text-red" />;
      case "section_created":
        return <FolderPlus size={16} className="text-purple" />;
      case "followed":
        return <UserCheck size={16} className="text-green" />;
      case "reviewed":
        return <Star size={16} className="text-yellow" />;
      case "copied":
        return <Copy size={16} className="text-cyan" />;
      default:
        return <Activity size={16} className="text-gray" />;
    }
  };

  const formatActivityDescription = (act) => {
    const user = act.user?.User_Name || "Curator";
    switch (act.activityType) {
      case "created":
        return (
          <span>
            <strong>@{user}</strong> created this collection.
          </span>
        );
      case "media_added":
        return (
          <span>
            <strong>@{user}</strong> added{" "}
            <span className="media-highlight">{act.meta?.mediaTitle || "a title"}</span>.
          </span>
        );
      case "media_removed":
        return (
          <span>
            <strong>@{user}</strong> removed{" "}
            <span className="media-highlight">{act.meta?.mediaTitle || "a title"}</span>.
          </span>
        );
      case "section_created":
        return (
          <span>
            <strong>@{user}</strong> organized a new section{" "}
            <em>"{act.meta?.sectionName}"</em>.
          </span>
        );
      case "followed":
        return (
          <span>
            <strong>@{user}</strong> started following this collection.
          </span>
        );
      case "reviewed":
        return (
          <span>
            <strong>@{user}</strong> published a review ({act.meta?.rating} ★).
          </span>
        );
      case "copied":
        return (
          <span>
            <strong>@{user}</strong> remixed/copied this collection.
          </span>
        );
      default:
        return (
          <span>
            <strong>@{user}</strong> performed an update.
          </span>
        );
    }
  };

  return (
    <div className="collection-activity-container">
      <div className="activity-panel-header">
        <Activity size={18} />
        <h4>Recent Collection Activity</h4>
      </div>

      {collectionActivity.length === 0 ? (
        <div className="empty-activity-box">
          <Clock size={28} />
          <p>No recent curation activity logged yet.</p>
        </div>
      ) : (
        <div className="activity-timeline-list">
          {collectionActivity.map((act) => {
            const dateStr = new Date(act.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div key={act._id} className="activity-timeline-item">
                <div className="timeline-node">{getActivityIcon(act.activityType)}</div>
                <div className="timeline-content">
                  <div className="activity-text">{formatActivityDescription(act)}</div>
                  <span className="activity-timestamp">{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
