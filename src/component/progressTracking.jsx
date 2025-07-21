import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";

const ProgressTracking = ({ setCurrentStage }) => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStageLocal] = useState("");

  const sendStageNotification = async (user, stageName) => {
    const notifRef = collection(db, "users", user.uid, "notifications");
    const todayStr = new Date().toDateString();
    const title = "🌾 Farming Progress Update";
    const description = `Your farm is now in the "${stageName}". Make sure to take the appropriate actions for this stage.`;

    try {
      const snapshot = await getDocs(notifRef);
      const alreadyNotified = snapshot.docs.some((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate?.() || new Date(data.timestamp);
        return data.description === description && timestamp.toDateString() === todayStr;
      });

      if (!alreadyNotified) {
        if (Notification.permission !== "granted") {
          await Notification.requestPermission();
        }

        if (Notification.permission === "granted") {
          new Notification(title, { body: description });
        }

        await addDoc(notifRef, {
          title,
          description,
          timestamp: new Date(),
          seen: false,
          category: "farming",
        });
      }
    } catch (error) {
      console.error("Failed to send stage notification:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
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
          const { startDate, firstApplication, secondApplication, plantingMethod } = data;

          const start = new Date(startDate);
          const firstFert = new Date(firstApplication);
          const secondFert = new Date(secondApplication);

          // Adjust days based on planting method
          const harvestDays = plantingMethod === "direct" ? 100 : 110;

          const stages = [
            { name: "Vegetative Stage", date: start },
            { name: "First Fertilizer Application", date: firstFert },
            { name: "Reproductive Stage", date: new Date(start.getTime() + 45 * 86400000) },
            { name: "Second Fertilizer Application", date: secondFert },
            { name: "Ripening Stage", date: new Date(start.getTime() + 80 * 86400000) },
            { name: "Harvest", date: new Date(start.getTime() + harvestDays * 86400000) },
          ];

          setProgressData(stages);

          const today = new Date().toDateString();
          for (const stage of stages) {
            if (new Date(stage.date).toDateString() === today) {
              await sendStageNotification(user, stage.name);
            }
          }

          // Set currentStage for status display
          const stageNames = ["Vegetative Stage", "Reproductive Stage", "Ripening Stage", "Harvest"];
          let current = "Not Started";
          const currentDate = new Date();

          for (let i = stages.length - 1; i >= 0; i--) {
            if (currentDate >= stages[i].date && stageNames.includes(stages[i].name)) {
              current = stages[i].name;
              break;
            }
          }

          setCurrentStageLocal(current);
          if (setCurrentStage) setCurrentStage(current);
        } else {
          setProgressData([]); // Plan not found
        }
      } catch (error) {
        console.error("Error fetching farming plan:", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
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
                  className={`w-3 h-3 rounded-full ${isCompleted ? "bg-green-500" : "bg-gray-400"}`}
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
          No farming plan found. <br />
          <span className="text-green-600">Go to Planting Plan to create one.</span>
        </p>
      )}
    </div>
  );
};

export default ProgressTracking;
