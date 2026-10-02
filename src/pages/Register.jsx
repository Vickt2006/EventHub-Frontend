import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      setLoading(true);

      await register(form);

      setMessage(
        "Registration successful! Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setError(
        error.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card premium-auth-card">

        {/* LEFT */}
        <div className="auth-showcase register-showcase">

          <div className="auth-orbit orbit-one"></div>
          <div className="auth-orbit orbit-two"></div>

          <div className="auth-brand-mark">
            <div className="brand-icon">E</div>
            <span>EVENTHUB</span>
          </div>

          <div className="auth-showcase-content">

            <span className="auth-eyebrow">
              START YOUR JOURNEY
            </span>

            <h1>
              Your next
              <br />
              <span>experience</span>
              <br />
              starts here.
            </h1>

            <p>
              Create your EventHub account and unlock a world
              of concerts, conferences, shows and unforgettable
              experiences.
            </p>

            <div className="auth-feature-list">

              <div className="auth-feature">
                <span className="feature-icon">✦</span>
                <div>
                  <strong>Explore Events</strong>
                  <small>Discover experiences around you</small>
                </div>
              </div>

              <div className="auth-feature">
                <span className="feature-icon">🎟</span>
                <div>
                  <strong>Book Instantly</strong>
                  <small>Pick your seat and reserve it</small>
                </div>
              </div>

              <div className="auth-feature">
                <span className="feature-icon">◆</span>
                <div>
                  <strong>Manage Everything</strong>
                  <small>Bookings and profile in one place</small>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-bottom-text">
            <span className="live-dot"></span>
            <span>Join the EventHub community</span>
          </div>

        </div>

        {/* RIGHT */}
        <div className="auth-form register-form">

          <div className="auth-form-top">

            <span className="mobile-brand">
              EVENTHUB
            </span>

            <span className="auth-small-label">
              CREATE ACCOUNT
            </span>

            <h2>
              Join the
              <span> experience</span>
            </h2>

            <p>
              Create your account in less than a minute.
            </p>

          </div>

          {message && (
            <div className="auth-success">
              <span className="message-icon success-icon-small">
                ✓
              </span>

              <div>
                <strong>You're all set!</strong>
                <p>{message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <span className="message-icon">!</span>

              <div>
                <strong>Registration failed</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="premium-form register-premium-form"
          >

            <div className="two-column-inputs">

              <div className="input-group">
                <label htmlFor="register-name">
                  Full name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
                    </svg>
                  </span>

                  <input
                    id="register-name"
                    value={form.name}
                    placeholder="Your name"
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value
                      )
                    }
                    required
                  />

                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-city">
                  City
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
                      <circle cx="12" cy="9" r="2.3" />
                    </svg>
                  </span>

                  <input
                    id="register-city"
                    value={form.city}
                    placeholder="Your city"
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                  />

                </div>
              </div>

            </div>

            <div className="input-group">
              <label htmlFor="register-email">
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
                  id="register-email"
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(event) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  required
                />

              </div>
            </div>

            <div className="two-column-inputs">

              <div className="input-group">
                <label htmlFor="register-password">
                  Password
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
                    id="register-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={form.password}
                    placeholder="Password"
                    onChange={(event) =>
                      updateField(
                        "password",
                        event.target.value
                      )
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>

                </div>
              </div>

              <div className="input-group">
                <label htmlFor="register-phone">
                  Phone
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
                        x="6"
                        y="2"
                        width="12"
                        height="20"
                        rx="2"
                      />
                      <path d="M10 18h4" />
                    </svg>
                  </span>

                  <input
                    id="register-phone"
                    value={form.phone}
                    placeholder="Phone number"
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                      )
                    }
                  />

                </div>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <span className="button-arrow">
                    →
                  </span>
                </>
              )}
            </button>

          </form>

          <div className="auth-divider">
            <span></span>
            <small>WELCOME TO EVENTHUB</small>
            <span></span>
          </div>

          <p className="auth-footer">
            Already have an account?
            <Link to="/login">
              Sign in
            </Link>
          </p>

        </div>

      </section>
    </main>
  );
}