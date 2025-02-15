import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import useWeatherData from "../component/weatherdata";
import HourlyForecast from "../component/hourlyForecast";
import WeeklyWeatherGraph from "../component/weeklyforecast"; // Import the new graph component

const Weather = () => {
  const [isOpen, setIsOpen] = useState(false);
  const LOCATION = "Compostela";
  const { currentWeather, weeklyForecast, hourlyForecast, error } = useWeatherData(LOCATION);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <main className="p-4 lg:ml-64 bg-gray-600">
        <h1 className="text-3xl text-white font-bold text-center mb-4">Weather Forecast</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Current Weather */}
        {currentWeather && (
          <div className="mb-6 text-center text-white bg-gray-900 rounded-md">
            <h2 className="text-2xl font-semibold">{LOCATION}</h2>
            <p className="text-sm text-gray-300">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="flex items-center justify-center mt-4">
              <img
                src={currentWeather.icon}
                alt={currentWeather.description}
                className="w-16 h-16"
              />
              <div className="ml-4">
                <p className="text-2xl font-bold">{currentWeather.temp}°C</p>
                <p className="capitalize">{currentWeather.description}</p>
              </div>
            </div>
          </div>
        )}

  <div className="flex flex-col md:flex-row  w-full">
        <div className="w-full md:mr-1">
        {/* Hourly Forecast */}
        <HourlyForecast hourlyForecast={hourlyForecast} />
        </div>
        <div className="w-full md:ml-1 mt-2 md:mt-0">
          {/* Weekly Weather Graph */}
          {weeklyForecast.length > 0 && (
            <div className="mb-6">
              <WeeklyWeatherGraph weeklyForecast={weeklyForecast} />
            </div>
          )}
        </div>
  </div>
       

        

        {/* Weekly Forecast Cards (Optional if you want to keep both) */}
        {weeklyForecast.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold text-center text-white mb-4">Weekly Forecast</h2>
            <div className="flex overflow-x-auto gap-4 justify-center items-center bg-gray-900 rounded-md p-5">
              {weeklyForecast.map((day, index) => (
                <div
                  key={index}
                  className="bg-blue-50 p-4 rounded-xl shadow-md flex flex-col items-center flex-shrink-0"
                  style={{ minWidth: "150px" }} // Ensures the cards have a consistent size
                >
                  <p className="text-gray-700 font-medium">{day.date}</p>
                  <img src={day.icon} alt={day.description} className="w-16 h-16" />
                  <p className="text-gray-800 font-semibold text-lg">{day.temp}°C</p>
                  <p className="text-gray-600 capitalize">{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Weather;
