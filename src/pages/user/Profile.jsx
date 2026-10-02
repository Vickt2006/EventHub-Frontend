import React, { useEffect, useState } from "react";

import { api } from "../../services/api";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setMessage("");

      const data = await api("/api/me/profile");

      setProfile(data);
    } catch (error) {
      setMessage(error.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      await api("/api/me/profile", {
        method: "PATCH",
        body: {
          name: profile.name,
          phone: profile.phone,
          city: profile.city,
          profileImageUrl: profile.profileImageUrl
        }
      });

      setMessage("Profile updated successfully.");

      await loadProfile();
    } catch (error) {
      setMessage(error.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials =
    profile.name
      ?.trim()
      ?.split(" ")
      ?.map((word) => word[0])
      ?.slice(0, 2)
      ?.join("")
      ?.toUpperCase() || "EH";

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner"></div>
          <h3>Loading profile</h3>
          <p>Getting your EventHub profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">

      {/* BACKGROUND */}

      <div className="profile-orb profile-orb-one"></div>
      <div className="profile-orb profile-orb-two"></div>

      {/* HEADER */}

      <header className="profile-header">

        <div>
          <div className="profile-eyebrow">
            <span></span>
            ACCOUNT CENTER
          </div>

          <h1>
            My <span>Profile</span>
          </h1>

          <p>
            Manage your EventHub account and personal information.
          </p>
        </div>

        <div className="profile-member-chip">
          <span className="profile-online-dot"></span>
          Account Active
        </div>

      </header>


      {/* MESSAGE */}

      {message && (
        <div
          className={
            message.includes("successfully")
              ? "profile-message profile-message-success"
              : "profile-message profile-message-error"
          }
        >
          <span>
            {message.includes("successfully") ? "✓" : "!"}
          </span>

          <strong>{message}</strong>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            ×
          </button>
        </div>
      )}


      {/* MAIN GRID */}

      <section className="profile-layout">

        {/* IDENTITY CARD */}

        <aside className="profile-identity-card">

          <div className="profile-avatar-wrap">

            <div className="profile-avatar">

              {profile.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}

            </div>

            <div className="profile-avatar-status"></div>

          </div>


          <h2>
            {profile.name || "EventHub User"}
          </h2>

          <p className="profile-email">
            {profile.email || "No email"}
          </p>


          <div className="profile-role">
            <span>●</span>
            {profile.role || "USER"}
          </div>


          <div className="profile-divider"></div>


          <div className="profile-mini-info">

            <div>
              <span>📍</span>
              <div>
                <small>LOCATION</small>
                <strong>
                  {profile.city || "Not set"}
                </strong>
              </div>
            </div>

            <div>
              <span>📱</span>
              <div>
                <small>PHONE</small>
                <strong>
                  {profile.phone || "Not set"}
                </strong>
              </div>
            </div>

          </div>


          <div className="profile-member-box">

            <div className="profile-member-icon">
              ✦
            </div>

            <div>
              <strong>EventHub Member</strong>
              <span>
                Your account is ready for events.
              </span>
            </div>

          </div>

        </aside>


        {/* FORM */}

        <section className="profile-form-card">

          <div className="profile-form-header">

            <div>
              <span className="profile-section-label">
                PERSONAL INFORMATION
              </span>

              <h2>Account Details</h2>

              <p>
                Update the information associated with your account.
              </p>
            </div>

            <div className="profile-edit-icon">
              ✎
            </div>

          </div>


          <form
            className="profile-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="profile-field">

              <label htmlFor="profile-name">
                Full Name
              </label>

              <div className="profile-input-wrap">

                <span>👤</span>

                <input
                  id="profile-name"
                  type="text"
                  value={profile.name || ""}
                  onChange={(event) =>
                    update("name", event.target.value)
                  }
                  placeholder="Enter your full name"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div className="profile-field">

              <label htmlFor="profile-email">
                Email Address
              </label>

              <div className="profile-input-wrap profile-input-disabled">

                <span>✉</span>

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email || ""}
                  disabled
                />

                <b>✓</b>

              </div>

              <small className="profile-field-note">
                Email address cannot be changed.
              </small>

            </div>


            {/* PHONE + CITY */}

            <div className="profile-two-columns">

              <div className="profile-field">

                <label htmlFor="profile-phone">
                  Phone Number
                </label>

                <div className="profile-input-wrap">

                  <span>📱</span>

                  <input
                    id="profile-phone"
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(event) =>
                      update("phone", event.target.value)
                    }
                    placeholder="Enter phone number"
                  />

                </div>

              </div>


              <div className="profile-field">

                <label htmlFor="profile-city">
                  City
                </label>

                <div className="profile-input-wrap">

                  <span>📍</span>

                  <input
                    id="profile-city"
                    type="text"
                    value={profile.city || ""}
                    onChange={(event) =>
                      update("city", event.target.value)
                    }
                    placeholder="Enter your city"
                  />

                </div>

              </div>

            </div>


            {/* IMAGE URL */}

            <div className="profile-field">

              <label htmlFor="profile-image">
                Profile Image URL
              </label>

              <div className="profile-input-wrap">

                <span>🖼</span>

                <input
                  id="profile-image"
                  type="url"
                  value={profile.profileImageUrl || ""}
                  onChange={(event) =>
                    update(
                      "profileImageUrl",
                      event.target.value
                    )
                  }
                  placeholder="https://example.com/profile.jpg"
                />

              </div>

              <small className="profile-field-note">
                Add a public image URL if you want to use a profile picture.
              </small>

            </div>


            {/* SAVE */}

            <div className="profile-form-footer">

              <span className="profile-save-note">
                🔒 Your information is securely stored.
              </span>

              <button
                className="profile-save-button"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="profile-button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    Save Changes
                    <span>→</span>
                  </>
                )}
              </button>

            </div>

          </form>

        </section>

      </section>

    </main>
  );
}