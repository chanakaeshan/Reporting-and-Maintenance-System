import React, { useEffect, useMemo, useState } from "react";
import Auth from "../components/Auth";
import ReportForm from "../components/ReportForm";
import ReportList from "../components/ReportList";
import { auth, db } from "../firebase";
import { ref, onValue, off, query, orderByChild } from "firebase/database";
import { Link } from "react-router-dom";

export default function ReporterApp() {
  const [tab, setTab] = useState("active");
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ active: 0, history: 0 });

  useEffect(() => {
    const q = query(ref(db, "breakdowns"), orderByChild("createdAt"));
    const handler = onValue(q, snap => {
      const data = snap.val() || {};
      const me = auth.currentUser && auth.currentUser.uid;
      const mine = Object.values(data).filter(r => r.reporterUid === me);
      const history = mine.filter(r => (r.status || "").toLowerCase() === "completed").length;
      const active = mine.length - history;
      setCounts({ active, history });
    });
    return () => off(q, "value", handler);
  }, []);

  const userLabel = useMemo(() => (auth.currentUser?.displayName || auth.currentUser?.email || ""), []);

  return (
    <Auth>
      <div className="reporter">
        {/* Header */}
        <div className="rp-header">
          <div className="left">
            <Link to="/" className="back-btn" aria-label="Back">←</Link>
            <div>
              <div className="rp-title">Breakdown Reporter</div>
              {userLabel && <div className="rp-sub">{userLabel}</div>}
            </div>
          </div>
          <div className="right">
            <button className="btn primary" onClick={() => setOpen(true)}>+ New Report</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs rp-tabs">
          <button className={`tab ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>
            Active Reports ({counts.active})
          </button>
          <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
            History ({counts.history})
          </button>
        </div>

        {/* List */}
        <div className="rp-list">
          <ReportList filter={tab} />
        </div>

        {/* Modal */}
        {open && (
          <div className="modal-overlay" onClick={() => setOpen(false)}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
              <ReportForm onSubmitted={() => setOpen(false)} onCancel={() => setOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </Auth>
  );
}
