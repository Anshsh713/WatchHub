import React, { useState } from "react";
import { LayoutGrid, List, Filter, Layers, Film, Tv, Sparkles } from "lucide-react";
import CollectionMediaCard from "./CollectionMediaCard";
import CollectionEmptyState from "./CollectionEmptyState";

export default function CollectionMediaGrid({
  items = [],
  sections = [],
  canEdit = false,
  onRemoveMedia,
  onReorderMedia,
  onUpdateNote,
  onChangeSection,
}) {
  const [filterType, setFilterType] = useState("all"); // 'all' | 'movie' | 'tv' | 'anime'
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("all");

  const filteredItems = items.filter((item) => {
    if (filterType !== "all" && item.mediaType !== filterType) return false;
    if (selectedSectionFilter !== "all") {
      if (selectedSectionFilter === "none") return !item.sectionId;
      return item.sectionId === selectedSectionFilter;
    }
    return true;
  });

  const handleMoveItem = async (index, direction) => {
    if (!onReorderMedia) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const itemOrders = newItems.map((it, idx) => ({
      itemId: it._id,
      position: idx,
      sectionId: it.sectionId,
    }));

    await onReorderMedia(itemOrders);
  };

  const handleItemSectionChange = async (itemId, sectionId) => {
    if (!onReorderMedia) return;
    const itemOrders = items.map((it) => ({
      itemId: it._id,
      position: it.position,
      sectionId: it._id === itemId ? sectionId : it.sectionId,
    }));
    await onReorderMedia(itemOrders);
  };

  if (items.length === 0) {
    return <CollectionEmptyState type="empty_items" />;
  }

  // Group by sections if sections exist
  const hasSections = sections.length > 0;

  return (
    <div className="collection-media-grid-container">
      {/* Filtering Bar */}
      <div className="collection-media-toolbar">
        <div className="media-type-filter-group">
          <button
            type="button"
            className={`filter-btn ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterType === "movie" ? "active" : ""}`}
            onClick={() => setFilterType("movie")}
          >
            <Film size={14} /> Movies ({items.filter((i) => i.mediaType === "movie").length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterType === "tv" ? "active" : ""}`}
            onClick={() => setFilterType("tv")}
          >
            <Tv size={14} /> TV ({items.filter((i) => i.mediaType === "tv").length})
          </button>
          <button
            type="button"
            className={`filter-btn ${filterType === "anime" ? "active" : ""}`}
            onClick={() => setFilterType("anime")}
          >
            <Sparkles size={14} /> Anime ({items.filter((i) => i.mediaType === "anime").length})
          </button>
        </div>

        {hasSections && (
          <div className="section-filter-dropdown">
            <select
              value={selectedSectionFilter}
              onChange={(e) => setSelectedSectionFilter(e.target.value)}
            >
              <option value="all">All Sections</option>
              {sections.map((s) => (
                <option key={s._id} value={s._id}>
                  Section: {s.name}
                </option>
              ))}
              <option value="none">Uncategorized</option>
            </select>
          </div>
        )}
      </div>

      {/* Media Grid Rendering */}
      {hasSections && selectedSectionFilter === "all" ? (
        <div className="sections-grouped-view">
          {sections.map((section) => {
            const sectionItems = filteredItems.filter(
              (it) => it.sectionId && it.sectionId.toString() === section._id.toString()
            );

            return (
              <div key={section._id} className="section-group-block">
                <div className="section-group-header">
                  <h3 className="section-title-heading">{section.name}</h3>
                  <span className="section-items-badge">{sectionItems.length} items</span>
                </div>

                {sectionItems.length === 0 ? (
                  <div className="empty-section-notice">
                    No media items assigned to this section yet. Use the dropdown on an item to assign it here.
                  </div>
                ) : (
                  <div className="collection-cards-grid">
                    {sectionItems.map((item, idx) => (
                      <CollectionMediaCard
                        key={item._id}
                        item={item}
                        index={items.findIndex((i) => i._id === item._id)}
                        totalItems={items.length}
                        sections={sections}
                        canEdit={canEdit}
                        onRemove={onRemoveMedia}
                        onMoveUp={(index) => handleMoveItem(index, "up")}
                        onMoveDown={(index) => handleMoveItem(index, "down")}
                        onUpdateNote={onUpdateNote}
                        onChangeSection={handleItemSectionChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Uncategorized Items */}
          {filteredItems.filter((it) => !it.sectionId).length > 0 && (
            <div className="section-group-block">
              <div className="section-group-header">
                <h3 className="section-title-heading">General / Unassigned</h3>
                <span className="section-items-badge">
                  {filteredItems.filter((it) => !it.sectionId).length} items
                </span>
              </div>

              <div className="collection-cards-grid">
                {filteredItems
                  .filter((it) => !it.sectionId)
                  .map((item) => (
                    <CollectionMediaCard
                      key={item._id}
                      item={item}
                      index={items.findIndex((i) => i._id === item._id)}
                      totalItems={items.length}
                      sections={sections}
                      canEdit={canEdit}
                      onRemove={onRemoveMedia}
                      onMoveUp={(index) => handleMoveItem(index, "up")}
                      onMoveDown={(index) => handleMoveItem(index, "down")}
                      onUpdateNote={onUpdateNote}
                      onChangeSection={handleItemSectionChange}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="collection-cards-grid">
          {filteredItems.map((item, idx) => (
            <CollectionMediaCard
              key={item._id}
              item={item}
              index={idx}
              totalItems={filteredItems.length}
              sections={sections}
              canEdit={canEdit}
              onRemove={onRemoveMedia}
              onMoveUp={(index) => handleMoveItem(index, "up")}
              onMoveDown={(index) => handleMoveItem(index, "down")}
              onUpdateNote={onUpdateNote}
              onChangeSection={handleItemSectionChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
