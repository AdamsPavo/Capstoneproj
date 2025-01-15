// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { getFirestore } from "firebase/firestore"; // Import Firestore (if needed)
import { getStorage } from "firebase/storage"; // Import Storage (if needed)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3EHQGvc86zoIGKBtU7Og8qgLRoC60B0w",
  authDomain: "capstoneproj-4ddf1.firebaseapp.com",
  projectId: "capstoneproj-4ddf1",
  storageBucket: "capstoneproj-4ddf1.appspot.com",
  messagingSenderId: "563570178465",
  appId: "1:563570178465:web:686724c790b8b6b3a633e0",
  measurementId: "G-G99N7C111T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database
const storage = getStorage(app); // Firebase Storage

// Export the services to use them in other files
export { app, auth, db, storage };
