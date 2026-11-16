import React, { useState, useEffect, useRef } from "react";
import { check } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useWatchList } from "../../Context/WatchListContext";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
