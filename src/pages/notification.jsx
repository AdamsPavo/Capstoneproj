import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

const Notification = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weatherHistory, setWeatherHistory] = useState([]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");
    const q = query(userWeatherRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeatherHistory(historyData);
    });

    return () => unsubscribe();
  }, []);

  const clearNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");

    try {
      const snapshot = await getDocs(userWeatherRef);
      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "users", user.uid, "weatherUpdates", docSnap.id))
      );

      await Promise.all(deletePromises);
      setWeatherHistory([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-2 lg:ml-64 bg-gray-300 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <div className="text-right">
          {weatherHistory.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-gray-500 font-semibold hover:text-red-700 mr-4"
            >
              Clear Notifications
            </button>
          )}
        </div>

        <div>
          {weatherHistory.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-4">
              {weatherHistory.map((weather) => (
                <div
                  key={weather.id}
                  className="p-4 border rounded-lg bg-white shadow-md m-4"
                >
                  <div className="flex items-center gap-4">
                    {weather.icon && (
                      <img
                        src={weather.icon}
                        alt="weather icon"
                        className="w-12 h-12"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">Weather Update</h2>
                      <p className="text-gray-700 capitalize">
                        {weather.description}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Temperature: <strong>{weather.temp}°C</strong>
                      </p>
                      <p className="text-gray-600 text-sm">
                        Humidity: <strong>{weather.humidity}%</strong>
                      </p>
                      {weather.advisory && (
                        <p className="text-sm text-yellow-700 mt-2 italic">
                           {weather.advisory}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 text-right mt-2">
                        {new Date(weather.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Notification;
