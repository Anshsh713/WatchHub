import React, { useState } from "react";
import { X, Plus, Sparkles, Layers, Building, Key } from "lucide-react";
import { useFranchise } from "../../../Context/FranchiseContext";

export default function CreateFranchiseModal({ isOpen, onClose }) {
  const { createFranchise } = useFranchise();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
    banner: "",
    sourceType: "collection",
    tmdbCollectionId: "",
    tmdbCompanyId: "",
    keywords: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto generate slug when name changes if user hasn't custom edited slug
      if (name === "name" && !prev.slugEdited) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      if (name === "slug") {
        updated.slugEdited = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        logo: formData.logo,
        banner: formData.banner,
        sourceType: formData.sourceType,
      };

      if (formData.sourceType === "collection") {
        payload.tmdbCollectionId = Number(formData.tmdbCollectionId);
      } else if (formData.sourceType === "company") {
        payload.tmdbCompanyId = Number(formData.tmdbCompanyId);
      } else if (formData.sourceType === "keyword") {
        payload.keywords = formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean);
      }

      await createFranchise(payload);
      setLoading(false);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create franchise");
      setLoading(false);
    }
  };

  // Preset quick fill templates for popular franchises
  const handleQuickFill = (preset) => {
    if (preset === "mcu") {
      setFormData({
        name: "Marvel Cinematic Universe",
        slug: "marvel-cinematic-universe",
        description: "The epic superhero franchise encompassing Earth's mightiest heroes, cosmic defenders, and the multiverse.",
        logo: "https://image.tmdb.org/t/p/w500/8qBwBD2Yx3d30vJ7mlyJ3d57P9p.png",
        banner: "https://image.tmdb.org/t/p/original/muth4OYamXf41G2evdrLEg8d3om.jpg",
        sourceType: "collection",
        tmdbCollectionId: "86311",
        tmdbCompanyId: "",
        keywords: "",
      });
    } else if (preset === "starwars") {
      setFormData({
        name: "Star Wars",
        slug: "star-wars",
        description: "In a galaxy far, far away... Explore the legendary saga of Jedi, Sith, and galactic conflict.",
        logo: "https://image.tmdb.org/t/p/w500/6804WSpTM8k41LioZgvtMVPp4v4.png",
        banner: "https://image.tmdb.org/t/p/original/5iwx1ScqU220uHw7tB62qmoqL4r.jpg",
        sourceType: "collection",
        tmdbCollectionId: "10",
        tmdbCompanyId: "",
        keywords: "",
      });
    } else if (preset === "ghibli") {
      setFormData({
        name: "Studio Ghibli",
        slug: "studio-ghibli",
        description: "Whimsical, enchanting animated masterpieces created by Hayao Miyazaki and Isao Takahata.",
        logo: "",
        banner: "https://image.tmdb.org/t/p/original/706awcxVJ6V4txw3Z9W6d328H8L.jpg",
        sourceType: "company",
        tmdbCollectionId: "",
        tmdbCompanyId: "10342",
        keywords: "",
      });
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-panel">
        <div className="modal-header">
          <div className="modal-title flex items-center gap-sm">
            <Plus className="accent-icon" />
            <h3>Create New Franchise</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="quick-presets flex gap-sm items-center">
          <span>Quick Presets:</span>
          <button type="button" onClick={() => handleQuickFill("mcu")} className="preset-chip">
            Marvel MCU
          </button>
          <button type="button" onClick={() => handleQuickFill("starwars")} className="preset-chip">
            Star Wars
          </button>
          <button type="button" onClick={() => handleQuickFill("ghibli")} className="preset-chip">
            Studio Ghibli
          </button>
        </div>

        <form onSubmit={handleSubmit} className="franchise-form">
          <div className="form-group">
            <label>Franchise Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Marvel Cinematic Universe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Slug (URL key) *</label>
            <input
              type="text"
              name="slug"
              required
              placeholder="e.g. marvel-cinematic-universe"
              value={formData.slug}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief overview of the franchise..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Logo Image URL</label>
              <input
                type="text"
                name="logo"
                placeholder="https://..."
                value={formData.logo}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Banner Image URL</label>
              <input
                type="text"
                name="banner"
                placeholder="https://..."
                value={formData.banner}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Source Type *</label>
            <div className="source-type-selector flex gap-md">
              <label className={`type-card ${formData.sourceType === "collection" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="sourceType"
                  value="collection"
                  checked={formData.sourceType === "collection"}
                  onChange={handleChange}
                />
                <Layers size={18} />
                <span>TMDB Collection</span>
              </label>

              <label className={`type-card ${formData.sourceType === "company" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="sourceType"
                  value="company"
                  checked={formData.sourceType === "company"}
                  onChange={handleChange}
                />
                <Building size={18} />
                <span>Studio / Company</span>
              </label>

              <label className={`type-card ${formData.sourceType === "keyword" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="sourceType"
                  value="keyword"
                  checked={formData.sourceType === "keyword"}
                  onChange={handleChange}
                />
                <Key size={18} />
                <span>Keywords</span>
              </label>
            </div>
          </div>

          {formData.sourceType === "collection" && (
            <div className="form-group">
              <label>TMDB Collection ID *</label>
              <input
                type="number"
                name="tmdbCollectionId"
                required
                placeholder="e.g. 86311 (The Avengers Collection)"
                value={formData.tmdbCollectionId}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.sourceType === "company" && (
            <div className="form-group">
              <label>TMDB Company ID *</label>
              <input
                type="number"
                name="tmdbCompanyId"
                required
                placeholder="e.g. 10342 (Studio Ghibli)"
                value={formData.tmdbCompanyId}
                onChange={handleChange}
              />
            </div>
          )}

          {formData.sourceType === "keyword" && (
            <div className="form-group">
              <label>Keywords (comma separated) *</label>
              <input
                type="text"
                name="keywords"
                required
                placeholder="e.g. Batman, Dark Knight"
                value={formData.keywords}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="modal-actions flex justify-end gap-md">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Franchise"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
