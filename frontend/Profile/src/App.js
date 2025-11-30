import React, { useState } from "react";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import ProfilePage from "./ProfilePage";
import SettingsPage from "./SettingsPage";
import SecurityPage from "./SecurityPage";
import "./App.css";

export default function App() {
  const [screen, setScreen] = useState("profile");
  const [tab, setTab] = useState("uploaded");
  return (
    <div className="app-root">
      <TopNav />
      <main className="main-container">
        <div className="card-wrapper">
          <Sidebar active={screen} setScreen={setScreen} />
          <div className="content-area">
            {screen === "profile" && <ProfilePage tab={tab} setTab={setTab} />}
            {screen === "settings" && <SettingsPage />}
            {screen === "security" && <SecurityPage />}
          </div>
        </div>
      </main>
    </div>
  );
}
