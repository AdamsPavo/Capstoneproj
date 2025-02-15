import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Import Firebase Auth
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";

function FarmingPlanView() {
  const [farmingPlan, setFarmingPlan] = useState(null);
  const [docId, setDocId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarmingPlan = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error("No user logged in.");
          navigate("/signin");
          return;
        }

        const userId = user.uid;
        const querySnapshot = await getDocs(collection(db, `users/${userId}/farmingPlans`));

        if (!querySnapshot.empty) {
          const firstDoc = querySnapshot.docs[0];
          setFarmingPlan(firstDoc.data());
          setDocId(firstDoc.id);
        } else {
          navigate("/createplan"); // Redirect if no farming plan exists
        }
      } catch (error) {
        console.error("Error fetching farming plan:", error);
      }
    };

    fetchFarmingPlan();
  }, [navigate]);

  const handleDelete = async () => {
    if (!docId) return;
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userId = user.uid;
      await deleteDoc(doc(db, `users/${userId}/farmingPlans`, docId));
      console.log("Farming plan deleted successfully");
      setFarmingPlan(null);
      navigate("/createplan"); // Redirect after deletion
    } catch (error) {
      console.error("Error deleting farming plan:", error);
    }
  };

  // Prevents errors if farmingPlan is null
  if (!farmingPlan) {
    return (
      <div className="text-center mt-10">
        <p>Loading farming plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex items-center justify-center min-h-screen bg-gray-300">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4">Farming Plan</h2>
            <p className="text-gray-600 text-center mb-6">View farming details</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Rice Variety:</label>
              <input
                type="text"
                value={farmingPlan?.riceVariety || ""}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Planting Method:</label>
              <input
                type="text"
                value={farmingPlan?.plantingMethod || ""}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Planting Start Date:</label>
              <input
                type="text"
                value={farmingPlan?.startDate || ""}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">First Application of Fertilizer Date:</label>
              <input
                type="text"
                value={farmingPlan?.firstApplication || ""}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Second Application Fertilizer Date:</label>
              <input
                type="text"
                value={farmingPlan?.secondApplication || ""}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => navigate("/editplan/" + docId)}
                className="w-1/2 px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="w-1/2 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FarmingPlanView;
