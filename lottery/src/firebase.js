import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
// You'll need to replace this with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAs4M82Uz2S4cLlu3wdogs_HESGah6xY_g",
  authDomain: "lottery-12tej.firebaseapp.com",
  projectId: "lottery-12tej",
  storageBucket: "lottery-12tej.firebasestorage.app",
  messagingSenderId: "1045524857659",
  appId: "1:1045524857659:web:80775943d678dc976aed1e",
  measurementId: "G-3KN5NJQJKJ",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
