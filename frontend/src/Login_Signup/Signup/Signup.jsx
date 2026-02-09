import React, { useState, useEffect } from "react";
import { useAuth } from "../../Context/UserContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import Timer from "../../Services/Timer";
import "./Signup.css";

export default function Signup({ stateReset }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const context = useAuth();
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }

  const { SignupRequest, SignupVerify } = context;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [otptimer, setOtptimer] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [showOtp, setShowOtp] = useState(false);
  const [want, setWant] = useState(false);
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!showOtp) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        verifyOtp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showOtp, otp]);

  useEffect(() => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
    setLoading(false);
    setShowPassword(false);
    setShowOtp(false);
  }, [stateReset]);

  const settingerror = () => {
    setTimeout(() => {
      setError("");
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!username) {
      setError("Username is required");
      settingerror();
      setLoading(false);
      return;
    }

    if (!email) {
      setError("Email is required");
      settingerror();
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      settingerror();
      setLoading(false);
      return;
    }

    if (!password) {
      setError("Password is required");
      settingerror();
      setLoading(false);
      return;
    }

    try {
      await SignupRequest(username, email, password);
      setOtptimer(5 * 60);
      setTimerKey((prev) => prev + 1);
      setShowOtp(true);
    } catch (error) {
      setError(error.message || "Signup failed");
      settingerror();
    }
    setLoading(false);
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      settingerror();
      return;
    }

    setLoading(true);

    try {
      await SignupVerify(username, email, password, otp);
      setOtp("");
      setShowOtp(false);
      navigate("/");
    } catch (error) {
      setError(error.message || "Verification failed");
      settingerror();
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      setOtp("");
      await SignupRequest(username, email, password);
      setOtptimer(5 * 60);
      setTimerKey((prev) => prev + 1);
      setResending(false);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
      settingerror();
    }
    setResending(false);
  };

  const closeOtp = async () => {
    setShowOtp(false);
    setOtp("");
    setError("");
  };

  return (
    <div className="signup-container">
      {error && !showOtp && <div className="error">{error}</div>}

      <form className="Signup-form" onSubmit={handleSubmit}>
        <div className="Signup-Input">
          <input
            type="text"
            placeholder="Username"
            value={username}
            disabled={loading}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            disabled={loading}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              disabled={loading}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={togglePassword}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="Submit">
          <button type="submit" disabled={loading}>
            {loading ? "Joining..." : "Join Now"}
          </button>
        </div>
      </form>

      <div className="socal-box">
        <div className="Social-Signup-text">
          <p>Or sign up with</p>
        </div>
        <div className="social-Platform">
          <button type="button">
            <i className="fa-brands fa-google"></i>
          </button>
          <button type="button">
            <i className="fa-brands fa-github"></i>
          </button>
        </div>
      </div>

      {showOtp && (
        <div className="otp-overlay" onClick={() => setWant(!want)}>
          <div className="otp-box" onClick={(e) => e.stopPropagation()}>
            <div className="title">
              <h2>Email Verification</h2>
              <button onClick={() => setWant(!want)}>
                <X size={24} />
              </button>
            </div>

            <p className="otp-subtext">
              <div className="otp-header">
                Enter the 6-digit code sent to
                <Timer key={timerKey} duration={otptimer} />
              </div>
              <br />
              <b>{email}</b>
            </p>

            {error && <div className="otp-error">{error}</div>}

            <input
              type="text"
              placeholder="••••••"
              value={otp}
              disabled={loading}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="otp-input"
            />

            <button
              className="otp-verify-btn"
              onClick={verifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              className="otp-resend-btn"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
          {want && (
            <div className="closing-box">
              <div className="heading">
                <h2>Discard OTP verification</h2>
                <p>Do you not want to be part of WatchHub</p>
              </div>
              <div className="selection">
                <button onClick={closeOtp}>Discard</button>
                <button onClick={() => setWant(!want)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
