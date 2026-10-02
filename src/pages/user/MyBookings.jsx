import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);

      const data = await api("/api/bookings/mine");

      setBookings(data || []);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(code) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(code);
      setMessage("");

      await api(`/api/bookings/${code}/cancel`, {
        method: "POST"
      });

      setMessage("Booking cancelled successfully.");

      await loadBookings();
    } catch (error) {
      setMessage(
        error.message || "Unable to cancel booking."
      );
    } finally {
      setCancelling("");
    }
  }

  function viewTicket(booking) {
    navigate(
      `/booking-confirmation?code=${encodeURIComponent(
        booking.bookingCode
      )}`,
      {
        state: {
          booking
        }
      }
    );
  }

  function formatDate(value) {
    if (!value) {
      return "—";
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
      return "—";
    }

    return new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function getSeats(booking) {
    return (
      booking.seats
        ?.map((item) => item.seat?.seatNumber)
        .filter(Boolean)
        .join(", ") || "—"
    );
  }

  function getStatusClass(status) {
    if (status === "CONFIRMED") {
      return "mybook-status-confirmed";
    }

    if (status === "CANCELLED") {
      return "mybook-status-cancelled";
    }

    if (status === "COMPLETED") {
      return "mybook-status-completed";
    }

    return "mybook-status-default";
  }

  return (
    <section className="mybook-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mybook-header">

        <div>
          <span className="eyebrow">
            ACCOUNT
          </span>

          <h1>
            My Bookings
          </h1>

          <p>
            Manage your EventHub tickets and bookings.
          </p>
        </div>

        <div className="mybook-count">
          <strong>
            {bookings.length}
          </strong>

          <span>
            {bookings.length === 1
              ? "Booking"
              : "Bookings"}
          </span>
        </div>

      </div>


      {/* =====================================================
          MESSAGE
      ====================================================== */}

      {message && (
        <div className="mybook-message">
          <span>✓</span>
          {message}
        </div>
      )}


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (
        <div className="mybook-loading">

          <div className="mybook-spinner"></div>

          <p>
            Loading your bookings...
          </p>

        </div>
      )}


      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!loading && bookings.length === 0 && (
        <div className="mybook-empty">

          <div className="mybook-empty-icon">
            🎟️
          </div>

          <h2>
            No bookings yet
          </h2>

          <p>
            Your booked events will appear here.
          </p>

          <button
            className="mybook-primary-btn"
            onClick={() => navigate("/")}
          >
            Explore Events
            <span>→</span>
          </button>

        </div>
      )}


      {/* =====================================================
          BOOKING LIST
      ====================================================== */}

      {!loading && bookings.length > 0 && (
        <div className="mybook-list">

          {bookings.map((booking) => {

            const event = booking.event;

            const seats = getSeats(booking);

            const cancelled =
              booking.status === "CANCELLED";

            return (
              <article
                className={`mybook-card ${
                  cancelled
                    ? "mybook-card-cancelled"
                    : ""
                }`}
                key={booking.id}
              >

                {/* Ticket left section */}

                <div className="mybook-main">

                  <div className="mybook-event-row">

                    <div className="mybook-event-icon">
                      🎫
                    </div>

                    <div className="mybook-event-title">

                      <span>
                        EVENT
                      </span>

                      <h2>
                        {event?.title ||
                          "EventHub Event"}
                      </h2>

                      <p>
                        📍{" "}
                        {event?.city ||
                          "Location"}
                      </p>

                    </div>

                  </div>


                  <div className="mybook-divider"></div>


                  {/* Event info */}

                  <div className="mybook-info-grid">

                    <div>
                      <span>
                        DATE
                      </span>

                      <strong>
                        {formatDate(
                          event?.startTime
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        TIME
                      </span>

                      <strong>
                        {formatTime(
                          event?.startTime
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        SEAT
                      </span>

                      <strong>
                        {seats}
                      </strong>
                    </div>

                    <div>
                      <span>
                        STATUS
                      </span>

                      <strong
                        className={getStatusClass(
                          booking.status
                        )}
                      >
                        {booking.status}
                      </strong>
                    </div>

                  </div>


                  <div className="mybook-divider"></div>


                  {/* Booking details */}

                  <div className="mybook-details">

                    <div>
                      <span>
                        BOOKING ID
                      </span>

                      <strong>
                        {booking.bookingCode}
                      </strong>
                    </div>

                    <div>
                      <span>
                        PAYMENT
                      </span>

                      <strong
                        className={
                          booking.paymentStatus ===
                          "PAID"
                            ? "mybook-paid"
                            : ""
                        }
                      >
                        {booking.paymentStatus ||
                          "—"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        TOTAL PAID
                      </span>

                      <strong className="mybook-price">
                        ₹
                        {Number(
                          booking.totalAmount || 0
                        ).toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2
                          }
                        )}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* Ticket action section */}

                <div className="mybook-actions">

                  <div className="mybook-ticket-mark">
                    <span>EVENTHUB</span>
                    <strong>
                      TICKET
                    </strong>
                  </div>


                  <div className="mybook-action-buttons">

                    <button
                      className="mybook-view-btn"
                      onClick={() =>
                        viewTicket(booking)
                      }
                    >
                      View Ticket
                      <span>→</span>
                    </button>


                    {!cancelled && (
                      <button
                        className="mybook-cancel-btn"
                        onClick={() =>
                          cancelBooking(
                            booking.bookingCode
                          )
                        }
                        disabled={
                          cancelling ===
                          booking.bookingCode
                        }
                      >
                        {cancelling ===
                        booking.bookingCode
                          ? "Cancelling..."
                          : "Cancel Booking"}
                      </button>
                    )}

                  </div>

                </div>

              </article>
            );
          })}

        </div>
      )}

    </section>
  );
}