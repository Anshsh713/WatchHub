import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Clock,
  Compass,
  MessageSquare,
  Flame,
  Layers,
  ArrowRight,
  Search as SearchIcon,
  Calendar,
  Radio,
  Zap,
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
  movie_announced: { label: "Movie Announced", icon: Megaphone, color: "#e50914" },
  release_date: { label: "Release Date", icon: CalendarDays, color: "#3b82f6" },
  release_date_changed: { label: "Date Changed", icon: CalendarClock, color: "#f59e0b" },
  trailer: { label: "Trailer Released", icon: Play, color: "#e50914" },
  teaser: { label: "Teaser Released", icon: Film, color: "#ec4899" },
  poster: { label: "Poster Released", icon: ImageIcon, color: "#8b5cf6" },
  first_look: { label: "First Look", icon: Eye, color: "#06b6d4" },
  casting: { label: "Casting Announcement", icon: Users, color: "#10b981" },
  new_season: { label: "New Season", icon: Tv, color: "#3b82f6" },
  renewed: { label: "Renewed", icon: RefreshCw, color: "#10b981" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "#ef4444" },
  production_started: { label: "Production Started", icon: Clapperboard, color: "#f59e0b" },
  production_wrapped: { label: "Production Wrapped", icon: CheckCircle2, color: "#22c55e" },
};

const ANNOUNCEMENT_FILTERS = [
  { id: "all", label: "All Updates", types: null },
  { id: "trailers", label: "Trailers & Teasers", types: ["trailer", "teaser"] },
  { id: "visuals", label: "Posters & First Looks", types: ["poster", "first_look"] },
  { id: "dates", label: "Release Dates", types: ["release_date", "release_date_changed"] },
  { id: "casting", label: "Casting", types: ["casting"] },
  { id: "production", label: "Production", types: ["production_started", "production_wrapped"] },
];

/*
|--------------------------------------------------------------------------
| DATE HELPERS
|--------------------------------------------------------------------------
*/
function formatDate(dateStr) {
  if (!dateStr) return "Release date TBA";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Release date TBA";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDayString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

/*
|--------------------------------------------------------------------------
| MAIN DISCOVER COMPONENT
|--------------------------------------------------------------------------
*/
export default function Discover() {
  const {
    releasingToday,
    releasingThisWeek,
    thisMonth,
    nextMonth,
    upcomingMovies,
    upcomingTV,
    upcomingAnime,
    trailers,
    announcements,
    visuals,
    dateChanges,
    calendarResults,
    selectedCalendarDate,
    franchiseUpdates,
    isPersonalizedFranchises,
    discussions,
    initialLoading,
    loadingToday,
    loadingWeek,
    loadingThisMonth,
    loadingNextMonth,
    loadingTrailers,
    loadingAnnouncements,
    loadingCalendar,
    fetchReleasingToday,
    fetchReleasingThisWeek,
    fetchThisMonth,
    fetchNextMonth,
    fetchAnnouncements,
    fetchCalendar,
    loadAllDiscoverData,
  } = useDiscover();

  const navigate = useNavigate();

  // Filter states
  const [todayFilter, setTodayFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [thisMonthFilter, setThisMonthFilter] = useState("all");
  const [nextMonthFilter, setNextMonthFilter] = useState("all");
  const [annFilter, setAnnFilter] = useState("all");
  const [annSearch, setAnnSearch] = useState("");
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [selectedVisual, setSelectedVisual] = useState(null);

  // Section Refs
  const todayRef = useRef(null);
  const weekRef = useRef(null);
  const thisMonthRef = useRef(null);
  const nextMonthRef = useRef(null);
  const moviesRef = useRef(null);
  const tvRef = useRef(null);
  const animeRef = useRef(null);
  const trailersRef = useRef(null);
  const announcementsRef = useRef(null);
  const visualsRef = useRef(null);
  const dateChangesRef = useRef(null);
  const calendarRef = useRef(null);
  const franchiseRef = useRef(null);
  const discussionsRef = useRef(null);

  // On mount, load all discover data
  useEffect(() => {
    loadAllDiscoverData();
  }, [loadAllDiscoverData]);

  const handleTodayFilterChange = (type) => {
    setTodayFilter(type);
    fetchReleasingToday(type);
  };

  const handleWeekFilterChange = (type) => {
    setWeekFilter(type);
    fetchReleasingThisWeek(type);
  };

  const handleThisMonthFilterChange = (type) => {
    setThisMonthFilter(type);
    fetchThisMonth(type);
  };

  const handleNextMonthFilterChange = (type) => {
    setNextMonthFilter(type);
    fetchNextMonth(type);
  };

  const handleAnnFilterChange = (filterId) => {
    setAnnFilter(filterId);
    const group = ANNOUNCEMENT_FILTERS.find((f) => f.id === filterId);
    const typeQuery = group?.types ? group.types.join(",") : null;
    fetchAnnouncements(typeQuery, annSearch);
  };

  const handleAnnSearch = (e) => {
    const query = e.target.value;
    setAnnSearch(query);
    const group = ANNOUNCEMENT_FILTERS.find((f) => f.id === annFilter);
    const typeQuery = group?.types ? group.types.join(",") : null;
    fetchAnnouncements(typeQuery, query);
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Hero Item: Top featured upcoming release
  const heroItem = useMemo(() => {
    if (releasingToday && releasingToday.length > 0) return releasingToday[0];
    if (releasingThisWeek && releasingThisWeek.length > 0) return releasingThisWeek[0];
    if (thisMonth && thisMonth.length > 0) return thisMonth[0];
    if (upcomingMovies && upcomingMovies.length > 0) return upcomingMovies[0];
    return null;
  }, [releasingToday, releasingThisWeek, thisMonth, upcomingMovies]);

  if (initialLoading) {
    return (
      <div className="discover-loading-screen">
        <VideoLoader />
      </div>
    );
  }

  return (
    <div className="discover-page">
      {/* 1. HERO SECTION */}
      <DiscoverHero
        item={heroItem}
        onNavigate={(item) => navigate(`/media/${item.media_type || "movie"}/${item.id}`)}
      />

      {/* QUICK SECTION NAVIGATION STRIP */}
      <div className="discover-nav-strip">
        <button onClick={() => scrollToSection(todayRef)}>
          <Radio size={15} /> Releasing Today
        </button>
        <button onClick={() => scrollToSection(weekRef)}>
          <Zap size={15} /> Releasing This Week
        </button>
        <button onClick={() => scrollToSection(thisMonthRef)}>
          <CalendarDays size={15} /> This Month
        </button>
        <button onClick={() => scrollToSection(nextMonthRef)}>
          <CalendarClock size={15} /> Next Month
        </button>
        <button onClick={() => scrollToSection(moviesRef)}>
          <Film size={15} /> Upcoming Movies (2+ Months)
        </button>
        <button onClick={() => scrollToSection(tvRef)}>
          <Tv size={15} /> Upcoming TV (2+ Months)
        </button>
        <button onClick={() => scrollToSection(animeRef)}>
          <Sparkles size={15} /> Upcoming Anime (2+ Months)
        </button>
        <button onClick={() => scrollToSection(trailersRef)}>
          <Play size={15} /> Trailers
        </button>
        <button onClick={() => scrollToSection(announcementsRef)}>
          <Megaphone size={15} /> Announcements
        </button>
        <button onClick={() => scrollToSection(visualsRef)}>
          <ImageIcon size={15} /> First Looks
        </button>
        <button onClick={() => scrollToSection(dateChangesRef)}>
          <Clock size={15} /> Date Changes
        </button>
        <button onClick={() => scrollToSection(calendarRef)}>
          <Calendar size={15} /> Calendar
        </button>
        <button onClick={() => scrollToSection(franchiseRef)}>
          <Layers size={15} /> Franchises
        </button>
        <button onClick={() => scrollToSection(discussionsRef)}>
          <MessageSquare size={15} /> Community
        </button>
      </div>

      <div className="discover-content-wrap">
        {/* ===================================================================
            1. RELEASING TODAY
        =================================================================== */}
        <section className="discover-section" ref={todayRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge red live-pulse">
                <Radio size={20} />
              </span>
              <div>
                <h2>Releasing Today</h2>
                <p>New movies, fresh television episodes, and anime premiering today.</p>
              </div>
            </div>

            <div className="discover-filter-pills">
              {["all", "movie", "tv", "anime"].map((type) => (
                <button
                  key={type}
                  className={todayFilter === type ? "active" : ""}
                  onClick={() => handleTodayFilterChange(type)}
                >
                  {type === "all"
                    ? "All"
                    : type === "movie"
                      ? "Movies"
                      : type === "tv"
                        ? "TV Shows"
                        : "Anime"}
                </button>
              ))}
            </div>
          </div>

          <HorizontalMediaSlider
            items={releasingToday}
            loading={loadingToday}
            emptyMessage="No major titles premiering today."
            onItemClick={(item) =>
              navigate(`/media/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)
            }
          />
        </section>

        {/* ===================================================================
            2. RELEASING THIS WEEK
        =================================================================== */}
        <section className="discover-section" ref={weekRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge amber">
                <Zap size={20} />
              </span>
              <div>
                <h2>Releasing This Week</h2>
                <p>Releases scheduled across the next 7 days.</p>
              </div>
            </div>

            <div className="discover-filter-pills">
              {["all", "movie", "tv", "anime"].map((type) => (
                <button
                  key={type}
                  className={weekFilter === type ? "active" : ""}
                  onClick={() => handleWeekFilterChange(type)}
                >
                  {type === "all"
                    ? "All"
                    : type === "movie"
                      ? "Movies"
                      : type === "tv"
                        ? "TV Shows"
                        : "Anime"}
                </button>
              ))}
            </div>
          </div>

          <HorizontalMediaSlider
            items={releasingThisWeek}
            loading={loadingWeek}
            emptyMessage="No titles scheduled for this 7-day window."
            onItemClick={(item) =>
              navigate(`/media/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)
            }
          />
        </section>

        {/* ===================================================================
            3. COMING THIS MONTH (In Descending Order: 31 days to today)
        =================================================================== */}
        <section className="discover-section" ref={thisMonthRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge red">
                <CalendarDays size={20} />
              </span>
              <div>
                <h2>Coming This Month</h2>
                <p>Upcoming releases landing across cinema and streaming this month.</p>
              </div>
            </div>

            <div className="discover-filter-pills">
              {["all", "movie", "tv", "anime"].map((type) => (
                <button
                  key={type}
                  className={thisMonthFilter === type ? "active" : ""}
                  onClick={() => handleThisMonthFilterChange(type)}
                >
                  {type === "all"
                    ? "All"
                    : type === "movie"
                      ? "Movies"
                      : type === "tv"
                        ? "TV Shows"
                        : "Anime"}
                </button>
              ))}
            </div>
          </div>

          <HorizontalMediaSlider
            items={thisMonth}
            loading={loadingThisMonth}
            onItemClick={(item) =>
              navigate(`/media/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)
            }
          />
        </section>

        {/* ===================================================================
            4. COMING NEXT MONTH (In Descending Order)
        =================================================================== */}
        <section className="discover-section" ref={nextMonthRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge blue">
                <CalendarClock size={20} />
              </span>
              <div>
                <h2>Coming Next Month</h2>
                <p>Curated movies, shows, and anime releasing in the upcoming calendar month.</p>
              </div>
            </div>

            <div className="discover-filter-pills">
              {["all", "movie", "tv", "anime"].map((type) => (
                <button
                  key={type}
                  className={nextMonthFilter === type ? "active" : ""}
                  onClick={() => handleNextMonthFilterChange(type)}
                >
                  {type === "all"
                    ? "All"
                    : type === "movie"
                      ? "Movies"
                      : type === "tv"
                        ? "TV Shows"
                        : "Anime"}
                </button>
              ))}
            </div>
          </div>

          <HorizontalMediaSlider
            items={nextMonth}
            loading={loadingNextMonth}
            onItemClick={(item) =>
              navigate(`/media/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)
            }
          />
        </section>

        {/* ===================================================================
            5. UPCOMING MOVIES (2+ Months Ahead)
        =================================================================== */}
        <section className="discover-section" ref={moviesRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge amber">
                <Film size={20} />
              </span>
              <div>
                <h2>Upcoming Movies (Coming Soon)</h2>
                <p>Major theatrical blockbusters releasing more than 2 months from now.</p>
              </div>
            </div>
            <Link to="/explore/genres" className="discover-view-all">
              Explore All Movies <ChevronRight size={16} />
            </Link>
          </div>

          <HorizontalMediaSlider
            items={upcomingMovies}
            onItemClick={(item) => navigate(`/media/movie/${item.id}`)}
          />
        </section>

        {/* ===================================================================
            6. UPCOMING TV SHOWS (2+ Months Ahead)
        =================================================================== */}
        <section className="discover-section" ref={tvRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge purple">
                <Tv size={20} />
              </span>
              <div>
                <h2>Upcoming TV Shows & New Seasons (Coming Soon)</h2>
                <p>Future series debuts and announced seasons scheduled 2+ months out.</p>
              </div>
            </div>
          </div>

          <HorizontalMediaSlider
            items={upcomingTV}
            onItemClick={(item) => navigate(`/media/tv/${item.id}`)}
          />
        </section>

        {/* ===================================================================
            7. UPCOMING ANIME (2+ Months Ahead)
        =================================================================== */}
        <section className="discover-section" ref={animeRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge pink">
                <Sparkles size={20} />
              </span>
              <div>
                <h2>Upcoming Anime (Coming Soon)</h2>
                <p>Future anime seasons, manga adaptations, and theatrical films.</p>
              </div>
            </div>
            <Link to="/explore/anime" className="discover-view-all">
              Explore Anime Hub <ChevronRight size={16} />
            </Link>
          </div>

          <HorizontalMediaSlider
            items={upcomingAnime}
            onItemClick={(item) => navigate(`/media/anime/${item.id}`)}
          />
        </section>

        {/* ===================================================================
            8. LATEST ANNOUNCEMENTS (WatchHub Announcement System)
        =================================================================== */}
        <section className="discover-section" ref={announcementsRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge red">
                <Megaphone size={20} />
              </span>
              <div>
                <h2>Latest Announcements</h2>
                <p>Direct industry updates, casting news, greenlit sequels, and official releases.</p>
              </div>
            </div>

            <div className="discover-ann-search-wrap">
              <SearchIcon size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={annSearch}
                onChange={handleAnnSearch}
              />
            </div>
          </div>

          <div className="discover-ann-filter-bar">
            {ANNOUNCEMENT_FILTERS.map((f) => (
              <button
                key={f.id}
                className={annFilter === f.id ? "active" : ""}
                onClick={() => handleAnnFilterChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loadingAnnouncements ? (
            <div className="discover-cards-loading">Loading announcements...</div>
          ) : announcements.length === 0 ? (
            <div className="discover-empty-state">
              <Megaphone size={36} />
              <p>No announcements found for this filter.</p>
            </div>
          ) : (
            <div className="announcements-grid">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id || announcement.titleText}
                  announcement={announcement}
                  onPosterClick={(a) => setSelectedVisual(a)}
                  onPlayTrailer={(key) =>
                    setSelectedTrailer({
                      title: announcement.title,
                      trailer: { key },
                    })
                  }
                />
              ))}
            </div>
          )}
        </section>

        {/* ===================================================================
            9. NEW TRAILERS
        =================================================================== */}
        <section className="discover-section" ref={trailersRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge red">
                <Play size={20} />
              </span>
              <div>
                <h2>New Trailers & Teasers</h2>
                <p>Fresh official previews and teaser trailers for upcoming releases.</p>
              </div>
            </div>
          </div>

          {loadingTrailers ? (
            <div className="discover-cards-loading">Loading trailers...</div>
          ) : trailers.length === 0 ? (
            <div className="discover-empty-state">
              <Play size={36} />
              <p>No new trailers available at this moment.</p>
            </div>
          ) : (
            <div className="trailers-grid">
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

        {/* ===================================================================
            10. NEW POSTERS / FIRST LOOKS
        =================================================================== */}
        <section className="discover-section" ref={visualsRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge purple">
                <ImageIcon size={20} />
              </span>
              <div>
                <h2>New Posters & First Looks</h2>
                <p>High-resolution teaser posters, key visuals, and production snapshots.</p>
              </div>
            </div>
          </div>

          <div className="visuals-grid">
            {visuals.map((visual) => (
              <motion.div
                key={visual._id}
                className="visual-card"
                whileHover={{ y: -6, scale: 1.02 }}
                onClick={() => setSelectedVisual(visual)}
              >
                <div className="visual-image-wrap">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${visual.posterPath}`}
                    alt={visual.title}
                    loading="lazy"
                  />
                  <div className="visual-overlay">
                    <span className="visual-badge">
                      {visual.announcementType === "first_look"
                        ? "First Look"
                        : visual.announcementType === "teaser"
                          ? "Teaser Visual"
                          : "Official Poster"}
                    </span>
                    <h4>{visual.title}</h4>
                    <span className="visual-date">
                      {new Date(visual.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            11. RELEASE DATE CHANGES
        =================================================================== */}
        <section className="discover-section" ref={dateChangesRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge amber">
                <Clock size={20} />
              </span>
              <div>
                <h2>Release Date Changes</h2>
                <p>Tracking schedule adjustments, postponed premieres, and expedited releases.</p>
              </div>
            </div>
          </div>

          <div className="date-changes-grid">
            {dateChanges.map((item) => (
              <motion.div
                key={item._id}
                className="date-change-card"
                whileHover={{ y: -4 }}
              >
                <div className="date-change-poster">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                      alt={item.title}
                    />
                  ) : (
                    <div className="poster-placeholder">No Poster</div>
                  )}
                </div>

                <div className="date-change-info">
                  <div className="date-change-status-pill">
                    <span
                      className={`status-tag ${
                        item.changeStatus === "Delayed"
                          ? "delayed"
                          : item.changeStatus === "Moved Earlier"
                            ? "earlier"
                            : "tba"
                      }`}
                    >
                      {item.changeStatus || "Date Changed"}
                    </span>
                    <span className="date-change-type">{item.mediaType?.toUpperCase()}</span>
                  </div>

                  <h3>{item.title}</h3>

                  <div className="date-comparison">
                    <div className="date-box prev">
                      <span className="label">Previous Date</span>
                      <span className="date-val">
                        {item.previousReleaseDate
                          ? formatDate(item.previousReleaseDate)
                          : "Unscheduled"}
                      </span>
                    </div>

                    <ArrowRight size={18} className="arrow-icon" />

                    <div className="date-box next">
                      <span className="label">New Target Date</span>
                      <span className="date-val">
                        {item.releaseDate ? formatDate(item.releaseDate) : "TBA"}
                      </span>
                    </div>
                  </div>

                  <p className="date-change-desc">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            12. RELEASE CALENDAR
        =================================================================== */}
        <section className="discover-section" ref={calendarRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge green">
                <Calendar size={20} />
              </span>
              <div>
                <h2>Release Calendar</h2>
                <p>Pick any day to discover exact movie premieres and television broadcasts.</p>
              </div>
            </div>

            <div className="calendar-date-input-wrap">
              <input
                type="date"
                value={selectedCalendarDate}
                onChange={(e) => fetchCalendar(e.target.value)}
              />
            </div>
          </div>

          {/* Quick 7-day strip */}
          <div className="calendar-days-strip">
            {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map((offset) => {
              const dayStr = getDayString(offset);
              const dateObj = new Date(dayStr);
              const isSelected = selectedCalendarDate === dayStr;
              const isToday = offset === 0;

              return (
                <button
                  key={dayStr}
                  className={`cal-day-btn ${isSelected ? "selected" : ""} ${isToday ? "today" : ""}`}
                  onClick={() => fetchCalendar(dayStr)}
                >
                  <span className="cal-weekday">
                    {dateObj.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span className="cal-daynum">{dateObj.getDate()}</span>
                  <span className="cal-month">
                    {dateObj.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                  {isToday && <span className="today-badge">TODAY</span>}
                </button>
              );
            })}
          </div>

          <div className="calendar-results-container">
            <div className="calendar-results-header">
              <h3>
                Releasing on{" "}
                {new Date(selectedCalendarDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <span className="results-count-pill">
                {calendarResults.length} {calendarResults.length === 1 ? "Title" : "Titles"}
              </span>
            </div>

            {loadingCalendar ? (
              <div className="discover-cards-loading">Fetching releases for selected date...</div>
            ) : calendarResults.length === 0 ? (
              <div className="discover-empty-state">
                <CalendarDays size={36} />
                <p>No major titles are scheduled to release on this specific date.</p>
              </div>
            ) : (
              <div className="calendar-grid">
                {calendarResults.map((item) => (
                  <motion.div
                    key={`${item.media_type}-${item.id}`}
                    className="calendar-card"
                    whileHover={{ y: -4 }}
                    onClick={() =>
                      navigate(`/media/${item.media_type || "movie"}/${item.id}`)
                    }
                  >
                    <div className="cal-poster">
                      {item.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title || item.name}
                        />
                      ) : (
                        <div className="poster-placeholder">No Image</div>
                      )}
                      <span className="media-type-badge">{item.media_type}</span>
                    </div>

                    <div className="cal-info">
                      <h4>{item.title || item.name}</h4>
                      <p className="cal-overview">
                        {item.overview
                          ? item.overview.slice(0, 100) + "..."
                          : "No synopsis available yet."}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================================
            13. FOLLOWED FRANCHISE UPDATES
        =================================================================== */}
        <section className="discover-section" ref={franchiseRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge blue">
                <Layers size={20} />
              </span>
              <div>
                <h2>
                  {isPersonalizedFranchises
                    ? "Updates from Your Followed Franchises"
                    : "Franchise Spotlight & Updates"}
                </h2>
                <p>
                  {isPersonalizedFranchises
                    ? "New announcements, trailers, and dates for sagas you follow."
                    : "Stay up to date with major movie & TV franchises."}
                </p>
              </div>
            </div>

            <Link to="/explore/franchise" className="discover-view-all">
              All Franchises <ChevronRight size={16} />
            </Link>
          </div>

          <div className="franchise-updates-grid">
            {franchiseUpdates.map((item) => (
              <motion.div
                key={item._id}
                className="franchise-update-card"
                whileHover={{ y: -4 }}
              >
                <div className="franchise-card-header">
                  {item.franchise?.logo ? (
                    <img
                      src={item.franchise.logo}
                      alt={item.franchise?.name || "Franchise"}
                      className="franchise-logo"
                    />
                  ) : (
                    <span className="franchise-name-badge">
                      {item.franchise?.name || item.franchiseSlug || "Universe"}
                    </span>
                  )}
                  <span className="franchise-ann-type">
                    {item.announcementType?.replace("_", " ")}
                  </span>
                </div>

                <div className="franchise-card-body">
                  <div className="franchise-media-thumb">
                    {item.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                        alt={item.title}
                      />
                    ) : (
                      <div className="poster-placeholder" />
                    )}
                  </div>

                  <div className="franchise-media-info">
                    <h4>{item.titleText}</h4>
                    <p>{item.description}</p>
                    <div className="franchise-card-meta">
                      {item.releaseDate && (
                        <span>Release: {formatDate(item.releaseDate)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            14. TRENDING DISCUSSIONS
        =================================================================== */}
        <section className="discover-section" ref={discussionsRef}>
          <div className="discover-section-header">
            <div className="section-title-wrap">
              <span className="section-icon-badge red">
                <MessageSquare size={20} />
              </span>
              <div>
                <h2>Trending Discussions for Upcoming Titles</h2>
                <p>Join the conversation with other fans anticipating upcoming releases.</p>
              </div>
            </div>
            <Link to="/community" className="discover-view-all">
              WatchHub Community <ChevronRight size={16} />
            </Link>
          </div>

          <div className="discussions-grid">
            {discussions.map((disc) => (
              <motion.div
                key={disc.id}
                className="discussion-card"
                whileHover={{ y: -4 }}
              >
                <div className="discussion-top">
                  <div className="discussion-media-header">
                    <img
                      src={`https://image.tmdb.org/t/p/w200${disc.posterPath}`}
                      alt={disc.title}
                      className="discussion-poster"
                    />
                    <div>
                      <span className="discussion-type-tag">UPCOMING {disc.mediaType?.toUpperCase()}</span>
                      <h3>{disc.title}</h3>
                      <div className="discussion-counters">
                        <span>
                          <MessageSquare size={14} /> {disc.totalDiscussions} Discussions
                        </span>
                        <span>
                          <Flame size={14} /> {disc.totalReactions} Reactions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="discussion-topic-box">
                  <span className="topic-label">TRENDING TOPIC</span>
                  <p className="topic-text">"{disc.trendingTopic}"</p>
                </div>

                <div className="discussion-comments">
                  {disc.recentComments?.map((c, idx) => (
                    <div key={idx} className="comment-bubble">
                      <img src={c.avatar} alt={c.user} className="comment-avatar" />
                      <div className="comment-body">
                        <div className="comment-user-row">
                          <span className="comment-author">{c.user}</span>
                          <span className="comment-rating-badge perfection">
                            {c.rating}
                          </span>
                          <span className="comment-time">{c.time}</span>
                        </div>
                        <p className="comment-msg">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="join-discussion-btn"
                  onClick={() => navigate(`/media/${disc.mediaType}/${disc.mediaId}`)}
                >
                  Join the Discussion <ArrowRight size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* ===================================================================
          MODALS: TRAILER MODAL & VISUAL LIGHTBOX
      =================================================================== */}
      <AnimatePresence>
        {selectedTrailer && (
          <TrailerModal
            item={selectedTrailer}
            onClose={() => setSelectedTrailer(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedVisual && (
          <VisualModal
            visual={selectedVisual}
            onClose={() => setSelectedVisual(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| DISCOVER HERO COMPONENT
|--------------------------------------------------------------------------
*/
function DiscoverHero({ item, onNavigate }) {
  const title = item?.title || item?.name || "Discover Upcoming Releases";
  const backdrop = item?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null;
  const date = item?.release_date || item?.first_air_date;

  return (
    <motion.div
      className="discover-hero"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={backdrop ? { backgroundImage: `url(${backdrop})` } : undefined}
    >
      <div className="discover-hero-overlay" />
      <div className="discover-hero-content">
        <div className="discover-hero-badge-row">
          <span className="discover-badge-highlight">WATCHHUB · DISCOVER</span>
        </div>

        <h1>{title}</h1>

        <p className="discover-hero-overview">
          {item?.overview
            ? item.overview.slice(0, 220) + (item.overview.length > 220 ? "…" : "")
            : "Explore what's arriving next across cinema, television, and anime — official announcements, trailers, posters, and release dates."}
        </p>

        {item && (
          <div className="discover-hero-actions">
            <button className="discover-hero-cta" onClick={() => onNavigate(item)}>
              <Compass size={18} /> View Details
            </button>
            <span className="discover-hero-date">
              <CalendarDays size={16} /> {formatDate(date)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| HORIZONTAL MEDIA SLIDER (No countdown pill on cards, abundant items)
|--------------------------------------------------------------------------
*/
function HorizontalMediaSlider({ items = [], loading = false, emptyMessage, onItemClick }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount =
        direction === "left"
          ? -scrollRef.current.clientWidth * 0.75
          : scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="discover-empty-state mini">
        <p>{emptyMessage || "No titles available in this category."}</p>
      </div>
    );
  }

  return (
    <div className="discover-slider-wrapper">
      <button
        className={`slider-arrow-btn prev ${!canScrollLeft ? "disabled" : ""}`}
        onClick={() => handleScroll("left")}
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="discover-slider-track" ref={scrollRef} onScroll={checkScroll}>
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="discover-media-card-wrap skeleton-card">
                <div className="discover-media-card skeleton-pulse" />
              </div>
            ))
          : items.map((item) => {
              const date = item.release_date || item.first_air_date;
              const title = item.title || item.name;

              return (
                <div
                  key={`${item.media_type}-${item.id}`}
                  className="discover-media-card-wrap"
                  onClick={() => onItemClick(item)}
                >
                  <motion.div
                    className="discover-media-card"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                        alt={title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="poster-placeholder">
                        <span>🎬</span>
                        <span>{title}</span>
                      </div>
                    )}

                    <div className="discover-card-badges">
                      <span className="media-type-badge">
                        {item.media_type === "movie"
                          ? "Movie"
                          : item.media_type === "anime"
                            ? "Anime"
                            : "TV Series"}
                      </span>
                    </div>

                    <div className="discover-card-info">
                      <h4>{title}</h4>
                      <p className="discover-card-date">{formatDate(date)}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
      </div>

      <button
        className={`slider-arrow-btn next ${!canScrollRight ? "disabled" : ""}`}
        onClick={() => handleScroll("right")}
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ANNOUNCEMENT CARD
|--------------------------------------------------------------------------
*/
function AnnouncementCard({ announcement, onPosterClick, onPlayTrailer }) {
  const config =
    ANNOUNCEMENT_CONFIG[announcement.announcementType] || {
      label: announcement.announcementType?.replace("_", " "),
      icon: Megaphone,
      color: "#e50914",
    };
  const Icon = config.icon;
  const [revealed, setRevealed] = useState(!announcement.isSpoiler);

  return (
    <motion.div className="announcement-card" whileHover={{ y: -3 }}>
      <div
        className="announcement-poster-wrap"
        onClick={() => announcement.posterPath && onPosterClick(announcement)}
      >
        {announcement.posterPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${announcement.posterPath}`}
            alt={announcement.title}
          />
        ) : (
          <div className="poster-placeholder">
            <Megaphone size={24} />
          </div>
        )}
      </div>

      <div className="announcement-details">
        <div className="announcement-meta-row">
          <span className="ann-type-tag" style={{ color: config.color }}>
            <Icon size={14} />
            {config.label}
          </span>
          <span className="ann-date">
            {new Date(announcement.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h3>{announcement.titleText}</h3>

        {revealed ? (
          <p className="ann-desc">{announcement.description}</p>
        ) : (
          <button className="spoiler-toggle-btn" onClick={() => setRevealed(true)}>
            <EyeOff size={15} /> Spoiler protection active — click to reveal
          </button>
        )}

        <div className="announcement-actions-row">
          {announcement.trailerKey && (
            <button
              className="ann-trailer-btn"
              onClick={() => onPlayTrailer(announcement.trailerKey)}
            >
              <Play size={14} /> Watch Trailer
            </button>
          )}

          {announcement.releaseDate && (
            <span className="ann-release-tag">
              Target: {formatDate(announcement.releaseDate)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| TRAILER CARD
|--------------------------------------------------------------------------
*/
function TrailerCard({ item, onClick }) {
  const title = item.title || item.name;

  return (
    <motion.div className="trailer-card" whileHover={{ y: -5 }} onClick={onClick}>
      <div className="trailer-thumb-container">
        <img
          src={`https://img.youtube.com/vi/${item.trailer.key}/hqdefault.jpg`}
          alt={title}
          loading="lazy"
        />
        <div className="trailer-play-overlay">
          <span className="play-circle">
            <Play size={24} fill="currentColor" />
          </span>
        </div>
        <span className="trailer-official-badge">Official Trailer</span>
      </div>

      <div className="trailer-card-info">
        <h4>{title}</h4>
        <div className="trailer-meta">
          <span className="media-type-pill">{item.media_type?.toUpperCase()}</span>
          {item.release_date && <span>{formatDate(item.release_date)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| TRAILER MODAL
|--------------------------------------------------------------------------
*/
function TrailerModal({ item, onClose }) {
  const title = item.title || item.name;

  return (
    <motion.div
      className="discover-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="discover-trailer-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="iframe-responsive-wrap">
          <iframe
            src={`https://www.youtube.com/embed/${item.trailer.key}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="modal-info-footer">
          <h3>{title}</h3>
          <span className="modal-trailer-tag">Official High-Definition Trailer</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| VISUAL LIGHTBOX MODAL
|--------------------------------------------------------------------------
*/
function VisualModal({ visual, onClose }) {
  return (
    <motion.div
      className="discover-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="discover-visual-modal"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <X size={22} />
        </button>

        <div className="visual-modal-image">
          <img
            src={`https://image.tmdb.org/t/p/original${visual.posterPath}`}
            alt={visual.title}
          />
        </div>

        <div className="visual-modal-details">
          <span className="visual-modal-badge">
            {visual.announcementType?.replace("_", " ").toUpperCase()}
          </span>
          <h3>{visual.title}</h3>
          <p>{visual.description}</p>
          <div className="visual-modal-meta">
            <span>Published: {new Date(visual.publishedAt).toLocaleDateString()}</span>
            {visual.releaseDate && <span>Release: {formatDate(visual.releaseDate)}</span>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
