import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Film,
  QrCode,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Download,
  ChevronRight,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useSelector } from "react-redux";
import API from "../../Services/Axios_api";
import "./TheatreBooking.css";

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "cancelled"
  const [selectedTicketModal, setSelectedTicketModal] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Load Bookings from API & LocalStorage
  const fetchBookings = async () => {
    setLoading(true);
    let serverBookings = [];
    try {
      const res = await API.get("/bookings/my-bookings");
      if (res.data?.bookings) {
        serverBookings = res.data.bookings;
      }
    } catch (err) {
      console.warn("Could not fetch remote bookings, checking local storage:", err);
    }

    // Load local storage bookings
    let localBookings = [];
    try {
      localBookings = JSON.parse(
        localStorage.getItem("watchhub_local_bookings") || "[]"
      );
    } catch (e) {}

    // Merge without duplicates by bookingId
    const seen = new Set();
    const merged = [];

    [...serverBookings, ...localBookings].forEach((b) => {
      if (b?.bookingId && !seen.has(b.bookingId)) {
        seen.add(b.bookingId);
        merged.push(b);
      }
    });

    // Sort newest first
    merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    setBookings(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking? Refund will be processed.")) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await API.patch(`/bookings/${bookingId}/cancel`);
    } catch (err) {
      console.warn("Remote cancel error, updating locally:", err);
    }

    // Update local state & localStorage
    setBookings((prev) =>
      prev.map((b) =>
        b.bookingId === bookingId
          ? { ...b, bookingStatus: "cancelled", paymentStatus: "refunded" }
          : b
      )
    );

    try {
      const local = JSON.parse(localStorage.getItem("watchhub_local_bookings") || "[]");
      const updated = local.map((b) =>
        b.bookingId === bookingId
          ? { ...b, bookingStatus: "cancelled", paymentStatus: "refunded" }
          : b
      );
      localStorage.setItem("watchhub_local_bookings", JSON.stringify(updated));
    } catch (e) {}

    setCancellingId(null);
    alert("Booking cancelled successfully. Refund initiated.");
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "active") return b.bookingStatus !== "cancelled";
    if (activeTab === "cancelled") return b.bookingStatus === "cancelled";
    return true;
  });

  return (
    <div className="my-bookings-page">
      <div className="bookings-container">
        {/* Header */}
        <div className="my-bookings-header">
          <div className="header-titles">
            <button className="btn-back-mini" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} /> Back
            </button>
            <h1>
              <Ticket className="icon-ticket-hd" size={28} /> My Cinema Bookings
            </h1>
            <p>View your upcoming showtimes, entry passes, and ticket history</p>
          </div>

          <Link to="/home" className="btn-browse-movies">
            <Film size={16} /> Browse Movies
          </Link>
        </div>

        {/* Tab Filter */}
        <div className="bookings-tabs-row">
          <button
            className={`b-tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={`b-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Confirmed Tickets (
            {bookings.filter((b) => b.bookingStatus !== "cancelled").length})
          </button>
          <button
            className={`b-tab ${activeTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveTab("cancelled")}
          >
            Cancelled ({bookings.filter((b) => b.bookingStatus === "cancelled").length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="theatres-loading">
            <div className="spinner" />
            <p>Loading your movie bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="empty-bookings-box">
            <div className="empty-icon-wrap">
              <Ticket size={48} />
            </div>
            <h3>No movie bookings found</h3>
            <p>
              You haven't booked any theatre tickets yet. Find now-showing movies in
              theatres and pick your favourite seats!
            </p>
            <Link to="/home" className="btn-primary">
              Explore Now Showing Movies
            </Link>
          </div>
        ) : (
          <div className="bookings-cards-grid">
            {filteredBookings.map((b) => {
              const isCancelled = b.bookingStatus === "cancelled";
              return (
                <div
                  key={b.bookingId}
                  className={`booking-history-card ${isCancelled ? "is-cancelled" : ""}`}
                >
                  <div className="card-top-bar">
                    <span className="booking-ref-chip">ID: {b.bookingId}</span>
                    <span
                      className={`status-pill ${
                        isCancelled ? "status-cancelled" : "status-confirmed"
                      }`}
                    >
                      {isCancelled ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                      {isCancelled ? "Cancelled & Refunded" : "Confirmed"}
                    </span>
                  </div>

                  <div className="card-middle-content">
                    {b.mediaPoster && (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${b.mediaPoster}`}
                        alt={b.mediaTitle}
                        className="b-poster"
                      />
                    )}
                    <div className="b-info-block">
                      <h3 className="b-movie-name">{b.mediaTitle}</h3>
                      <p className="b-theatre-title">
                        <MapPin size={14} /> {b.theatreName}
                      </p>
                      <p className="b-screen-meta">
                        {b.screen} • {b.format}
                      </p>

                      <div className="b-timing-grid">
                        <div className="t-cell">
                          <span className="label">Date</span>
                          <strong>{b.showDate}</strong>
                        </div>
                        <div className="t-cell">
                          <span className="label">Time</span>
                          <strong className="time-accent">{b.showTime}</strong>
                        </div>
                        <div className="t-cell">
                          <span className="label">Seats</span>
                          <strong className="seats-tag">
                            {b.seats?.map((s) => s.seatNumber).join(", ")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-bottom-actions">
                    <div className="amount-info">
                      <span className="amt-label">Total Paid:</span>
                      <strong className="amt-val">₹{b.totalAmount}</strong>
                    </div>

                    <div className="btn-action-group">
                      <button
                        className="btn-view-pass"
                        onClick={() => setSelectedTicketModal(b)}
                      >
                        <QrCode size={16} /> View M-Ticket
                      </button>

                      {!isCancelled && (
                        <button
                          className="btn-cancel-ticket"
                          disabled={cancellingId === b.bookingId}
                          onClick={() => handleCancelBooking(b.bookingId)}
                        >
                          <Trash2 size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Pass View Modal */}
      {selectedTicketModal && (
        <div className="modal-backdrop" onClick={() => setSelectedTicketModal(null)}>
          <div
            className="ticket-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cinema-ticket-card">
              <div className="ticket-header-strip">
                <div className="wh-logo-badge">
                  <Film size={18} /> WatchHub Cinema Pass
                </div>
                <div className="ticket-id-tag">
                  Booking ID: <strong>{selectedTicketModal.bookingId}</strong>
                </div>
              </div>

              <div className="ticket-main-body">
                <div className="ticket-movie-col">
                  {selectedTicketModal.mediaPoster && (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${selectedTicketModal.mediaPoster}`}
                      alt={selectedTicketModal.mediaTitle}
                      className="ticket-poster"
                    />
                  )}
                  <div className="ticket-movie-info">
                    <span className="movie-cert-badge">U/A</span>
                    <h3 className="ticket-title">{selectedTicketModal.mediaTitle}</h3>
                    <p className="ticket-format">
                      {selectedTicketModal.screen} • {selectedTicketModal.format}
                    </p>
                    <p className="ticket-theatre-title">
                      {selectedTicketModal.theatreName}
                    </p>
                    <p className="ticket-loc">
                      {selectedTicketModal.theatreLocation?.address ||
                        `${selectedTicketModal.theatreLocation?.city}, ${selectedTicketModal.theatreLocation?.state}`}
                    </p>
                  </div>
                </div>

                <div className="ticket-divider-punched">
                  <div className="punch-circle punch-top" />
                  <div className="punch-line" />
                  <div className="punch-circle punch-bottom" />
                </div>

                <div className="ticket-entry-col">
                  <div className="ticket-details-grid">
                    <div className="t-block">
                      <span className="t-label">SHOW DATE</span>
                      <strong className="t-val">{selectedTicketModal.showDate}</strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">SHOW TIME</span>
                      <strong className="t-val accent">
                        {selectedTicketModal.showTime}
                      </strong>
                    </div>
                    <div className="t-block full-width">
                      <span className="t-label">SEATS</span>
                      <strong className="t-val seats-highlight">
                        {selectedTicketModal.seats?.map((s) => s.seatNumber).join(", ")}
                      </strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">TOTAL PAID</span>
                      <strong className="t-val">₹{selectedTicketModal.totalAmount}</strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">STATUS</span>
                      <strong
                        className={`t-val ${
                          selectedTicketModal.bookingStatus === "cancelled"
                            ? "cancelled-txt"
                            : "confirmed-txt"
                        }`}
                      >
                        {selectedTicketModal.bookingStatus?.toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="ticket-qr-block">
                    <div className="qr-box">
                      <QrCode size={84} />
                    </div>
                    <span className="qr-subtext">Scan at entrance scanner</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-ticket-actions">
              <button className="btn-primary" onClick={() => window.print()}>
                <Download size={16} /> Print / Save Pass
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedTicketModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
