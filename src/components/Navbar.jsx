import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { getRole, getToken, logout } from "../utils/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const role = getRole();
  const loggedIn = Boolean(getToken());

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        Event<span>Hub</span>
      </Link>

      <nav className="nav-links">
        <Link to="/">Events</Link>

        {role === "USER" && (
          <>
            <Link to="/my-bookings">My Bookings</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {role === "ORGANIZER" && (
          <Link to="/organizer">Organizer</Link>
        )}

        {role === "ADMIN" && (
          <Link to="/admin">Admin</Link>
        )}

        {loggedIn ? (
          <button className="nav-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}