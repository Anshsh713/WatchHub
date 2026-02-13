import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { useMedia } from "../../Context/MediaContext";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const { currentType } = useMedia();

  // Determine theme class based on currentType
  let themeClass = "";
  if (currentType === "movie") themeClass = "theme-movie";
  else if (currentType === "tv") themeClass = "theme-tv";
  else if (currentType === "anime") themeClass = "theme-anime";

  return (
    <footer className={`footer ${themeClass}`}>
      <div className="container footer-container">
        <div className="footer-top">
          <Link to="/home" className="logo">
            Watch<span className="logo-accent">Hub</span>
          </Link>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="Instagram">
              <Instagram size={24} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={24} />
            </a>
            <a href="#" aria-label="Youtube">
              <Youtube size={24} />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Browse</h4>
            <a href="#">New & Popular</a>
            <a href="#">Movies</a>
            <a href="#">TV Shows</a>
            <a href="#">Anime</a>
          </div>
          <div className="footer-column">
            <h4>Help</h4>
            <a href="#">FAQ</a>
            <a href="#">Help Centre</a>
            <a href="#">Account</a>
            <a href="#">Media Centre</a>
          </div>
          <div className="footer-column">
            <h4>Legal</h4>
            <a href="#">Privacy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Cookie Preferences</a>
            <a href="#">Corporate Information</a>
          </div>
          <div className="footer-column">
            <h4>More</h4>
            <a href="#">Gift Cards</a>
            <a href="#">Redeem</a>
            <a href="#">Jobs</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer-bottom">
          <button className="service-code-btn">Service Code</button>
          <div className="copyright-area">
            <p className="copyright">
              &copy; {new Date().getFullYear()} WatchHub, Inc.
            </p>
            <p className="disclaimer">Designed for cinematic experience.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
