import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, getDocs } from "firebase/firestore";

const Notification = ({ setHasNewNotification }) => {
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

    // Real-time listener for weather history updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const historyData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWeatherHistory(historyData);

      // Update badge state
      setHasNewNotification(historyData.length > 0);
    });

    return () => unsubscribe();
  }, [setHasNewNotification]);

  // Function to delete all notifications properly
  const clearNotifications = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");

    try {
      const snapshot = await getDocs(userWeatherRef); // Fetch all documents
      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "users", user.uid, "weatherUpdates", docSnap.id))
      );

      await Promise.all(deletePromises); // Wait for all deletions to complete

      // Clear local state
      setWeatherHistory([]);
      setHasNewNotification(false);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
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

        {/* Weather Update History Display */}
        <div>
          {weatherHistory.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <div className="space-y-4">
              {weatherHistory.map((weather) => (
                <div
                  key={weather.id}
                  className="p-2 border rounded-lg bg-white shadow-md m-4"
                >
                  <h2 className="text-xl font-semibold mb-2">Weather Update</h2>
                  <p className="text-lg font-semibold">{weather.temp}°C</p>
                  <p className="text-gray-700">{weather.description}</p>
                  <p className="text-sm text-gray-600">
                    Humidity: {weather.humidity}%
                  </p>
                  <p className="text-sm text-gray-500 text-right">
                    {new Date(weather.timestamp).toLocaleString()}
                  </p>
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
