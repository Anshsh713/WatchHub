import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { User, Layers, Bookmark, Star, ShieldCheck, Film } from "lucide-react";
import { useCollections } from "../../Context/CollectionContext";
import CollectionCard from "../Collections/CollectionCard";
import CollectionEmptyState from "../Collections/CollectionEmptyState";
import VideoLoader from "../Common/VideoLoader";
import "./Profile.css";

export default function Profile() {
  const { userId } = useParams();
  const { user: authUser } = useSelector((state) => state.auth);
  const { fetchUserCollections, userProfileCollections, loading } = useCollections();

  const targetUserId = userId || authUser?.id || authUser?._id;
  const username = authUser?.User_Name || authUser?.username || "Curator";
  const email = authUser?.User_Email || authUser?.email || "";

  useEffect(() => {
    if (targetUserId) {
      fetchUserCollections(targetUserId);
    }
  }, [targetUserId]);

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page-container">
        {/* Profile Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-big">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info-block">
            <h1>@{username}</h1>
            {email && <p>{email}</p>}

            <div className="profile-stats-row">
              <div className="profile-stat-badge">
                <Layers size={16} className="text-primary" />
                <span>
                  <strong>{userProfileCollections.length}</strong> Collections
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Collections Section */}
        <div className="profile-sections-title">
          <h2>
            <Layers size={20} /> Collections by @{username}
          </h2>
          <Link to="/collections" className="btn-secondary-sm">
            View All Collections
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0" }}>
            <VideoLoader />
          </div>
        ) : userProfileCollections.length === 0 ? (
          <CollectionEmptyState
            type="no_collections"
            actionText="Browse Discover Collections"
            onAction={() => window.location.assign("/collections")}
          />
        ) : (
          <div className="collections-cards-grid">
            {userProfileCollections.map((col) => (
              <CollectionCard key={col._id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
