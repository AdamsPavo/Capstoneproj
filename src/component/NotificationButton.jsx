import React, { useEffect, useState } from "react";
import { generateToken } from "../firebase";

const NotificationButton = () => {
  const [fcmToken, setFcmToken] = useState("");

  useEffect(() => {
    const getToken = async () => {
      const token = await generateToken();
      if (token) {
        setFcmToken(token);
      }
    };
    getToken();
  }, []);

  return (
    <div>
      <button
        onClick={() => generateToken()}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Enable Notifications
      </button>

      {fcmToken && <p>FCM Token: {fcmToken}</p>}
    </div>
  );
};

export default NotificationButton;