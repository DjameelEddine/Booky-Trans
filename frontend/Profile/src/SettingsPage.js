import React, { useState } from "react";
import "./App.css";

export default function SettingsPage() {
  const [tab, setTab] = useState("account");

  // Editable state fields
  const [username, setUsername] = useState("Isabela joss");
  const [email, setEmail] = useState("eg: isabela.joss@gmail.com");
  const [bio, setBio] = useState("A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows.");
  const [currentPassword, setCurrentPassword] = useState("Isabela 2025");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handlers for Save buttons (replace with your API as needed)
  function handleSaveAccount() {
    alert("Account changes saved! (Demo)");
  }
  function handleSaveSecurity() {
    alert("Password updated! (Demo)");
  }

  return (
    <div className="settings-main-layout">
      <div className="settings-tabs">
        <span className={tab === "account" ? "settings-tab active" : "settings-tab"} onClick={() => setTab("account")}>Account</span>
        <span className={tab === "security" ? "settings-tab active" : "settings-tab"} onClick={() => setTab("security")}>Security</span>
      </div>
      {tab === "account" && (
        <div className="settings-card">
          <div className="settings-row-2col">
            <div>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-row">
            <label>Biography</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>
          <div className="settings-avatar-row">
            <img className="settings-avatar" src="/profile.jpg" alt="profile" />
            <span style={{ marginLeft: 10 }}>
              Change picture <span style={{ fontSize: "12px", color: "#9AA8BE" }}>JPG, .JIF or PNG</span>
            </span>
          </div>
          <div className="settings-actions">
            <button className="cancel-btn" type="button">Cancel</button>
            <button className="save-btn" type="button" onClick={handleSaveAccount}>Save changes</button>
          </div>
        </div>
      )}
      {tab === "security" && (
        <div className="settings-card">
          <div className="settings-row-2col">
            <div>
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-row-2col">
            <div>
              <label>New password</label>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Confirm new password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="settings-actions">
            <button className="cancel-btn" type="button">Cancel</button>
            <button className="save-btn" type="button" onClick={handleSaveSecurity}>Save changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
