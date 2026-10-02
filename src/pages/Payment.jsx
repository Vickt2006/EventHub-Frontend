import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  const [method, setMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");

  if (!booking) {
    return (
      <section className="payment-page">
        <div className="payment-empty">
          <span className="eyebrow">PAYMENT</span>

          <h1>No booking details found</h1>

          <p>
            Please select your seats again before continuing.
          </p>

          <button
            className="payment-button"
            onClick={() => navigate("/")}
          >
            Back to Events
          </button>
        </div>
      </section>
    );
  }

  const {
    event,
    eventId,
    selectedSeats = [],
    selectedSeatIds = [],
    subtotal = 0,
    tax = 0,
    discount = 0,
    total = 0,
    couponCode = ""
  } = booking;

  function validatePaymentDetails() {
    if (method === "UPI") {
      if (!upiId.trim()) {
        return "Please enter your UPI ID.";
      }

      if (!upiId.includes("@")) {
        return "Please enter a valid UPI ID.";
      }
    }

    if (method === "CARD") {
      if (!cardNumber.trim()) {
        return "Please enter your card number.";
      }

      if (cardNumber.replace(/\s/g, "").length < 12) {
        return "Please enter a valid card number.";
      }

      if (!expiry.trim()) {
        return "Please enter card expiry.";
      }

      if (!cvv.trim() || cvv.length !== 3) {
        return "Please enter a valid CVV.";
      }
    }

    if (method === "NETBANKING") {
      if (!bank) {
        return "Please select your bank.";
      }
    }

    return "";
  }

  async function handlePayment() {
    setError("");

    if (!eventId) {
      setError("Event information is missing.");
      return;
    }

    if (!selectedSeatIds.length) {
      setError("No seats selected.");
      return;
    }

    const validationError = validatePaymentDetails();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setProcessing(true);

      /*
       * Backend expects:
       * eventId
       * seatIds
       * couponCode
       * paymentMethod
       */

      const result = await api("/api/bookings", {
        method: "POST",

        body: {
          eventId: Number(eventId),

          seatIds: selectedSeatIds,

          couponCode: couponCode?.trim() || null,

          paymentMethod: method
        }
      });

      /*
       * Booking successfully created.
       *
       * Backend marks it CONFIRMED + PAID.
       *
       * Send complete booking response to
       * Booking Confirmation page.
       */
navigate(
  `/booking-confirmation?code=${encodeURIComponent(
    result.bookingCode
  )}`,
  {
    state: {
      booking: result
    }
  }
);

    } catch (err) {
      setError(
        err.message ||
          "Payment failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <section className="payment-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="payment-header">

        <div>

          <span className="eyebrow">
            SECURE CHECKOUT
          </span>

          <h1>
            Complete your{" "}
            <span>payment.</span>
          </h1>

          <p>
            Securely complete your EventHub booking.
          </p>

        </div>

        <div className="payment-secure-badge">
          <span>●</span>
          Secure Payment
        </div>

      </div>


      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="payment-layout">

        {/* ===================================================
            LEFT
        ==================================================== */}

        <div className="payment-main">

          <div className="payment-card">

            <div className="payment-card-title">

              <div>

                <span className="eyebrow">
                  PAYMENT METHOD
                </span>

                <h2>
                  Choose how you want to pay
                </h2>

              </div>

            </div>


            {/* =================================================
                PAYMENT METHODS
            ================================================== */}

            <div className="payment-methods">

              {/* UPI */}

              <button
                type="button"
                className={`payment-method ${
                  method === "UPI"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setMethod("UPI");
                  setError("");
                }}
                disabled={processing}
              >

                <span className="payment-method-icon">
                  ₹
                </span>

                <span className="payment-method-info">

                  <strong>
                    UPI
                  </strong>

                  <small>
                    Google Pay, PhonePe, Paytm
                  </small>

                </span>

                <span className="payment-radio">
                  {method === "UPI"
                    ? "✓"
                    : ""}
                </span>

              </button>


              {/* CARD */}

              <button
                type="button"
                className={`payment-method ${
                  method === "CARD"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setMethod("CARD");
                  setError("");
                }}
                disabled={processing}
              >

                <span className="payment-method-icon">
                  ▣
                </span>

                <span className="payment-method-info">

                  <strong>
                    Credit / Debit Card
                  </strong>

                  <small>
                    Visa, Mastercard, RuPay
                  </small>

                </span>

                <span className="payment-radio">
                  {method === "CARD"
                    ? "✓"
                    : ""}
                </span>

              </button>


              {/* NET BANKING */}

              <button
                type="button"
                className={`payment-method ${
                  method === "NETBANKING"
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  setMethod("NETBANKING");
                  setError("");
                }}
                disabled={processing}
              >

                <span className="payment-method-icon">
                  ⌂
                </span>

                <span className="payment-method-info">

                  <strong>
                    Net Banking
                  </strong>

                  <small>
                    All major banks
                  </small>

                </span>

                <span className="payment-radio">
                  {method === "NETBANKING"
                    ? "✓"
                    : ""}
                </span>

              </button>

            </div>


            {/* =================================================
                UPI
            ================================================== */}

            {method === "UPI" && (

              <div className="payment-input-area">

                <label>
                  UPI ID
                </label>

                <input
                  type="text"
                  value={upiId}
                  onChange={(event) =>
                    setUpiId(event.target.value)
                  }
                  placeholder="example@upi"
                  disabled={processing}
                />

                <p>
                  Enter your UPI ID to continue.
                </p>

              </div>

            )}


            {/* =================================================
                CARD
            ================================================== */}

            {method === "CARD" && (

              <div className="payment-input-area">

                <label>
                  Card Number
                </label>

                <input
                  type="text"
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(
                      event.target.value
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  disabled={processing}
                />


                <div className="payment-two-inputs">

                  <div>

                    <label>
                      Expiry
                    </label>

                    <input
                      type="text"
                      value={expiry}
                      onChange={(event) =>
                        setExpiry(
                          event.target.value
                        )
                      }
                      placeholder="MM / YY"
                      disabled={processing}
                    />

                  </div>


                  <div>

                    <label>
                      CVV
                    </label>

                    <input
                      type="password"
                      value={cvv}
                      onChange={(event) =>
                        setCvv(
                          event.target.value
                            .replace(/\D/g, "")
                        )
                      }
                      placeholder="•••"
                      maxLength="3"
                      disabled={processing}
                    />

                  </div>

                </div>

              </div>

            )}


            {/* =================================================
                NET BANKING
            ================================================== */}

            {method === "NETBANKING" && (

              <div className="payment-input-area">

                <label>
                  Select Bank
                </label>

                <select
                  value={bank}
                  onChange={(event) =>
                    setBank(event.target.value)
                  }
                  disabled={processing}
                >

                  <option value="">
                    Select your bank
                  </option>

                  <option value="SBI">
                    State Bank of India
                  </option>

                  <option value="HDFC">
                    HDFC Bank
                  </option>

                  <option value="ICICI">
                    ICICI Bank
                  </option>

                  <option value="AXIS">
                    Axis Bank
                  </option>

                  <option value="KOTAK">
                    Kotak Mahindra Bank
                  </option>

                </select>

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="payment-error">

                <span>⚠️</span>

                <p>
                  {error}
                </p>

              </div>

            )}


            {/* =================================================
                SECURITY
            ================================================== */}

            <div className="payment-security">

              <span>
                🔒
              </span>

              <div>

                <strong>
                  Your payment is secure
                </strong>

                <p>
                  Your payment information is
                  encrypted and protected.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            RIGHT SUMMARY
        ==================================================== */}

        <aside className="payment-summary">

          <div className="payment-summary-card">

            <span className="eyebrow">
              ORDER SUMMARY
            </span>

            <h2>
              {event?.title ||
                "EventHub Event"}
            </h2>

            <p className="payment-event-info">

              {event?.city ||
                "EventHub"}

              {" • "}

              {event?.startTime
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
                : "Event Date"}

            </p>


            <div className="payment-divider" />


            {/* SELECTED SEATS */}

            <div className="payment-seat-heading">

              <span>
                Selected Seats
              </span>

              <strong>
                {selectedSeats.length}
              </strong>

            </div>


            <div className="payment-seat-list">

              {selectedSeats.map((seat) => (

                <div
                  className="payment-seat-row"
                  key={seat.id}
                >

                  <span>
                    {seat.seatNumber}
                  </span>

                  <strong>

                    ₹
                    {Number(
                      seat.price ||
                      (
                        Number(
                          event?.basePrice || 0
                        ) *
                        Number(
                          seat.priceMultiplier || 1
                        )
                      )
                    ).toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2
                      }
                    )}

                  </strong>

                </div>

              ))}

            </div>


            <div className="payment-divider" />


            {/* PRICE */}

            <div className="payment-price-row">

              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {Number(subtotal).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2
                  }
                )}
              </strong>

            </div>


            {discount > 0 && (

              <div className="payment-price-row discount">

                <span>
                  Discount
                  {couponCode
                    ? ` (${couponCode})`
                    : ""}
                </span>

                <strong>
                  -₹
                  {Number(discount).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2
                    }
                  )}
                </strong>

              </div>

            )}


            <div className="payment-price-row">

              <span>
                Taxes
              </span>

              <strong>
                ₹
                {Number(tax).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2
                  }
                )}
              </strong>

            </div>


            <div className="payment-divider" />


            {/* TOTAL */}

            <div className="payment-total">

              <span>
                Total Payable
              </span>

              <strong>
                ₹
                {Number(total).toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2
                  }
                )}
              </strong>

            </div>


            {/* =================================================
                PAY
            ================================================== */}

            <button
              className="payment-button"
              onClick={handlePayment}
              disabled={processing}
            >

              {processing ? (

                <>
                  Processing Payment...
                </>

              ) : (

                <>
                  Pay ₹
                  {Number(total).toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2
                    }
                  )}
                </>

              )}

            </button>


            {/* BACK */}

            <button
              className="payment-back-button"
              onClick={() => navigate(-1)}
              disabled={processing}
            >
              ← Back to Seats
            </button>

          </div>

        </aside>

      </div>

    </section>
  );
}