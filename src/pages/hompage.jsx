import React, { useEffect,useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { IoIosNotifications } from "react-icons/io";
import ricebg from "../assets/ricebg.png";
import useWeatherData from "../component/weatherdata";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth } from "firebase/auth";
import ProgressTracking from "../component/progressTracking";
import NotificationBadge from "../component/notificationbadge";



const HomePage = () => {

  const [isOpen, setIsOpen] = useState(false);
  const LOCATION = "Compostela"; // Location for weather data
  const { currentWeather, weeklyForecast, error } = useWeatherData(LOCATION); // Use the custom hook

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  

  const [daysSinceStart, setDaysSinceStart] = useState(null);
  const [riceVariety, setRiceVariety] = useState("");

  useEffect(() => {
    const fetchStartDate = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, `users/${user.uid}/farmingPlans`,"Plan");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { startDate,riceVariety } = docSnap.data(); // e.g., "2024-01-01"
        const [year, month, day] = startDate.split("-").map(Number);
        const start = new Date(year, month - 1, day);

        setRiceVariety(riceVariety);

        const updateDaysCount = () => {
          const today = new Date();
          const diffInMs = today - start;
          setDaysSinceStart(Math.floor(diffInMs / (1000 * 60 * 60 * 24))); // Convert ms to days
        };

        updateDaysCount(); // Initial update
        const interval = setInterval(updateDaysCount, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
      }
    };

    fetchStartDate();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex w-full items-center h-max px-2 mb-2">
          <h1 className=" text-xl sm:text-3xl md:text-xl lg:text-[30px] flex-grow sm:pl-8">
            Dashboard
          </h1> 
          <Link to="/notification">
            <NotificationBadge />
          </Link>
          
        </div>
        <div
          className="flex flex-col w-full h-[170px] md:h-[350px] bg-cover bg-no-repeat bg-center rounded-md mb-2"
          style={{
            backgroundImage: `url(${ricebg})`,
            backgroundSize: "100% 100%", // Stretches the image to fit the div
          }}
        >
          {/* Top section */}
          <div className="flex justify-between w-full h-max pl-2 ">
            <span className="text-sm sm:text-2xl md:text-2xl text-white">
              Rice variety: {riceVariety}
            </span>

          </div>

          {/* Bottom section */}
          <div className="flex flex-col items-center w-full sm:h-[200px] md:h-[250px] lg:h-[300px]">
            <h1 className="text-4xl sm:text-6xl md:text-8xl text-white">DAY {daysSinceStart !== null ? daysSinceStart : "..."}</h1>
            <h2 className="text-white text-sm md:text-5xl pt-5">Vegetative Stage</h2>
          </div>
          <div className="flex flex-col items-center justify-center w-full pt-4  md:pb-2 ">
            <h2 className="text-white text-sm md:text-3xl">Irrigation Status: Close</h2>
            <button className="bg-green-500 text-white font-semibold px-4 py-1 rounded-md">
              <h1 className="md:text-xl text-sm">Open Gate</h1>
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row w-full gap-4">
  {/* Progress Tracking Section */}
  <div className="w-full md:w-1/4 bg-gray-200 rounded-md p-4 h-[400px]">
    <ProgressTracking/>
  </div>

  {/* Weather Section */}
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
          <img
            src={currentWeather.icon}
            alt={currentWeather.description}
            className="w-20 h-20"
          />
          <div className="">
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
                    <img
                      src={day.icon}
                      alt={day.description}
                      className="w-10 h-10 md:w-10 md:h-10"
                    />
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

  {/* Soil Moisture & Water Level */}
  <div className="w-full md:w-1/4 flex flex-col gap-4">
    <div className="bg-slate-900 text-white rounded-md p-4 flex items-center justify-between">
      <h1 className="text-xl">Water Level</h1>
      <div className="flex items-center">
        <span className="text-3xl font-bold">80</span>
        <span className="ml-1 text-lg">cm</span>
      </div>
    </div>
    <div className="bg-slate-900 text-white rounded-md p-4 flex items-center justify-between">
      <h1 className="text-xl">Soil Moisture</h1>
      <div className="flex items-center">
        <span className="text-3xl font-bold">50</span>
        <span className="ml-1 text-lg">%</span>
      </div>
    </div>
  </div>
</div>
      </main>
    </div>
  );
};

export default HomePage;
