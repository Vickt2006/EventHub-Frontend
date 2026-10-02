import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../services/api";

function formatDate(value) {
  if (!value) return "Date not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(value) {
  if (!value) return "Time not available";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [couponCode, setCouponCode] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvent();
  }, [id]);

  async function loadEvent() {
    try {
      setLoading(true);
      setError("");

      const [eventData, seatsData] = await Promise.all([
        api(`/api/events/${id}`),
        api(`/api/events/${id}/seats`)
      ]);

      setEvent(eventData);
      setSeats(seatsData);
    } catch (err) {
      setError(err.message || "Unable to load event.");
    } finally {
      setLoading(false);
    }
  }

  function toggleSeat(seat) {
    if (seat.status !== "AVAILABLE") return;

    setSelectedSeats((current) => {
      const exists = current.includes(seat.id);

      if (exists) {
        return current.filter(
          (seatId) => seatId !== seat.id
        );
      }

      return [...current, seat.id];
    });
  }

  const selectedSeatObjects = useMemo(() => {
    return seats.filter((seat) =>
      selectedSeats.includes(seat.id)
    );
  }, [seats, selectedSeats]);

  const subtotal = useMemo(() => {
    return selectedSeatObjects.reduce((sum, seat) => {
      const price =
        Number(event?.basePrice || 0) *
        Number(seat.priceMultiplier || 1);

      return sum + price;
    }, 0);
  }, [selectedSeatObjects, event]);

  const estimatedTax =
    subtotal *
    (Number(event?.taxPercent || 0) / 100);

  const estimatedTotal =
    subtotal + estimatedTax;

  function handleBooking() {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setError("");

    navigate("/payment", {
      state: {
        event,
        eventId: Number(id),
        selectedSeats: selectedSeatObjects,
        selectedSeatIds: selectedSeats,
        couponCode: couponCode.trim() || null,
        subtotal,
        tax: estimatedTax,
        discount: 0,
        total: estimatedTotal
      }
    });
  }

  if (loading) {
    return (
      <main className="event-details-page">
        <div className="event-loading">
          <div className="event-loader"></div>
          <p>Loading event...</p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="event-details-page">
        <div className="event-error-card">
          <span>⚠️</span>

          <h2>Unable to load event</h2>

          <p>{error}</p>

          <button
            className="event-back-button"
            onClick={() => navigate("/")}
          >
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="event-details-page">

      {/* HERO */}
      <section className="event-hero-card">

        <div className="event-hero-glow"></div>

        <div className="event-hero-content">

          <div className="event-breadcrumb">

            <button onClick={() => navigate("/")}>
              ← Events
            </button>

            <span>/</span>

            <span>
              {event.eventType}
            </span>

          </div>

          <div className="event-type-pill">
            {event.eventType}
          </div>

          <h1>{event.title}</h1>

          <p className="event-description">
            {event.description}
          </p>

          <div className="event-meta-grid">

            <div className="event-meta-item">
              <span className="meta-icon">📍</span>

              <div>
                <small>Location</small>
                <strong>{event.city}</strong>
              </div>
            </div>

            <div className="event-meta-item">
              <span className="meta-icon">📅</span>

              <div>
                <small>Date</small>
                <strong>
                  {formatDate(event.startTime)}
                </strong>
              </div>
            </div>

            <div className="event-meta-item">
              <span className="meta-icon">🕐</span>

              <div>
                <small>Time</small>
                <strong>
                  {formatTime(event.startTime)}
                </strong>
              </div>
            </div>

            <div className="event-meta-item">
              <span className="meta-icon">🌐</span>

              <div>
                <small>Language</small>
                <strong>
                  {event.language || "English"}
                </strong>
              </div>
            </div>

            <div className="event-meta-item">
              <span className="meta-icon">🎵</span>

              <div>
                <small>Genre</small>
                <strong>
                  {event.genre || "Live Event"}
                </strong>
              </div>
            </div>

            <div className="event-meta-item">
              <span className="meta-icon">🔞</span>

              <div>
                <small>Age Rating</small>
                <strong>
                  {event.ageRating || "All Ages"}
                </strong>
              </div>
            </div>

          </div>

          <div className="event-price-row">

            <div>
              <span>Starting from</span>

              <strong>
                ₹{formatMoney(event.basePrice)}
              </strong>

              <small>per seat</small>
            </div>

            <div className="event-capacity">

              <span>🎟</span>

              <strong>
                {event.capacity || seats.length}
              </strong>

              <small>Total seats</small>

            </div>

          </div>

        </div>

      </section>


      {/* BOOKING AREA */}
      <section className="booking-layout">

        {/* SEATS */}
        <div className="seat-selection-card">

          <div className="section-top">

            <div>

              <span className="section-label">
                TICKETS
              </span>

              <h2>
                Select your seats
              </h2>

              <p>
                Choose your preferred seats from
                the layout below.
              </p>

            </div>

            <div className="selected-count">

              <strong>
                {selectedSeats.length}
              </strong>

              <span>
                Selected
              </span>

            </div>

          </div>


          {/* LEGEND */}
          <div className="seat-legend">

            <div>
              <span className="legend-dot available"></span>
              <span>Available</span>
            </div>

            <div>
              <span className="legend-dot selected"></span>
              <span>Selected</span>
            </div>

            <div>
              <span className="legend-dot booked"></span>
              <span>Booked</span>
            </div>

          </div>


          {/* SCREEN */}
          <div className="screen-area">

            <div className="screen-glow"></div>

            <div className="screen">
              SCREEN
            </div>

            <span>
              All eyes this way
            </span>

          </div>


          {/* SEAT MAP */}
          <div className="seat-map">

            {[
              "A",
              "B",
              "C",
              "D",
              "E",
              "F",
              "G",
              "H",
              "I",
              "J"
            ].map((row) => {

              const rowSeats = seats.filter(
                (seat) =>
                  seat.rowLabel === row
              );

              if (rowSeats.length === 0) {
                return null;
              }

              return (
                <div
                  className="seat-row"
                  key={row}
                >

                  <div className="row-label">
                    {row}
                  </div>

                  <div className="row-seats">

                    {rowSeats.map((seat) => {

                      const isSelected =
                        selectedSeats.includes(
                          seat.id
                        );

                      const isBooked =
                        seat.status !==
                        "AVAILABLE";

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() =>
                            toggleSeat(seat)
                          }
                          className={[
                            "seat-button",
                            seat.category?.toLowerCase(),
                            isSelected
                              ? "seat-selected"
                              : "",
                            isBooked
                              ? "seat-booked"
                              : ""
                          ].join(" ")}
                        >

                          <span>
                            {seat.seatNumber}
                          </span>

                          <small>
                            ₹
                            {formatMoney(
                              Number(
                                event.basePrice || 0
                              ) *
                                Number(
                                  seat.priceMultiplier ||
                                    1
                                )
                            )}
                          </small>

                        </button>
                      );
                    })}

                  </div>

                  <div className="row-label">
                    {row}
                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* BOOKING SUMMARY */}
        <aside className="booking-summary-card">

          <div className="summary-header">

            <span className="section-label">
              YOUR BOOKING
            </span>

            <h2>
              Booking Summary
            </h2>

            <p>
              Review your seats before continuing
              to payment.
            </p>

          </div>


          <div className="summary-event">

            <div className="summary-event-icon">
              🎫
            </div>

            <div>

              <strong>
                {event.title}
              </strong>

              <span>
                {formatDate(event.startTime)}
                {" · "}
                {formatTime(event.startTime)}
              </span>

            </div>

          </div>


          <div className="summary-divider"></div>


          {/* SELECTED SEATS */}
          <div className="summary-seats">

            <div className="summary-title">

              <span>
                Selected Seats
              </span>

              <strong>
                {selectedSeats.length}
              </strong>

            </div>

            {selectedSeatObjects.length === 0 ? (

              <div className="no-seats">

                <span>💺</span>

                <p>
                  No seats selected
                </p>

                <small>
                  Select seats from the layout
                </small>

              </div>

            ) : (

              <div className="selected-seat-list">

                {selectedSeatObjects.map((seat) => {

                  const price =
                    Number(event.basePrice || 0) *
                    Number(
                      seat.priceMultiplier || 1
                    );

                  return (
                    <div
                      className="selected-seat-item"
                      key={seat.id}
                    >

                      <div>

                        <span className="mini-seat">
                          {seat.seatNumber}
                        </span>

                        <span>
                          {seat.category}
                        </span>

                      </div>

                      <strong>
                        ₹{formatMoney(price)}
                      </strong>

                    </div>
                  );
                })}

              </div>
            )}

          </div>


          {/* COUPON */}
          <div className="coupon-box">

            <label>
              Have a coupon?
            </label>

            <div className="coupon-input-row">

              <input
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(
                    e.target.value
                  )
                }
                placeholder="Enter coupon code"
              />

            </div>

          </div>


          {/* PRICE */}
          <div className="price-breakdown">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                ₹{formatMoney(subtotal)}
              </strong>

            </div>

            <div>

              <span>
                Taxes
              </span>

              <strong>
                ₹{formatMoney(estimatedTax)}
              </strong>

            </div>

            <div className="total-row">

              <span>
                Total
              </span>

              <strong>
                ₹{formatMoney(estimatedTotal)}
              </strong>

            </div>

          </div>


          {/* ERROR */}
          {error && (
            <div className="booking-error">
              ⚠️ {error}
            </div>
          )}


          {/* CONFIRM */}
          <button
            className="confirm-booking-button"
            disabled={
              selectedSeats.length === 0
            }
            onClick={handleBooking}
          >
            <>
              Continue to Payment
              <span>→</span>
            </>
          </button>


          <p className="secure-note">
            🔒 Secure checkout · Payment required
            to confirm your booking
          </p>

        </aside>

      </section>

    </main>
  );
}