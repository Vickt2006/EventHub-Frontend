import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, city]);

  async function loadEvents() {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", "0");
      params.set("size", "12");

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (city.trim()) {
        params.set("city", city.trim());
      }

      const data = await api(
        `/api/events/public?${params.toString()}`,
        { auth: false }
      );

      setEvents(data.content || []);
    } catch (error) {
      console.error(error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getEventIcon(type) {
    const icons = {
      CONCERT: "🎵",
      CONFERENCE: "💻",
      SPORTS: "🏆",
      WORKSHOP: "🧠",
      FESTIVAL: "🎉",
      THEATRE: "🎭",
      MOVIE: "🎬"
    };

    return icons[type] || "✦";
  }

  return (
    <main className="home-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="home-hero">

        <div className="home-hero-orb home-orb-one"></div>
        <div className="home-hero-orb home-orb-two"></div>
        <div className="home-hero-grid"></div>

        <div className="home-hero-content">

          <div className="home-eyebrow">
            <span className="home-live-dot"></span>
            EVENTS • TICKETS • EXPERIENCES
          </div>

          <h1>
            Find your next
            <br />
            <span>great experience.</span>
          </h1>

          <p>
            Discover concerts, conferences, festivals and
            unforgettable experiences. Choose your seat and
            book in minutes.
          </p>

          {/* SEARCH */}

          <div className="home-search">

            <div className="home-search-field">

              <span className="home-search-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </span>

              <input
                placeholder="Search events, concerts..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

            </div>

            <div className="home-search-field">

              <span className="home-search-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>

              <input
                placeholder="City"
                value={city}
                onChange={(event) =>
                  setCity(event.target.value)
                }
              />

            </div>

          </div>

          <div className="home-hero-meta">

            <span>
              ✦ Curated events
            </span>

            <span>
              ● Secure booking
            </span>

            <span>
              ⚡ Instant confirmation
            </span>

          </div>

        </div>

      </section>


      {/* =================================================
          EVENTS
      ================================================= */}

      <section className="home-events-section">

        <div className="home-section-heading">

          <div>

            <span className="home-section-eyebrow">
              DISCOVER
            </span>

            <h2>
              Upcoming Events
              <span>.</span>
            </h2>

            <p>
              Find something worth remembering.
            </p>

          </div>

          <div className="home-result-count">
            <strong>{events.length}</strong>
            <span>events available</span>
          </div>

        </div>


        {/* LOADING */}

        {loading && (
          <div className="home-loading">

            <div className="home-loader"></div>

            <span>
              Finding amazing events...
            </span>

          </div>
        )}


        {/* EMPTY */}

        {!loading && events.length === 0 && (
          <div className="home-empty">

            <div className="home-empty-icon">
              ✦
            </div>

            <h3>
              No events found
            </h3>

            <p>
              Try another event name or city.
            </p>

          </div>
        )}


        {/* EVENTS */}

        {!loading && events.length > 0 && (
          <div className="home-event-grid">

            {events.map((event, index) => (
              <article
                className="home-event-card"
                key={event.id}
                style={{
                  "--card-delay": `${index * 80}ms`
                }}
              >

                {/* VISUAL */}

                <div className="home-event-visual">

                  {event.posterUrl ? (
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                    />
                  ) : (
                    <div className="home-event-placeholder">

                      <div className="placeholder-orb"></div>

                      <span className="placeholder-icon">
                        {getEventIcon(event.eventType)}
                      </span>

                      <span className="placeholder-type">
                        {event.eventType || "EVENT"}
                      </span>

                    </div>
                  )}

                  <div className="home-event-overlay"></div>

                  <span className="home-event-type">
                    {event.eventType || "EVENT"}
                  </span>

                  <span className="home-event-number">
                    #{String(event.id).padStart(2, "0")}
                  </span>

                </div>


                {/* CONTENT */}

                <div className="home-event-content">

                  <h3>
                    {event.title}
                  </h3>

                  <div className="home-event-details">

                    <div className="home-detail">

                      <span className="detail-icon">
                        📍
                      </span>

                      <div>
                        <small>LOCATION</small>
                        <strong>
                          {event.city || "TBA"}
                        </strong>
                      </div>

                    </div>


                    <div className="home-detail">

                      <span className="detail-icon">
                        📅
                      </span>

                      <div>
                        <small>DATE</small>
                        <strong>
                          {formatDate(event.startTime)}
                        </strong>
                      </div>

                    </div>

                  </div>


                  <div className="home-event-bottom">

                    <div className="home-price">

                      <small>
                        Starting from
                      </small>

                      <strong>
                        ₹{event.basePrice ?? 0}
                      </strong>

                    </div>

                    <Link
                      className="home-view-button"
                      to={`/events/${event.id}`}
                    >
                      <span>
                        View Event
                      </span>

                      <b>
                        →
                      </b>
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}