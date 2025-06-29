import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Import Auth
import { db } from "../firebase";

function EditFarmingPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth
  
  const [formData, setFormData] = useState({
    riceVariety: "",
    plantingMethod: "",
    hectareCoverage: "",
    startDate: { year: "", month: "", day: "" },
    firstApplication: { year: "", month: "", day: "" },
    secondApplication: { year: "", month: "", day: "" },
  });

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 1 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

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

        const docRef = doc(db, `users/${userId}/farmingPlans`, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            riceVariety: data.riceVariety || "",
            hectareCoverage: data.hectareCoverage || "",
            plantingMethod: data.plantingMethod || "",
            startDate: parseDate(data.startDate),
            firstApplication: parseDate(data.firstApplication),
            secondApplication: parseDate(data.secondApplication),
          });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchFarmingPlan();
  }, [id, auth, navigate]);

  const parseDate = (dateString) => {
    if (!dateString) return { year: "", month: "", day: "" };
    const [year, month, day] = dateString.split("-");
    return { year, month, day };
  };

  const handleDateChange = (field, key, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [key]: value },
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No user logged in.");
        navigate("/signin");
        return;
      }
      const userId = user.uid;

      const docRef = doc(db, `users/${userId}/farmingPlans`, id);
      await updateDoc(docRef, {
        riceVariety: formData.riceVariety,
        hectareCoverage: formData.hectareCoverage,
        plantingMethod: formData.plantingMethod,
        startDate: `${formData.startDate.year}-${formData.startDate.month}-${formData.startDate.day}`,
        firstApplication: `${formData.firstApplication.year}-${formData.firstApplication.month}-${formData.firstApplication.day}`,
        secondApplication: `${formData.secondApplication.year}-${formData.secondApplication.month}-${formData.secondApplication.day}`,
      });

      console.log("Farming plan updated successfully");
      navigate("/homepage");
    } catch (error) {
      console.error("Error updating farming plan:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex items-center justify-center min-h-screen bg-gray-300">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4">Edit Farming Plan</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rice Variety:</label>
                <input
                  type="text"
                  name="riceVariety"
                  value={formData.riceVariety}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700"> Hectare Coverage (ha):</label>
                <input
                  type="text"
                  name="hectareCoverage"
                  value={formData.hectareCoverage}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Planting Method</label>
                <select
                  name="plantingMethod"
                  value={formData.plantingMethod}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                >
                  <option value="">Select a method</option>
                  <option value="direct">Direct</option>
                  <option value="transplanting">Transplanting</option>
                </select>
              </div>
              {["startDate", "firstApplication", "secondApplication"].map((field) => (
                <div key={field} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.replace(/([A-Z])/g, " $1")} Date
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData[field].year}
                      onChange={(e) => handleDateChange(field, "year", e.target.value)}
                      className="w-1/3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    >
                      <option value="">Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData[field].month}
                      onChange={(e) => handleDateChange(field, "month", e.target.value)}
                      className="w-1/3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    >
                      <option value="">Month</option>
                      {months.map((month) => (
                        <option key={month} value={month}>
                          {month}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData[field].day}
                      onChange={(e) => handleDateChange(field, "day", e.target.value)}
                      className="w-1/3 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                    >
                      <option value="">Day</option>
                      {days.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <button type="button" onClick={() => navigate("/plan")} className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditFarmingPlan;
