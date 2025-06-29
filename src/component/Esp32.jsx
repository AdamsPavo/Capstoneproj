import React, { useEffect, useState, useRef } from "react";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

function SensorDisplay() {
  const [data, setData] = useState({ soil: 0, waterPercent: 0, pending: "", gateOpen: false, manualAction: "" });
  const [pendingAction, setPendingAction] = useState(null);
  const [timerId, setTimerId] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [lastStatus, setLastStatus] = useState("");
  const [lastManualAction, setLastManualAction] = useState("");
  const notifiedStatus = useRef({ low: false, full: false });
  const triggeredFromWeb = useRef(false);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  const showNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const logGateAction = async (actionType, triggeredBy = "auto") => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn("No user logged in, skipping log.");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "gateActions"), {
        action: actionType,
        triggeredBy,
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Error saving gate action to Firestore:", error);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetch("http://192.168.1.55/data")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setGateOpen(json.gateOpen);

          if (json.pending === "open") {
            setPendingAction("open");
          } else if (json.pending === "close") {
            setPendingAction("close");
          } else {
            setPendingAction(null);
          }

          if (json.autoAction === "open" && !triggeredFromWeb.current) {
            showNotification("✅ Gate Opened Automatically", "The irrigation gate was automatically opened because the sensors detected low water level and dry soil.");
            logGateAction("open", "auto");
          } else if (json.autoAction === "close" && !triggeredFromWeb.current) {
            showNotification("✅ Gate Closed Automatically", "The irrigation gate was automatically closed because the water level reached full capacity.");
            logGateAction("close", "auto");
          }
          triggeredFromWeb.current = false;

          if (json.manualAction && json.manualAction !== lastManualAction) {
            showNotification(
              json.manualAction === "open" ? "🚨 Manual Gate Opened" : "🚨 Manual Gate Closed",
              `Gate was ${json.manualAction}ed manually.`
            );
            logGateAction(json.manualAction, "manual");
            setLastManualAction(json.manualAction);
          }

          if (
            json.waterPercent === 0 &&
            json.soil < 75 &&
            !json.gateOpen &&
            !notifiedStatus.current.low
          ) {
            showNotification("🚨 Low Water & Dry Soil", "Tap to open the irrigation gate and start watering, or it will automatically open in 30 seconds.");
            notifiedStatus.current.low = true;
            notifiedStatus.current.full = false;
          } else if (
            json.waterPercent === 100 &&
            json.gateOpen &&
            !notifiedStatus.current.full
          ) {
            showNotification("✅ Water Level is Full", "Tap to close the gate, or it will close automatically in 30 seconds.");
            notifiedStatus.current.full = true;
            notifiedStatus.current.low = false;
          } else if (
            json.waterPercent > 0 && json.waterPercent < 100
          ) {
            notifiedStatus.current.low = false;
            notifiedStatus.current.full = false;
          }
        })
        .catch((err) => console.error("Failed to fetch data:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [lastManualAction]);

  const triggerAutoAction = (action) => {
    fetch(`http://192.168.1.55/${action}`)
      .then(() => {
        setGateOpen(action === "open");
        setPendingAction(null);
        logGateAction(action, "auto");
        showNotification(
          action === "open" ? "✅ Auto Opened" : "✅ Auto Closed",
          `The gate has been automatically ${action}ed after 30 seconds.`
        );
      })
      .catch((err) => {
        console.error("Auto action failed:", err);
      });
  };

  useEffect(() => {
    if (data.waterPercent === 0 && data.soil < 75 && !gateOpen && lastStatus !== "low") {
      setLastStatus("low");
      setPendingAction("open");
      setCountdown(30);

      const id = setTimeout(() => {
        triggerAutoAction("open");
        setCountdown(0);
      }, 30000);
      setTimerId(id);

      const intervalId = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      setCountdownInterval(intervalId);

    } else if (data.waterPercent === 100 && gateOpen && lastStatus !== "full") {
      setLastStatus("full");
      setPendingAction("close");
      setCountdown(30);

      const id = setTimeout(() => {
        triggerAutoAction("close");
        setCountdown(0);
      }, 30000);
      setTimerId(id);

      const intervalId = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      setCountdownInterval(intervalId);

    } else if (
      (data.waterPercent > 0 && data.waterPercent < 100) ||
      (data.waterPercent === 0 && data.soil < 75 && gateOpen) ||
      (data.waterPercent === 100 && data.soil < 75 && !gateOpen)
    ) {
      if (lastStatus !== "normal") {
        setLastStatus("normal");
        setPendingAction(null);
        clearTimeout(timerId);
        clearInterval(countdownInterval);
        setCountdown(0);
      }
    }
  }, [data.waterPercent, data.soil, gateOpen, lastStatus]);

  const handleAction = (action) => {
    if ((gateOpen && action === "open") || (!gateOpen && action === "close")) {
      setModalMessage(`ℹ️ The gate is already ${gateOpen ? "open" : "closed"}.`);
      return;
    }

    setLoadingMessage(`${action === "open" ? "Opening" : "Closing"}...`);
    triggeredFromWeb.current = true;

    fetch(`http://192.168.1.55/${action}`)
      .then((res) => {
        setLoadingMessage("");
        if (res.status === 200) {
          setModalMessage(`✅ Gate successfully ${action}ed.`);
          setGateOpen(action === "open");
          logGateAction(action, "manual");
        } else if (res.status === 202) {
          setModalMessage(`ℹ️ Gate was already ${action}ed.`);
        } else {
          setModalMessage(`⚠️ Unexpected response while trying to ${action} the gate.`);
        }
        return res.text();
      })
      .catch((err) => {
        setLoadingMessage("");
        console.error(`Failed to ${action} the gate`, err);
        setModalMessage(`✅ the gate ${action} Successfully.`);
        logGateAction(action, "manual");
      });
  };

  return (
    <div className="rounded-2xl max-w-5xl mx-auto px-2 h-full flex flex-col justify-center items-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        <div className="bg-green-600 text-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-xl font-semibold mb-2">Soil Moisture</p>
          <p className="text-4xl font-bold">{data.soil}%</p>
        </div>

        <div className="bg-blue-600 text-white rounded-2xl p-8 shadow-xl flex flex-col items-center">
          <div className="text-6xl mb-4">💧</div>
          <p className="text-xl font-semibold mb-2">Water Level</p>
          <p className="text-4xl font-bold">{data.waterPercent}%</p>
        </div>
      </div>

      <div className="text-center space-x-4">
        <button
          onClick={() => handleAction("open")}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md"
        >
          Open Gate
        </button>

        <button
          onClick={() => handleAction("close")}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-md"
        >
          Close Gate
        </button>

        {countdown > 0 && pendingAction && (
          <p className="mt-2 text-sm text-gray-600">
            ⏳ Auto-{pendingAction} in {countdown}s
          </p>
        )}
      </div>

      {loadingMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold">{loadingMessage}</p>
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      )}

      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center space-y-4">
            <p className="text-lg font-semibold">{modalMessage}</p>
            <button
              onClick={() => setModalMessage("")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SensorDisplay;
