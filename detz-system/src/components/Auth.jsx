// src/components/Auth.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function Auth({ children }) {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  const signup = async () => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await set(ref(db, `users/${cred.user.uid}`), {
      displayName,
      email,
      role: "reporter"
    });
  };

  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">{mode === "login" ? "Sign in" : "Create account"}</h2>

          {mode === "signup" && (
            <input className="input mb-2 w-full p-2 border rounded" placeholder="Full name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          )}
          <input className="input mb-2 w-full p-2 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input mb-4 w-full p-2 border rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

          <div className="flex items-center justify-between">
            <button onClick={mode === "login" ? login : signup} className="px-4 py-2 bg-blue-600 text-white rounded">
              {mode === "login" ? "Sign in" : "Create"}
            </button>
            <button className="text-sm text-slate-600" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
              {mode === "login" ? "Create account" : "Have an account?"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <div>
          <strong>{user.displayName || user.email}</strong>
          <div className="text-sm text-slate-500">{user.email}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={logout} className="px-3 py-1 border rounded">Sign out</button>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
