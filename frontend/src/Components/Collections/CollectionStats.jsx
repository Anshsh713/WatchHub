import React from "react";
import {
  PieChart,
  Film,
  Tv,
  Sparkles,
  Star,
  Clock,
  Tag,
  Trophy,
  Flame,
  Layers,
} from "lucide-react";

export default function CollectionStats({ collection }) {
  if (!collection) return null;

  const { items = [], stats = {}, averageRating = 0, voteScore = 0 } = collection;

  // Genre distribution calculation
  const genreCounts = {};
  items.forEach((item) => {
    if (Array.isArray(item.genres)) {
      item.genres.forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Highest rated item by TMDB voteAverage
  const itemsWithRatings = items.filter((i) => i.voteAverage && i.voteAverage > 0);
  const highestRated =
    itemsWithRatings.length > 0
      ? itemsWithRatings.reduce((prev, curr) =>
          curr.voteAverage > prev.voteAverage ? curr : prev
        )
      : null;

  // Oldest and Newest release years
  const releaseYears = items
    .map((i) => (i.releaseDate ? parseInt(i.releaseDate.split("-")[0], 10) : null))
    .filter(Boolean)
    .sort((a, b) => a - b);

  const oldestYear = releaseYears.length > 0 ? releaseYears[0] : "—";
  const newestYear = releaseYears.length > 0 ? releaseYears[releaseYears.length - 1] : "—";

  return (
    <div className="collection-stats-panel">
      <h3 className="stats-panel-title">
        <PieChart size={20} /> Collection Insights & Statistics
      </h3>

      {/* Grid of Key Stat Cards */}
      <div className="stats-metric-cards-grid">
        <div className="stat-metric-card">
          <div className="stat-card-icon-wrap movie">
            <Film size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-number">{stats.movieCount || 0}</span>
            <span className="stat-card-label">Feature Films</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-wrap tv">
            <Tv size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-number">{stats.tvCount || 0}</span>
            <span className="stat-card-label">TV Series</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-wrap anime">
            <Sparkles size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-number">{stats.animeCount || 0}</span>
            <span className="stat-card-label">Anime Titles</span>
          </div>
        </div>

        <div className="stat-metric-card">
          <div className="stat-card-icon-wrap rating">
            <Star size={20} />
          </div>
          <div className="stat-card-data">
            <span className="stat-card-number">
              {stats.averageTmdbRating > 0 ? stats.averageTmdbRating : "—"}
            </span>
            <span className="stat-card-label">Avg TMDB Score</span>
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div className="stats-detailed-breakdown-row">
        {/* Top Genres */}
        <div className="breakdown-box">
          <h4>
            <Tag size={16} /> Most Common Genres
          </h4>
          {sortedGenres.length === 0 ? (
            <p className="empty-subtext">No genre information recorded.</p>
          ) : (
            <div className="genres-frequency-list">
              {sortedGenres.map(([genre, count]) => {
                const percent = Math.round((count / items.length) * 100);
                return (
                  <div key={genre} className="genre-freq-item">
                    <div className="genre-freq-header">
                      <span>{genre}</span>
                      <span>
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="genre-progress-bar">
                      <div className="genre-fill" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Highlights & Eras */}
        <div className="breakdown-box">
          <h4>
            <Trophy size={16} /> Highlights & Era
          </h4>

          <div className="highlights-list">
            <div className="highlight-item">
              <span className="hl-label">Era Span:</span>
              <span className="hl-value">
                {oldestYear === newestYear ? oldestYear : `${oldestYear} – ${newestYear}`}
              </span>
            </div>

            {highestRated && (
              <div className="highlight-item">
                <span className="hl-label">Top Rated Title:</span>
                <span className="hl-value text-accent">
                  {highestRated.title} ({highestRated.voteAverage?.toFixed(1)} ★)
                </span>
              </div>
            )}

            <div className="highlight-item">
              <span className="hl-label">Community Approval:</span>
              <span className="hl-value text-green">
                {voteScore > 0 ? `${voteScore}% Good` : "Pending community votes"}
              </span>
            </div>

            <div className="highlight-item">
              <span className="hl-label">WatchHub Community Rating:</span>
              <span className="hl-value text-yellow">
                {averageRating > 0 ? `${averageRating.toFixed(1)} / 5 Stars` : "Not rated yet"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
