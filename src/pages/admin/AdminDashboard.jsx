import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

const EMPTY_VENUE = {
  name: "",
  address: "",
  city: "",
  totalSeats: "",
  description: "",
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState(EMPTY_VENUE);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, eventsData, usersData, venuesData, bookingsData] =
        await Promise.all([
          api("/api/admin/dashboard"),
          api("/api/admin/events"),
          api("/api/admin/users"),
          api("/api/admin/venues"),
          api("/api/admin/bookings"),
        ]);

      setDashboard(dashboardData);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  async function runAction(key, action, successMessage) {
    try {
      setBusy(key);
      setError("");
      await action();
      showNotice(successMessage);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Action failed.");
    } finally {
      setBusy("");
    }
  }

  async function changeEventStatus(event, status) {
    await runAction(
      `event-${event.id}-${status}`,
      () =>
        api(`/api/admin/events/${event.id}/status`, {
          method: "PATCH",
          body: { status },
        }),
      `Event ${status.toLowerCase().replaceAll("_", " ")} successfully.`
    );
    setSelectedEvent(null);
  }

  async function changeUserRole(user, role) {
    await runAction(
      `user-role-${user.id}`,
      () =>
        api(
          `/api/admin/users/${user.id}/role?role=${encodeURIComponent(role)}`,
          { method: "PATCH" }
        ),
      `${user.name || "User"} role changed to ${role}.`
    );
  }

  async function toggleUser(user) {
    const enabled = !(user.enabled ?? true);
    await runAction(
      `user-enabled-${user.id}`,
      () =>
        api(
          `/api/admin/users/${user.id}/enabled?enabled=${String(enabled)}`,
          { method: "PATCH" }
        ),
      `${user.name || "User"} ${enabled ? "enabled" : "disabled"}.`
    );
  }

  async function toggleVenue(venue) {
    const active = !(venue.active ?? true);
    await runAction(
      `venue-active-${venue.id}`,
      () =>
        api(
          `/api/admin/venues/${venue.id}/active?active=${String(active)}`,
          { method: "PATCH" }
        ),
      `${venue.name || "Venue"} ${active ? "activated" : "deactivated"}.`
    );
  }

  async function changeBookingStatus(booking, status) {
    await runAction(
      `booking-status-${booking.id}`,
      () =>
        api(`/api/admin/bookings/${booking.id}/status`, {
          method: "PATCH",
          body: { status },
        }),
      `Booking status changed to ${status}.`
    );
    setSelectedBooking(null);
  }

  async function cancelBooking(booking) {
    await runAction(
      `booking-cancel-${booking.id}`,
      () => api(`/api/admin/bookings/${booking.id}/cancel`, { method: "PATCH" }),
      "Booking cancelled successfully."
    );
    setSelectedBooking(null);
  }

  function openCreateVenue() {
    setEditingVenue(null);
    setVenueForm(EMPTY_VENUE);
    setShowVenueModal(true);
  }

  function openEditVenue(venue) {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name || "",
      address: venue.address || "",
      city: venue.city || "",
      totalSeats: venue.totalSeats ?? "",
      description: venue.description || "",
    });
    setShowVenueModal(true);
  }

  async function saveVenue(event) {
    event.preventDefault();

    try {
      setBusy("venue-save");
      setError("");

      const payload = {
        name: venueForm.name.trim(),
        address: venueForm.address.trim(),
        city: venueForm.city.trim(),
        totalSeats: Number(venueForm.totalSeats),
        description: venueForm.description.trim(),
      };

      if (!payload.name || !payload.city || !payload.totalSeats) {
        throw new Error("Venue name, city and total seats are required.");
      }

      if (editingVenue) {
        await api(`/api/admin/venues/${editingVenue.id}`, {
          method: "PATCH",
          body: payload,
        });
        showNotice("Venue updated successfully.");
      } else {
        await api("/api/admin/venues", {
          method: "POST",
          body: payload,
        });
        showNotice("Venue created successfully.");
      }

      setShowVenueModal(false);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Unable to save venue.");
    } finally {
      setBusy("");
    }
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function statusClass(status) {
    const value = String(status || "").toLowerCase();
    if (
      value.includes("publish") ||
      value.includes("confirm") ||
      value.includes("paid") ||
      value === "active"
    )
      return "success";
    if (
      value.includes("cancel") ||
      value.includes("refund") ||
      value.includes("failed") ||
      value === "inactive"
    )
      return "danger";
    if (value.includes("pending") || value.includes("draft"))
      return "warning";
    return "neutral";
  }

  const normalizedSearch = search.trim().toLowerCase();

  const filteredEvents = events.filter((event) =>
    `${event.title || ""} ${event.city || ""} ${event.status || ""}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredUsers = users.filter((user) =>
    `${user.name || ""} ${user.email || ""} ${user.role || ""}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredVenues = venues.filter((venue) =>
    `${venue.name || ""} ${venue.city || ""} ${venue.address || ""}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const filteredBookings = bookings.filter((booking) =>
    `${booking.bookingCode || ""} ${booking.event?.title || ""} ${
      booking.user?.name || ""
    } ${booking.status || ""}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  if (loading && !dashboard) {
    return (
      <section className="admin-page">
        <div className="admin-loading">
          <div className="admin-loader" />
          <p>Loading EventHub control center...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-page">
      {notice && <div className="admin-toast">✓ {notice}</div>}

      <header className="admin-hero">
        <div>
          <div className="admin-eyebrow">
            <span className="admin-live-dot" />
            ADMIN CONTROL CENTER
          </div>
          <h1>
            Manage your <span>EventHub.</span>
          </h1>
          <p>
            Control events, users, venues and bookings from one dashboard.
          </p>
        </div>

        <button
          className="admin-refresh-button"
          onClick={loadAdminData}
          disabled={loading}
        >
          <span className={loading ? "spin-icon" : ""}>↻</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="admin-alert admin-alert-error">
          <strong>!</strong>
          <span>{error}</span>
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="admin-stats-grid">
        {[
          ["users", "Total Users", "👥", "purple"],
          ["events", "Total Events", "🎫", "blue"],
          ["publishedEvents", "Published", "✦", "cyan"],
          ["bookings", "Total Bookings", "◈", "pink"],
          ["confirmedBookings", "Confirmed", "✓", "green"],
          ["organizers", "Organizers", "◆", "orange"],
        ].map(([key, label, icon, color]) => (
          <article className={`admin-stat-card ${color}`} key={key}>
            <div className="admin-stat-top">
              <div className="admin-stat-icon">{icon}</div>
              <span>↗</span>
            </div>
            <div className="admin-stat-value">{dashboard?.[key] ?? 0}</div>
            <div className="admin-stat-label">{label}</div>
          </article>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {[
            ["overview", "Overview"],
            ["events", "Events"],
            ["users", "Users"],
            ["venues", "Venues"],
            ["bookings", "Bookings"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={tab === value ? "active" : ""}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="admin-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
          {search && <button onClick={() => setSearch("")}>×</button>}
        </div>
      </div>

      {tab === "overview" && (
        <div className="admin-dashboard-grid">
          <section className="admin-section-card admin-wide-card">
            <SectionHeader title="Events" label="EVENT MANAGEMENT" count={events.length} />
            <div className="admin-list">
              {filteredEvents.slice(0, 6).map((event) => (
                <article className="admin-list-row" key={event.id}>
                  <div className="admin-row-icon">🎫</div>
                  <div className="admin-row-main">
                    <strong>{event.title || "Untitled Event"}</strong>
                    <span>
                      📍 {event.city || "Unknown"} · {formatDate(event.startTime)}
                    </span>
                  </div>
                  <span className={`admin-status ${statusClass(event.status)}`}>
                    {event.status || "UNKNOWN"}
                  </span>
                  <button
                    className="admin-small-button"
                    onClick={() => setSelectedEvent(event)}
                  >
                    Manage
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-section-card">
            <SectionHeader title="Users" label="USER MANAGEMENT" count={users.length} />
            <div className="admin-list">
              {filteredUsers.slice(0, 6).map((user) => (
                <article className="admin-list-row" key={user.id}>
                  <div className="admin-avatar">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="admin-row-main">
                    <strong>{user.name || "Unknown User"}</strong>
                    <span>{user.email}</span>
                  </div>
                  <span className="admin-role-badge">{user.role || "USER"}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-section-card">
            <SectionHeader title="Venues" label="VENUE MANAGEMENT" count={venues.length} />
            <div className="admin-list">
              {filteredVenues.slice(0, 6).map((venue) => (
                <article className="admin-list-row" key={venue.id}>
                  <div className="admin-row-icon">🏟️</div>
                  <div className="admin-row-main">
                    <strong>{venue.name || "Unnamed Venue"}</strong>
                    <span>{venue.city || "Unknown"} · {venue.totalSeats ?? 0} seats</span>
                  </div>
                  <button
                    className="admin-small-button"
                    onClick={() => openEditVenue(venue)}
                  >
                    Edit
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-section-card admin-wide-card">
            <SectionHeader title="Recent Bookings" label="TRANSACTION ACTIVITY" count={bookings.length} />
            <BookingTable
              bookings={filteredBookings.slice(0, 8)}
              onManage={setSelectedBooking}
              formatDate={formatDate}
              statusClass={statusClass}
            />
          </section>
        </div>
      )}

      {tab === "events" && (
        <section className="admin-section-card">
          <SectionHeader title="Event Management" label="ALL EVENTS" count={filteredEvents.length} />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>City</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td><strong>{event.title || "Untitled"}</strong></td>
                    <td>{event.city || "—"}</td>
                    <td>{formatDate(event.startTime)}</td>
                    <td>
                      <span className={`admin-status ${statusClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <button className="admin-small-button" onClick={() => setSelectedEvent(event)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "users" && (
        <section className="admin-section-card">
          <SectionHeader title="User Management" label="ALL USERS" count={filteredUsers.length} />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Account</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.name || "Unknown"}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className="admin-role-badge">{user.role || "USER"}</span>
                    </td>
                    <td>
                      <span className={`admin-status ${(user.enabled ?? true) ? "success" : "danger"}`}>
                        {(user.enabled ?? true) ? "ENABLED" : "DISABLED"}
                      </span>
                    </td>
                    <td className="admin-action-group">
                      <button
                        className="admin-small-button"
                        disabled={busy === `user-role-${user.id}`}
                        onClick={() =>
                          changeUserRole(user, user.role === "ORGANIZER" ? "USER" : "ORGANIZER")
                        }
                      >
                        {user.role === "ORGANIZER" ? "Make User" : "Make Organizer"}
                      </button>
                      <button
                        className="admin-small-button secondary"
                        disabled={busy === `user-enabled-${user.id}`}
                        onClick={() => toggleUser(user)}
                      >
                        {(user.enabled ?? true) ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "venues" && (
        <section className="admin-section-card">
          <div className="admin-section-header">
            <div>
              <span className="admin-section-label">VENUE MANAGEMENT</span>
              <h2>Venues</h2>
            </div>
            <button className="admin-primary-button" onClick={openCreateVenue}>
              + Add Venue
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Venue</th>
                  <th>City</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVenues.map((venue) => (
                  <tr key={venue.id}>
                    <td>
                      <strong>{venue.name || "Unnamed"}</strong>
                      <small>{venue.address || ""}</small>
                    </td>
                    <td>{venue.city || "—"}</td>
                    <td>{venue.totalSeats ?? "—"}</td>
                    <td>
                      <span className={`admin-status ${(venue.active ?? true) ? "success" : "danger"}`}>
                        {(venue.active ?? true) ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="admin-action-group">
                      <button className="admin-small-button" onClick={() => openEditVenue(venue)}>
                        Edit
                      </button>
                      <button
                        className="admin-small-button secondary"
                        disabled={busy === `venue-active-${venue.id}`}
                        onClick={() => toggleVenue(venue)}
                      >
                        {(venue.active ?? true) ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "bookings" && (
        <section className="admin-section-card">
          <SectionHeader title="Booking Management" label="ALL BOOKINGS" count={filteredBookings.length} />
          <BookingTable
            bookings={filteredBookings}
            onManage={setSelectedBooking}
            formatDate={formatDate}
            statusClass={statusClass}
          />
        </section>
      )}

      {selectedEvent && (
        <div className="admin-modal-overlay" onMouseDown={() => setSelectedEvent(null)}>
          <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-section-label">EVENT MANAGEMENT</span>
                <h2>{selectedEvent.title || "Event"}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)}>×</button>
            </div>

            <div className="admin-modal-info">
              <div><span>City</span><strong>{selectedEvent.city || "—"}</strong></div>
              <div><span>Start</span><strong>{formatDateTime(selectedEvent.startTime)}</strong></div>
              <div><span>Type</span><strong>{selectedEvent.eventType || "—"}</strong></div>
              <div><span>Status</span><strong>{selectedEvent.status || "—"}</strong></div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-primary-button"
                disabled={busy.includes(`event-${selectedEvent.id}-PUBLISHED`)}
                onClick={() => changeEventStatus(selectedEvent, "PUBLISHED")}
              >
                Publish
              </button>
              <button
                className="admin-warning-button"
                onClick={() => changeEventStatus(selectedEvent, "PENDING_APPROVAL")}
              >
                Pending
              </button>
              <button
                className="admin-danger-button"
                onClick={() => changeEventStatus(selectedEvent, "CANCELLED")}
              >
                Cancel Event
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBooking && (
        <div className="admin-modal-overlay" onMouseDown={() => setSelectedBooking(null)}>
          <div className="admin-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-section-label">BOOKING MANAGEMENT</span>
                <h2>{selectedBooking.bookingCode || `Booking #${selectedBooking.id}`}</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)}>×</button>
            </div>

            <div className="admin-modal-info">
              <div><span>Customer</span><strong>{selectedBooking.user?.name || "—"}</strong></div>
              <div><span>Event</span><strong>{selectedBooking.event?.title || "—"}</strong></div>
              <div><span>Date</span><strong>{formatDate(selectedBooking.bookedAt)}</strong></div>
              <div><span>Amount</span><strong>₹{selectedBooking.totalAmount ?? selectedBooking.total ?? 0}</strong></div>
              <div><span>Status</span><strong>{selectedBooking.status || "—"}</strong></div>
              <div><span>Payment</span><strong>{selectedBooking.paymentStatus || "—"}</strong></div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-primary-button"
                onClick={() => changeBookingStatus(selectedBooking, "CONFIRMED")}
              >
                Confirm
              </button>
              <button
                className="admin-warning-button"
                onClick={() => changeBookingStatus(selectedBooking, "PENDING")}
              >
                Pending
              </button>
              <button
                className="admin-danger-button"
                onClick={() => cancelBooking(selectedBooking)}
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {showVenueModal && (
        <div className="admin-modal-overlay" onMouseDown={() => setShowVenueModal(false)}>
          <form className="admin-modal admin-venue-form" onSubmit={saveVenue} onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-section-label">VENUE MANAGEMENT</span>
                <h2>{editingVenue ? "Edit Venue" : "Add Venue"}</h2>
              </div>
              <button type="button" onClick={() => setShowVenueModal(false)}>×</button>
            </div>

            <div className="admin-form-grid">
              <label>
                Venue Name
                <input value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} />
              </label>
              <label>
                City
                <input value={venueForm.city} onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })} />
              </label>
              <label className="full">
                Address
                <input value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} />
              </label>
              <label>
                Total Seats
                <input type="number" min="1" value={venueForm.totalSeats} onChange={(e) => setVenueForm({ ...venueForm, totalSeats: e.target.value })} />
              </label>
              <label className="full">
                Description
                <textarea rows="4" value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} />
              </label>
            </div>

            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setShowVenueModal(false)}>
                Close
              </button>
              <button type="submit" className="admin-primary-button" disabled={busy === "venue-save"}>
                {busy === "venue-save" ? "Saving..." : editingVenue ? "Update Venue" : "Create Venue"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

function SectionHeader({ title, label, count }) {
  return (
    <div className="admin-section-header">
      <div>
        <span className="admin-section-label">{label}</span>
        <h2>{title}</h2>
      </div>
      <span className="admin-count">{count} total</span>
    </div>
  );
}

function BookingTable({ bookings, onManage, formatDate, statusClass }) {
  if (!bookings.length) {
    return (
      <div className="admin-empty">
        <span>◈</span>
        <p>No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Booking</th>
            <th>Customer</th>
            <th>Event</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td><strong>{booking.bookingCode || `#${booking.id}`}</strong></td>
              <td>{booking.user?.name || "Customer"}</td>
              <td>{booking.event?.title || "Event"}</td>
              <td>{formatDate(booking.bookedAt)}</td>
              <td>₹{booking.totalAmount ?? booking.total ?? 0}</td>
              <td>
                <span className={`admin-status ${statusClass(booking.status)}`}>
                  {booking.status || "UNKNOWN"}
                </span>
              </td>
              <td>
                <button className="admin-small-button" onClick={() => onManage(booking)}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
