import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const EVENT_TYPES = [
  { value: "MOVIE", label: "Movie" },
  { value: "CONCERT", label: "Concert" },
  { value: "SPORTS", label: "Sports" },
  { value: "COMEDY", label: "Comedy" },
  { value: "THEATRE", label: "Theatre" },
  { value: "COLLEGE_EVENT", label: "College Event" },
  { value: "ACTIVITY", label: "Activity" },
  { value: "WORKSHOP", label: "Workshop" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "OTHER", label: "Other" }
];

const EMPTY_FORM = {
  title: "",
  description: "",
  eventType: "CONCERT",
  startTime: "",
  endTime: "",
  city: "",
  language: "",
  genre: "",
  ageRating: "",
  posterUrl: "",
  bannerUrl: "",
  basePrice: "",
  taxPercent: "18",
  venueId: ""
};

export default function OrganizerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [venues, setVenues] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventForm, setEventForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedBookingEvent, setSelectedBookingEvent] = useState(null);
  const [eventBookings, setEventBookings] = useState([]);
  const [bookingSummary, setBookingSummary] = useState(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard(showRefreshLoader = false) {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        dashboardData,
        statsData,
        eventsData,
        performanceData,
        venuesData
      ] = await Promise.all([
        api("/api/events/organizer/dashboard"),
        api("/api/events/organizer/booking-stats"),
        api("/api/events/organizer/my-events"),
        api("/api/events/organizer/event-performance"),
        api("/api/venues/public")
      ]);

      setDashboard(dashboardData);
      setBookingStats(statsData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setPerformance(
        Array.isArray(performanceData) ? performanceData : []
      );

    const venueList = Array.isArray(venuesData)
  ? venuesData.filter((venue) => venue.active !== false)
  : [];

const uniqueVenues = Array.from(
  new Map(
    venueList.map((venue) => [
      `${venue.name?.trim().toLowerCase()}-${venue.city?.trim().toLowerCase()}`,
      venue
    ])
  ).values()
);

setVenues(uniqueVenues);
    } catch (error) {
      console.error("Organizer dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function updateForm(field, value) {
    setEventForm((current) => ({
      ...current,
      [field]: value
    }));

    if (createError) {
      setCreateError("");
    }

    if (editError) {
      setEditError("");
    }
  }

  function openCreateModal() {
    setEventForm(EMPTY_FORM);
    setCreateError("");
    setCreateSuccess("");
    setShowCreateModal(true);
  }

  function closeCreateModal() {
    if (creating) return;

    setShowCreateModal(false);
    setCreateError("");
    setCreateSuccess("");
  }

  function toInputDateTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const pad = (number) => String(number).padStart(2, "0");

    return `${date.getFullYear()}-${pad(
      date.getMonth() + 1
    )}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  }

  function openEditModal(event) {
    setEditingEventId(event.id);
    setEditError("");
    setEditSuccess("");

    setEventForm({
      title: event.title || "",
      description: event.description || "",
      eventType: event.eventType || "CONCERT",
      startTime: toInputDateTime(event.startTime),
      endTime: toInputDateTime(event.endTime),
      city: event.city || "",
      language: event.language || "",
      genre: event.genre || "",
      ageRating: event.ageRating || "",
      posterUrl: event.posterUrl || "",
      bannerUrl: event.bannerUrl || "",
      basePrice: event.basePrice ?? "",
      taxPercent: event.taxPercent ?? "18",
      venueId: event.venue?.id ?? event.venueId ?? ""
    });

    setShowEditModal(true);
  }

  function closeEditModal() {
    if (editing) return;

    setShowEditModal(false);
    setEditingEventId(null);
    setEditError("");
    setEditSuccess("");
  }

  function validateEventForm() {
    if (!eventForm.title.trim()) {
      return "Event title is required.";
    }

    if (!eventForm.eventType) {
      return "Please select event type.";
    }

    if (!eventForm.startTime) {
      return "Start date and time is required.";
    }

    if (
      eventForm.endTime &&
      new Date(eventForm.endTime) <= new Date(eventForm.startTime)
    ) {
      return "End date/time must be after start date/time.";
    }

    if (!eventForm.city.trim()) {
      return "City is required.";
    }

    if (!eventForm.basePrice) {
      return "Base price is required.";
    }

    if (Number(eventForm.basePrice) <= 0) {
      return "Base price must be greater than 0.";
    }

    if (
      eventForm.taxPercent !== "" &&
      Number(eventForm.taxPercent) < 0
    ) {
      return "Tax percent cannot be negative.";
    }

    if (!eventForm.venueId) {
      return "Please select a venue.";
    }

    if (Number(eventForm.venueId) <= 0) {
      return "Please select a valid venue.";
    }

    return "";
  }

  async function handleEditEvent(event) {
    event.preventDefault();

    setEditError("");
    setEditSuccess("");

    const validationError = validateEventForm();

    if (validationError) {
      setEditError(validationError);
      return;
    }

    try {
      setEditing(true);

      const payload = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        eventType: eventForm.eventType,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime || null,
        city: eventForm.city.trim(),
        language: eventForm.language.trim() || null,
        genre: eventForm.genre.trim() || null,
        ageRating: eventForm.ageRating.trim() || null,
        posterUrl: eventForm.posterUrl.trim() || null,
        bannerUrl: eventForm.bannerUrl.trim() || null,
        basePrice: Number(eventForm.basePrice),
        taxPercent:
          eventForm.taxPercent === ""
            ? null
            : Number(eventForm.taxPercent),
        venueId: Number(eventForm.venueId)
      };

      console.log("EDIT EVENT PAYLOAD:", payload);

      await api(`/api/events/${editingEventId}`, {
        method: "PATCH",
        body: payload
      });

      setEditSuccess("Event updated successfully!");

      await loadDashboard();

      setTimeout(() => {
        setShowEditModal(false);
        setEditingEventId(null);
        setEditSuccess("");
        setEventForm(EMPTY_FORM);
      }, 900);
    } catch (error) {
      console.error("EDIT EVENT ERROR:", error);

      setEditError(
        error?.message ||
          "Unable to update event. Please try again."
      );
    } finally {
      setEditing(false);
    }
  }

  async function openBookingsModal(event) {
    setSelectedBookingEvent(event);
    setShowBookingsModal(true);
    setBookingsLoading(true);
    setBookingsError("");
    setEventBookings([]);
    setBookingSummary(null);

    try {
      const [bookings, summary] = await Promise.all([
        api(`/api/events/${event.id}/bookings`),
        api(`/api/events/${event.id}/booking-summary`)
      ]);

      setEventBookings(
        Array.isArray(bookings) ? bookings : []
      );

      setBookingSummary(summary || null);
    } catch (error) {
      console.error("Event bookings error:", error);

      setBookingsError(
        error?.message ||
          "Unable to load booking details."
      );
    } finally {
      setBookingsLoading(false);
    }
  }

  function closeBookingsModal() {
    if (bookingsLoading) return;

    setShowBookingsModal(false);
    setSelectedBookingEvent(null);
    setEventBookings([]);
    setBookingSummary(null);
    setBookingsError("");
  }

  async function handleCreateEvent(event) {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    const validationError = validateEventForm();

    if (validationError) {
      setCreateError(validationError);
      return;
    }

    try {
      setCreating(true);

      const payload = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        eventType: eventForm.eventType,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime || null,
        city: eventForm.city.trim(),
        language: eventForm.language.trim() || null,
        genre: eventForm.genre.trim() || null,
        ageRating: eventForm.ageRating.trim() || null,
        posterUrl: eventForm.posterUrl.trim() || null,
        bannerUrl: eventForm.bannerUrl.trim() || null,
        basePrice: Number(eventForm.basePrice),
        taxPercent:
          eventForm.taxPercent === ""
            ? null
            : Number(eventForm.taxPercent),
        venueId: Number(eventForm.venueId)
      };

      console.log("CREATE EVENT PAYLOAD:", payload);

      const result = await api("/api/events", {
        method: "POST",
        body: payload
      });

      console.log("CREATE EVENT RESPONSE:", result);

      setCreateSuccess(
        "Event created successfully!"
      );

      await loadDashboard();

      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess("");
        setEventForm(EMPTY_FORM);
      }, 1000);
    } catch (error) {
      console.error("CREATE EVENT ERROR:", error);

      setCreateError(
        error?.message ||
          "Unable to create event. Please try again."
      );
    } finally {
      setCreating(false);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Date not available";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2
      }
    );
  }

  function formatLabel(value) {
    return String(value || "").replaceAll("_", " ");
  }

  function statusClass(status) {
    if (status === "PUBLISHED") {
      return "published";
    }

    if (status === "PENDING_APPROVAL") {
      return "pending";
    }

    if (status === "CANCELLED") {
      return "cancelled";
    }

    if (status === "COMPLETED") {
      return "completed";
    }

    return "draft";
  }

  function eventIcon(type) {
    switch (type) {
      case "MOVIE":
        return "🎬";

      case "CONCERT":
        return "🎵";

      case "SPORTS":
        return "🏟️";

      case "COMEDY":
        return "😂";

      case "THEATRE":
        return "🎭";

      case "COLLEGE_EVENT":
        return "🎓";

      case "ACTIVITY":
        return "⚡";

      case "WORKSHOP":
        return "🛠️";

      case "CONFERENCE":
        return "💼";

      default:
        return "✨";
    }
  }

  if (loading) {
    return (
      <main className="organizer-page">
        <div className="organizer-loading">
          <div className="organizer-spinner"></div>

          <h3>
            Loading organizer dashboard
          </h3>

          <p>
            Preparing your event analytics...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="organizer-page">

      {/* BACKGROUND */}

      <div className="organizer-orb organizer-orb-one"></div>
      <div className="organizer-orb organizer-orb-two"></div>

      {/* HEADER */}

      <header className="organizer-header">
        <div>
          <div className="organizer-eyebrow">
            <span></span>
            ORGANIZER CENTER
          </div>

          <h1>
            Organizer{" "}
            <span>Dashboard</span>
          </h1>

          <p>
            Manage your events and track your
            booking performance.
          </p>
        </div>

        <div className="organizer-header-actions">

          <button
            type="button"
            className="organizer-create-btn"
            onClick={openCreateModal}
          >
            <span>＋</span>
            Create Event
          </button>

          <button
            type="button"
            className="organizer-refresh"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
          >
            <span>
              {refreshing ? "◌" : "↻"}
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>
      </header>

      {/* STATS */}

      <section className="organizer-stats">

        <div className="organizer-stat-card">
          <div className="organizer-stat-icon purple">
            ◆
          </div>

          <div>
            <span>MY EVENTS</span>

            <strong>
              {dashboard?.events ??
                events.length ??
                0}
            </strong>
          </div>
        </div>

        <div className="organizer-stat-card">
          <div className="organizer-stat-icon blue">
            ▰
          </div>

          <div>
            <span>TOTAL BOOKINGS</span>

            <strong>
              {bookingStats?.totalBookings ??
                dashboard?.bookings ??
                0}
            </strong>
          </div>
        </div>

        <div className="organizer-stat-card">
          <div className="organizer-stat-icon green">
            ₹
          </div>

          <div>
            <span>TOTAL REVENUE</span>

            <strong>
              ₹
              {formatMoney(
                bookingStats?.totalRevenue ?? 0
              )}
            </strong>
          </div>
        </div>

        <div className="organizer-stat-card">
          <div className="organizer-stat-icon yellow">
            ◆
          </div>

          <div>
            <span>SEATS SOLD</span>

            <strong>
              {bookingStats?.totalSeatsSold ??
                dashboard?.confirmedBookings ??
                0}
            </strong>
          </div>
        </div>

      </section>

      {/* MY EVENTS */}

      <section className="organizer-section">

        <div className="organizer-section-heading">

          <div>
            <span>YOUR EVENTS</span>

            <h2>My Events</h2>

            <p>
              All events created by your organizer
              account.
            </p>
          </div>

          <div className="organizer-event-count">
            {events.length} Events
          </div>

        </div>

        {events.length === 0 ? (

          <div className="organizer-empty">

            <div className="organizer-empty-icon">
              ✦
            </div>

            <h3>
              No events yet
            </h3>

            <p>
              Create your first event and start
              managing bookings.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
            >
              Create Your First Event
            </button>

          </div>

        ) : (

          <div className="organizer-events-grid">

            {events.map((event) => (

              <article
                className="organizer-event-card"
                key={event.id}
              >

                <div className="organizer-event-top">

                  <div className="organizer-event-icon">
                    {eventIcon(event.eventType)}
                  </div>

                  <span
                    className={`organizer-status ${statusClass(
                      event.status
                    )}`}
                  >
                    {formatLabel(event.status)}
                  </span>

                </div>

                <div className="organizer-event-type">
                  {formatLabel(event.eventType)}
                </div>

                <h3>
                  {event.title}
                </h3>

                <p className="organizer-event-description">
                  {event.description ||
                    "No description available."}
                </p>

                <div className="organizer-event-details">

                  <div>
                    <span>📍</span>

                    <p>
                      {event.city ||
                        "Location not available"}
                    </p>
                  </div>

                  <div>
                    <span>📅</span>

                    <p>
                      {formatDate(event.startTime)}
                    </p>
                  </div>

                  <div>
                    <span>⏰</span>

                    <p>
                      {formatTime(event.startTime)}
                    </p>
                  </div>

                </div>

                <div className="organizer-event-footer">

                  <div>
                    <small>
                      Starting from
                    </small>

                    <strong>
                      ₹
                      {formatMoney(event.basePrice)}
                    </strong>
                  </div>

                  <div className="organizer-event-actions">

                    <div className="organizer-event-id">
                      Event #{event.id}
                    </div>

                    <button
                      type="button"
                      className="organizer-view-bookings-btn"
                      onMouseDown={(e) =>
                        e.stopPropagation()
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        openBookingsModal(event);
                      }}
                    >
                      👥 View Bookings
                    </button>

                    <button
                      type="button"
                      className="organizer-edit-event-btn"
                      onClick={() =>
                        openEditModal(event)
                      }
                    >
                      ✎ Edit Event
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* PERFORMANCE */}

      <section className="organizer-section organizer-performance-section">

        <div className="organizer-section-heading">

          <div>
            <span>ANALYTICS</span>

            <h2>
              Event Performance
            </h2>

            <p>
              Track bookings, seats sold and
              revenue for your events.
            </p>
          </div>

        </div>

        {performance.length === 0 ? (

          <div className="organizer-performance-empty">
            No performance data available yet.
          </div>

        ) : (

          <div className="organizer-performance-list">

            {performance.map((item) => (

              <div
                className="organizer-performance-row"
                key={item.eventId}
              >

                <div className="performance-event-info">

                  <div className="performance-event-icon">
                    {eventIcon(item.eventType)}
                  </div>

                  <div>
                    <h3>
                      {item.title}
                    </h3>

                    <span>
                      Event #{item.eventId}
                    </span>
                  </div>

                </div>

                <div className="performance-stat">
                  <span>BOOKINGS</span>

                  <strong>
                    {item.totalBookings ?? 0}
                  </strong>
                </div>

                <div className="performance-stat">
                  <span>CONFIRMED</span>

                  <strong>
                    {item.confirmedBookings ?? 0}
                  </strong>
                </div>

                <div className="performance-stat">
                  <span>SEATS SOLD</span>

                  <strong>
                    {item.totalSeatsSold ?? 0}
                  </strong>
                </div>

                <div className="performance-stat revenue">
                  <span>REVENUE</span>

                  <strong>
                    ₹
                    {formatMoney(
                      item.totalRevenue
                    )}
                  </strong>
                </div>

                <span
                  className={`organizer-status ${statusClass(
                    item.status
                  )}`}
                >
                  {formatLabel(item.status)}
                </span>

              </div>

            ))}

          </div>

        )}

      </section>

      {/* CREATE EVENT MODAL */}

      {showCreateModal && (

        <div
          className="create-event-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !creating
            ) {
              closeCreateModal();
            }
          }}
        >

          <div className="create-event-modal">

            <div className="create-event-modal-header">

              <div>
                <span className="organizer-section-label">
                  NEW EVENT
                </span>

                <h2>
                  Create Event
                </h2>

                <p>
                  Add a new event to your organizer
                  account.
                </p>
              </div>

              <button
                type="button"
                className="create-event-close"
                onClick={closeCreateModal}
                disabled={creating}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleCreateEvent}>

              <div className="create-event-form-grid">

                {/* TITLE */}

                <div className="create-event-field full">

                  <label htmlFor="create-event-title">
                    Event Title *
                  </label>

                  <input
                    id="create-event-title"
                    type="text"
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) =>
                      updateForm(
                        "title",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="create-event-field full">

                  <label htmlFor="create-event-description">
                    Description
                  </label>

                  <textarea
                    id="create-event-description"
                    placeholder="Describe your event..."
                    value={eventForm.description}
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* EVENT TYPE */}

                <div className="create-event-field">

                  <label htmlFor="create-event-type">
                    Event Type *
                  </label>

                  <select
                    id="create-event-type"
                    value={eventForm.eventType}
                    onChange={(e) =>
                      updateForm(
                        "eventType",
                        e.target.value
                      )
                    }
                  >

                    {EVENT_TYPES.map((type) => (

                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>

                    ))}

                  </select>

                </div>

                {/* CITY */}

                <div className="create-event-field">

                  <label htmlFor="create-event-city">
                    City *
                  </label>

                  <input
                    id="create-event-city"
                    type="text"
                    placeholder="e.g. Pune"
                    value={eventForm.city}
                    onChange={(e) =>
                      updateForm(
                        "city",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* START */}

                <div className="create-event-field">

                  <label htmlFor="create-event-start">
                    Start Date & Time *
                  </label>

                  <input
                    id="create-event-start"
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      updateForm(
                        "startTime",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* END */}

                <div className="create-event-field">

                  <label htmlFor="create-event-end">
                    End Date & Time
                  </label>

                  <input
                    id="create-event-end"
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      updateForm(
                        "endTime",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* LANGUAGE */}

                <div className="create-event-field">

                  <label htmlFor="create-event-language">
                    Language
                  </label>

                  <input
                    id="create-event-language"
                    type="text"
                    placeholder="e.g. Hindi"
                    value={eventForm.language}
                    onChange={(e) =>
                      updateForm(
                        "language",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* GENRE */}

                <div className="create-event-field">

                  <label htmlFor="create-event-genre">
                    Genre
                  </label>

                  <input
                    id="create-event-genre"
                    type="text"
                    placeholder="e.g. Music"
                    value={eventForm.genre}
                    onChange={(e) =>
                      updateForm(
                        "genre",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* AGE RATING */}

                <div className="create-event-field">

                  <label htmlFor="create-event-age">
                    Age Rating
                  </label>

                  <input
                    id="create-event-age"
                    type="text"
                    placeholder="e.g. 18+"
                    value={eventForm.ageRating}
                    onChange={(e) =>
                      updateForm(
                        "ageRating",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* BASE PRICE */}

                <div className="create-event-field">

                  <label htmlFor="create-event-price">
                    Base Price *
                  </label>

                  <input
                    id="create-event-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 499.93"
                    value={eventForm.basePrice}
                    onChange={(e) =>
                      updateForm(
                        "basePrice",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* TAX */}

                <div className="create-event-field">

                  <label htmlFor="create-event-tax">
                    Tax Percent
                  </label>

                  <input
                    id="create-event-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 18"
                    value={eventForm.taxPercent}
                    onChange={(e) =>
                      updateForm(
                        "taxPercent",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* VENUE */}

                <div className="create-event-field">

                  <label htmlFor="create-event-venue">
                    Venue *
                  </label>

                  <select
                    id="create-event-venue"
                    value={eventForm.venueId}
                    onChange={(e) =>
                      updateForm(
                        "venueId",
                        e.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Select a venue
                    </option>

                    {venues.map((venue) => (

                      <option
                        key={venue.id}
                        value={venue.id}
                      >
                        {venue.name}
                        {venue.city
                          ? ` • ${venue.city}`
                          : ""}
                      </option>

                    ))}

                  </select>

                  <small>
                    Select the venue where this event
                    will be conducted.
                  </small>

                  {venues.length === 0 && (
                    <small>
                      No active venues available.
                    </small>
                  )}

                </div>

                {/* POSTER */}

                <div className="create-event-field">

                  <label htmlFor="create-event-poster">
                    Poster URL
                  </label>

                  <input
                    id="create-event-poster"
                    type="url"
                    placeholder="https://..."
                    value={eventForm.posterUrl}
                    onChange={(e) =>
                      updateForm(
                        "posterUrl",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* BANNER */}

                <div className="create-event-field full">

                  <label htmlFor="create-event-banner">
                    Banner URL
                  </label>

                  <input
                    id="create-event-banner"
                    type="url"
                    placeholder="https://..."
                    value={eventForm.bannerUrl}
                    onChange={(e) =>
                      updateForm(
                        "bannerUrl",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {createError && (
                <div className="create-event-message error">
                  ⚠️ {createError}
                </div>
              )}

              {createSuccess && (
                <div className="create-event-message success">
                  ✓ {createSuccess}
                </div>
              )}

              <div className="create-event-actions">

                <button
                  type="button"
                  className="create-event-cancel"
                  onClick={closeCreateModal}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="create-event-submit"
                  disabled={
                    creating || venues.length === 0
                  }
                >

                  {creating ? (
                    <>
                      <span className="create-event-small-spinner"></span>
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <span>＋</span>
                      Create Event
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* EDIT EVENT MODAL */}

      {showEditModal && (

        <div
          className="edit-event-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !editing
            ) {
              closeEditModal();
            }
          }}
        >

          <div className="edit-event-modal">

            <div className="edit-event-modal-header">

              <div>
                <span className="organizer-section-label">
                  EDIT EVENT
                </span>

                <h2>
                  Edit Event
                </h2>

                <p>
                  Update your event information.
                </p>
              </div>

              <button
                type="button"
                className="edit-event-close"
                onClick={closeEditModal}
                disabled={editing}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleEditEvent}>

              <div className="edit-event-form-grid">

                {/* TITLE */}

                <div className="edit-event-field full">

                  <label htmlFor="edit-event-title">
                    Event Title *
                  </label>

                  <input
                    id="edit-event-title"
                    type="text"
                    placeholder="Enter event title"
                    value={eventForm.title}
                    onChange={(e) =>
                      updateForm(
                        "title",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* DESCRIPTION */}

                <div className="edit-event-field full">

                  <label htmlFor="edit-event-description">
                    Description
                  </label>

                  <textarea
                    id="edit-event-description"
                    placeholder="Describe your event..."
                    value={eventForm.description}
                    onChange={(e) =>
                      updateForm(
                        "description",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* EVENT TYPE */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-type">
                    Event Type *
                  </label>

                  <select
                    id="edit-event-type"
                    value={eventForm.eventType}
                    onChange={(e) =>
                      updateForm(
                        "eventType",
                        e.target.value
                      )
                    }
                  >

                    {EVENT_TYPES.map((type) => (

                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>

                    ))}

                  </select>

                </div>

                {/* CITY */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-city">
                    City *
                  </label>

                  <input
                    id="edit-event-city"
                    type="text"
                    placeholder="e.g. Pune"
                    value={eventForm.city}
                    onChange={(e) =>
                      updateForm(
                        "city",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* START */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-start">
                    Start Date & Time *
                  </label>

                  <input
                    id="edit-event-start"
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) =>
                      updateForm(
                        "startTime",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* END */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-end">
                    End Date & Time
                  </label>

                  <input
                    id="edit-event-end"
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) =>
                      updateForm(
                        "endTime",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* LANGUAGE */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-language">
                    Language
                  </label>

                  <input
                    id="edit-event-language"
                    type="text"
                    placeholder="e.g. Hindi"
                    value={eventForm.language}
                    onChange={(e) =>
                      updateForm(
                        "language",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* GENRE */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-genre">
                    Genre
                  </label>

                  <input
                    id="edit-event-genre"
                    type="text"
                    placeholder="e.g. Music"
                    value={eventForm.genre}
                    onChange={(e) =>
                      updateForm(
                        "genre",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* AGE RATING */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-age">
                    Age Rating
                  </label>

                  <input
                    id="edit-event-age"
                    type="text"
                    placeholder="e.g. 18+"
                    value={eventForm.ageRating}
                    onChange={(e) =>
                      updateForm(
                        "ageRating",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* BASE PRICE */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-price">
                    Base Price *
                  </label>

                  <input
                    id="edit-event-price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="e.g. 499.93"
                    value={eventForm.basePrice}
                    onChange={(e) =>
                      updateForm(
                        "basePrice",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* TAX */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-tax">
                    Tax Percent
                  </label>

                  <input
                    id="edit-event-tax"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 18"
                    value={eventForm.taxPercent}
                    onChange={(e) =>
                      updateForm(
                        "taxPercent",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* VENUE */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-venue">
                    Venue *
                  </label>

                  <select
                    id="edit-event-venue"
                    value={eventForm.venueId}
                    onChange={(e) =>
                      updateForm(
                        "venueId",
                        e.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Select a venue
                    </option>

                    {venues.map((venue) => (

                      <option
                        key={venue.id}
                        value={venue.id}
                      >
                        {venue.name}
                        {venue.city
                          ? ` • ${venue.city}`
                          : ""}
                      </option>

                    ))}

                  </select>

                  <small>
                    Select the venue where this event
                    will be conducted.
                  </small>

                </div>

                {/* POSTER */}

                <div className="edit-event-field">

                  <label htmlFor="edit-event-poster">
                    Poster URL
                  </label>

                  <input
                    id="edit-event-poster"
                    type="url"
                    placeholder="https://..."
                    value={eventForm.posterUrl}
                    onChange={(e) =>
                      updateForm(
                        "posterUrl",
                        e.target.value
                      )
                    }
                  />

                </div>

                {/* BANNER */}

                <div className="edit-event-field full">

                  <label htmlFor="edit-event-banner">
                    Banner URL
                  </label>

                  <input
                    id="edit-event-banner"
                    type="url"
                    placeholder="https://..."
                    value={eventForm.bannerUrl}
                    onChange={(e) =>
                      updateForm(
                        "bannerUrl",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {editError && (
                <div className="edit-event-message error">
                  ⚠️ {editError}
                </div>
              )}

              {editSuccess && (
                <div className="edit-event-message success">
                  ✓ {editSuccess}
                </div>
              )}

              <div className="edit-event-actions">

                <button
                  type="button"
                  className="edit-event-cancel"
                  onClick={closeEditModal}
                  disabled={editing}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-event-submit"
                  disabled={
                    editing || venues.length === 0
                  }
                >

                  {editing ? (
                    <>
                      <span className="edit-event-small-spinner"></span>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* EVENT BOOKINGS MODAL */}

      {showBookingsModal && (

        <div
          className="organizer-bookings-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !bookingsLoading
            ) {
              closeBookingsModal();
            }
          }}
        >

          <div className="organizer-bookings-modal">

            <div className="organizer-bookings-header">

              <div>

                <span className="organizer-section-label">
                  EVENT BOOKINGS
                </span>

                <h2>
                  {selectedBookingEvent?.title ||
                    "Event Bookings"}
                </h2>

                <p>
                  View customers, seats, payment and
                  booking status.
                </p>

              </div>

              <button
                type="button"
                className="organizer-bookings-close"
                onClick={closeBookingsModal}
                disabled={bookingsLoading}
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {bookingSummary && (

              <div className="organizer-booking-summary-grid">

                <div className="organizer-booking-summary-card">
                  <span>Total Bookings</span>

                  <strong>
                    {bookingSummary.totalBookings ?? 0}
                  </strong>
                </div>

                <div className="organizer-booking-summary-card confirmed">
                  <span>Confirmed</span>

                  <strong>
                    {bookingSummary.confirmedBookings ?? 0}
                  </strong>
                </div>

                <div className="organizer-booking-summary-card seats">
                  <span>Seats Sold</span>

                  <strong>
                    {bookingSummary.totalSeatsSold ?? 0}
                  </strong>
                </div>

                <div className="organizer-booking-summary-card revenue">
                  <span>Revenue</span>

                  <strong>
                    ₹
                    {formatMoney(
                      bookingSummary.totalRevenue ?? 0
                    )}
                  </strong>
                </div>

              </div>

            )}

            {bookingsLoading ? (

              <div className="organizer-bookings-loading">

                <span className="organizer-bookings-spinner"></span>

                <p>
                  Loading booking details...
                </p>

              </div>

            ) : bookingsError ? (

              <div className="organizer-bookings-error">

                <span>!</span>

                <p>
                  {bookingsError}
                </p>

              </div>

            ) : eventBookings.length === 0 ? (

              <div className="organizer-bookings-empty">

                <div>🎟️</div>

                <h3>
                  No bookings yet
                </h3>

                <p>
                  Customers who book this event
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="organizer-bookings-table-wrap">

                <table className="organizer-bookings-table">

                  <thead>

                    <tr>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th>Seats</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {eventBookings.map((booking) => {

                      const customerName =
                        booking.user?.name ||
                        booking.user?.email ||
                        "Customer";

                      const customerEmail =
                        booking.user?.email || "";

                      const seatList =
                        Array.isArray(booking.seats)
                          ? booking.seats
                              .map(
                                (item) =>
                                  item?.seat?.seatNumber ||
                                  item?.seat?.label ||
                                  item?.seatNumber ||
                                  "Seat"
                              )
                              .join(", ")
                          : "-";

                      const bookingStatus =
                        booking.status || "UNKNOWN";

                      return (
                        <tr
                          key={
                            booking.id ||
                            booking.bookingCode
                          }
                        >

                          <td>
                            <strong>
                              {booking.bookingCode ||
                                `#${booking.id}`}
                            </strong>

                            <small>
                              {booking.bookedAt
                                ? formatDate(
                                    booking.bookedAt
                                  )
                                : ""}
                            </small>
                          </td>

                          <td>
                            <strong>
                              {customerName}
                            </strong>

                            <small>
                              {customerEmail}
                            </small>
                          </td>

                          <td>
                            <span className="organizer-seat-list">
                              {seatList || "-"}
                            </span>
                          </td>

                          <td>
                            <strong>
                              ₹
                              {formatMoney(
                                booking.totalAmount ?? 0
                              )}
                            </strong>
                          </td>

                          <td>

                            <span
                              className={`organizer-booking-status ${String(
                                bookingStatus
                              ).toLowerCase()}`}
                            >
                              {formatLabel(
                                bookingStatus
                              )}
                            </span>

                          </td>

                        </tr>
                      );

                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}