import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";

const PlantingHistory = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [plantingHistory, setPlantingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterHectare, setFilterHectare] = useState("");
  const [filterMethod, setFilterMethod] = useState("");
  const [filterVariety, setFilterVariety] = useState("");
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching planting history:", error);
        setLoading(false);
      }
    };

    fetchPlantingHistory();
  }, []);

  // ✅ Filtered records logic
  const filteredRecords = plantingHistory.filter(record => {
    const recordYear = new Date(record.startDate).getFullYear();
    return (
      (filterYear === "" || recordYear === parseInt(filterYear)) &&
      (filterHectare === "" || String(record.hectareCoverage) === filterHectare) &&
      (filterMethod === "" || record.plantingMethod === filterMethod) &&
      (filterVariety === "" || record.riceVariety === filterVariety)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-1 lg:ml-64 bg-gray-300 min-h-screen">
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-bold text-gray-800 pb-2">Planting History</h1>
          <p className="text-md tex-black">Track your past planting records and harvest data</p>
        </div>

        {/* ✅ Filter Section */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 px-2">
          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterVariety}
            onChange={(e) => setFilterVariety(e.target.value)}
          >
            <option value="">All Varieties</option>
            {[...new Set(plantingHistory.map(item => item.riceVariety))].map((variety, index) => (
              <option key={index} value={variety}>{variety}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
          >
            <option value="">All Methods</option>
            {[...new Set(plantingHistory.map(item => item.plantingMethod))].map((method, index) => (
              <option key={index} value={method}>{method}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[...new Set(plantingHistory.map(item => new Date(item.startDate).getFullYear()))]
              .sort((a, b) => b - a)
              .map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
          </select>

          <select
            className="border rounded px-3 py-1 text-sm"
            value={filterHectare}
            onChange={(e) => setFilterHectare(e.target.value)}
          >
            <option value="">All Hectares</option>
            {[...new Set(plantingHistory.map(item => String(item.hectareCoverage)))].map((hectare, index) => (
              <option key={index} value={hectare}>{hectare} ha</option>
            ))}
          </select>

          <button
            className="bg-gray-200 text-red-700 px-3 py-1 rounded hover:bg-red-300 text-sm"
            onClick={() => {
              setFilterYear("");
              setFilterHectare("");
              setFilterMethod("");
              setFilterVariety("");
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* ✅ Table Section */}
        <div className="bg-white p-2 rounded-lg shadow-md">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-10">
              <p className="text-lg">No planting history found for selected filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-full table-auto">
                <thead className="bg-green-500 text-white text-sm md:text-base">
                  <tr>
                    <th className="border p-2">Rice Variety</th>
                    <th className="border p-2">Start Date</th>
                    <th className="border p-2">Hectare</th>
                    <th className="border p-2">Method</th>
                    <th className="border p-2">Harvest Date</th>
                    <th className="border p-2">Harvest (sacks)</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="text-center text-sm md:text-base hover:bg-gray-100">
                      <td className="border p-2 font-medium">{record.riceVariety}</td>
                      <td className="border p-2">{new Date(record.startDate).toLocaleDateString()}</td>
                      <td className="border p-2">{record.hectareCoverage} ha</td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.plantingMethod === 'Transplanting' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {record.plantingMethod}
                        </span>
                      </td>
                      <td className="border p-2">{new Date(record.harvestDate).toLocaleDateString()}</td>
                      <td className="border p-2 font-bold">{record.harvestAmount}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ✅ Modal for Details */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-2">
              <h2 className="text-xl font-bold mb-4 text-center">Planting Details</h2>
              <ul className="text-lg space-y-2">
                <li><strong>Rice Variety:</strong> {selectedRecord.riceVariety}</li>
                <li><strong>Start Date:</strong> {new Date(selectedRecord.startDate).toLocaleDateString()}</li>
                <li><strong>Hectare Coverage:</strong> {selectedRecord.hectareCoverage} ha</li>
                <li><strong>Planting Method:</strong> {selectedRecord.plantingMethod}</li>
                <li><strong>Harvest Date:</strong> {new Date(selectedRecord.harvestDate).toLocaleDateString()}</li>
                <li><strong>Harvest Amount:</strong> {selectedRecord.harvestAmount} sacks</li>
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PlantingHistory;
