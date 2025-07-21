import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { db, auth } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  updateDoc, // ✅ added
} from "firebase/firestore";

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const weatherRef = collection(db, "users", user.uid, "weatherUpdates");
    const systemRef = collection(db, "users", user.uid, "notifications");

    const unsubWeather = onSnapshot(weatherRef, async (weatherSnap) => {
      const weather = weatherSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "weather",
      }));

      // ✅ Mark unseen weather notifications as seen
      const unseenWeather = weatherSnap.docs.filter(doc => !doc.data().seen);
      unseenWeather.forEach((docSnap) => {
        const docRef = doc(db, "users", user.uid, "weatherUpdates", docSnap.id);
        updateDoc(docRef, { seen: true });
      });

      const unsubSystem = onSnapshot(systemRef, async (systemSnap) => {
        const system = systemSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "system",
        }));

        // ✅ Mark unseen system notifications as seen
        const unseenSystem = systemSnap.docs.filter(doc => !doc.data().seen);
        unseenSystem.forEach((docSnap) => {
          const docRef = doc(db, "users", user.uid, "notifications", docSnap.id);
          updateDoc(docRef, { seen: true });
        });

        const merged = [...weather, ...system];
        const sorted = merged.sort((a, b) => {
          const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
          const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
          return timeB - timeA;
        });

        setAllNotifications(sorted);
      });

      return () => {
        unsubSystem();
      };
    });

    return () => {
      unsubWeather();
    };
  }, []);

  const clearNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const weatherRef = collection(db, "users", user.uid, "weatherUpdates");
    const systemRef = collection(db, "users", user.uid, "notifications");

    try {
      const weatherSnap = await getDocs(weatherRef);
      const systemSnap = await getDocs(systemRef);

      const deleteWeather = weatherSnap.docs.map((d) =>
        deleteDoc(doc(db, "users", user.uid, "weatherUpdates", d.id))
      );
      const deleteSystem = systemSnap.docs.map((d) =>
        deleteDoc(doc(db, "users", user.uid, "notifications", d.id))
      );

      await Promise.all([...deleteWeather, ...deleteSystem]);
      setAllNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-2 lg:ml-64 bg-gray-300 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {allNotifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-gray-500 font-semibold hover:text-red-700 mr-4"
            >
              Clear Notifications
            </button>
          )}
        </div>

        {allNotifications.length === 0 ? (
          <p className="text-gray-500 mt-4">No notifications</p>
        ) : (
          <div className="space-y-4 mt-4">
            {allNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-4 border rounded-lg bg-white shadow-md m-4"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {notif.type === "weather" && notif.icon && (
                      <img
                        src={notif.icon}
                        alt="weather icon"
                        className="w-12 h-12"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">
                        {notif.type === "weather"
                          ? "🌤 Weather Update"
                          : "🔔 System Notification"}
                      </h2>

                      {notif.type === "weather" ? (
                        <>
                          <p className="text-gray-700 capitalize">
                            {notif.description}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Temperature: <strong>{notif.temp}°C</strong>
                          </p>
                          <p className="text-gray-600 text-sm">
                            Humidity: <strong>{notif.humidity}%</strong>
                          </p>
                          {notif.advisory && (
                            <p className="text-sm text-yellow-700 mt-2 italic">
                              {notif.advisory}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-700">{notif.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-right whitespace-nowrap">
                    {notif.timestamp?.toDate?.().toLocaleString?.() ??
                      new Date(notif.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Notification;
