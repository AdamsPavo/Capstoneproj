import { messaging } from "../firebase";
import { getToken, onMessage } from "firebase/messaging";

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return null;
    }

    console.log("Notification permission granted.");

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: "BKDwoVmLYf1nllotKWz0O5gwhtMWew9iC-Yyan4AvwHkFfoZZTPixkA5dvTetPWL_WtKZwlCcvpzyIEIFGwngTM",
    });

    if (token) {
      console.log("FCM Token:", token);
      return token; // Send this to your backend
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Listen for incoming messages
const onMessageListener = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("Message received:", payload);
    if (callback) {
      callback(payload);
    }
  });
};

export { requestNotificationPermission, onMessageListener };
