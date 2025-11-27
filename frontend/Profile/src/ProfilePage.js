import React from "react";
import "./App.css";

// Use your actual filenames in public/
const sampleBooks = [
  {
    id: 1,
    img: "/let_them_theory.jpg",
    title: "THE LET THEM THEORY",
    by: "By Mel Robbins",
    langFrom: "English",
    langTo: "Spanish"
  },
  {
    id: 2,
    img: "/emperor_of_gladness.jpg",
    title: "THE EMPEROR OF GLADNESS",
    by: "By Ocean Vuong",
    langFrom: "English",
    langTo: "French"
  },
  {
    id: 3,
    img: "/let_them_theory.jpg",
    title: "THE LET THEM THEORY",
    by: "By Mel Robbins",
    langFrom: "English",
    langTo: "Spanish"
  },
  {
    id: 4,
    img: "/emperor_of_gladness.jpg",
    title: "THE EMPEROR OF MALADIES",
    by: "By Ocean Vuong",
    langFrom: "German",
    langTo: "English"
  }
];

export default function ProfilePage({ tab, setTab }) {
  return (
    <div className="profile-row">
      <div className="profile-info-card">
        <img
          className="profile-avatar"
          src="/profile.jpg"
          alt="profile"
        />
        <div className="profile-name">Isabella ross</div>
        <div className="profile-bio">
          Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows.
        </div>
      </div>
      <div className="profile-books-main">
        <div className="profile-tabs">
          <button className={tab === "uploaded" ? "tab active" : "tab"} onClick={() => setTab("uploaded")}>Uploaded books</button>
          <button className={tab === "translated" ? "tab active" : "tab"} onClick={() => setTab("translated")}>Translated books</button>
          <button className={tab === "favorite" ? "tab active" : "tab"} onClick={() => setTab("favorite")}>Favorite books</button>
        </div>
        <div className="book-grid">
          {sampleBooks.map((b, i) => (
            <div key={i} className="book-card">
              <img className="book-img" src={b.img} alt={b.title} />
              <div className="book-title">{b.title}</div>
              <div className="book-author">{b.by}</div>
              <div className="book-meta">
                {b.langFrom} <span style={{fontSize: "110%"}}>→</span> {b.langTo}
              </div>
              <button className="book-btn">Read more</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
