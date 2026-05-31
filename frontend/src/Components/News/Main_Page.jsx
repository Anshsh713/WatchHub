import React, { useState, useEffect } from "react";
import News_Page from "./News_Page";
import { 
  Globe, 
  Film, 
  Tv, 
  Sparkles, 
  Gamepad, 
  Search,
  Calendar,
  Clock,
  MapPin,
  Flame
} from "lucide-react";
import "./Main_News.css";

const EVENTS_DATA = [
  {
    id: 1,
    title: "Summer Game Fest 2026",
    date: "June 5 - June 8, 2026",
    location: "Los Angeles, CA & Online",
    category: "game",
    description: "The global celebration of the future of video games. Expect world premieres, gameplay reveals, and developer showcases from the world's leading studios.",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop",
    link: "https://www.summergamefest.com"
  },
  {
    id: 2,
    title: "Anime Expo 2026",
    date: "July 2 - July 5, 2026",
    location: "Los Angeles Convention Center",
    category: "anime",
    description: "North America's largest anime convention, bringing together fans and industry leaders for panel discussions, exclusive merchandise, cosplay, and major studio announcements.",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop",
    link: "https://www.anime-expo.org"
  },
  {
    id: 3,
    title: "San Diego Comic-Con 2026",
    date: "July 23 - July 26, 2026",
    location: "San Diego Convention Center",
    category: "movie",
    description: "The ultimate pop culture event. Comic-Con will feature massive movie studio panels, comic industry celebrations, television show exclusive previews, and artist showcases.",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
    link: "https://www.comic-con.org"
  },
  {
    id: 4,
    title: "Emmy Awards 2026",
    date: "September 20, 2026",
    location: "Peacock Theater, Los Angeles",
    category: "show",
    description: "Honoring excellence in American prime-time television programming. Witness the highest achievements in television design, acting, writing, and production.",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop",
    link: "https://www.emmys.com"
  },
  {
    id: 5,
    title: "The Game Awards 2026",
    date: "December 10, 2026",
    location: "Peacock Theater, Los Angeles",
    category: "game",
    description: "The gaming industry's biggest night. Celebrate the best games of the year alongside world premieres of upcoming titles, musical performances, and special guests.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop",
    link: "https://thegameawards.com"
  }
];

export default function Main_Page() {
  const [mode, setMode] = useState("News");
  const [category, setCategory] = useState("all");
  const [searchVal, setSearchVal] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  // Simple debounce for search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchDebounced(searchVal);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchVal]);

  const categories = [
    { id: "all", label: "All News", icon: Globe },
    { id: "movie", label: "Movies", icon: Film },
    { id: "show", label: "TV Shows", icon: Tv },
    { id: "anime", label: "Anime", icon: Flame },
    { id: "game", label: "Gaming", icon: Gamepad },
  ];

  return (
    <div className="main-page">
      <div className="hero-section">
        <div className="hero-badge">WATCHHUB INSIDER</div>
        <h1 className="text-gradient">Entertainment News</h1>
        <p>
          Your premium gateway to the latest scoops, blockbuster reveals, gaming updates, anime releases, and critical events in the entertainment industry.
        </p>
      </div>

      <div className="insider-controls">
        <div className="mode-toggle">
          <button
            className={mode === "News" ? "active" : ""}
            onClick={() => setMode("News")}
          >
            <Clock size={18} style={{ marginRight: "8px" }} />
            Latest Scoop
          </button>

          <button
            className={mode === "Events" ? "active" : ""}
            onClick={() => setMode("Events")}
          >
            <Calendar size={18} style={{ marginRight: "8px" }} />
            Major Events
          </button>
        </div>

        {mode === "News" && (
          <div className="search-bar-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search news articles..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="news-search-input"
            />
            {searchVal && (
              <button className="clear-search" onClick={() => setSearchVal("")}>
                &times;
              </button>
            )}
          </div>
        )}
      </div>

      {mode === "News" && (
        <div className="category-filter-bar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                className={`category-pill ${category === cat.id ? "active" : ""}`}
                onClick={() => setCategory(cat.id)}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="content-container">
        {mode === "News" ? (
          <News_Page category={category} searchQuery={searchDebounced} />
        ) : (
          <div className="events-timeline">
            <div className="timeline-header">
              <h2>Upcoming Industry Showcases</h2>
              <p>Mark your calendars for the biggest premieres, conferences, and award ceremonies of the year.</p>
            </div>
            
            <div className="timeline-grid">
              {EVENTS_DATA.map((event) => (
                <div key={event.id} className={`event-card border-${event.category}`}>
                  <div className="event-image-container">
                    <img src={event.image} alt={event.title} className="event-image" />
                    <span className={`event-badge badge-${event.category}`}>
                      {event.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="event-details">
                    <h3 className="event-title">{event.title}</h3>
                    
                    <div className="event-meta">
                      <div className="meta-item">
                        <Calendar size={14} />
                        <span>{event.date}</span>
                      </div>
                      <div className="meta-item">
                        <MapPin size={14} />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="event-description">{event.description}</p>
                    
                    <a href={event.link} target="_blank" rel="noopener noreferrer" className="event-btn">
                      Visit Official Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
