import React, { useEffect, useState, useRef } from "react";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdCheckCircle, MdError, MdInfo } from "react-icons/md";

function SensorDisplay() {
  const [deviceIP, setDeviceIP] = useState("");
  const [data, setData] = useState({
    soil: 0,
    waterPercent: 0,
    gateOpen: false,
    manualAction: "",
  });
  const [gateOpen, setGateOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [openLimitReached, setOpenLimitReached] = useState(false);
  const [closeLimitReached, setCloseLimitReached] = useState(false);

  const notifiedStatus = useRef({ low: false, full: false });
  const triggeredFromWeb = useRef(false);
  const lastLoggedAuto = useRef("");
  const lastLoggedManual = useRef("");
  const lastAutoActionTime = useRef(0);
  const lastManualActionTime = useRef(0);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.esp32ip) {
          setDeviceIP(data.esp32ip);
        }
      }
    });

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    return () => unsubscribe();
  }, []);

  const showNotification = async (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "notifications"), {
        title,
        description: body,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving notification to Firestore:", error);
    }
  };

  const logGateAction = async (actionType, triggeredBy = "auto") => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, "users", user.uid, "gateActions"), {
        action: actionType,
        triggeredBy,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error logging gate action:", error);
    }
  };

  const fetchData = () => {
    if (!deviceIP) return;
    fetch(`http://${deviceIP}/data`)
      .then((res) => res.json())
      .then((json) => {
        if (json.gateIsMoving) {
          console.log("⏸️ Gate is moving — skipping fetch update");
          return;
        }

        setData(json);
        setGateOpen(json.gateOpen);
        setOpenLimitReached(json.openLimitReached);
        setCloseLimitReached(json.closeLimitReached);

        if (
          json.autoAction &&
          json.autoAction !== lastLoggedAuto.current &&
          json.autoActionTime !== lastAutoActionTime.current
        ) {
          const autoTitle =
            json.autoAction === "open"
              ? "✅ Gate Opened Automatically"
              : "✅ Gate Closed Automatically";
          const autoBody =
            json.autoAction === "open"
              ? "To ensure optimal crop health, the irrigation gate was automatically opened after detecting low water levels and dry soil in the rice field."
              : " The irrigation gate was automatically closed after detecting sufficient water in the rice field to avoid overwatering and reduce water waste for better crop management.";

          showNotification(autoTitle, autoBody);
          logGateAction(json.autoAction, "auto");
          lastLoggedAuto.current = json.autoAction;
          lastAutoActionTime.current = json.autoActionTime;
        }

        if (
          json.manualAction &&
          json.manualAction !== lastLoggedManual.current &&
          json.manualActionTime !== lastManualActionTime.current
        ) {
          logGateAction(json.manualAction, "manual");
          lastLoggedManual.current = json.manualAction;
          lastManualActionTime.current = json.manualActionTime;
        }

        if (
          json.waterPercent === 0 &&
          json.soil < 75 &&
          !json.gateOpen &&
          !json.openLimitReached &&
          !notifiedStatus.current.low
        ) {
          showNotification(
            "🚨 Low Water & Dry Soil",
            "🌱 Low soil moisture detected. To protect the crops and ensure proper irrigation, the gate will automatically open if this low condition remains stable for 15 seconds."
          );
          notifiedStatus.current.low = true;
          notifiedStatus.current.full = false;
        } else if (
          json.waterPercent === 100 &&
          json.gateOpen &&
          !json.closeLimitReached &&
          !notifiedStatus.current.full
        ) {
          showNotification(
            "✅ Water Level Full",
            "💧 Field Fully Irrigated. If the water level in the rice field stays full for 15 seconds, the system will automatically close the gate to avoid over-irrigation and water waste."
          );
          notifiedStatus.current.full = true;
          notifiedStatus.current.low = false;
        } else if (json.waterPercent > 0 && json.waterPercent < 100) {
          notifiedStatus.current.low = false;
          notifiedStatus.current.full = false;
        }

        triggeredFromWeb.current = false;
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  useEffect(() => {
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [deviceIP]);

  const handleOpen = () => {
    if (!deviceIP) return;
    setLoadingMessage("Opening...");
    triggeredFromWeb.current = true;
    notifiedStatus.current.low = false;
    notifiedStatus.current.full = false;

    fetch(`http://${deviceIP}/open`)
      .then((res) => {
        setLoadingMessage("");
        if (res.status === 200) {
          setModalMessage("✅ Gate opened successfully.");
        } else if (res.status === 202) {
          setModalMessage("ℹ️ Gate was already open.");
        } else {
          setModalMessage("⚠️ Unexpected response while opening.");
        }
        return res.text();
      })
      .catch((err) => {
        setLoadingMessage("");
        console.error("Failed to open gate", err);
        setModalMessage("⚠️ Failed to open gate.");
      });
  };

  const handleClose = () => {
    if (!deviceIP) return;
    setLoadingMessage("Closing...");
    triggeredFromWeb.current = true;
    notifiedStatus.current.low = false;
    notifiedStatus.current.full = false;

    fetch(`http://${deviceIP}/close`)
      .then((res) => {
        setLoadingMessage("");
        if (res.status === 200) {
          setModalMessage("✅ Gate closed successfully.");
        } else if (res.status === 202) {
          setModalMessage("ℹ️ Gate was already closed.");
        } else {
          setModalMessage("⚠️ Unexpected response while closing.");
        }
        return res.text();
      })
      .catch((err) => {
        setLoadingMessage("");
        console.error("Failed to close gate", err);
        setModalMessage("⚠️ Failed to close gate.");
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

        <div className="bg-blue-600 text-white rounded-2xl p-6 shadow-xl flex flex-col items-center">
          <div className="text-6xl mb-4">💧</div>
          <p className="text-xl font-semibold mb-2">Water Level</p>
          <p className="text-4xl font-bold">{data.waterPercent}%</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 text-center pb-2">
        <button
          onClick={handleOpen}
          className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md transition"
        >
          Open Gate
        </button>
        <button
          onClick={handleClose}
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md transition"
        >
          Close Gate
        </button>
      </div>

      {loadingMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-80">
            <div className="flex justify-center mb-4">
              <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-4xl" />
            </div>
            <p className="text-lg font-semibold text-gray-800">{loadingMessage}</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while the system performs the action...</p>
          </div>
        </div>
      )}

      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl text-center w-80">
            <div className="flex justify-center mb-2 text-4xl">
              {modalMessage.startsWith("✅") && <MdCheckCircle className="text-green-600" />} 
              {modalMessage.startsWith("⚠️") && <MdError className="text-yellow-500" />} 
              {modalMessage.startsWith("ℹ️") && <MdInfo className="text-blue-500" />}
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {modalMessage.replace(/^✅ |^⚠️ |^ℹ️ /, "")}
            </p>
            <button
              onClick={() => setModalMessage("")}
              className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200"
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
