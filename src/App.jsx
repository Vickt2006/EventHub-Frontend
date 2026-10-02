import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import Payment from "./pages/Payment";
import BookingConfirmation from "./pages/BookingConfirmation";

import MyBookings from "./pages/user/MyBookings";
import Profile from "./pages/user/Profile";

import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function AppLayout() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <>
      {!isAuthPage && <Navbar />}

      <main
        className={
          isAuthPage
            ? "auth-layout"
            : "container"
        }
      >
        <Routes>

          {/* =========================
              HOME
          ========================== */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* =========================
              AUTH
          ========================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* =========================
              EVENT DETAILS
          ========================== */}

          <Route
            path="/events/:id"
            element={<EventDetails />}
          />


          {/* =========================
              PAYMENT
          ========================== */}

          <Route
            path="/payment"
            element={
              <ProtectedRoute role="USER">
                <Payment />
              </ProtectedRoute>
            }
          />


          {/* =========================
              BOOKING CONFIRMATION
          ========================== */}

          <Route
            path="/booking-confirmation"
            element={
              <ProtectedRoute role="USER">
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />


          {/* =========================
              MY BOOKINGS
          ========================== */}

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute role="USER">
                <MyBookings />
              </ProtectedRoute>
            }
          />


          {/* =========================
              PROFILE
          ========================== */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />


          {/* =========================
              ORGANIZER
          ========================== */}

          <Route
            path="/organizer"
            element={
              <ProtectedRoute role="ORGANIZER">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />


          {/* =========================
              ADMIN
          ========================== */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* =========================
              UNKNOWN ROUTE
          ========================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return <AppLayout />;
}