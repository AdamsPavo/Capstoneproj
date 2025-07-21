import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const Activity = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchGateActions = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.warn("No user logged in");
        setLoading(false);
        return;
      }

      try {
        const actionsRef = collection(db, "users", user.uid, "gateActions");
        const q = query(actionsRef, orderBy("timestamp", "desc"));
        const querySnap = await getDocs(q);

        const logs = querySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setActions(logs);
      } catch (err) {
        console.error("Error fetching gate actions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGateActions();
  }, []);

  const handleClearLogs = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("⚠️ User not authenticated.");
      return;
    }

    const confirmClear = window.confirm("Are you sure you want to clear all activity logs?");
    if (!confirmClear) return;

    try {
      const actionsRef = collection(db, "users", user.uid, "gateActions");
      const q = query(actionsRef);
      const snapshot = await getDocs(q);

      const deletePromises = snapshot.docs.map((docSnap) =>
        deleteDoc(doc(db, "users", user.uid, "gateActions", docSnap.id))
      );

      await Promise.all(deletePromises);
      setActions([]); // Clear UI
      alert("✅ Logs cleared successfully.");
    } catch (error) {
      console.error("Error clearing logs:", error);
      alert("❌ Failed to clear logs.");
    }
  };

  const formatTriggeredBy = (trigger) => {
    switch (trigger) {
      case "manual":
        return "Manual (UI Button)";
      case "manual-button":
        return "Manual (Hardware Button)";
      case "emergency":
        return "🚨 Emergency Button";
      default:
        return "Automatic";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar + Sidebar */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <main className="p-4 lg:ml-64 bg-gray-300 min-h-screen">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 w-full">
        <h1 className="text-2xl font-bold">
          Irrigation Activity Logs
        </h1>
        <span
          onClick={handleClearLogs}
          className="text-gray-500 font-semibold hover:text-red-700 cursor-pointer sm:ml-auto mt-2 sm:mt-0"
        >
          Clear Activity Logs
        </span>
      </div>



        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : actions.length === 0 ? (
          <p className="text-gray-600">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 bg-white rounded-lg shadow">
            {actions.map((action) => (
              <li key={action.id} className="flex justify-between items-center p-4">
                <div>
                  <p className="font-medium capitalize">
                    Irrigation Gate is{" "}
                    <span
                      className={`font-bold ${
                        action.action === "open" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {action.action}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Triggered by: {formatTriggeredBy(action.triggeredBy)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {action.timestamp?.seconds
                    ? new Date(action.timestamp.seconds * 1000).toLocaleString()
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default Activity;
