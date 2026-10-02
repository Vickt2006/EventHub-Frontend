import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../services/api";
import { setAuth } from "../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const data = await login(email, password);

      const role = data.user?.role || data.role;

      setAuth(data.token, role);

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "ORGANIZER") {
        navigate("/organizer");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card premium-auth-card">

        {/* LEFT SIDE */}
        <div className="auth-showcase">

          <div className="auth-orbit orbit-one"></div>
          <div className="auth-orbit orbit-two"></div>

          <div className="auth-floating-card floating-card-one">
            <span>🎟️</span>
            <div>
              <strong>Easy Booking</strong>
              <small>Book your favourite events</small>
            </div>
          </div>

          <div className="auth-floating-card floating-card-two">
            <span>⚡</span>
            <div>
              <strong>Instant Access</strong>
              <small>Fast & secure experience</small>
            </div>
          </div>

          <div className="auth-brand-mark">
            <div className="brand-icon">E</div>
            <span>EVENTHUB</span>
          </div>

          <div className="auth-showcase-content">
            <span className="auth-eyebrow">
              YOUR EVENT. YOUR EXPERIENCE.
            </span>

            <h1>
              Discover.
              <br />
              <span>Experience.</span>
              <br />
              Remember.
            </h1>

            <p>
              Your one-stop destination to discover amazing events,
              reserve your seats and create unforgettable memories.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span className="feature-icon">✦</span>
                <div>
                  <strong>Discover Events</strong>
                  <small>Find concerts, conferences & more</small>
                </div>
              </div>

              <div className="auth-feature">
                <span className="feature-icon">◈</span>
                <div>
                  <strong>Choose Your Seat</strong>
                  <small>Select the perfect seat instantly</small>
                </div>
              </div>

              <div className="auth-feature">
                <span className="feature-icon">✓</span>
                <div>
                  <strong>Secure Booking</strong>
                  <small>Simple and reliable booking</small>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-bottom-text">
            <span className="live-dot"></span>
            <span>Thousands of experiences waiting for you</span>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-form">

          <div className="auth-form-top">
            <span className="mobile-brand">EVENTHUB</span>

            <span className="auth-small-label">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your
              <span> account</span>
            </h2>

            <p>
              Continue your journey with EventHub.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="message-icon">!</span>

              <div>
                <strong>Login failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="premium-form">

            <div className="input-group">
              <label htmlFor="login-email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />

              </div>
            </div>

            <div className="input-group">
              <div className="password-label-row">
                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="forgot-button"
                  onClick={() =>
                    setError(
                      "Password reset is not available yet."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "◉" : "◌"}
                </button>

              </div>
            </div>

            <button
              className={`auth-submit ${
                loading ? "loading-button" : ""
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span></span>
            <small>SECURE EVENTHUB ACCESS</small>
            <span></span>
          </div>

          <p className="auth-footer">
            New to EventHub?
            <Link to="/register">
              Create your account
            </Link>
          </p>

          <div className="security-note">
            <span>🔒</span>
            <span>
              Your account information is securely handled.
            </span>
          </div>

        </div>
      </section>
    </main>
  );
}