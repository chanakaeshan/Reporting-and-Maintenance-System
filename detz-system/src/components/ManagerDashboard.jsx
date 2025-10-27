import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase";
import { ref, onValue, off, update } from "firebase/database";

const formatDT = (ts) => {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
};

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="8" r="1" fill="currentColor"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default function ManagerDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending"); 
  const [techs, setTechs] = useState([]);
  const [assignModal, setAssignModal] = useState({ open: false, reportId: null, techUid: "" });

  useEffect(() => {
    const rRef = ref(db, "breakdowns");
    const h = onValue(rRef, snapshot => {
      const data = snapshot.val() || {};
      const arr = Object.entries(data)
        .map(([id, v]) => ({ id, ...v }))
        .sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      setReports(arr);
      setLoading(false);
    });
    return () => off(rRef, "value", h);
  }, []);

  useEffect(() => {
    const uRef = ref(db, "users");
    const h = onValue(uRef, snap => {
      const data = snap.val() || {};
      const arr = Object.entries(data)
        .map(([uid, u]) => ({ uid, ...(u || {}) }))
        .filter(u => (u.role || "").toLowerCase() === "technician");
      setTechs(arr);
    });
    return () => off(uRef, "value", h);
  }, []);

  const approve = async (id) => {
    await update(ref(db, `breakdowns/${id}`), { status: "approved", updatedAt: Date.now() });
  };
  const reject = async (id) => {
    await update(ref(db, `breakdowns/${id}`), { status: "rejected", updatedAt: Date.now() });
  };
  const assign = async (id, techUid) => {
    await update(ref(db, `breakdowns/${id}`), { assignedTechnician: techUid, status: "assigned", updatedAt: Date.now() });
  };
  const markComplete = async (id) => {
    await update(ref(db, `breakdowns/${id}`), { status: "completed", updatedAt: Date.now() });
  };

  const counts = useMemo(() => {
    const c = { pending: 0, active: 0, completed: 0, rejected: 0 };
    for (const r of reports) {
      const s = (r.status || "").toLowerCase();
      if (s === "pending") c.pending++;
      else if (s === "rejected") c.rejected++;
      else if (s === "completed" || s === "resolved") c.completed++;
      else c.active++;
    }
    return c;
  }, [reports]);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      const s = (r.status || "").toLowerCase();
      if (tab === "pending") return s === "pending";
      if (tab === "history") return s === "completed" || s === "resolved" || s === "rejected";

      return !(s === "completed" || s === "resolved" || s === "rejected");
    });
  }, [reports, tab]);

  const SeverityChip = ({ level }) => {
    const label = (level || "").toLowerCase();
    return <span className={`chip ${label}`}>{label || "n/a"}</span>;
  };
  const StatusChip = ({ status }) => {
    const s = (status || "").toLowerCase();
    return <span className={`chip outline ${s}`}>{s || "pending"}</span>;
  };

  const userName = (auth.currentUser && (auth.currentUser.displayName || auth.currentUser.email)) || "";

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-bar">
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <span className="back-btn"><BackIcon /></span>
            <div>
              <div className="dash-title">Maintenance Manager</div>
              <div className="dash-subtitle">{userName}</div>
            </div>
          </div>

        </div>
      </div>


      <div className="dash-content">
        <div className="stats">
          <div className="stat-card">
            <div>
              <div className="dash-subtitle">Pending</div>
              <div className="dash-title">{counts.pending}</div>
            </div>
            <div className="badge yellow"><ClockIcon /></div>
          </div>
          <div className="stat-card">
            <div>
              <div className="dash-subtitle">Active</div>
              <div className="dash-title">{counts.active}</div>
            </div>
            <div className="badge blue"><InfoIcon /></div>
          </div>
          <div className="stat-card">
            <div>
              <div className="dash-subtitle">Completed</div>
              <div className="dash-title">{counts.completed}</div>
            </div>
            <div className="badge green"><CheckIcon /></div>
          </div>
          <div className="stat-card">
            <div>
              <div className="dash-subtitle">Rejected</div>
              <div className="dash-title">{counts.rejected}</div>
            </div>
            <div className="badge red"><XIcon /></div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>Pending ({counts.pending})</button>
          <button className={`tab ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active ({counts.active})</button>
          <button className={`tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>History ({counts.completed + counts.rejected})</button>
        </div>

        {loading ? (
          <div className="panel">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="panel">{tab === "pending" ? "No pending reports" : tab === "active" ? "No active reports" : "No history yet"}</div>
        ) : (
          <div>
            {filtered.map(r => (
              <div key={r.id} className="report-card">
                <div className="report-chips">
                  <SeverityChip level={r.severity} />
                  <StatusChip status={r.status} />
                </div>
                <div className="report-title">{r.title || r.message}</div>
                {(r.location || r.reporterName) && (
                  <div className="report-location">
                    {r.location ? r.location : ""}
                    {r.location && r.reporterName ? " • " : ""}
                    {r.reporterName ? `Reported by ${r.reporterName}` : ""}
                  </div>
                )}
                {(r.description || r.message) && <div className="report-desc">{r.description || r.message}</div>}

                <div className="report-meta">
                  <div className="report-assigned">
                    <span className="muted">Assigned to:</span>
                    <span> {r.assignedTechnician || "—"}</span>
                  </div>
                  <div className="report-time">
                    <div className="muted">Submitted: {formatDT(r.createdAt)}</div>
                    <div className="muted">Updated: {formatDT(r.updatedAt)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
                  {tab === "pending" && (
                    <>
                      <button className="btn primary" onClick={() => approve(r.id)}>Approve</button>
                      <button className="btn" onClick={() => reject(r.id)}>Reject</button>
                    </>
                  )}
                  {tab !== "history" && (
                    <button className="btn" onClick={() => setAssignModal({ open: true, reportId: r.id, techUid: r.assignedTechnician || "" })}>
                      Assign Technician
                    </button>
                  )}
                  {tab === "active" && (
                    <button className="btn" onClick={() => markComplete(r.id)}>Mark Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {assignModal.open && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-container">
            <div className="modal">
              <div className="modal-header">
                <h3>Assign Technician</h3>
                <button className="icon-btn" onClick={() => setAssignModal({ open: false, reportId: null, techUid: "" })} aria-label="Close">×</button>
              </div>
              <div className="modal-body">
                <label className="field">
                  <span>Technician</span>
                  <select className="input" value={assignModal.techUid} onChange={e => setAssignModal(m => ({ ...m, techUid: e.target.value }))}>
                    <option value="">Select a technician</option>
                    {techs.map(t => (
                      <option key={t.uid} value={t.uid}>{t.displayName || t.email || t.uid}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setAssignModal({ open: false, reportId: null, techUid: "" })}>Cancel</button>
                <button className="btn primary" disabled={!assignModal.techUid} onClick={async () => {
                  if (!assignModal.reportId || !assignModal.techUid) return;
                  await assign(assignModal.reportId, assignModal.techUid);
                  setAssignModal({ open: false, reportId: null, techUid: "" });
                }}>Assign</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
