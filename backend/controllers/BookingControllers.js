const WatchHub_Booking = require("../models/WatchHub_Booking_model");
const { sendNotification } = require("../ultils/NotificationHelper");

// Helper to generate a unique readable booking ID (e.g., WHB-893421)
const generateBookingId = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WHB-${randomPart}`;
};

// Database / predefined theatre registry by State & City
const THEATRES_BY_STATE_CITY = {
  Maharashtra: {
    Mumbai: [
      {
        id: "pvr-palladium-mum",
        name: "PVR INOX: Phoenix Palladium, Lower Parel",
        address: "Level 4, High Street Phoenix, Senapati Bapat Marg, Lower Parel",
        distance: "1.8 km away",
        screens: ["Audi 1 - IMAX Laser", "Audi 2 - Dolby Atmos", "Audi 3 - 4DX"],
        experiences: ["IMAX 2D", "Dolby Atmos", "4DX 3D", "2D"],
        pricing: { vip: 520, prime: 320, standard: 200 },
        showtimes: [
          { time: "10:15 AM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX Laser" },
          { time: "01:45 PM", format: "IMAX 2D", status: "Filling Fast", audi: "Audi 1 - IMAX Laser" },
          { time: "05:15 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos" },
          { time: "08:30 PM", format: "4DX 3D", status: "Almost Full", audi: "Audi 3 - 4DX" },
          { time: "11:00 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos" },
        ],
      },
      {
        id: "cinepolis-viviana-mum",
        name: "Cinépolis VIP: Viviana Mall, Thane",
        address: "Eastern Express Hwy, Laxmi Nagar, Thane West",
        distance: "3.4 km away",
        screens: ["Screen 1 - Macro XE", "Screen 2 - VIP Lounge", "Screen 3 - 2D"],
        experiences: ["Macro XE", "Dolby Atmos", "2D"],
        pricing: { vip: 480, prime: 290, standard: 180 },
        showtimes: [
          { time: "11:00 AM", format: "Dolby Atmos", status: "Available", audi: "Screen 1 - Macro XE" },
          { time: "02:30 PM", format: "Macro XE", status: "Available", audi: "Screen 1 - Macro XE" },
          { time: "06:00 PM", format: "VIP Lounge", status: "Filling Fast", audi: "Screen 2 - VIP Lounge" },
          { time: "09:15 PM", format: "Dolby Atmos", status: "Available", audi: "Screen 1 - Macro XE" },
        ],
      },
      {
        id: "inox-inorbit-malad",
        name: "INOX Megaplex: Inorbit Mall, Malad West",
        address: "New Link Rd, Malad West, Mumbai",
        distance: "5.1 km away",
        screens: ["Audi 4 - ScreenX", "Audi 5 - Laser", "Audi 6 - Atmos"],
        experiences: ["ScreenX", "Dolby Atmos", "2D"],
        pricing: { vip: 500, prime: 300, standard: 190 },
        showtimes: [
          { time: "12:00 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 6 - Atmos" },
          { time: "03:45 PM", format: "ScreenX", status: "Filling Fast", audi: "Audi 4 - ScreenX" },
          { time: "07:30 PM", format: "Laser", status: "Available", audi: "Audi 5 - Laser" },
          { time: "10:45 PM", format: "Dolby Atmos", status: "Almost Full", audi: "Audi 6 - Atmos" },
        ],
      },
      {
        id: "miraj-wadala-mum",
        name: "Miraj Cinemas: IMAX Wadala",
        address: "Anik Wadala Link Rd, Bhakti Park, Wadala East",
        distance: "6.2 km away",
        screens: ["Dome Screen 1", "Audi 2 - Dolby 7.1"],
        experiences: ["IMAX 3D", "Dolby Atmos", "2D"],
        pricing: { vip: 450, prime: 260, standard: 160 },
        showtimes: [
          { time: "10:30 AM", format: "2D", status: "Available", audi: "Audi 2 - Dolby 7.1" },
          { time: "02:15 PM", format: "IMAX 3D", status: "Available", audi: "Dome Screen 1" },
          { time: "06:45 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby 7.1" },
          { time: "10:00 PM", format: "IMAX 3D", status: "Filling Fast", audi: "Dome Screen 1" },
        ],
      },
    ],
    Pune: [
      {
        id: "pvr-pavilion-pune",
        name: "PVR ICON: The Pavilion, SB Road",
        address: "Senapati Bapat Rd, Laxmi Society, Model Colony, Pune",
        distance: "2.1 km away",
        screens: ["Audi 1 - 4DX", "Audi 2 - P[XL] Atmos", "Audi 3 - Gold"],
        experiences: ["P[XL] Atmos", "4DX 3D", "Gold Class", "2D"],
        pricing: { vip: 490, prime: 290, standard: 190 },
        showtimes: [
          { time: "10:45 AM", format: "P[XL] Atmos", status: "Available", audi: "Audi 2 - P[XL] Atmos" },
          { time: "02:15 PM", format: "4DX 3D", status: "Filling Fast", audi: "Audi 1 - 4DX" },
          { time: "05:45 PM", format: "P[XL] Atmos", status: "Available", audi: "Audi 2 - P[XL] Atmos" },
          { time: "09:00 PM", format: "Gold Class", status: "Almost Full", audi: "Audi 3 - Gold" },
        ],
      },
      {
        id: "cinepolis-seasons-pune",
        name: "Cinépolis: Seasons Mall, Magarpatta",
        address: "Magarpatta City, Hadapsar, Pune",
        distance: "4.8 km away",
        screens: ["Audi 1 - VIP", "Audi 4 - Macro XE"],
        experiences: ["Macro XE", "VIP Lounge", "2D"],
        pricing: { vip: 450, prime: 270, standard: 170 },
        showtimes: [
          { time: "11:30 AM", format: "Macro XE", status: "Available", audi: "Audi 4 - Macro XE" },
          { time: "03:10 PM", format: "2D", status: "Available", audi: "Audi 1 - VIP" },
          { time: "07:00 PM", format: "Macro XE", status: "Filling Fast", audi: "Audi 4 - Macro XE" },
          { time: "10:15 PM", format: "VIP Lounge", status: "Available", audi: "Audi 1 - VIP" },
        ],
      },
    ],
  },
  "Delhi NCR": {
    "New Delhi": [
      {
        id: "pvr-directors-cut-del",
        name: "PVR Director's Cut: Ambience Mall, Vasant Kunj",
        address: "Nelson Mandela Marg, Vasant Kunj II, New Delhi",
        distance: "2.5 km away",
        screens: ["Lounge Audi 1", "Lounge Audi 2", "Lounge Audi 3"],
        experiences: ["Director's Cut", "Dolby Atmos", "Recliner"],
        pricing: { vip: 650, prime: 450, standard: 280 },
        showtimes: [
          { time: "11:15 AM", format: "Director's Cut", status: "Available", audi: "Lounge Audi 1" },
          { time: "02:45 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Lounge Audi 2" },
          { time: "06:30 PM", format: "Director's Cut", status: "Almost Full", audi: "Lounge Audi 1" },
          { time: "09:45 PM", format: "Dolby Atmos", status: "Available", audi: "Lounge Audi 3" },
        ],
      },
      {
        id: "pvr-plaza-cp-del",
        name: "PVR Plaza: Connaught Place",
        address: "H Block, Connaught Circus, New Delhi",
        distance: "3.1 km away",
        screens: ["Main Heritage Audi", "Heritage Audi 2"],
        experiences: ["Dolby Atmos 7.1", "2D"],
        pricing: { vip: 420, prime: 260, standard: 170 },
        showtimes: [
          { time: "10:30 AM", format: "2D", status: "Available", audi: "Main Heritage Audi" },
          { time: "01:45 PM", format: "Dolby Atmos", status: "Available", audi: "Main Heritage Audi" },
          { time: "05:15 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Main Heritage Audi" },
          { time: "08:45 PM", format: "Dolby Atmos", status: "Available", audi: "Heritage Audi 2" },
        ],
      },
      {
        id: "cinepolis-dlf-saket-del",
        name: "Cinépolis: DLF Avenue, Saket",
        address: "Press Enclave Marg, Saket District Centre, New Delhi",
        distance: "4.2 km away",
        screens: ["Audi 1 - 4DX", "Audi 2 - Macro XE"],
        experiences: ["4DX 3D", "Macro XE", "2D"],
        pricing: { vip: 490, prime: 300, standard: 190 },
        showtimes: [
          { time: "12:15 PM", format: "Macro XE", status: "Available", audi: "Audi 2 - Macro XE" },
          { time: "04:00 PM", format: "4DX 3D", status: "Almost Full", audi: "Audi 1 - 4DX" },
          { time: "07:30 PM", format: "Macro XE", status: "Available", audi: "Audi 2 - Macro XE" },
          { time: "10:30 PM", format: "4DX 3D", status: "Available", audi: "Audi 1 - 4DX" },
        ],
      },
    ],
    Noida: [
      {
        id: "pvr-logix-noida",
        name: "PVR Superplex: Logix City Centre, Sector 32",
        address: "BW-58, Wave City Centre, Sector 32, Noida",
        distance: "1.9 km away",
        screens: ["IMAX Laser Audi 1", "4DX Audi 2", "Playhouse Audi 3"],
        experiences: ["IMAX Laser", "4DX 3D", "Dolby Atmos"],
        pricing: { vip: 510, prime: 310, standard: 190 },
        showtimes: [
          { time: "10:45 AM", format: "IMAX Laser", status: "Available", audi: "IMAX Laser Audi 1" },
          { time: "02:00 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "4DX Audi 2" },
          { time: "05:30 PM", format: "IMAX Laser", status: "Almost Full", audi: "IMAX Laser Audi 1" },
          { time: "09:00 PM", format: "4DX 3D", status: "Available", audi: "4DX Audi 2" },
        ],
      },
    ],
    Gurgaon: [
      {
        id: "pvr-ambience-gurgaon",
        name: "PVR INOX: Ambience Mall, NH 8, Gurgaon",
        address: "Ambience Mall, NH 8, DLF Phase 3, Gurugram",
        distance: "2.8 km away",
        screens: ["Audi 1 - IMAX", "Audi 2 - Dolby Atmos", "Audi 3 - Gold"],
        experiences: ["IMAX 2D", "Dolby Atmos", "Gold Class"],
        pricing: { vip: 540, prime: 330, standard: 210 },
        showtimes: [
          { time: "11:00 AM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX" },
          { time: "02:30 PM", format: "Gold Class", status: "Available", audi: "Audi 3 - Gold" },
          { time: "06:15 PM", format: "IMAX 2D", status: "Filling Fast", audi: "Audi 1 - IMAX" },
          { time: "09:30 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos" },
        ],
      },
    ],
  },
  Karnataka: {
    Bengaluru: [
      {
        id: "pvr-orion-bengaluru",
        name: "PVR INOX: Orion Mall, Rajajinagar",
        address: "Brigade Gateway, Dr Rajkumar Rd, Rajajinagar, Bengaluru",
        distance: "2.3 km away",
        screens: ["Audi 1 - P[XL]", "Audi 2 - 4DX", "Audi 3 - Dolby Atmos"],
        experiences: ["P[XL] Laser", "4DX 3D", "Dolby Atmos"],
        pricing: { vip: 490, prime: 290, standard: 180 },
        showtimes: [
          { time: "10:30 AM", format: "P[XL] Laser", status: "Available", audi: "Audi 1 - P[XL]" },
          { time: "02:00 PM", format: "4DX 3D", status: "Filling Fast", audi: "Audi 2 - 4DX" },
          { time: "05:45 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 3 - Dolby Atmos" },
          { time: "09:15 PM", format: "P[XL] Laser", status: "Almost Full", audi: "Audi 1 - P[XL]" },
        ],
      },
      {
        id: "pvr-vega-city-bengaluru",
        name: "PVR INOX: Vega City Mall, Bannerghatta",
        address: "Vega City Mall, Srinivas Nagar, Bannerghatta Rd, Bengaluru",
        distance: "4.1 km away",
        screens: ["IMAX Audi 1", "ScreenX Audi 2"],
        experiences: ["IMAX 2D", "ScreenX", "Dolby Atmos"],
        pricing: { vip: 510, prime: 310, standard: 190 },
        showtimes: [
          { time: "11:15 AM", format: "IMAX 2D", status: "Available", audi: "IMAX Audi 1" },
          { time: "03:00 PM", format: "ScreenX", status: "Available", audi: "ScreenX Audi 2" },
          { time: "06:30 PM", format: "IMAX 2D", status: "Filling Fast", audi: "IMAX Audi 1" },
          { time: "10:00 PM", format: "Dolby Atmos", status: "Available", audi: "IMAX Audi 1" },
        ],
      },
      {
        id: "cinepolis-shantiniketan-bengaluru",
        name: "Cinépolis: Forum Shantiniketan, Whitefield",
        address: "ITPL Main Rd, Thigalarapalya, Krishnarajapura, Bengaluru",
        distance: "6.0 km away",
        screens: ["Audi 1 - Macro XE", "Audi 2 - VIP"],
        experiences: ["Macro XE", "VIP Lounge", "2D"],
        pricing: { vip: 460, prime: 280, standard: 170 },
        showtimes: [
          { time: "11:45 AM", format: "Macro XE", status: "Available", audi: "Audi 1 - Macro XE" },
          { time: "03:30 PM", format: "2D", status: "Available", audi: "Audi 2 - VIP" },
          { time: "07:15 PM", format: "Macro XE", status: "Filling Fast", audi: "Audi 1 - Macro XE" },
        ],
      },
    ],
  },
  Telangana: {
    Hyderabad: [
      {
        id: "prasads-multiplex-hyd",
        name: "Prasad's Multiplex & Large Screen, Necklace Road",
        address: "NTR Gardens, LIC Division, Khairatabad, Hyderabad",
        distance: "2.0 km away",
        screens: ["Large Screen 6 - Dolby Atmos", "Screen 1 - 4K Laser"],
        experiences: ["Large Screen Atmos", "4K Laser", "2D"],
        pricing: { vip: 420, prime: 250, standard: 150 },
        showtimes: [
          { time: "10:15 AM", format: "Large Screen Atmos", status: "Available", audi: "Large Screen 6 - Dolby Atmos" },
          { time: "01:30 PM", format: "Large Screen Atmos", status: "Filling Fast", audi: "Large Screen 6 - Dolby Atmos" },
          { time: "04:45 PM", format: "4K Laser", status: "Available", audi: "Screen 1 - 4K Laser" },
          { time: "08:15 PM", format: "Large Screen Atmos", status: "Almost Full", audi: "Large Screen 6 - Dolby Atmos" },
          { time: "11:15 PM", format: "4K Laser", status: "Available", audi: "Screen 1 - 4K Laser" },
        ],
      },
      {
        id: "amb-cinemas-hyd",
        name: "AMB Cinemas: Sarath City Capital Mall, Gachibowli",
        address: "Gachibowli - Miyapur Rd, Whitefields, Kondapur, Hyderabad",
        distance: "4.5 km away",
        screens: ["Screen 1 - Laser 3D", "Screen 2 - Dolby Atmos", "Screen 3 - VIP M-Lounge"],
        experiences: ["Laser 3D", "Dolby Atmos", "VIP M-Lounge"],
        pricing: { vip: 480, prime: 290, standard: 180 },
        showtimes: [
          { time: "11:00 AM", format: "Dolby Atmos", status: "Available", audi: "Screen 2 - Dolby Atmos" },
          { time: "02:30 PM", format: "Laser 3D", status: "Filling Fast", audi: "Screen 1 - Laser 3D" },
          { time: "06:00 PM", format: "VIP M-Lounge", status: "Almost Full", audi: "Screen 3 - VIP M-Lounge" },
          { time: "09:30 PM", format: "Laser 3D", status: "Available", audi: "Screen 1 - Laser 3D" },
        ],
      },
    ],
  },
  "Tamil Nadu": {
    Chennai: [
      {
        id: "spi-sathyam-chennai",
        name: "SPI Cinemas: Sathyam, Royapettah",
        address: "8, Thiru Vi Ka Rd, Royapettah, Chennai",
        distance: "1.7 km away",
        screens: ["Sathyam Main - Dolby Atmos", "Santham", "Seasons"],
        experiences: ["Dolby Atmos", "Laser 2D", "Rhubarb Popcorn Hub"],
        pricing: { vip: 390, prime: 220, standard: 150 },
        showtimes: [
          { time: "10:30 AM", format: "Dolby Atmos", status: "Available", audi: "Sathyam Main - Dolby Atmos" },
          { time: "01:45 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Sathyam Main - Dolby Atmos" },
          { time: "05:15 PM", format: "Laser 2D", status: "Available", audi: "Santham" },
          { time: "08:45 PM", format: "Dolby Atmos", status: "Almost Full", audi: "Sathyam Main - Dolby Atmos" },
        ],
      },
      {
        id: "pvr-vr-chennai",
        name: "PVR INOX: VR Chennai Mall, Anna Nagar",
        address: "Inner Ring Rd, Thirumangalam, Anna Nagar, Chennai",
        distance: "3.8 km away",
        screens: ["Audi 1 - IMAX", "Audi 2 - P[XL]"],
        experiences: ["IMAX 2D", "P[XL]", "Dolby Atmos"],
        pricing: { vip: 420, prime: 250, standard: 160 },
        showtimes: [
          { time: "11:15 AM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX" },
          { time: "02:45 PM", format: "P[XL]", status: "Available", audi: "Audi 2 - P[XL]" },
          { time: "06:15 PM", format: "IMAX 2D", status: "Filling Fast", audi: "Audi 1 - IMAX" },
          { time: "09:45 PM", format: "P[XL]", status: "Available", audi: "Audi 2 - P[XL]" },
        ],
      },
    ],
  },
  "West Bengal": {
    Kolkata: [
      {
        id: "inox-south-city-kol",
        name: "INOX: South City Mall, Prince Anwar Shah Rd",
        address: "375, Prince Anwar Shah Rd, South City Complex, Kolkata",
        distance: "2.4 km away",
        screens: ["IMAX Audi 1", "Insignia Audi 2", "Audi 3 - Dolby Atmos"],
        experiences: ["IMAX 2D", "Insignia VIP", "Dolby Atmos"],
        pricing: { vip: 460, prime: 280, standard: 170 },
        showtimes: [
          { time: "10:45 AM", format: "IMAX 2D", status: "Available", audi: "IMAX Audi 1" },
          { time: "02:15 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Audi 3 - Dolby Atmos" },
          { time: "05:45 PM", format: "IMAX 2D", status: "Available", audi: "IMAX Audi 1" },
          { time: "09:00 PM", format: "Insignia VIP", status: "Almost Full", audi: "Insignia Audi 2" },
        ],
      },
    ],
  },
  Gujarat: {
    Ahmedabad: [
      {
        id: "cinepolis-alpha-one-ahm",
        name: "Cinépolis: Alpha One Mall, Vastrapur",
        address: "Sarkari Vasahat Road, Vastrapur, Ahmedabad",
        distance: "2.2 km away",
        screens: ["Audi 1 - Macro XE", "Audi 2 - Dolby Atmos"],
        experiences: ["Macro XE", "Dolby Atmos", "2D"],
        pricing: { vip: 420, prime: 250, standard: 160 },
        showtimes: [
          { time: "11:00 AM", format: "Macro XE", status: "Available", audi: "Audi 1 - Macro XE" },
          { time: "02:30 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos" },
          { time: "06:15 PM", format: "Macro XE", status: "Filling Fast", audi: "Audi 1 - Macro XE" },
          { time: "09:30 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos" },
        ],
      },
    ],
  },
  "Uttar Pradesh": {
    Lucknow: [
      {
        id: "pvr-palassio-lko",
        name: "PVR Superplex: Phoenix Palassio, Gomti Nagar",
        address: "Amar Shaheed Path, Sector 7, Gomti Nagar Extension, Lucknow",
        distance: "3.0 km away",
        screens: ["Audi 1 - IMAX", "Audi 2 - 4DX", "Audi 3 - Atmos"],
        experiences: ["IMAX 2D", "4DX 3D", "Dolby Atmos"],
        pricing: { vip: 460, prime: 270, standard: 170 },
        showtimes: [
          { time: "11:15 AM", format: "IMAX 2D", status: "Available", audi: "Audi 1 - IMAX" },
          { time: "02:45 PM", format: "4DX 3D", status: "Available", audi: "Audi 2 - 4DX" },
          { time: "06:15 PM", format: "IMAX 2D", status: "Filling Fast", audi: "Audi 1 - IMAX" },
          { time: "09:30 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 3 - Atmos" },
        ],
      },
    ],
  },
};

// Generic fallback theatre generator for any state / city
const generateFallbackTheatres = (state, city) => {
  const safeCity = city || "Downtown";
  const safeState = state || "General Region";
  return [
    {
      id: `pvr-${safeCity.toLowerCase().replace(/\s+/g, "-")}-1`,
      name: `PVR INOX: Central Mall, ${safeCity}`,
      address: `Main Boulevard, City Centre, ${safeCity}, ${safeState}`,
      distance: "2.1 km away",
      screens: ["Audi 1 - 4K Laser", "Audi 2 - Dolby Atmos 7.1"],
      experiences: ["4K Laser", "Dolby Atmos", "2D"],
      pricing: { vip: 420, prime: 260, standard: 160 },
      showtimes: [
        { time: "10:30 AM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos 7.1" },
        { time: "01:45 PM", format: "4K Laser", status: "Filling Fast", audi: "Audi 1 - 4K Laser" },
        { time: "05:15 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 2 - Dolby Atmos 7.1" },
        { time: "08:30 PM", format: "4K Laser", status: "Almost Full", audi: "Audi 1 - 4K Laser" },
      ],
    },
    {
      id: `cinepolis-${safeCity.toLowerCase().replace(/\s+/g, "-")}-2`,
      name: `Cinépolis: Grand Plaza, ${safeCity}`,
      address: `Ring Road Junction, ${safeCity}, ${safeState}`,
      distance: "3.8 km away",
      screens: ["Screen 1 - VIP Lounge", "Screen 2 - Macro XE"],
      experiences: ["Macro XE", "VIP Lounge", "2D"],
      pricing: { vip: 440, prime: 270, standard: 170 },
      showtimes: [
        { time: "11:15 AM", format: "Macro XE", status: "Available", audi: "Screen 2 - Macro XE" },
        { time: "02:45 PM", format: "VIP Lounge", status: "Available", audi: "Screen 1 - VIP Lounge" },
        { time: "06:30 PM", format: "Macro XE", status: "Filling Fast", audi: "Screen 2 - Macro XE" },
        { time: "09:45 PM", format: "Macro XE", status: "Available", audi: "Screen 2 - Macro XE" },
      ],
    },
    {
      id: `miraj-${safeCity.toLowerCase().replace(/\s+/g, "-")}-3`,
      name: `Miraj Cinemas: Galleria, ${safeCity}`,
      address: `Station Road, Market Square, ${safeCity}, ${safeState}`,
      distance: "4.5 km away",
      screens: ["Audi 1 - Dolby 7.1", "Audi 2 - Digital 2D"],
      experiences: ["Dolby Atmos", "2D"],
      pricing: { vip: 390, prime: 240, standard: 150 },
      showtimes: [
        { time: "12:00 PM", format: "2D", status: "Available", audi: "Audi 2 - Digital 2D" },
        { time: "03:30 PM", format: "Dolby Atmos", status: "Available", audi: "Audi 1 - Dolby 7.1" },
        { time: "07:15 PM", format: "Dolby Atmos", status: "Filling Fast", audi: "Audi 1 - Dolby 7.1" },
      ],
    },
  ];
};

// GET /api/bookings/theatres?state=...&city=...
exports.getTheatres = async (req, res) => {
  try {
    const { state = "Maharashtra", city = "Mumbai" } = req.query;

    let theatres = [];
    if (THEATRES_BY_STATE_CITY[state] && THEATRES_BY_STATE_CITY[state][city]) {
      theatres = THEATRES_BY_STATE_CITY[state][city];
    } else if (THEATRES_BY_STATE_CITY[state]) {
      // Pick first city in state or combine
      const cities = Object.keys(THEATRES_BY_STATE_CITY[state]);
      if (cities.length > 0 && THEATRES_BY_STATE_CITY[state][cities[0]]) {
        theatres = THEATRES_BY_STATE_CITY[state][cities[0]];
      } else {
        theatres = generateFallbackTheatres(state, city);
      }
    } else {
      theatres = generateFallbackTheatres(state, city);
    }

    res.json({
      success: true,
      state,
      city,
      theatres,
    });
  } catch (error) {
    console.error("GET THEATRES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch theatres" });
  }
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      mediaId,
      mediaType = "movie",
      mediaTitle,
      mediaPoster,
      theatreId,
      theatreName,
      theatreLocation,
      screen = "Audi 1",
      format = "2D",
      showDate,
      showTime,
      seats = [],
      snacks = [],
      convenienceFee = 35,
      totalAmount,
      paymentMethod = "UPI",
      guestInfo = {},
    } = req.body;

    if (!mediaId || !mediaTitle || !theatreName || !showDate || !showTime || !seats.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required booking details (movie, theatre, date, time, or seats).",
      });
    }

    // Determine user info
    let userId = req.user ? req.user._id : null;
    const finalGuestInfo = {
      name: guestInfo.name || req.user?.displayName || req.user?.User_Name || "WatchHub Guest",
      email: guestInfo.email || req.user?.User_Email || "guest@watchhub.com",
      phone: guestInfo.phone || "",
    };

    const bookingId = generateBookingId();

    const newBooking = await WatchHub_Booking.create({
      bookingId,
      user: userId,
      guestInfo: finalGuestInfo,
      mediaId,
      mediaType,
      mediaTitle,
      mediaPoster: mediaPoster || "",
      theatreId: theatreId || `theatre-${Date.now()}`,
      theatreName,
      theatreLocation: {
        city: theatreLocation?.city || "Mumbai",
        state: theatreLocation?.state || "Maharashtra",
        address: theatreLocation?.address || "",
      },
      screen,
      format,
      showDate,
      showTime,
      seats,
      snacks,
      convenienceFee,
      totalAmount: totalAmount || 0,
      paymentMethod,
      paymentStatus: "completed",
      bookingStatus: "confirmed",
    });

    // Notify user in their WatchHub account if logged in
    if (userId) {
      const seatLabels = seats.map((s) => s.seatNumber).join(", ");
      await sendNotification({
        recipient: userId,
        type: "system",
        title: "🎬 Tickets Confirmed!",
        message: `Your booking for "${mediaTitle}" at ${theatreName} is confirmed for ${showDate} at ${showTime}. Seats: ${seatLabels}`,
        link: `/bookings`,
        data: { bookingId },
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully!",
      booking: newBooking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process booking.",
    });
  }
};

// GET /api/bookings/my-bookings
exports.getMyBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user) {
      query = {
        $or: [{ user: req.user._id }, { "guestInfo.email": req.user.User_Email }],
      };
    } else if (req.query.email) {
      query = { "guestInfo.email": req.query.email };
    } else {
      return res.status(200).json({ success: true, bookings: [] });
    }

    const bookings = await WatchHub_Booking.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve bookings." });
  }
};

// GET /api/bookings/:bookingId
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await WatchHub_Booking.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("GET BOOKING BY ID ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve booking." });
  }
};

// PATCH /api/bookings/:bookingId/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await WatchHub_Booking.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled." });
    }

    booking.bookingStatus = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    if (booking.user) {
      await sendNotification({
        recipient: booking.user,
        type: "system",
        title: "🎟️ Booking Cancelled",
        message: `Your booking ${booking.bookingId} for "${booking.mediaTitle}" has been cancelled. Refund will be credited within 3-5 business days.`,
        link: `/bookings`,
      });
    }

    res.json({
      success: true,
      message: "Booking cancelled successfully. Refund initiated.",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to cancel booking." });
  }
};
