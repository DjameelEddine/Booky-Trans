import React from "react";
import { FaUser, FaCog, FaPowerOff } from "react-icons/fa";
import "./App.css";

export default function Sidebar({ active, setScreen }) {
  return (
    <aside className="sidebar">
      <div className={`side-item ${active === "profile" ? "active" : ""}`}
           onClick={() => setScreen("profile")}>
        <FaUser className="side-icon" />
        <span>Profile</span>
      </div>
      <div className={`side-item ${active === "settings" ? "active" : ""}`}
           onClick={() => setScreen("settings")}>
        <FaCog className="side-icon" />
        <span>Settings</span>
      </div>
      <div className="side-item logout">
        <FaPowerOff className="side-icon" />
        <span>Log out</span>
      </div>
    </aside>
  );
}
