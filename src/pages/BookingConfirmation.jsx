import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../services/api";

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialBooking = location.state?.booking || null;

  const [booking, setBooking] = useState(initialBooking);
  const [loading, setLoading] = useState(!initialBooking);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBooking() {
      // Booking already available from Payment page
      if (initialBooking) {
        setBooking(initialBooking);
        setLoading(false);
        return;
      }

      // Get booking code from URL
      const params = new URLSearchParams(location.search);
      const bookingCode = params.get("code");

      if (!bookingCode) {
        setLoading(false);
        setError("Booking details could not be found.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await api(
          `/api/bookings/${encodeURIComponent(bookingCode)}`
        );

        setBooking(result);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load booking details."
        );
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [location.search, initialBooking]);


  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <section className="booking-confirmation-page">

        <div className="confirmation-empty">

          <span className="confirmation-icon">
            🎟️
          </span>

          <h1>
            Loading Ticket...
          </h1>

          <p>
            Please wait while we load your booking.
          </p>

        </div>

      </section>
    );
  }


  /* =====================================================
     ERROR / BOOKING NOT FOUND
  ====================================================== */

  if (error || !booking) {
    return (
      <section className="booking-confirmation-page">

        <div className="confirmation-empty">

          <span className="confirmation-icon">
            🎟️
          </span>

          <h1>
            Booking Not Found
          </h1>

          <p>
            {error ||
              "We could not find the booking details."}
          </p>

          <button
            type="button"
            className="confirmation-primary-button"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            View My Bookings
          </button>

        </div>

      </section>
    );
  }


  /* =====================================================
     BOOKING DATA
  ====================================================== */

  const event = booking.event;

  const seats = booking.seats || [];

  const seatNumbers = seats
    .map(
      (item) =>
        item?.seat?.seatNumber
    )
    .filter(Boolean)
    .join(", ");

  const qrValue =
    booking.qrCode ||
    `EVENTHUB:${booking.bookingCode}`;


  /* =====================================================
     DATE / TIME
  ====================================================== */

  const bookingDate = booking.bookedAt
    ? new Date(
        booking.bookedAt
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )
    : "—";


  const eventDate = event?.startTime
    ? new Date(
        event.startTime
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric"
        }
      )
    : "—";


  const eventTime = event?.startTime
    ? new Date(
        event.startTime
      ).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit"
        }
      )
    : "—";


  /* =====================================================
     ACTIONS
  ====================================================== */

  function goToMyBookings() {
    navigate("/my-bookings");
  }


  function exploreEvents() {
    navigate("/");
  }


  function printTicket() {
    window.print();
  }


  return (
    <section className="booking-confirmation-page">

      {/* =================================================
          BACKGROUND EFFECTS
      ================================================== */}

      <div className="confirmation-glow confirmation-glow-one"></div>

      <div className="confirmation-glow confirmation-glow-two"></div>


      {/* =================================================
          SUCCESS HEADER
      ================================================== */}

      <div className="confirmation-success">

        <div className="confirmation-check">
          ✓
        </div>

        <span className="eyebrow">
          PAYMENT SUCCESSFUL
        </span>

        <h1>
          Booking Confirmed!
        </h1>

        <p>
          Your EventHub ticket has been booked
          successfully.
        </p>

      </div>


      {/* =================================================
          TICKET CARD
      ================================================== */}

      <div className="ticket-card">


        {/* ===============================================
            LEFT / MAIN TICKET
        ================================================ */}

        <div className="ticket-main">

          {/* EVENT */}

          <div className="ticket-event">

            <div className="ticket-event-icon">
              🎫
            </div>

            <div>

              <span className="ticket-label">
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


          <div className="ticket-divider"></div>


          {/* =============================================
              EVENT INFORMATION
          ============================================== */}

          <div className="ticket-info-grid">

            <div className="ticket-info">

              <span>
                DATE
              </span>

              <strong>
                {eventDate}
              </strong>

            </div>


            <div className="ticket-info">

              <span>
                TIME
              </span>

              <strong>
                {eventTime}
              </strong>

            </div>


            <div className="ticket-info">

              <span>
                SEAT
              </span>

              <strong>
                {seatNumbers || "—"}
              </strong>

            </div>


            <div className="ticket-info">

              <span>
                PAYMENT
              </span>

              <strong className="paid-status">
                {booking.paymentStatus ||
                  "PAID"}
              </strong>

            </div>

          </div>


          <div className="ticket-divider"></div>


          {/* =============================================
              BOOKING DETAILS
          ============================================== */}

          <div className="ticket-details">

            <div>

              <span>
                Booking ID
              </span>

              <strong>
                {booking.bookingCode}
              </strong>

            </div>


            <div>

              <span>
                Booked On
              </span>

              <strong>
                {bookingDate}
              </strong>

            </div>


            <div>

              <span>
                Payment Status
              </span>

              <strong
                className={
                  booking.paymentStatus === "PAID"
                    ? "paid-status"
                    : ""
                }
              >
                {booking.paymentStatus ||
                  "PAID"}
              </strong>

            </div>


            <div>

              <span>
                Total Paid
              </span>

              <strong className="ticket-total">

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


        {/* ===============================================
            QR SECTION
        ================================================ */}

        <div className="ticket-qr-section">

          <div className="ticket-qr">

            <QRCodeSVG
              value={qrValue}
              size={170}
              bgColor="#ffffff"
              fgColor="#080b18"
              level="H"
            />

          </div>

          <span className="ticket-qr-title">
            Scan to verify ticket
          </span>

          <span className="ticket-qr-code">
            {booking.bookingCode}
          </span>

        </div>

      </div>


      {/* =================================================
          ACTION BUTTONS
      ================================================== */}

      <div className="confirmation-actions">


        {/* VIEW BOOKINGS */}

        <button
          type="button"
          className="confirmation-primary-button"
          onClick={goToMyBookings}
        >
          View My Bookings
          <span>→</span>
        </button>


        {/* PRINT / SAVE PDF */}

        <button
          type="button"
          className="confirmation-secondary-button"
          onClick={printTicket}
        >
          🖨️ Print / Save PDF
        </button>


        {/* EXPLORE */}

        <button
          type="button"
          className="confirmation-secondary-button"
          onClick={exploreEvents}
        >
          Explore More Events
        </button>

      </div>


      {/* =================================================
          NOTE
      ================================================== */}

      <p className="confirmation-note">
        🔒 Keep your booking ID and QR code safe
        for event entry.
      </p>

    </section>
  );
}