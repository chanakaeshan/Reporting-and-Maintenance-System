/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ReporterApp from "./pages/ReporterApp";
import ManagerApp from "./pages/ManagerApp";
import "./index.css";

function Home() {
  return (
    <div className="home">
      <div className="home-container">
        <h1 className="home-title">Real-time Breakdown Reporting and
Maintenance System</h1>
        <p className="home-subtitle">Choose your application to get started</p>

        <div className="cards">
          <Link to="/reporter" className="card">
            <div className="icon blue" aria-hidden>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 2.6 20.4h18.8L12 3z" />
                <path d="M12 9v5" />
                <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <h3>Breakdown Reporter</h3>
            <p>Submit and track your breakdown reports</p>
          </Link>

          <Link to="/manager" className="card">
            <div className="icon green" aria-hidden>
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="5" y="4" width="14" height="16" rx="2" />
                <rect x="9" y="2" width="6" height="3" rx="1.5" />
                <path d="M9 8h6" />
              </svg>
            </div>
            <h3>Maintenance Manager</h3>
            <p>Manage and assign maintenance tasks</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reporter/*" element={<ReporterApp />} />
        <Route path="/manager/*" element={<ManagerApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
