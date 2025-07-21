import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

function FarmingPlan() {
  const [startDate, setStartDate] = useState({ year: "", month: "", day: "" });
  const [plantingMethod, setPlantingMethod] = useState("");
  const [firstApplication, setFirstApplication] = useState({
    year: "",
    month: "",
    day: "",
  });
  const [secondApplication, setSecondApplication] = useState({
    year: "",
    month: "",
    day: "",
  });

  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 1 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const navigate = useNavigate(); // To navigate after form submission
  const auth = getAuth();

  const handleDateChange = (setDate, field, value) => {
    setDate((prev) => ({ ...prev, [field]: value }));
  };

  const calculateSuggestedDate = (baseDate, daysToAdd) => {
    const { year, month, day } = baseDate;
    if (!year || !month || !day) return null;

    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + daysToAdd);

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const suggestedFirstDate = calculateSuggestedDate(
    startDate,
    plantingMethod === "direct" ? 21 : plantingMethod === "transplanting" ? 10 : null
  );

  const suggestedSecondDate = calculateSuggestedDate(
    { year: firstApplication.year, month: firstApplication.month, day: firstApplication.day },
    21
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser; // Get the logged-in user

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const farmingPlanRef = doc(db, `users/${user.uid}/farmingPlans`, "Plan"); // Set a fixed ID

    try {
      await setDoc(farmingPlanRef, {
        riceVariety: e.target.riceVariety.value,
        hectareCoverage: e.target.HectareCoverage.value,
        plantingMethod,
        startDate: `${startDate.year}-${startDate.month}-${startDate.day}`,
        firstApplication: `${firstApplication.year}-${firstApplication.month}-${firstApplication.day}`,
        secondApplication: `${secondApplication.year}-${secondApplication.month}-${secondApplication.day}`,
      });

      console.log("Farming plan saved successfully");
      navigate("/homepage");
    } catch (error) {
      console.error("Error saving farming plan:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Sidebar />
      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex items-center justify-center min-h-screen bg-gray-300">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4">
              Create your farming plan
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Provide farming details
            </p>
            <form onSubmit={handleSubmit}>
              {/* Rice Variety */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Rice Variety:
                </label>
                <input
                  type="text"
                  name="riceVariety"
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                  placeholder="Enter rice variety"
                  required
                />
              </div>

                        {/* Hectare Coverage */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Hectare Coverage (ha):
            </label>
            <input
              type="number"
              name="HectareCoverage"
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              placeholder="Enter Hectare Coverage"
              min="0.01"
              step="0.01"
              required
            />
          </div>


          {/* Planting Method */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Planting Method:
            </label>
            <select
              value={plantingMethod}
              onChange={(e) => setPlantingMethod(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
              required
            >
              <option value="" disabled>Select a planting method</option>
              <option value="direct">Direct</option>
              <option value="transplanting">Transplanting</option>
            </select>

            {plantingMethod && (
              <p className="mt-2 text-sm text-gray-700">
                Days to Harvest:{" "}
                <span className="font-semibold text-yellow-500">
                  {plantingMethod === "direct" ? 100 : plantingMethod === "transplanting" ? 110 : "N/A"} days
                </span>
              </p>
            )}
          </div>




              {/* Planting Start Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Planting Start Date
                </label>
                <div className="flex gap-2">
                  <select
                    value={startDate.year}
                    onChange={(e) =>
                      handleDateChange(setStartDate, "year", e.target.value)
                    }
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
                    value={startDate.month}
                    onChange={(e) =>
                      handleDateChange(setStartDate, "month", e.target.value)
                    }
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
                    value={startDate.day}
                    onChange={(e) =>
                      handleDateChange(setStartDate, "day", e.target.value)
                    }
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

              {/* First Application */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Fertilizer Application Date - First Application
                </label>
                {suggestedFirstDate && (
                  <p className="text-sm text-yellow-600 mt-2">
                    Suggested Date: {suggestedFirstDate}
                  </p>
                )}
                <div className="flex gap-2">
                  <select
                    value={firstApplication.year}
                    onChange={(e) =>
                      handleDateChange(setFirstApplication, "year", e.target.value)
                    }
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
                    value={firstApplication.month}
                    onChange={(e) =>
                      handleDateChange(setFirstApplication, "month", e.target.value)
                    }
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
                    value={firstApplication.day}
                    onChange={(e) =>
                      handleDateChange(setFirstApplication, "day", e.target.value)
                    }
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

              {/* Second Application */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Fertilizer Application Date - Second Application
                </label>
                {suggestedSecondDate && (
                  <p className="text-sm text-yellow-600 mt-2">
                    Suggested Date: {suggestedSecondDate}
                  </p>
                )}
                <div className="flex gap-2">
                  <select
                    value={secondApplication.year}
                    onChange={(e) =>
                      handleDateChange(setSecondApplication, "year", e.target.value)
                    }
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
                    value={secondApplication.month}
                    onChange={(e) =>
                      handleDateChange(setSecondApplication, "month", e.target.value)
                    }
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
                    value={secondApplication.day}
                    onChange={(e) =>
                      handleDateChange(setSecondApplication, "day", e.target.value)
                    }
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

              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              >
                Start Growing
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default FarmingPlan;
