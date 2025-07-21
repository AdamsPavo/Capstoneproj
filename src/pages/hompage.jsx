import React, { useEffect, useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { IoIosNotifications } from "react-icons/io";
import ricebg from "../assets/ricebg.png";
import useWeatherData from "../component/weatherdata";
import { Link } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, limit, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ProgressTracking from "../component/progressTracking";
import HarvestModal from "../component/harvestmodal";
import { generateToken } from "../firebase";
import logo from "../assets/logo.png";
import Esp32 from "../component/Esp32";

const HomePage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const LOCATION = "Compostela";
  const { currentWeather, weeklyForecast, error } = useWeatherData(LOCATION);
  const [currentStage, setCurrentStage] = useState("");
  const [hasPlan, setHasPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState("Closed");
  const [lastGateStatus, setLastGateStatus] = useState("");
  const [daysSinceStart, setDaysSinceStart] = useState(null);
  const [riceVariety, setRiceVariety] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleOpenGate = async () => {
    const token = await generateToken();
    if (token) {
      new Notification("PATUBIGAN Irrigation System", {
        body: "The gate has been opened successfully!",
        icon: logo,
      });
    }
    setIsGateOpen("Open");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      const docRef = doc(db, `users/${user.uid}/farmingPlans`, "Plan");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { startDate, riceVariety } = docSnap.data();
        const [year, month, day] = startDate.split("-").map(Number);
        const start = new Date(year, month - 1, day);

        setRiceVariety(riceVariety);
        setHasPlan(true);

        const updateDaysCount = () => {
          const today = new Date();
          const diffInMs = today - start;
          setDaysSinceStart(Math.floor(diffInMs / (1000 * 60 * 60 * 24)));
        };

        updateDaysCount();
        const interval = setInterval(updateDaysCount, 1000);

        return () => clearInterval(interval);
      } else {
        setHasPlan(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;

      try {
        const actionsRef = collection(db, "users", user.uid, "gateActions");
        const q = query(actionsRef, orderBy("timestamp", "desc"), limit(1));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const latest = querySnap.docs[0].data();
          setLastGateStatus(latest.action === "open" ? "Open" : "Close");
        }
      } catch (err) {
        console.error("Failed to fetch last gate action:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!user) return;

      const weatherRef = collection(db, "users", user.uid, "weatherUpdates");
      const systemRef = collection(db, "users", user.uid, "notifications");

      const unsubWeather = onSnapshot(weatherRef, (weatherSnap) => {
        const weatherUnseen = weatherSnap.docs.filter(doc => !doc.data().seen).length;

        const unsubSystem = onSnapshot(systemRef, (systemSnap) => {
          const systemUnseen = systemSnap.docs.filter(doc => !doc.data().seen).length;
          setNotificationCount(weatherUnseen + systemUnseen);
        });

        return () => unsubSystem();
      });

      return () => unsubWeather();
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex w-full items-center h-max px-2 mb-2">
          <h1 className="text-xl sm:text-3xl md:text-2xl lg:text-[30px] flex-grow sm:pl-8">
            Dashboard
          </h1>
          <Link to="/notification" className="relative">
            <IoIosNotifications className="text-4xl cursor-pointer" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </Link>
        </div>

        <div
          className="flex flex-col w-full min-h-[170px] md:min-h-[350px] bg-cover bg-no-repeat bg-center rounded-md mb-2 p-4 sm:p-6"
          style={{ backgroundImage: `url(${ricebg})`, backgroundSize: "cover" }}
        >
          <div className="flex justify-between items-center w-full">
            <span className="text-sm sm:text-lg md:text-xl lg:text-2xl text-white">
              Rice variety: {riceVariety}
            </span>
          </div>

          <div className="flex flex-col items-center w-full min-h-[110px] sm:min-h-[200px] md:min-h-[250px] lg:min-h-[300px] pt-2">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white font-bold">
              {hasPlan === false ? "No Farming Plan" : daysSinceStart !== null ? `DAY ${daysSinceStart}` : ""}
            </h1>
            {currentStage === "Harvest" && hasPlan ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg text-lg sm:text-xl md:text-2xl mt-4 shadow-md hover:bg-green-700 transition duration-300"
              >
                Harvest
              </button>
            ) : (
              hasPlan && (
                <h2 className="text-white text-xl sm:text-lg md:text-2xl lg:text-5xl pt-5 text-center">
                  {currentStage}
                </h2>
              )
            )}
          </div>

          <div className="flex flex-col items-center justify-center w-full pt-4 md:pb-2">
            <h2 className="text-white text-sm sm:text-lg md:text-2xl lg:text-3xl">
              Irrigation Status: {" "}
              <span className={`font-bold ${lastGateStatus === "Open" ? "text-green-400" : "text-red-400"}`}>
                {lastGateStatus || "Loading..."}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-4">
          <div className="w-full md:w-1/4 bg-gray-200 rounded-md p-4 h-[400px]">
            <ProgressTracking setCurrentStage={setCurrentStage} />
          </div>

          <div className="w-full md:w-1/2 bg-slate-900 rounded-md text-white p-4">
            <h1 className="text-2xl font-bold mb-4">Weather Forecast</h1>
            {error && <p className="text-red-500">{error}</p>}
            {currentWeather && (
              <div className="flex flex-row justify-center items-center">
                <div className="md:mr-4">
                  <h2 className="text-[25px] md:text-[40px] font-semibold">{LOCATION}</h2>
                  <p className="text-sm md:text-base text-gray-300">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm md:text-xl text-gray-200">
                    Humidity: <span className="font-bold">{currentWeather.humidity}%</span>
                  </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center m-4">
                  <img src={currentWeather.icon} alt={currentWeather.description} className="w-20 h-20" />
                  <div>
                    <p className="text-3xl font-bold">{currentWeather.temp}°C</p>
                    <p className="capitalize text-lg">{currentWeather.description}</p>
                  </div>
                </div>
              </div>
            )}

            {weeklyForecast.length > 0 && (
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-center text-white">
                  Weekly Forecast
                </h2>
                <div className="flex w-full overflow-x-auto gap-4 p-2 bg-gray-900 rounded-md">
                  {weeklyForecast.map((day, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-[80px] sm:w-[100px] md:w-[80px] lg:w-[100px] min-h-[120px] bg-blue-50 rounded-md shadow-md text-center flex flex-col items-center justify-between p-2"
                    >
                      <p className="text-gray-700 text-xs md:text-sm break-words">{day.date}</p>
                      <img src={day.icon} alt={day.description} className="w-10 h-10 md:w-10 md:h-10" />
                      <p className="text-sm md:text-sm font-semibold text-gray-600">{day.temp}°C</p>
                      <p className="capitalize text-xs md:text-sm font-medium text-gray-600 text-wrap">
                        {day.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/4 flex flex-col bg-gray-700 rounded-md justify-center items-center">
            <h2 className="text-3xl font-bold text-center text-white mb-8 pt-3">
              Sensor Readings
            </h2>
            <Esp32 />
          </div>
        </div>

        <HarvestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
};

export default HomePage;
