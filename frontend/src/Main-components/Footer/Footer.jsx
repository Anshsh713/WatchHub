import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-socials">
          <a href="#" aria-label="Facebook"><Facebook size={24} /></a>
          <a href="#" aria-label="Instagram"><Instagram size={24} /></a>
          <a href="#" aria-label="Twitter"><Twitter size={24} /></a>
          <a href="#" aria-label="Youtube"><Youtube size={24} /></a>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <a href="#">Audio Description</a>
            <a href="#">Investor Relations</a>
            <a href="#">Legal Notices</a>
          </div>
          <div className="footer-column">
            <a href="#">Help Centre</a>
            <a href="#">Jobs</a>
            <a href="#">Cookie Preferences</a>
          </div>
          <div className="footer-column">
            <a href="#">Gift Cards</a>
            <a href="#">Terms of Use</a>
            <a href="#">Corporate Information</a>
          </div>
          <div className="footer-column">
            <a href="#">Media Centre</a>
            <a href="#">Privacy</a>
            <a href="#">Contact Us</a>
          </div>
        </div>

        <div className="footer-bottom">
          <button className="service-code-btn">Service Code</button>
          <p className="copyright">&copy; 2024 WatchHub, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
