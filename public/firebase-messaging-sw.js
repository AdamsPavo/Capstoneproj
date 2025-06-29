importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

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
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // Replace with your notification icon
  });
});