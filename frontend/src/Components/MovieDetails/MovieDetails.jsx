import React, { act, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMedia } from "../../Context/MediaContext";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import "./MovieDetails.css";
import VideoLoader from "../Common/VideoLoader";
import {
  Dot,
  ChevronRight,
  X,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import VibeChart from "../Common/VideChart";
import { useRef } from "react";
import MediaReviews from "../MediaReviews/MediaReviews";
import ReviewFilter from "../MediaReviews/Review";
import API from "../../Services/Axios_api";

const DEFAULT_PROFILE =
  "https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png";

const ScrollablePeople = ({ title, data }) => {
  const ref = useRef(null);
  return (
    <div className="scroll-section">
      <h2>{title}</h2>

      <motion.div ref={ref} className="scroll-container">
        {data.map((person) => (
          <div key={person.id || person.credit_id} className="person-card">
            <img
              loading="lazy"
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                  : DEFAULT_PROFILE
              }
              alt={person.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PROFILE;
              }}
            />
            <p>{person.name}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function MediaDetail() {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { fetchMediaDetails, mediaDetails, loading, error, setCurrentType } =
    useMedia();
  const [video, setVideo] = useState(false);
  const [backdropError, setBackdropError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    if (mediaDetails && mediaDetails.name) {
      const fetchRelatedNews = async () => {
        try {
          const mappedType =
            mediaDetails.type === "tv" ? "show" : mediaDetails.type;
          const { data } = await API.get("/news", {
            params: {
              search: mediaDetails.name,
              contentType: mappedType,
              page: 1,
            },
          });
          setRelatedNews(data.articles || []);
        } catch (err) {
          console.error("Error fetching related news:", err);
        }
      };
      fetchRelatedNews();
    }
  }, [mediaDetails]);

  useEffect(() => {
    if (id && type) {
      fetchMediaDetails(id, type);
      setCurrentType(type);
    }
  }, [id, type]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (video) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [video]);

  function formatDuration(minutes) {
    if (!minutes) return null;

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  if (loading || !mediaDetails) {
    return (
      <div className="Main-box">
        <AnimatePresence>
          <VideoLoader />
        </AnimatePresence>
      </div>
    );
  }

  const media_details = [
    { title: "Directed By", content: mediaDetails?.director || "N/A" },
    {
      title: "Country",
      content: mediaDetails?.country?.map((c) => c.name).join(", ") || "N/A",
    },
    {
      title: "Language",
      content: mediaDetails?.language
        ? new Intl.DisplayNames(["en"], { type: "language" }).of(
            mediaDetails.language,
          )
        : "N/A",
    },
    { title: "Age Rating", content: mediaDetails.ageRating || "N/A" },
  ];

  const bookingPlatforms = [
    {
      name: "BookMyShow",
      logo: "https://play-lh.googleusercontent.com/TB_8RMvDjxGmx06LBK-8opRFJ0msb6hSZalEtOMBmxgJ4jYE_i0BmdRuMWChCE76tLnxoytZ75Cew_r0_JDd",
      link: `https://in.bookmyshow.com/search?q=${encodeURIComponent(
        mediaDetails.name,
      )}`,
    },
    {
      name: "WatchHub Booking",
      logo: "/Watchhub.png",
      link: "#",
    },
  ];

  const normalizePlatforms = (platforms) => {
    if (!platforms) return [];

    const allProviders = [
      ...(platforms.flatrate || []),
      ...(platforms.free || []),
      ...(platforms.ads || []),
    ];
    const unique = [];

    const seen = new Set();

    for (const provider of allProviders) {
      if (!seen.has(provider.provider_id)) {
        seen.add(provider.provider_id);
        unique.push({
          name: provider.provider_name,
          logo: `https://image.tmdb.org/t/p/w200${provider.logo_path}`,
          link: platforms.link,
        });
      }
    }

    return unique;
  };

  const streamingPlatforms = normalizePlatforms(mediaDetails.platforms);

  return (
    <div className="Main-box">
      <div className="banner">
        {!backdropError && mediaDetails.images?.backdrop ? (
          <img
            loading="lazy"
            onClick={() => setVideo(!video)}
            src={`https://image.tmdb.org/t/p/original${mediaDetails.images.backdrop}`}
            alt="Backdrop"
            onError={() => setBackdropError(true)}
          />
        ) : (
          <div className="banner-placeholder"></div>
        )}
        <div className="banner-overlay"></div>
      </div>
      <div className="main-content">
        <div className="media-image">
          <div className="image">
            {!posterError && mediaDetails.images?.poster ? (
              <img
                loading="lazy"
                src={`https://image.tmdb.org/t/p/original${mediaDetails.images.poster}`}
                alt={mediaDetails.name}
                onError={() => setPosterError(true)}
              />
            ) : (
              <div className="poster-placeholder">
                <span className="placeholder-icon">🎬</span>
                <span className="placeholder-text">{mediaDetails.name}</span>
                <span className="placeholder-subtext">Poster unavailable</span>
              </div>
            )}
          </div>
        </div>
        <div className="media-details">
          <div className="idea">
            {mediaDetails.type === "movie"
              ? "Movie"
              : mediaDetails.type === "tv"
                ? "Show"
                : mediaDetails.type === "anime"
                  ? "Anime"
                  : ""}
            <Dot size={30} />
            {mediaDetails.theatreStatus.releaseDate?.slice(0, 4)}
            <Dot size={30} />
            {formatDuration(
              mediaDetails.duration
                ? mediaDetails.duration
                : mediaDetails.episodeRuntime,
            )}
            {mediaDetails.totalSeasons ? (
              <>
                <Dot size={30} /> {mediaDetails.totalSeasons} Seasons
              </>
            ) : null}
            {mediaDetails.totalEpisodes ? (
              <>
                <Dot size={30} /> {mediaDetails.totalEpisodes} Episodes
              </>
            ) : null}
          </div>
          <div className="Name">
            <h1>{mediaDetails.name}</h1>
          </div>
          <div className="media-idea">
            <div className="media-title">
              {media_details.map((data) => (
                <div key={data.title} className="title">
                  <h5>{data.title}</h5>
                  <p>{data.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="overview-cast-crew">
          <div className="Overview">
            <h1>Overview</h1>
            <p>{mediaDetails.overview}</p>
          </div>
          <div className="cast-crew">
            {mediaDetails.cast?.length > 0 && (
              <ScrollablePeople title="Cast" data={mediaDetails.cast} />
            )}

            {mediaDetails.crew?.length > 0 && (
              <ScrollablePeople title="Crew" data={mediaDetails.crew} />
            )}
            {mediaDetails.productionHouses?.length > 0 && (
              <div className="section">
                <h2>Production</h2>
                <div className="production-list">
                  {mediaDetails.productionHouses.map((house) => (
                    <div key={house.id} className="production-card">
                      {house.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="vide-watch">
          <div className="vide">
            <VibeChart data={mediaDetails.vibeChart} />
          </div>
          <div className="watch">
            {mediaDetails.theatreStatus.isInTheatre === true ? (
              <div className="theatre">
                <h3>Tickets On</h3>
                {bookingPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    className="whaton"
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="logo-show">
                      <img
                        src={platform.logo}
                        alt={platform.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/40?text=▶";
                        }}
                      />
                    </div>

                    <span>{platform.name}</span>

                    <ChevronRight />
                  </a>
                ))}
              </div>
            ) : mediaDetails.platforms ? (
              <div className="theatre">
                <h3>Watch On</h3>
                {streamingPlatforms.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whaton"
                  >
                    <div className="logo-show">
                      <img
                        src={platform.logo}
                        alt={platform.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/40?text=▶";
                        }}
                      />
                    </div>

                    <span>{platform.name}</span>

                    <ChevronRight />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {/*<pre>{JSON.stringify(mediaDetails, null, 2)}</pre>*/}
      </div>

      {/* Related News Section */}
      {relatedNews && relatedNews.length > 0 && (
        <div className="related-news-section">
          <div className="related-news-header">
            <h2>Related News</h2>
            <p>
              Catch the latest stories, developments, and reviews about{" "}
              {mediaDetails.name}
            </p>
          </div>
          <div className="related-news-grid">
            {relatedNews.slice(0, 3).map((article) => (
              <div
                className="related-news-card"
                key={article.id}
                onClick={() => setSelectedArticle(article)}
              >
                <div className="related-news-img-wrapper">
                  <img
                    src={article.image}
                    alt={article.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop";
                    }}
                  />
                  <span className="related-news-source">{article.source}</span>
                </div>
                <div className="related-news-info">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <div className="related-news-card-footer">
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )}
                    </span>
                    <span className="read-more-accent">Read Article →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modern Article Details Modal */}
      {selectedArticle && (
        <div
          className="article-modal-overlay"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="article-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-image-container">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=600&auto=format&fit=crop";
                }}
              />
              <div className="modal-image-overlay"></div>
              <span className="modal-badge badge-details-page">
                RELATED NEWS
              </span>
            </div>

            <div className="modal-body">
              <div className="modal-meta">
                <span className="modal-source">{selectedArticle.source}</span>
                <span className="modal-divider">•</span>
                <div className="modal-meta-item">
                  <Calendar size={14} />
                  <span>
                    {new Date(selectedArticle.publishedAt).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                  </span>
                </div>
                <span className="modal-divider">•</span>
                <div className="modal-meta-item">
                  <User size={14} />
                  <span>{selectedArticle.author}</span>
                </div>
                <span className="modal-divider">•</span>
                <div className="modal-meta-item">
                  <span> {selectedArticle.impact}</span>
                </div>
              </div>

              <h2 className="modal-title">{selectedArticle.title}</h2>

              <div className="modal-divider-line"></div>

              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="modal-read-full-btn bg-details-page"
              >
                Read Full Coverage on {selectedArticle.source}{" "}
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="Reviews-media">
        <ReviewFilter mediaID={mediaDetails.id} mediaType={mediaDetails.type} />
      </div>
      <AnimatePresence>
        {video && mediaDetails.trailer && (
          <motion.div
            className="trailer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setVideo(false)}
          >
            <motion.div
              className="trailer-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                width="100%"
                height="600"
                src={
                  mediaDetails.trailer.replace("watch?v=", "embed/") +
                  "?autoplay=1&mute=1"
                }
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
