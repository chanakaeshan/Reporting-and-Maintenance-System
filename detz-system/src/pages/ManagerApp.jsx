import React from "react";
import Auth from "../components/Auth";
import ManagerDashboard from "../components/ManagerDashboard";

export default function ManagerApp() {
  return (
    <Auth>
      <ManagerDashboard />
    </Auth>
  );
}
