import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, collection, addDoc, deleteDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import logo from "../assets/logo.png";
import { db } from "../firebase";

const HarvestModal = ({ isOpen, onClose }) => {
  const [harvestAmount, setHarvestAmount] = useState("");
  const [farmingPlan, setFarmingPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // Success message state
  const auth = getAuth();

  useEffect(() => {
    const fetchFarmingPlan = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const farmingPlanRef = doc(db, `users/${user.uid}/farmingPlans`, "Plan");

      try {
        const docSnap = await getDoc(farmingPlanRef);
        if (docSnap.exists()) {
          setFarmingPlan(docSnap.data());
        } else {
          console.error("No farming plan found!");
        }
      } catch (error) {
        console.error("Error fetching farming plan:", error);
      }
    };

    if (isOpen) {
      fetchFarmingPlan();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !farmingPlan) {
      console.error("User not authenticated or no farming plan available");
      return;
    }

    const harvestDate = new Date().toISOString().split("T")[0]; // Get current date

    try {
      const harvestDataRef = collection(db, `users/${user.uid}/harvestData`);

      await addDoc(harvestDataRef, {
        riceVariety: farmingPlan.riceVariety,
        startDate: farmingPlan.startDate,
        hectareCoverage: farmingPlan.hectareCoverage,
        plantingMethod: farmingPlan.plantingMethod,
        harvestDate,
        harvestAmount: Number(harvestAmount),
      });

      console.log("Harvest recorded successfully");

      // Delete the farming plan after recording the harvest
      const farmingPlanRef = doc(db, `users/${user.uid}/farmingPlans`, "Plan");
      await deleteDoc(farmingPlanRef);
      console.log("Farming plan deleted successfully");

      setHarvestAmount("");
      setSuccessMessage("Harvest recorded successfully! 🎉");

      // Hide the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
        onClose(); // Close the modal
      }, 3000);
    } catch (error) {
      console.error("Error saving harvest data:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="P-Tubigan Logo" className="w-40 md:w-56" />
        </div>

        <h2 className="text-lg font-semibold text-center text-gray-800 mb-4">
          Congratulations on your successful harvest! Please enter the total amount of harvested rice in sacks.
        </h2>

        {successMessage && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md text-center mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-gray-700 font-medium mb-2">
            Harvest Amount (sacks):
          </label>
          <input
            type="number"
            value={harvestAmount}
            onChange={(e) => setHarvestAmount(e.target.value)}
            className="border border-gray-300 p-3 rounded-md mb-4 focus:ring-2 focus:ring-green-500 outline-none"
            required
            placeholder="Enter number of sacks"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HarvestModal;
