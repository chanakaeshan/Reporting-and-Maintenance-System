import React from "react";
import Auth from "../components/Auth";
import TechnicianDashboard from "../components/TechnicianDashboard";

export default function TechnicianApp() {
  return (
    <Auth>
      <TechnicianDashboard />
    </Auth>
  );
}
