import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/UserContext.jsx";
import { Eye, EyeOff } from "lucide-react";
import Timer from "../../Services/Timer.jsx";
import "./Login.css";

export default function Login({ stateReset }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset States
  const [showReset, setShowReset] = useState(false);
  const [resetStep, setResetStep] = useState(null); // 'Email', 'OTP', 'Password' or null (if not resetting)

  // Simplified Reset State
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [want, setWant] = useState(false);
  const [otptimer, setOtptimer] = useState(0);
  const [timerKey, setTimerKey] = useState(0);

  const context = useAuth();
  if (!context) {
    throw new Error("useAuth must be used within a UserProvider");
  }

  const {
    LoginUser,
    PassowrdRestingRequest,
    Password_Reset_Verify,
    Password_Reseting,
  } = context;

  const navigate = useNavigate();

  const ResetingERROR = () => {
    setTimeout(() => {
      setError("");
      setResetError("");
    }, 2000);
  };

  useEffect(() => {
    setEmail("");
    setPassword("");
    setResetEmail("");
    setError("");
    setResetError("");
    setNewPassword("");
    setLoading(false);
    setShowPassword(false);
    setShowReset(false);
    setResetStep(null);
  }, [stateReset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      ResetingERROR();
      setLoading(false);
      return;
    }

    try {
      await LoginUser(email, password);
      navigate("/");
    } catch (error) {
      setError(
        error.message || "Failed to login. Please check your credentials.",
      );
      ResetingERROR();
      console.error(error);
    }
    setLoading(false);
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleForgotPasswordClick = () => {
    setShowReset(true);
    setResetStep("Email");
    setResetEmail(email);
    setResetError("");
  };

  const handleSendOTP = async () => {
    if (!resetEmail) {
      setResetError("Please enter your email");
      ResetingERROR();
      return;
    }

    try {
      setLoading(true);
      await PassowrdRestingRequest(resetEmail);
      setOtptimer(5 * 60);
      setTimerKey((prev) => prev + 1);
      setResetStep("OTP");
    } catch (err) {
      setResetError(err.message);
      ResetingERROR();
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setResetError("Please enter your OTP");
      ResetingERROR();
      return;
    }

    try {
      setLoading(true);
      setResetError("");
      await Password_Reset_Verify(resetEmail, otp);
      setResetStep("Password");
    } catch (err) {
      setResetError(err.message);
      ResetingERROR();
    }

    setLoading(false);
  };

  const handlePasswordReseting = async () => {
    if (!newPassword) {
      setResetError("Please enter your New Password");
      ResetingERROR();
      return;
    }

    try {
      setLoading(true);
      setResetError("");
      await Password_Reseting(resetEmail, newPassword);
      setShowReset(false);
      setResetStep(null);
      setResetEmail("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setResetError(err.message);
      ResetingERROR();
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    try {
      setResending(true);
      setOtp("");
      await PassowrdRestingRequest(resetEmail);
      setOtptimer(5 * 60);
      setTimerKey((prev) => prev + 1);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
      ResetingERROR();
    }
    setResending(false);
  };

  const closeReset = () => {
    setResetEmail("");
    setResetError("");
    setNewPassword("");
    setLoading(false);
    setShowPassword(false);
    setShowReset(false);
    setResetStep(null);
  };

  const renderResetFlow = () => {
    return (
      <div className="Login-form">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginBottom: "5px",
          }}
        >
          <h3 style={{ fontSize: "1.2rem" }}>Reset Password</h3>
          <button
            onClick={() => {
              setWant(!want);
            }}
            style={{ color: "var(--color-text-secondary)" }}
          >
            <i className="fa-solid fa-xmark"></i> Close
          </button>
        </div>

        {resetError && <div className="error-message">{resetError}</div>}

        {resetStep === "Email" && (
          <>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                disabled={loading}
                onChange={(e) => setResetEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendOTP();
                  }
                }}
              />
            </div>
            <button
              className="submit-btn"
              disabled={loading}
              onClick={handleSendOTP}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}
        {resetStep === "OTP" && (
          <>
            <div className="timer">
              <Timer key={timerKey} duration={otptimer} />
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                disabled={loading}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleVerifyOTP();
                  }
                }}
              />
            </div>
            <button
              className="submit-btn"
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? "Verifing OTP..." : "Verify OTP"}
            </button>
            <button
              className="otp-resend-btn"
              onClick={resendOtp}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </>
        )}
        {resetStep === "Password" && (
          <>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                disabled={loading}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePasswordReseting();
                  }
                }}
              />
            </div>
            <button
              className="submit-btn"
              onClick={handlePasswordReseting}
              disabled={loading}
            >
              {loading ? "Reseting Password" : "Reset Password"}
            </button>
          </>
        )}
        {want && (
          <div className="closing-box">
            <div className="heading">
              <h2>Discard Password Reset</h2>
              <p>You Remember Your Password Now</p>
            </div>
            <div className="selection">
              <button onClick={closeReset}>Yes</button>
              <button onClick={() => setWant(!want)}>No</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showReset) {
    return renderResetFlow();
  }

  return (
    <div className="login-container">
      {error && <div className="error-message">{error}</div>}

      <form className="Login-form" onSubmit={handleSubmit}>
        <div className="Login-Input">
          <div className="input-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePassword}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <span className="reset-link" onClick={handleForgotPasswordClick}>
          Forgot Password?
        </span>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="social-login">
          <div className="social-text">Or continue with</div>
          <div className="social-buttons">
            <button
              type="button"
              className="social-btn"
              aria-label="Login with Google"
            >
              <i className="fa-brands fa-google"></i>
            </button>
            <button
              type="button"
              className="social-btn"
              aria-label="Login with Github"
            >
              <i className="fa-brands fa-github"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
