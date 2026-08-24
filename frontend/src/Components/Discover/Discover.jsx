import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  CalendarClock,
  Megaphone,
  Play,
  Image as ImageIcon,
  Film,
  Tv,
  Sparkles,
  Users,
  Eye,
  Clapperboard,
  CheckCircle2,
  RefreshCw,
  XCircle,
  X,
  ChevronDown,
  EyeOff,
} from "lucide-react";

import { useDiscover } from "../../Context/DiscoverContext";

import VideoLoader from "../Common/VideoLoader";

import "./Discover.css";

/*
|--------------------------------------------------------------------------
| ANNOUNCEMENT TYPE CONFIG
|--------------------------------------------------------------------------
*/

const ANNOUNCEMENT_CONFIG = {
  movie_announced: { label: "Announced", icon: Megaphone, color: "#e50914" },
  release_date: { label: "Release Date", icon: CalendarDays, color: "#3b82f6" },
  release_date_changed: {
    label: "Date Changed",
    icon: CalendarClock,
    color: "#f59e0b",
  },
  trailer: { label: "Trailer", icon: Play, color: "#e50914" },
  teaser: { label: "Teaser", icon: Film, color: "#ec4899" },
  poster: { label: "Poster", icon: ImageIcon, color: "#8b5cf6" },
  first_look: { label: "First Look", icon: Eye, color: "#06b6d4" },
  casting: { label: "Casting", icon: Users, color: "#10b981" },
  new_season: { label: "New Season", icon: Tv, color: "#3b82f6" },
  renewed: { label: "Renewed", icon: RefreshCw, color: "#10b981" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "#6b7280" },
  production_started: {
    label: "Production Started",
    icon: Clapperboard,
    color: "#f59e0b",
  },
  production_wrapped: {
    label: "Production Wrapped",
    icon: CheckCircle2,
    color: "#22c55e",
  },
};

const FILTER_GROUPS = [
  { id: "all", label: "All", types: null },
  { id: "trailers", label: "Trailers & Teasers", types: ["trailer", "teaser"] },
  {
    id: "visuals",
    label: "Posters & First Looks",
    types: ["poster", "first_look"],
  },
  { id: "casting", label: "Casting", types: ["casting"] },
  {
    id: "dates",
    label: "Release Dates",
    types: ["release_date", "release_date_changed"],
  },
  {
    id: "production",
    label: "Production",
    types: ["production_started", "production_wrapped"],
  },
];

const TYPE_TABS = [
  { id: "all", label: "All" },
  { id: "movie", label: "Movies" },
  { id: "tv", label: "Shows" },
  { id: "anime", label: "Anime" },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Guards the UI against already-released items slipping into "upcoming",
// regardless of what the backend returns.
function isStillUpcoming(dateStr) {
  if (!dateStr) return true; // no date yet (TBA) still counts as upcoming
  const parsed = new Date(dateStr);
  if (isNaN(parsed)) return true;
  return parsed >= startOfToday();
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - startOfToday()) / 86400000);
  if (diff < 0) return null;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Release date TBA";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Discover() {
  const {
    upcoming,
    trailers,
    announcements,
    loading,
    upcomingPage,
    hasMoreUpcoming,
    fetchUpcoming,
    fetchTrailers,
    fetchAnnouncements,
  } = useDiscover();

  const navigate = useNavigate();

  const [range, setRange] = useState("month");
  const [mediaType, setMediaType] = useState("all");
  const [annFilter, setAnnFilter] = useState("all");
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const upcomingRef = useRef(null);
  const announcementsRef = useRef(null);

  useEffect(() => {
    fetchUpcoming(mediaType, range, 1);
    fetchTrailers(mediaType, range);
    fetchAnnouncements();
  }, [range, mediaType]);

  // Filter out anything already released + sort soonest-first.
  const sortedUpcoming = useMemo(() => {
    return [...upcoming]
      .filter((item) =>
        isStillUpcoming(item.release_date || item.first_air_date),
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.release_date || a.first_air_date || "9999-12-31",
        );
        const dateB = new Date(
          b.release_date || b.first_air_date || "9999-12-31",
        );
        return dateA - dateB;
      });
  }, [upcoming]);

  const heroItem = sortedUpcoming[0];

  const filteredAnnouncements = useMemo(() => {
    if (annFilter === "all") return announcements;
    const group = FILTER_GROUPS.find((g) => g.id === annFilter);
    return announcements.filter((a) =>
      group.types.includes(a.announcementType),
    );
  }, [announcements, annFilter]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await fetchUpcoming(mediaType, range, upcomingPage + 1);
    setLoadingMore(false);
  };

  const jumpTo = (ref, type) => {
    if (type) setMediaType(type);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading && upcoming.length === 0) {
    return <VideoLoader />;
  }

  return (
    <div className="discover-page">
      {/* HERO */}
      <DiscoverHero
        item={heroItem}
        onOpen={(item) => navigate(`/media/${item.media_type}/${item.id}`)}
      />

      {/* SHARED FILTER BAR */}
      <div className="discover-filterbar">
        <div className="discover-type-tabs">
          {TYPE_TABS.map((t) => (
            <button
              key={t.id}
              className={mediaType === t.id ? "active" : ""}
              onClick={() => setMediaType(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="discover-range">
          <button
            className={range === "month" ? "active" : ""}
            onClick={() => setRange("month")}
          >
            This Month
          </button>
          <button
            className={range === "nextMonth" ? "active" : ""}
            onClick={() => setRange("nextMonth")}
          >
            Next Month
          </button>
          <button
            className={range === "year" ? "active" : ""}
            onClick={() => setRange("year")}
          >
            Upcoming
          </button>
        </div>
      </div>

      {/* UPCOMING */}
      <section className="discover-section" ref={upcomingRef}>
        <div className="discover-section-header">
          <div>
            <h2>
              <CalendarDays />
              Coming Soon
            </h2>
            <p>Movies, shows and anime releasing soon.</p>
          </div>
        </div>

        {sortedUpcoming.length === 0 ? (
          <EmptyState text="Nothing upcoming in this window yet." />
        ) : (
          <>
            <div className="discover-media-grid">
              {sortedUpcoming.map((item) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  onClick={() =>
                    navigate(`/media/${item.media_type}/${item.id}`)
                  }
                />
              ))}
            </div>

            {hasMoreUpcoming && (
              <div className="discover-loadmore">
                <button onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? "Loading…" : "Load More"}
                  <ChevronDown size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* TRAILERS */}
      <section className="discover-section">
        <div className="discover-section-header">
          <div>
            <h2>
              <Play />
              New Trailers
            </h2>
            <p>Recently available official trailers.</p>
          </div>
        </div>

        {trailers.length === 0 ? (
          <EmptyState text="No new trailers right now." />
        ) : (
          <div className="trailer-grid">
            {trailers.map((item) => (
              <TrailerCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                onClick={() => setSelectedTrailer(item)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="discover-section" ref={announcementsRef}>
        <div className="discover-section-header">
          <div>
            <h2>
              <Megaphone />
              Latest Announcements
            </h2>
            <p>Trailers, posters, casting news, and release updates.</p>
          </div>
        </div>

        <div className="discover-ann-tabs">
          {FILTER_GROUPS.map((g) => (
            <button
              key={g.id}
              className={annFilter === g.id ? "active" : ""}
              onClick={() => setAnnFilter(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>

        {filteredAnnouncements.length === 0 ? (
          <EmptyState text="No announcements in this category yet." />
        ) : (
          <div className="announcement-list">
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard
                key={announcement._id}
                announcement={announcement}
              />
            ))}
          </div>
        )}
      </section>

      {/* DISCOVERY CATEGORIES (interactive shortcuts) */}
      <section className="discover-feature-grid">
        <FeatureCard
          icon={<Film />}
          title="Upcoming Movies"
          description="See movies scheduled for release."
          onClick={() => jumpTo(upcomingRef, "movie")}
        />
        <FeatureCard
          icon={<Tv />}
          title="Upcoming Shows"
          description="Track upcoming TV series and seasons."
          onClick={() => jumpTo(upcomingRef, "tv")}
        />
        <FeatureCard
          icon={<Sparkles />}
          title="Upcoming Anime"
          description="Discover anime arriving soon."
          onClick={() => jumpTo(upcomingRef, "anime")}
        />
        <FeatureCard
          icon={<ImageIcon />}
          title="New Posters"
          description="See newly revealed visuals and first looks."
          onClick={() => {
            setAnnFilter("visuals");
            announcementsRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />
      </section>

      {/* TRAILER MODAL */}
      <AnimatePresence>
        {selectedTrailer && (
          <TrailerModal
            item={selectedTrailer}
            onClose={() => setSelectedTrailer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| HERO
|--------------------------------------------------------------------------
*/

function DiscoverHero({ item, onOpen }) {
  const title = item?.title || item?.name;
  const backdrop = item?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;
  const countdown = item
    ? daysUntil(item.release_date || item.first_air_date)
    : null;

  return (
    <motion.div
      className="discover-hero"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
    >
      <div className="discover-hero-overlay" />
      <div className="discover-hero-content">
        <span className="discover-label">WATCHHUB · DISCOVER</span>
        <h1>{title || "Discover"}</h1>
        <p>
          {item?.overview
            ? item.overview.slice(0, 180) +
              (item.overview.length > 180 ? "…" : "")
            : "See what's coming next — new announcements, trailers, posters and more."}
        </p>

        {item && (
          <div className="discover-hero-actions">
            {countdown && (
              <span className="discover-hero-countdown">{countdown}</span>
            )}
            <button className="discover-hero-cta" onClick={() => onOpen(item)}>
              View Details
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| MEDIA CARD
|--------------------------------------------------------------------------
*/

function MediaCard({ item, onClick }) {
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const countdown = daysUntil(date);

  return (
    <motion.div
      className="discover-media-card"
      whileHover={{ y: -6 }}
      onClick={onClick}
    >
      <div className="discover-poster">
        {item.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
            alt={title}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">No Poster</div>
        )}

        <span className="media-type-badge">{item.media_type}</span>
        {countdown && <span className="countdown-badge">{countdown}</span>}
      </div>

      <div className="discover-card-info">
        <h3>{title}</h3>
        <span>{formatDate(date)}</span>
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| TRAILER CARD + MODAL
|--------------------------------------------------------------------------
*/

function TrailerCard({ item, onClick }) {
  const title = item.title || item.name;

  return (
    <motion.div
      className="trailer-card"
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="trailer-thumbnail">
        <img
          src={`https://img.youtube.com/vi/${item.trailer.key}/maxresdefault.jpg`}
          alt={title}
          loading="lazy"
        />
        <div className="trailer-play">
          <Play fill="currentColor" />
        </div>
      </div>

      <div className="trailer-info">
        <h3>{title}</h3>
        <span>Official Trailer</span>
      </div>
    </motion.div>
  );
}

function TrailerModal({ item, onClose }) {
  const title = item.title || item.name;

  return (
    <motion.div
      className="trailer-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="trailer-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="trailer-modal-close" onClick={onClose}>
          <X />
        </button>
        <div className="trailer-modal-frame">
          <iframe
            src={`https://www.youtube.com/embed/${item.trailer.key}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <h3>{title}</h3>
      </motion.div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| ANNOUNCEMENT
|--------------------------------------------------------------------------
*/

function AnnouncementCard({ announcement }) {
  const config = ANNOUNCEMENT_CONFIG[announcement.announcementType] || {
    label: announcement.announcementType,
    icon: Megaphone,
    color: "#e50914",
  };
  const Icon = config.icon;
  const [revealed, setRevealed] = useState(!announcement.isSpoiler);

  return (
    <motion.div className="announcement-card" whileHover={{ x: 5 }}>
      <div className="announcement-poster">
        {announcement.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w200${announcement.posterPath}`}
            alt={announcement.title}
          />
        ) : (
          <div />
        )}
      </div>

      <div className="announcement-content">
        <span className="announcement-type" style={{ color: config.color }}>
          <Icon size={13} />
          {config.label}
        </span>

        <h3>{announcement.titleText}</h3>

        {revealed ? (
          <p>{announcement.description}</p>
        ) : (
          <button className="spoiler-toggle" onClick={() => setRevealed(true)}>
            <EyeOff size={14} /> Contains spoilers — tap to reveal
          </button>
        )}

        <span className="announcement-date">
          {new Date(announcement.publishedAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| FEATURE CARD
|--------------------------------------------------------------------------
*/

function FeatureCard({ icon, title, description, onClick }) {
  return (
    <motion.div
      className="discover-feature-card"
      whileHover={{ y: -4 }}
      onClick={onClick}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({ text }) {
  return <div className="discover-empty">{text}</div>;
}
