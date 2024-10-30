// Import the necessary functions from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyAdr-jk0yzWYR08L0q1SYFXEQVzuHl80QI",
  authDomain: "collaborative-whiteboard-f8024.firebaseapp.com",
  projectId: "collaborative-whiteboard-f8024",
  storageBucket: "collaborative-whiteboard-f8024.appspot.com", // fixed typo in storageBucket
  messagingSenderId: "620609934021",
  appId: "1:620609934021:web:a5bc27dacc8509fc03d6ac",
  measurementId: "G-X6CSY89RTB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Export the auth instance to use it in other files
export { auth };
