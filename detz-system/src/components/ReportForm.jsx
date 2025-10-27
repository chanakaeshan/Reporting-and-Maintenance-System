import React, { useState } from "react";
import { auth, db } from "../firebase";
import { ref, push, set } from "firebase/database";

export default function ReportForm({ onSubmitted, onCancel }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !description.trim()) return;
    setSubmitting(true);
    const now = Date.now();
    const newRef = push(ref(db, "breakdowns"));
    await set(newRef, {
      reporterUid: auth.currentUser.uid,
      reporterName: auth.currentUser.displayName || auth.currentUser.email,
      title: title.trim(),
      location: location.trim(),
      severity,
      description: description.trim(),
      status: "in-progress", 
      assignedTechnician: null,
      fixDetails: null,
      createdAt: now,
      updatedAt: now
    });
    setSubmitting(false);
    setTitle("");
    setLocation("");
    setSeverity("medium");
    setDescription("");
    if (onSubmitted) onSubmitted();
  };

  return (
    <div className="modal">
      <div className="modal-header">
        <h3>Submit New Breakdown Report</h3>
        <button className="icon-btn" onClick={onCancel} aria-label="Close">×</button>
      </div>
      <form onSubmit={submit} className="modal-body">
        <label className="field">
          <span>Title *</span>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" />
        </label>
        <label className="field">
          <span>Location *</span>
          <input className="input" value={location} onChange={e => setLocation(e.target.value)} placeholder="Building, Floor, Room number" />
        </label>
        <label className="field">
          <span>Severity *</span>
          <select className="input" value={severity} onChange={e => setSeverity(e.target.value)}>
            <option value="low">Low - Minor impact</option>
            <option value="medium">Medium - Affects productivity</option>
            <option value="high">High - Urgent attention</option>
          </select>
        </label>
        <label className="field">
          <span>Description *</span>
          <textarea className="input" rows="4" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed description of the problem" />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Report"}</button>
        </div>
      </form>
    </div>
  );
}
