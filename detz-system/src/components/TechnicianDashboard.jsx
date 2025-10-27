import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase";
import { ref, onValue, off, update } from "firebase/database";

const formatDT = (ts) => {
  if (!ts) return "";
  try { return new Date(ts).toLocaleString(); } catch { return ""; }
};

export default function TechnicianDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressModal, setProgressModal] = useState({ open: false, reportId: null, notes: "" });

  useEffect(() => {
    const rRef = ref(db, "breakdowns");
    const h = onValue(rRef, snap => {
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v })).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
      setReports(arr);
      setLoading(false);
    });
    return () => off(rRef, "value", h);
  }, []);

  const myUid = auth.currentUser && auth.currentUser.uid;

  // Only reports assigned to this technician
  const assigned = useMemo(() => {
    if (!myUid) return [];
    return reports.filter(r => (r.assignedTechnician || "") === myUid).sort((a,b) => (b.createdAt||0)-(a.createdAt||0));
  }, [reports, myUid]);

  const setProgress = async (id, notes) => {
    await update(ref(db, `breakdowns/${id}`), { status: "in-progress", progressNotes: notes || null, updatedAt: Date.now() });
  };

  const markComplete = async (id, details) => {
    await update(ref(db, `breakdowns/${id}`), { status: "completed", fixDetails: details || null, updatedAt: Date.now() });
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="dash-bar">
          <div style={{ display: "flex", alignItems: "center", gap: ".75rem" }}>
            <div className="back-btn">◀</div>
            <div>
              <div className="dash-title">Technician Console</div>
              <div className="dash-subtitle">{(auth.currentUser && (auth.currentUser.displayName || auth.currentUser.email)) || "Technician"}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dash-content">
        {loading ? (
          <div className="panel">Loading assigned tasks…</div>
        ) : assigned.length === 0 ? (
          <div className="panel">You have no assigned reports.</div>
        ) : (
          <div>
            {assigned.map(r => (
              <div key={r.id} className="report-card">
                <div style={{ display: "flex", gap: ".5rem", marginBottom: ".5rem" }}>
                  <span className={`chip ${r.severity || "medium"}`}>{(r.severity || "").toLowerCase()}</span>
                  <span className={`chip outline ${r.status || "in-progress"}`}>{(r.status || "").toLowerCase()}</span>
                </div>

                <div className="report-title">{r.title || r.message}</div>
                {r.location && <div className="report-location">{r.location}</div>}
                {r.description && <div className="report-desc">{r.description}</div>}

                {r.progressNotes && (
                  <div style={{ marginTop: ".75rem", padding: ".75rem", borderRadius: ".5rem", background: "#f8fafc" }}>
                    <strong>Progress:</strong>
                    <div style={{ marginTop: ".35rem" }}>{r.progressNotes}</div>
                  </div>
                )}

                <div className="report-meta">
                  <div className="report-assigned"><span className="muted">Reported by:</span> {r.reporterName || "—"}</div>
                  <div className="report-time"><div className="muted">Submitted: {formatDT(r.createdAt)}</div></div>
                </div>

                <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem" }}>
                  <button className="btn" onClick={() => setProgressModal({ open: true, reportId: r.id, notes: r.progressNotes || "" })}>Update Progress</button>
                  <button className="btn primary" onClick={() => {
                    const d = prompt("Enter completion notes (optional):");
                    markComplete(r.id, d || "");
                  }}>Mark Complete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {progressModal.open && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal">
              <div className="modal-header">
                <h3>Update Progress</h3>
                <button className="icon-btn" onClick={() => setProgressModal({ open: false, reportId: null, notes: "" })}>×</button>
              </div>
              <div className="modal-body">
                <label className="field">
                  <span>Notes</span>
                  <textarea className="input" rows="4" value={progressModal.notes} onChange={e => setProgressModal(m => ({ ...m, notes: e.target.value }))} />
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setProgressModal({ open: false, reportId: null, notes: "" })}>Cancel</button>
                <button className="btn primary" onClick={async () => {
                  if (!progressModal.reportId) return;
                  await setProgress(progressModal.reportId, progressModal.notes);
                  setProgressModal({ open: false, reportId: null, notes: "" });
                }}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
