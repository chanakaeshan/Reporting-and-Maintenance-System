import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { ref, onValue, off, query, orderByChild } from "firebase/database";

function formatDT(ts) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
}

function SeverityChip({ level }) {
  const label = (level || "").toLowerCase();
  return <span className={`chip ${label}`}>{label || "n/a"}</span>;
}
function StatusChip({ status }) {
  const s = (status || "").toLowerCase();
  return <span className={`chip outline ${s}`}>{s || "pending"}</span>;
}

function ReportItem({ r }) {
  return (
    <div className="report-card">
      <div className="report-row">
        <div className="report-chips">
          <SeverityChip level={r.severity} />
          <StatusChip status={r.status} />
        </div>
      </div>
      <div className="report-title">{r.title || r.message}</div>
      {r.location && <div className="report-location">{r.location}</div>}
      <div className="report-desc">{r.description || r.message}</div>

      <div className="report-meta">
        <div className="report-assigned">
          {(r.status || "").toLowerCase() === "completed" && r.fixDetails ? (
            <>
              <span className="muted">Completed by:</span>
              <span> {r.assignedTechnician || "Technician"}</span>
            </>
          ) : (
            <>
              <span className="muted">Assigned to:</span>
              <span> {r.assignedTechnician || "—"}</span>
            </>
          )}
        </div>
        <div className="report-time">
          <div className="muted">Submitted: {formatDT(r.createdAt)}</div>
          <div className="muted">Updated: {formatDT(r.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReportList({ filter = "active" }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const q = query(ref(db, "breakdowns"), orderByChild("createdAt"));
    const handler = onValue(q, snapshot => {
      const data = snapshot.val() || {};
      const arr = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .filter(r => r.reporterUid === (auth.currentUser && auth.currentUser.uid))
        .sort((a,b) => b.createdAt - a.createdAt);
      setReports(arr);
    });
    return () => off(q, "value", handler);
  }, []);

  const filtered = reports.filter(r => {
    const isDone = (r.status || "").toLowerCase() === "completed";
    return filter === "history" ? isDone : !isDone;
  });

  if (filtered.length === 0) {
    return <div className="panel">No reports here.</div>;
  }

  return (
    <div>
      {filtered.map(r => <ReportItem key={r.id} r={r} />)}
    </div>
  );
}
