// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Firebase Auth
import { getFirestore } from "firebase/firestore"; // Firestore
import { getStorage } from "firebase/storage"; // Storage
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getDatabase } from "firebase/database"; // ✅ Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3EHQGvc86zoIGKBtU7Og8qgLRoC60B0w",
  authDomain: "capstoneproj-4ddf1.firebaseapp.com",
  projectId: "capstoneproj-4ddf1",
  storageBucket: "capstoneproj-4ddf1.appspot.com",
  messagingSenderId: "563570178465",
  appId: "1:563570178465:web:686724c790b8b6b3a633e0",
  measurementId: "G-G99N7C111T",
  databaseURL: "https://capstoneproj-4ddf1-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ Add this
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database
const realtimeDb = getDatabase(app); // ✅ Realtime Database
const storage = getStorage(app); // Firebase Storage
const messaging = getMessaging(app);

// FCM token generation
export const generateToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BKDwoVmLYf1nllotKWz0O5gwhtMWew9iC-Yyan4AvwHkFfoZZTPixkA5dvTetPWL_WtKZwlCcvpzyIEIFGwngTM",
      });
      if (token) {
        console.log("FCM Token:", token);
        return token;
      } else {
        console.log("No registration token available.");
      }
    } else {
      console.log("Permission denied for notifications.");
    }
  } catch (error) {
    console.error("Error generating FCM token:", error);
  }
};

// Listener for incoming messages
onMessage(messaging, (payload) => {
  console.log("Message received: ", payload);
  alert(`New Notification: ${payload.notification.title}`);
});

// Export the services
export { app, auth, db, storage, realtimeDb };
