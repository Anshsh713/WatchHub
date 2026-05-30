import React, { useState } from "react";
import "./Main_News.css";

export default function Main_Page() {
  const [mode, setMode] = useState("News");

  return (
    <div className="main-page">
      <div className="hero-section">
        <h1>Insider</h1>
        <p>
          Stay updated with the latest entertainment news, announcements,
          events, trailers, and industry updates.
        </p>
      </div>

      <div className="mode-toggle">
        <button
          className={mode === "News" ? "active" : ""}
          onClick={() => setMode("News")}
        >
          News
        </button>

        <button
          className={mode === "Events" ? "active" : ""}
          onClick={() => setMode("Events")}
        >
          Events
        </button>
      </div>

      <div className="content">
        {mode === "News" ? (
          <div className="section-placeholder">
            <h2>Latest News</h2>
            <p>Trending movie, TV show, and anime news will appear here.</p>
          </div>
        ) : (
          <div className="section-placeholder">
            <h2>Upcoming Events</h2>
            <p>
              Comic-Con, Anime Expo, premieres, awards, and showcases will
              appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
