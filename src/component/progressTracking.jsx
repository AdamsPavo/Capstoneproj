import React, { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

const ProgressTracking = ({ setCurrentStage }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStageLocal] = useState("");

  useEffect(() => {
    const fetchFarmingPlan = async () => {
      setLoading(true);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        setLoading(false);
        return;
      }

      const farmingPlanRef = doc(db, `users/${user.uid}/farmingPlans`, "Plan");
      try {
        const farmingPlanSnap = await getDoc(farmingPlanRef);
        if (farmingPlanSnap.exists()) {
          const data = farmingPlanSnap.data();
          const { startDate, firstApplication, secondApplication } = data;

          const start = new Date(startDate);
          const firstFert = new Date(firstApplication);
          const secondFert = new Date(secondApplication);

          const stages = [
            { name: "Vegetative Stage", date: start },
            { name: "First Fertilizer Application", date: firstFert },
            { name: "Reproductive Stage", date: new Date(start.getTime() + 45 * 86400000) },
            { name: "Second Fertilizer Application", date: secondFert },
            { name: "Ripening Stage", date: new Date(start.getTime() + 80 * 86400000) },
            { name: "Harvest", date: new Date(start.getTime() + 110 * 86400000) },
          ];

          setProgressData(stages);

          // Determine the current stage (excluding fertilizer applications)
          const currentDate = new Date();
          const stageNames = ["Vegetative Stage", "Reproductive Stage", "Ripening Stage", "Harvest"];
          let current = "Not Started";

          for (let i = stages.length - 1; i >= 0; i--) {
            if (currentDate >= stages[i].date && stageNames.includes(stages[i].name)) {
              current = stages[i].name;
              break;
            }
          }

          setCurrentStageLocal(current);
          if (setCurrentStage) setCurrentStage(current);
        } else {
          console.error("No farming plan found!");
        }
      } catch (error) {
        console.error("Error fetching farming plan:", error);
      }
      setLoading(false);
    };

    fetchFarmingPlan();
  }, [setCurrentStage]);

  return (
    <div className="p-2">
  <h1 className="text-xl font-bold mb-4">Rice Farming Progress</h1>

  {loading ? (
    <p>Loading...</p>
  ) : progressData.length > 0 ? (
    <div className="space-y-4">
      {progressData.map((stage, index) => {
        const isCompleted = new Date() >= stage.date;

        return (
          <div key={index} className="flex items-center space-x-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isCompleted ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
            <p className={`text-sm ${isCompleted ? "text-green-600" : "text-gray-600"}`}>
              {stage.name} - {stage.date.toDateString()}
            </p>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-gray-500 font-semibold text-center">
      No farming plan found. <br /> <span className="text-green-600">Go to Planting Plan to create one.</span>
    </p>
  )}
</div>

  );
};

export default ProgressTracking;
