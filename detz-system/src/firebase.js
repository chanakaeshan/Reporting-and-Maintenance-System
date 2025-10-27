// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDttdncWLIkxeM64V1oYS9oPA3T6VR7WgI",
  authDomain: "reporting-and-maintenance.firebaseapp.com",
  databaseURL: "https://reporting-and-maintenance-default-rtdb.firebaseio.com",
  projectId: "reporting-and-maintenance",
  storageBucket: "reporting-and-maintenance.firebasestorage.app",
  messagingSenderId: "1024396446558",
  appId: "1:1024396446558:web:9dd621860e3f9d7e509dcf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
