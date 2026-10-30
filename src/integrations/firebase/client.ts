// src/integrations/firebase/client.ts
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics"; // removed for SSR compatibility
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration (replace with your own values if needed)
const firebaseConfig = {
  apiKey: "AIzaSyA-Y8VLwDoMAe1DtO0LTZPiBY_lANhqxrs",
  authDomain: "basirah-infinity.firebaseapp.com",
  projectId: "basirah-infinity",
  storageBucket: "basirah-infinity.firebasestorage.app",
  messagingSenderId: "668605081414",
  appId: "1:668605081414:web:299453d4df8225e74f6747",
  measurementId: "G-CQE00P1MXM",
};


// Initialize Firebase app
export const firebaseApp = initializeApp(firebaseConfig);
// Initialize services
// export const analytics = getAnalytics(firebaseApp); // removed for SSR compatibility
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
