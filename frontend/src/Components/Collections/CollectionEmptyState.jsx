import React from "react";
import { Layers, BookmarkPlus, Search, Film, Users } from "lucide-react";
import "./Collections.css";

export default function CollectionEmptyState({
  type = "no_collections",
  actionText = null,
  onAction = null,
}) {
  const configs = {
    no_collections: {
      icon: Layers,
      title: "No Collections Created",
      message:
        "You haven't created any collections yet. Organize your favorite movies, TV shows, or anime into personalized, shareable curations.",
      defaultAction: "Create Your First Collection",
    },
    no_following: {
      icon: BookmarkPlus,
      title: "No Followed Collections",
      message:
        "You aren't following any collections yet. Explore public collections curated by the WatchHub community and follow the ones you love.",
      defaultAction: "Explore Collections",
    },
    no_shared: {
      icon: Users,
      title: "No Shared Collections",
      message:
        "No collections have been shared with you as a collaborator. When friends invite you to edit or view collections, they will show up here.",
      defaultAction: null,
    },
    no_results: {
      icon: Search,
      title: "No Collections Found",
      message:
        "We couldn't find any collections matching your filters or search keywords. Try adjusting your search or clearing active filters.",
      defaultAction: "Clear Filters",
    },
    empty_items: {
      icon: Film,
      title: "This Collection is Empty",
      message:
        "No media items have been added to this collection yet. Browse WatchHub and use 'Add to Collection' to add movies, TV series, or anime.",
      defaultAction: "Explore Media",
    },
  };

  const current = configs[type] || configs.no_collections;
  const Icon = current.icon;

  return (
    <div className="collection-empty-state">
      <div className="empty-state-icon-wrap">
        <Icon size={44} />
      </div>
      <h3 className="empty-state-title">{current.title}</h3>
      <p className="empty-state-message">{current.message}</p>
      {(actionText || current.defaultAction) && onAction && (
        <button className="empty-state-btn" onClick={onAction}>
          {actionText || current.defaultAction}
        </button>
      )}
    </div>
  );
}
