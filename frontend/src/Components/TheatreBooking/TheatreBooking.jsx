import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  Film,
  Compass,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  QrCode,
  Sparkles,
  Ticket,
  Coffee,
  AlertCircle,
  Share2,
  Download,
  Info,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import API from "../../Services/Axios_api";
import "./TheatreBooking.css";

// Supported States and their Cities in India
export const INDIAN_STATES_CITIES = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Thane", "Navi Mumbai", "Nashik"],
  "Delhi NCR": ["New Delhi", "Noida", "Gurgaon", "Ghaziabad", "Faridabad"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "West Bengal": ["Kolkata", "Howrah", "Siliguri", "Durgapur"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "Punjab & Chandigarh": ["Chandigarh", "Ludhiana", "Amritsar", "Jalandhar"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
  Goa: ["Panaji", "Margao"],
  Assam: ["Guwahati"],
  Odisha: ["Bhubaneswar", "Cuttack"],
};

export const POPULAR_CITIES = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "New Delhi", state: "Delhi NCR" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Chandigarh", state: "Punjab & Chandigarh" },
  { city: "Kochi", state: "Kerala" },
];

const SNACK_OPTIONS = [
  {
    id: "popcorn-caramel",
    name: "Caramel Popcorn (L)",
    price: 240,
    desc: "Crispy freshly popped corn coated in rich gourmet caramel",
    img: "🍿",
  },
  {
    id: "popcorn-butter",
    name: "Salted Butter Popcorn (M)",
    price: 190,
    desc: "Classic warm theatre popcorn with melted golden butter",
    img: "🍿",
  },
  {
    id: "nachos-cheese",
    name: "Crispy Nachos & Hot Cheese",
    price: 220,
    desc: "Tortilla corn chips served with warm jalapeño cheese dip & salsa",
    img: "🧀",
  },
  {
    id: "pepsi-large",
    name: "Chilled Pepsi / Coke (600ml)",
    price: 140,
    desc: "Ice-cold fountain soda with complimentary refill",
    img: "🥤",
  },
  {
    id: "combo-duo",
    name: "WatchHub Mega Combo Deal",
    price: 380,
    desc: "1 Large Popcorn + 2 Soft Drinks + 1 Nachos (Save 20%)",
    img: "🎉",
  },
];

// Seat Layout structure
const SEAT_ROWS = [
  { row: "A", tier: "VIP", price: 500, seats: 12, aisleAfter: [3, 9] },
  { row: "B", tier: "VIP", price: 500, seats: 12, aisleAfter: [3, 9] },
  { row: "C", tier: "Prime", price: 320, seats: 14, aisleAfter: [4, 10] },
  { row: "D", tier: "Prime", price: 320, seats: 14, aisleAfter: [4, 10] },
  { row: "E", tier: "Prime", price: 320, seats: 14, aisleAfter: [4, 10] },
  { row: "F", tier: "Classic", price: 200, seats: 14, aisleAfter: [4, 10] },
  { row: "G", tier: "Classic", price: 200, seats: 14, aisleAfter: [4, 10] },
  { row: "H", tier: "Classic", price: 200, seats: 14, aisleAfter: [4, 10] },
];

export default function TheatreBooking() {
  const { id, type = "movie" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Movie Details state
  const [movie, setMovie] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(true);

  // User Location State
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("watchhub_user_location");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { state: "Maharashtra", city: "Mumbai" };
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locSearch, setLocSearch] = useState("");
  const [detectingGps, setDetectingGps] = useState(false);

  // Booking Flow Steps: 1: Theatres & Showtimes, 2: Seat Selection, 3: Snacks, 4: Payment, 5: Ticket Confirmed
  const [step, setStep] = useState(1);

  // Date selection (7 days from today)
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  // Experience and time filters
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("All");

  // Theatres data
  const [theatres, setTheatres] = useState([]);
  const [loadingTheatres, setLoadingTheatres] = useState(false);

  // Selection states for booking
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeatsMap, setBookedSeatsMap] = useState({});
  const [snacksCart, setSnacksCart] = useState({});

  // Checkout & Payment State
  const [guestInfo, setGuestInfo] = useState({
    name: user?.displayName || user?.User_Name || "",
    email: user?.User_Email || "",
    phone: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // 1. Initialize Dates
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push({
        dateObj: d,
        dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString("en-US", { month: "short" }),
        fullDateStr: d.toISOString().split("T")[0],
        formatted: d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
    }
    setAvailableDates(dates);
  }, []);

  // 2. Fetch Movie Details
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoadingMovie(true);
        const res = await API.get(`/media/${id}?type=${type}`);
        setMovie(res.data);
      } catch (err) {
        console.error("Error fetching movie data for booking:", err);
      } finally {
        setLoadingMovie(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id, type]);

  // 3. Prompt user for location on first visit if not explicitly chosen
  useEffect(() => {
    const hasPrompted = sessionStorage.getItem("watchhub_location_prompted");
    if (!hasPrompted && !localStorage.getItem("watchhub_user_location")) {
      setIsLocationModalOpen(true);
      sessionStorage.setItem("watchhub_location_prompted", "true");
    }
  }, []);

  // 4. Fetch Theatres whenever Location or Movie changes
  useEffect(() => {
    const fetchTheatres = async () => {
      setLoadingTheatres(true);
      try {
        const res = await API.get("/bookings/theatres", {
          params: {
            state: userLocation.state,
            city: userLocation.city,
            mediaId: id,
          },
        });
        if (res.data.theatres && res.data.theatres.length > 0) {
          setTheatres(res.data.theatres);
        } else {
          setTheatres([]);
        }
      } catch (err) {
        console.warn("Backend theatres endpoint error, using local fallback:", err);
        // Fallback local list for state/city
        setTheatres([
          {
            id: `pvr-${userLocation.city.toLowerCase()}-1`,
            name: `PVR INOX: Central Plaza, ${userLocation.city}`,
            address: `Main City Centre, ${userLocation.city}, ${userLocation.state}`,
            distance: "1.9 km away",
            screens: ["Audi 1 - IMAX Laser", "Audi 2 - Dolby Atmos"],
            experiences: ["IMAX 2D", "Dolby Atmos", "2D"],
            pricing: { vip: 480, prime: 300, standard: 180 },
            showtimes: [
              { time: "10:30 AM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX Laser" },
              { time: "01:45 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Audi 2 - Dolby Atmos" },
              { time: "05:15 PM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX Laser" },
              { time: "08:30 PM", format: "Dolby Atmos", status: "Almost Full", audi: "Audi 2 - Dolby Atmos" },
            ],
          },
          {
            id: `cinepolis-${userLocation.city.toLowerCase()}-2`,
            name: `Cinépolis: Grand Megaplex, ${userLocation.city}`,
            address: `High Street Avenue, ${userLocation.city}, ${userLocation.state}`,
            distance: "3.5 km away",
            screens: ["Screen 1 - VIP Lounge", "Screen 2 - Macro XE"],
            experiences: ["Macro XE", "VIP Lounge", "2D"],
            pricing: { vip: 450, prime: 280, standard: 170 },
            showtimes: [
              { time: "11:15 AM", format: "Macro XE", status: "Available", audi: "Screen 2 - Macro XE" },
              { time: "02:45 PM", format: "VIP Lounge", status: "Available", audi: "Screen 1 - VIP Lounge" },
              { time: "06:30 PM", format: "Macro XE", status: "Filling Fast", audi: "Screen 2 - Macro XE" },
            ],
          },
        ]);
      } finally {
        setLoadingTheatres(false);
      }
    };

    fetchTheatres();
  }, [userLocation, id]);

  // Handle location update
  const handleSelectLocation = (state, city) => {
    const newLoc = { state, city };
    setUserLocation(newLoc);
    localStorage.setItem("watchhub_user_location", JSON.stringify(newLoc));
    setIsLocationModalOpen(false);
  };

  // Detect GPS Location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.state_district ||
            "Mumbai";
          const detectedState = data.address?.state || "Maharashtra";

          handleSelectLocation(detectedState, detectedCity);
        } catch (e) {
          // Default to Mumbai if geocode fails
          handleSelectLocation("Maharashtra", "Mumbai");
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        console.warn("GPS error:", err);
        setDetectingGps(false);
        alert("Could not detect location. Please select your state and city manually.");
      },
      { timeout: 7000 }
    );
  };

  // Generate realistic pseudo-random booked seats for a showtime
  const generateRandomBookedSeats = (showtimeStr, dateStr) => {
    const seed = `${showtimeStr}-${dateStr}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
    }
    const booked = {};
    SEAT_ROWS.forEach((r) => {
      for (let s = 1; s <= r.seats; s++) {
        // ~25% of seats booked
        const isBooked = Math.abs(Math.sin(hash + s * 13 + r.row.charCodeAt(0))) > 0.72;
        if (isBooked) {
          booked[`${r.row}${s}`] = true;
        }
      }
    });
    return booked;
  };

  // Select Showtime & open Seat Selection
  const handlePickShowtime = (theatre, showtime) => {
    setSelectedTheatre(theatre);
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    const currDate = availableDates[selectedDateIndex]?.fullDateStr || "today";
    setBookedSeatsMap(generateRandomBookedSeats(showtime.time, currDate));
    setStep(2);
  };

  // Seat toggle handler
  const handleToggleSeat = (rowObj, seatNum) => {
    const seatId = `${rowObj.row}${seatNum}`;
    if (bookedSeatsMap[seatId]) return;

    const exists = selectedSeats.find((s) => s.seatNumber === seatId);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        alert("You can select a maximum of 8 seats per booking.");
        return;
      }
      setSelectedSeats([
        ...selectedSeats,
        {
          seatNumber: seatId,
          tier: rowObj.tier,
          price: rowObj.price,
        },
      ]);
    }
  };

  // Snack Cart handlers
  const handleUpdateSnack = (snack, change) => {
    setSnacksCart((prev) => {
      const curr = prev[snack.id]?.quantity || 0;
      const next = Math.max(0, curr + change);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snack.id];
        return copy;
      }
      return {
        ...prev,
        [snack.id]: {
          ...snack,
          quantity: next,
        },
      };
    });
  };

  // Calculations
  const seatsTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const snacksTotal = Object.values(snacksCart).reduce(
    (sum, sn) => sum + sn.price * sn.quantity,
    0
  );
  const convenienceFee = selectedSeats.length > 0 ? 35 : 0;
  const grandTotal = seatsTotal + snacksTotal + convenienceFee;

  // Process Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!guestInfo.name || !guestInfo.email) {
      alert("Please provide your name and email for the tickets.");
      return;
    }
    if (paymentMethod === "UPI" && !upiId.trim()) {
      alert("Please enter a valid UPI ID (e.g. yourname@oksbi / yourname@upi).");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const selectedDate = availableDates[selectedDateIndex]?.formatted || "Today";
      const payload = {
        mediaId: id,
        mediaType: type,
        mediaTitle: movie?.name || "Movie",
        mediaPoster: movie?.images?.poster || "",
        theatreId: selectedTheatre.id,
        theatreName: selectedTheatre.name,
        theatreLocation: {
          city: userLocation.city,
          state: userLocation.state,
          address: selectedTheatre.address,
        },
        screen: selectedShowtime.audi || "Audi 1",
        format: selectedShowtime.format || "2D",
        showDate: selectedDate,
        showTime: selectedShowtime.time,
        seats: selectedSeats,
        snacks: Object.values(snacksCart),
        convenienceFee,
        totalAmount: grandTotal,
        paymentMethod,
        guestInfo,
      };

      let bookingResult = null;
      try {
        const res = await API.post("/bookings", payload);
        if (res.data && res.data.booking) {
          bookingResult = res.data.booking;
        }
      } catch (apiErr) {
        console.warn("Backend booking API failed, saving locally:", apiErr);
      }

      // If backend didn't return (e.g. offline/network), build local booking pass
      if (!bookingResult) {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let randomPart = "";
        for (let i = 0; i < 6; i++) {
          randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        bookingResult = {
          ...payload,
          bookingId: `WHB-${randomPart}`,
          createdAt: new Date().toISOString(),
          bookingStatus: "confirmed",
          paymentStatus: "completed",
        };
      }

      // Always save to localStorage for offline viewing & redundancy
      try {
        const existing = JSON.parse(localStorage.getItem("watchhub_local_bookings") || "[]");
        localStorage.setItem(
          "watchhub_local_bookings",
          JSON.stringify([bookingResult, ...existing])
        );
      } catch (storageErr) {}

      setConfirmedBooking(bookingResult);
      setStep(5);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Filtered Theatres
  const filteredTheatres = theatres.filter((theatre) => {
    if (selectedFormat !== "All") {
      const hasFormat = theatre.experiences.some((exp) =>
        exp.toLowerCase().includes(selectedFormat.toLowerCase())
      );
      if (!hasFormat) return false;
    }

    if (selectedTimeFilter !== "All") {
      const hasTime = theatre.showtimes.some((st) => {
        const hour = parseInt(st.time.split(":")[0]);
        const isPM = st.time.includes("PM");
        const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;

        if (selectedTimeFilter === "Morning") return hour24 < 12;
        if (selectedTimeFilter === "Afternoon") return hour24 >= 12 && hour24 < 16;
        if (selectedTimeFilter === "Evening") return hour24 >= 16 && hour24 < 20;
        if (selectedTimeFilter === "Night") return hour24 >= 20;
        return true;
      });
      if (!hasTime) return false;
    }

    return true;
  });

  return (
    <div className="theatre-booking-page">
      {/* Background Ambience */}
      {movie?.images?.backdrop && (
        <div
          className="booking-backdrop"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.images.backdrop})`,
          }}
        >
          <div className="booking-backdrop-overlay" />
        </div>
      )}

      {/* Main Container */}
      <div className="booking-container">
        {/* Navigation / Header Bar */}
        <div className="booking-top-nav">
          <button
            className="btn-back"
            onClick={() => {
              if (step > 1 && step < 5) {
                setStep(step - 1);
              } else {
                navigate(`/media/${type}/${id}`);
              }
            }}
          >
            <ChevronLeft size={20} />
            <span>{step === 1 || step === 5 ? "Back to Movie" : "Previous Step"}</span>
          </button>

          {/* User Location Bar */}
          <div className="user-location-badge" onClick={() => setIsLocationModalOpen(true)}>
            <div className="loc-icon-wrap">
              <MapPin size={16} />
            </div>
            <div className="loc-text">
              <span className="loc-label">Your Location</span>
              <strong className="loc-val">
                {userLocation.city}, {userLocation.state}
              </strong>
            </div>
            <span className="btn-change-loc">Change</span>
          </div>
        </div>

        {/* Movie Info Header */}
        {movie && (
          <div className="movie-booking-hero">
            <div className="hero-poster">
              {movie.images?.poster ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${movie.images.poster}`}
                  alt={movie.name}
                />
              ) : (
                <div className="no-poster">🎬</div>
              )}
            </div>

            <div className="hero-details">
              <div className="movie-tag-pill">NOW SHOWING IN THEATRES</div>
              <h1 className="hero-title">{movie.name}</h1>
              <div className="hero-meta">
                {movie.theatreStatus?.releaseDate?.slice(0, 4) && (
                  <span>{movie.theatreStatus.releaseDate.slice(0, 4)}</span>
                )}
                <span>•</span>
                <span>{movie.ageRating || "U/A 13+"}</span>
                <span>•</span>
                <span>{movie.duration ? `${movie.duration} mins` : "2h 15m"}</span>
                {movie.genres?.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="genres-list">
                      {movie.genres.map((g) => g.name || g).slice(0, 3).join(", ")}
                    </span>
                  </>
                )}
              </div>
              <p className="hero-state-note">
                <Compass size={15} /> Showing in cinemas across{" "}
                <strong>{userLocation.state}</strong> ({userLocation.city})
              </p>
            </div>
          </div>
        )}

        {/* Flow Progress Steps Indicator */}
        <div className="booking-stepper">
          <div className={`step-item ${step >= 1 ? "active" : ""}`}>
            <span className="step-num">1</span>
            <span className="step-title">Theatres & Time</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 2 ? "active" : ""}`}>
            <span className="step-num">2</span>
            <span className="step-title">Select Seats</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 3 ? "active" : ""}`}>
            <span className="step-num">3</span>
            <span className="step-title">F&B Snacks</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 4 ? "active" : ""}`}>
            <span className="step-num">4</span>
            <span className="step-title">Payment</span>
          </div>
          <div className="step-connector" />
          <div className={`step-item ${step >= 5 ? "active" : ""}`}>
            <span className="step-num">5</span>
            <span className="step-title">Digital Ticket</span>
          </div>
        </div>

        {/* ===================== STEP 1: THEATRES & SHOWTIMES ===================== */}
        {step === 1 && (
          <div className="booking-step-content">
            {/* Date Selection Bar */}
            <div className="dates-selector-wrapper">
              <div className="dates-label">
                <Calendar size={18} />
                <span>Select Show Date</span>
              </div>
              <div className="dates-scroll-row">
                {availableDates.map((item, index) => (
                  <button
                    key={index}
                    className={`date-pill ${selectedDateIndex === index ? "selected" : ""}`}
                    onClick={() => setSelectedDateIndex(index)}
                  >
                    <span className="date-day">{item.dayName}</span>
                    <span className="date-number">{item.dayNum}</span>
                    <span className="date-month">{item.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="booking-filters-bar">
              <div className="filter-group">
                <span className="filter-title">Experience:</span>
                {["All", "IMAX 2D", "Dolby Atmos", "4DX 3D", "2D"].map((exp) => (
                  <button
                    key={exp}
                    className={`filter-btn ${selectedFormat === exp ? "active" : ""}`}
                    onClick={() => setSelectedFormat(exp)}
                  >
                    {exp}
                  </button>
                ))}
              </div>

              <div className="filter-group">
                <span className="filter-title">Showtime:</span>
                {["All", "Morning", "Afternoon", "Evening", "Night"].map((timeSlot) => (
                  <button
                    key={timeSlot}
                    className={`filter-btn ${selectedTimeFilter === timeSlot ? "active" : ""}`}
                    onClick={() => setSelectedTimeFilter(timeSlot)}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>

            {/* Theatres Listing */}
            <div className="theatres-listing-section">
              <div className="section-headline">
                <h2>Theatres in {userLocation.city}</h2>
                <span className="theatre-count">
                  {filteredTheatres.length} cinemas showing "{movie?.name || "Movie"}"
                </span>
              </div>

              {loadingTheatres ? (
                <div className="theatres-loading">
                  <div className="spinner" />
                  <p>Finding theatres showing in {userLocation.city}...</p>
                </div>
              ) : filteredTheatres.length === 0 ? (
                <div className="no-theatres-card">
                  <Film size={42} />
                  <h3>No theatres matched your current filters</h3>
                  <p>
                    Try choosing a different date, filter, or switch to another city in{" "}
                    {userLocation.state}.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setSelectedFormat("All");
                      setSelectedTimeFilter("All");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="theatres-cards-list">
                  {filteredTheatres.map((theatre) => (
                    <div key={theatre.id} className="theatre-card">
                      <div className="theatre-meta-col">
                        <div className="theatre-name-row">
                          <h3 className="theatre-name">{theatre.name}</h3>
                          <span className="theatre-dist">{theatre.distance}</span>
                        </div>
                        <p className="theatre-addr">{theatre.address}</p>

                        <div className="theatre-amenities">
                          {theatre.experiences.map((exp, idx) => (
                            <span key={idx} className="amenity-tag">
                              {exp}
                            </span>
                          ))}
                          <span className="amenity-tag fnb">🍿 F&B Available</span>
                          <span className="amenity-tag ticket">🎟️ M-Ticket</span>
                        </div>
                      </div>

                      {/* Showtimes Row */}
                      <div className="theatre-showtimes-col">
                        <div className="showtimes-grid">
                          {theatre.showtimes.map((st, sIdx) => {
                            let statusClass = "avail-good";
                            if (st.status === "Filling Fast") statusClass = "avail-medium";
                            if (st.status === "Almost Full") statusClass = "avail-low";

                            return (
                              <button
                                key={sIdx}
                                className={`showtime-btn ${statusClass}`}
                                onClick={() => handlePickShowtime(theatre, st)}
                              >
                                <span className="time-val">{st.time}</span>
                                <span className="format-label">{st.format}</span>
                                <span className="status-dot-label">
                                  <span className="dot" /> {st.status}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== STEP 2: SEAT SELECTION ===================== */}
        {step === 2 && selectedTheatre && selectedShowtime && (
          <div className="booking-step-content seat-selection-view">
            {/* Show info bar */}
            <div className="seat-screen-info-bar">
              <div>
                <h2>{selectedTheatre.name}</h2>
                <p>
                  {selectedShowtime.audi} • {selectedShowtime.format} •{" "}
                  <strong>{selectedShowtime.time}</strong> •{" "}
                  {availableDates[selectedDateIndex]?.formatted}
                </p>
              </div>
              <div className="seat-limit-notice">
                <span>Select up to 8 seats</span>
              </div>
            </div>

            {/* Cinema Screen Visual */}
            <div className="screen-visual-wrapper">
              <div className="screen-curve-bar" />
              <div className="screen-glow-mesh" />
              <div className="screen-label">ALL EYES THIS WAY : CINEMA SCREEN</div>
            </div>

            {/* Interactive Seat Map */}
            <div className="seats-map-container">
              {SEAT_ROWS.map((rowObj) => (
                <div key={rowObj.row} className="seat-row-wrapper">
                  <div className="row-label-badge">{rowObj.row}</div>

                  <div className="seats-in-row">
                    {Array.from({ length: rowObj.seats }, (_, i) => i + 1).map((seatNum) => {
                      const seatId = `${rowObj.row}${seatNum}`;
                      const isBooked = bookedSeatsMap[seatId];
                      const isSelected = selectedSeats.some(
                        (s) => s.seatNumber === seatId
                      );
                      const isAisle = rowObj.aisleAfter?.includes(seatNum);

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            className={`seat-unit tier-${rowObj.tier.toLowerCase()} ${
                              isBooked ? "booked" : isSelected ? "selected" : "available"
                            }`}
                            disabled={isBooked}
                            onClick={() => handleToggleSeat(rowObj, seatNum)}
                            title={`${seatId} (${rowObj.tier}) - ₹${rowObj.price}`}
                          >
                            <span className="seat-number">{seatNum}</span>
                          </button>
                          {isAisle && <div className="seat-aisle-gap" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="row-price-badge">
                    <span className="tier-tag">{rowObj.tier}</span>
                    <span className="price-tag">₹{rowObj.price}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Seat Map Legend */}
            <div className="seats-legend-bar">
              <div className="legend-item">
                <span className="legend-sample available" />
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-sample selected" />
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <span className="legend-sample booked" />
                <span>Sold Out</span>
              </div>
              <div className="legend-divider" />
              <div className="legend-item">
                <span className="legend-badge-vip">VIP (₹500)</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge-prime">Prime (₹320)</span>
              </div>
              <div className="legend-item">
                <span className="legend-badge-classic">Classic (₹200)</span>
              </div>
            </div>

            {/* Bottom Floating Bar */}
            <div className="bottom-seat-checkout-bar">
              <div className="selection-summary">
                {selectedSeats.length === 0 ? (
                  <p className="no-selection-msg">Please click on seats above to select</p>
                ) : (
                  <div>
                    <div className="selected-seats-pills">
                      {selectedSeats.map((s) => (
                        <span key={s.seatNumber} className="seat-chip">
                          {s.seatNumber} ({s.tier})
                        </span>
                      ))}
                    </div>
                    <div className="summary-price-line">
                      <span>{selectedSeats.length} Ticket(s)</span>
                      <span>•</span>
                      <strong>₹{seatsTotal}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedSeats([]);
                    setStep(1);
                  }}
                >
                  Change Showtime
                </button>
                <button
                  className="btn-primary"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep(3)}
                >
                  Continue to Snacks
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 3: SNACKS & BEVERAGES ===================== */}
        {step === 3 && (
          <div className="booking-step-content snacks-view">
            <div className="snacks-header">
              <div>
                <h2>Cinema Snacks & Drinks</h2>
                <p>Enhance your theatre experience with fresh popcorn & cold beverages</p>
              </div>
              <button className="btn-skip" onClick={() => setStep(4)}>
                Skip to Payment <ChevronRight size={16} />
              </button>
            </div>

            <div className="snacks-grid">
              {SNACK_OPTIONS.map((snack) => {
                const count = snacksCart[snack.id]?.quantity || 0;
                return (
                  <div key={snack.id} className="snack-card">
                    <div className="snack-emoji">{snack.img}</div>
                    <div className="snack-details">
                      <h4 className="snack-title">{snack.name}</h4>
                      <p className="snack-desc">{snack.desc}</p>
                      <strong className="snack-price">₹{snack.price}</strong>
                    </div>

                    <div className="snack-ctrl">
                      {count === 0 ? (
                        <button
                          className="btn-add-snack"
                          onClick={() => handleUpdateSnack(snack, 1)}
                        >
                          + ADD
                        </button>
                      ) : (
                        <div className="quantity-toggle">
                          <button onClick={() => handleUpdateSnack(snack, -1)}>-</button>
                          <span>{count}</span>
                          <button onClick={() => handleUpdateSnack(snack, 1)}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom floating bar */}
            <div className="bottom-seat-checkout-bar">
              <div className="selection-summary">
                <div className="summary-price-line">
                  <span>Seats: ₹{seatsTotal}</span>
                  {snacksTotal > 0 && <span>+ Snacks: ₹{snacksTotal}</span>}
                  <span>•</span>
                  <strong>Total: ₹{seatsTotal + snacksTotal}</strong>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Back to Seats
                </button>
                <button className="btn-primary" onClick={() => setStep(4)}>
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 4: PAYMENT & CHECKOUT ===================== */}
        {step === 4 && (
          <div className="booking-step-content checkout-view">
            <div className="checkout-grid">
              {/* Left Column: Form & Payment Method */}
              <form className="checkout-form-col" onSubmit={handleConfirmBooking}>
                <div className="checkout-section-box">
                  <h3>
                    <Film size={18} /> Contact Information
                  </h3>
                  <p className="section-subtext">
                    Your digital ticket will be sent to this email & mobile number
                  </p>

                  <div className="form-fields-grid">
                    <div className="form-field">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-field">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        required
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        placeholder="you@domain.com"
                      />
                    </div>
                    <div className="form-field full-width">
                      <label>Phone Number (for SMS M-Ticket)</label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="checkout-section-box">
                  <h3>
                    <CreditCard size={18} /> Select Payment Method
                  </h3>

                  <div className="payment-options-list">
                    {/* UPI Option */}
                    <label
                      className={`payment-method-card ${
                        paymentMethod === "UPI" ? "active" : ""
                      }`}
                    >
                      <div className="method-left">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "UPI"}
                          onChange={() => setPaymentMethod("UPI")}
                        />
                        <div>
                          <strong>UPI (Instant & Zero Fee)</strong>
                          <p>Google Pay, PhonePe, Paytm, BHIM</p>
                        </div>
                      </div>
                      <span className="pay-tag-fast">Recommended</span>
                    </label>

                    {paymentMethod === "UPI" && (
                      <div className="upi-input-box">
                        <input
                          type="text"
                          placeholder="Enter UPI ID (e.g. username@oksbi / username@paytm)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-quick-fill"
                          onClick={() => setUpiId("watchhub.guest@okaxis")}
                        >
                          Use Demo UPI ID
                        </button>
                      </div>
                    )}

                    {/* Card Option */}
                    <label
                      className={`payment-method-card ${
                        paymentMethod === "Card" ? "active" : ""
                      }`}
                    >
                      <div className="method-left">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "Card"}
                          onChange={() => setPaymentMethod("Card")}
                        />
                        <div>
                          <strong>Credit / Debit Card</strong>
                          <p>Visa, MasterCard, RuPay</p>
                        </div>
                      </div>
                    </label>

                    {/* WatchHub Pay Option */}
                    <label
                      className={`payment-method-card ${
                        paymentMethod === "WatchHub Pay" ? "active" : ""
                      }`}
                    >
                      <div className="method-left">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === "WatchHub Pay"}
                          onChange={() => setPaymentMethod("WatchHub Pay")}
                        />
                        <div>
                          <strong>WatchHub Quick Checkout</strong>
                          <p>1-Click Seamless Cinema Booking</p>
                        </div>
                      </div>
                      <span className="pay-tag-wh">WatchHub Exclusive</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-pay-submit"
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="spinner-small" /> Processing Booking...
                    </>
                  ) : (
                    <>
                      <span>Pay & Confirm Booking</span>
                      <strong>₹{grandTotal}</strong>
                    </>
                  )}
                </button>
              </form>

              {/* Right Column: Order Summary */}
              <div className="checkout-summary-col">
                <div className="summary-card">
                  <div className="summary-movie-header">
                    {movie?.images?.poster && (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${movie.images.poster}`}
                        alt={movie.name}
                        className="summary-thumb"
                      />
                    )}
                    <div>
                      <h4 className="summary-movie-title">{movie?.name}</h4>
                      <p className="summary-theatre-name">{selectedTheatre?.name}</p>
                      <p className="summary-screen-info">
                        {selectedShowtime?.audi} • {selectedShowtime?.format}
                      </p>
                    </div>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-detail-row">
                    <span>Date & Time:</span>
                    <strong>
                      {availableDates[selectedDateIndex]?.formatted} at{" "}
                      {selectedShowtime?.time}
                    </strong>
                  </div>

                  <div className="summary-detail-row">
                    <span>Seats:</span>
                    <strong>
                      {selectedSeats.map((s) => s.seatNumber).join(", ")} (
                      {selectedSeats.length} seats)
                    </strong>
                  </div>

                  <div className="summary-divider" />

                  <div className="summary-price-breakdown">
                    <div className="price-line">
                      <span>Tickets Subtotal</span>
                      <span>₹{seatsTotal}</span>
                    </div>

                    {snacksTotal > 0 && (
                      <div className="price-line">
                        <span>Cinema F&B Snacks</span>
                        <span>₹{snacksTotal}</span>
                      </div>
                    )}

                    <div className="price-line">
                      <span>Convenience & Booking Fee</span>
                      <span>₹{convenienceFee}</span>
                    </div>

                    <div className="summary-divider" />

                    <div className="price-line total-line">
                      <strong>Total Amount</strong>
                      <strong className="grand-price">₹{grandTotal}</strong>
                    </div>
                  </div>

                  <div className="summary-guarantee-note">
                    <CheckCircle2 size={16} /> 100% Guaranteed Seat Allocation with
                    Instant Digital Ticket
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== STEP 5: DIGITAL TICKET CONFIRMATION ===================== */}
        {step === 5 && confirmedBooking && (
          <div className="booking-step-content ticket-success-view">
            <div className="success-banner-box">
              <div className="success-icon-wrap">
                <CheckCircle2 size={42} />
              </div>
              <h2>Booking Confirmed!</h2>
              <p>
                Your seats have been successfully reserved at {confirmedBooking.theatreName}.
              </p>
            </div>

            {/* Cinematic Boarding Pass Ticket */}
            <div className="cinema-ticket-card">
              <div className="ticket-header-strip">
                <div className="wh-logo-badge">
                  <Film size={18} /> WatchHub Cinema Pass
                </div>
                <div className="ticket-id-tag">
                  Booking ID: <strong>{confirmedBooking.bookingId}</strong>
                </div>
              </div>

              <div className="ticket-main-body">
                <div className="ticket-movie-col">
                  {confirmedBooking.mediaPoster && (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${confirmedBooking.mediaPoster}`}
                      alt={confirmedBooking.mediaTitle}
                      className="ticket-poster"
                    />
                  )}
                  <div className="ticket-movie-info">
                    <span className="movie-cert-badge">U/A</span>
                    <h3 className="ticket-title">{confirmedBooking.mediaTitle}</h3>
                    <p className="ticket-format">
                      {confirmedBooking.screen} • {confirmedBooking.format}
                    </p>
                    <p className="ticket-theatre-title">
                      {confirmedBooking.theatreName}
                    </p>
                    <p className="ticket-loc">
                      {confirmedBooking.theatreLocation?.address ||
                        `${confirmedBooking.theatreLocation?.city}, ${confirmedBooking.theatreLocation?.state}`}
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
                      <strong className="t-val">{confirmedBooking.showDate}</strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">SHOW TIME</span>
                      <strong className="t-val accent">{confirmedBooking.showTime}</strong>
                    </div>
                    <div className="t-block full-width">
                      <span className="t-label">SEATS</span>
                      <strong className="t-val seats-highlight">
                        {confirmedBooking.seats?.map((s) => s.seatNumber).join(", ")}
                      </strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">TOTAL PAID</span>
                      <strong className="t-val">₹{confirmedBooking.totalAmount}</strong>
                    </div>
                    <div className="t-block">
                      <span className="t-label">BOOKED FOR</span>
                      <strong className="t-val">{confirmedBooking.guestInfo?.name}</strong>
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

            {/* Ticket Actions */}
            <div className="ticket-actions-row">
              <button
                className="btn-action-outline"
                onClick={() => window.print()}
              >
                <Download size={18} /> Print / Save Ticket
              </button>
              <button
                className="btn-action-primary"
                onClick={() => navigate("/bookings")}
              >
                <Ticket size={18} /> View in My Bookings
              </button>
              <button
                className="btn-action-subtle"
                onClick={() => navigate(`/media/${type}/${id}`)}
              >
                Back to Movie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== LOCATION MODAL ===================== */}
      <AnimatePresence>
        {isLocationModalOpen && (
          <div className="modal-backdrop">
            <motion.div
              className="location-modal-card"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="header-icon-title">
                  <MapPin className="pin-icon" size={24} />
                  <div>
                    <h3>Select Your Location</h3>
                    <p>Find cinemas and showtimes in your state & city</p>
                  </div>
                </div>
                <button
                  className="btn-close-modal"
                  onClick={() => setIsLocationModalOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* GPS Auto-Detect Button */}
              <div className="gps-section">
                <button
                  className="btn-detect-gps"
                  disabled={detectingGps}
                  onClick={handleDetectGPS}
                >
                  <Compass size={18} />
                  <span>
                    {detectingGps
                      ? "Detecting your location..."
                      : "Use Current Location (GPS Auto-Detect)"}
                  </span>
                </button>
              </div>

              <div className="modal-section-divider">
                <span>OR SELECT REGION</span>
              </div>

              {/* Popular Cities */}
              <div className="popular-cities-wrap">
                <span className="pop-label">Popular Cinema Hubs:</span>
                <div className="pop-cities-chips">
                  {POPULAR_CITIES.map((item) => (
                    <button
                      key={item.city}
                      className={`pop-chip ${
                        userLocation.city === item.city &&
                        userLocation.state === item.state
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleSelectLocation(item.state, item.city)}
                    >
                      {item.city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full State & City Dropdowns */}
              <div className="custom-loc-selectors">
                <div className="selector-field">
                  <label>State / Region</label>
                  <select
                    value={userLocation.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      const cities = INDIAN_STATES_CITIES[newState] || ["City Center"];
                      setUserLocation({ state: newState, city: cities[0] });
                    }}
                  >
                    {Object.keys(INDIAN_STATES_CITIES).map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="selector-field">
                  <label>City / District</label>
                  <select
                    value={userLocation.city}
                    onChange={(e) =>
                      setUserLocation({ ...userLocation, city: e.target.value })
                    }
                  >
                    {(INDIAN_STATES_CITIES[userLocation.state] || [userLocation.city]).map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-primary full-width"
                  onClick={() =>
                    handleSelectLocation(userLocation.state, userLocation.city)
                  }
                >
                  Confirm & View Theatres in {userLocation.city}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
