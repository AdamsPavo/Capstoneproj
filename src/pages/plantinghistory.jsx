import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";

const PlantingHistory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [plantingHistory, setPlantingHistory] = useState([]);
  const auth = getAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const fetchPlantingHistory = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      try {
        const harvestDataRef = collection(db, `users/${user.uid}/harvestData`);
        const querySnapshot = await getDocs(harvestDataRef);
        const history = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlantingHistory(history);
      } catch (error) {
        console.error("Error fetching planting history:", error);
      }
    };

    fetchPlantingHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <main className="p-4 lg:ml-64 bg-gray-300 min-h-screen">
        <h1 className="text-2xl font-semibold mb-4 text-center">Planting History</h1>

        <div className="bg-white p-4 rounded-lg shadow-md">
          {plantingHistory.length === 0 ? (
            <p className="text-gray-600 text-center">No planting history available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-gray-700 text-sm md:text-base">
                    <th className="border p-2">Rice Variety</th>
                    <th className="border p-2">Start Date</th>
                    <th className="border p-2">Hectare Coverage</th>
                    <th className="border p-2">Planting Method</th>
                    <th className="border p-2">Harvest Date</th>
                    <th className="border p-2">Harvest Amount (sacks)</th>
                  </tr>
                </thead>
                <tbody>
                  {plantingHistory.map((record) => (
                    <tr key={record.id} className="text-center text-sm md:text-base">
                      <td className="border p-2">{record.riceVariety}</td>
                      <td className="border p-2">{record.startDate}</td>
                      <td className="border p-2">{record.hectareCoverage} ha</td>
                      <td className="border p-2">{record.plantingMethod}</td>
                      <td className="border p-2">{record.harvestDate}</td>
                      <td className="border p-2">{record.harvestAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlantingHistory;
