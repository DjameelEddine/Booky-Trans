import React from "react";
import { FaRegUserCircle } from "react-icons/fa";
import "./App.css";

export default function TopNav() {
  return (
    <header className="topnav">
   
       <div className="brand-nav" style={{display: 'flex', alignItems: 'center', gap: 10}}>
  <img src="/logo.png" alt="Logo" style={{height: 65}} />
  

        <span className="brand-text">BookyTrans</span>
      </div>

      <nav className="top-links">
        <span>Community</span>
        <span>How It Works</span>
        <span>Contact Us</span>
      </nav>

      <div className="topnav-right">
        <button className="upload-btn">Upload a book</button>
        <FaRegUserCircle className="user-icon" />
      </div>
      
    </header>
  );
}
