import { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const useWeatherData = (location) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "default_fallback_key";
  const API_URL_CURRENT = "https://api.openweathermap.org/data/2.5/weather";
  const API_URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";

  const fetchWeatherData = async () => {
    try {
      const now = new Date();
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const minuteKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${hour}:${minutes}`;

      // Fetch current weather
      const currentResponse = await axios.get(API_URL_CURRENT, {
        params: {
          q: location,
          units: "metric",
          appid: API_KEY,
        },
      });

      // Extract and process weather info
      const temp = currentResponse.data.main.temp;
      const humidity = currentResponse.data.main.humidity;
      const description = currentResponse.data.weather[0].description.toLowerCase();
      const icon = currentResponse.data.weather[0].icon;

      let advisoryText = "weather looks normal.Visit the website to monitor your farm.";
      if (description.includes("heavy rain") || description.includes("thunderstorm")) {
        advisoryText = " Heavy rain expected! Turn off irrigation to prevent waterlogging and crop damage.";
      } else if (temp >= 38 && humidity >= 40) {
        advisoryText = "Hot weather alert! Activate irrigation to prevent drought stress on your crops.";
      }

      const weatherInfo = {
        temp,
        description,
        humidity,
        icon: `https://openweathermap.org/img/wn/${icon}@2x.png`,
        timestamp: now.toISOString(),
        notified: false,
        advisory: advisoryText, // Include in Firestore
      };

      setCurrentWeather(weatherInfo);

      // Push notification trigger (8:00 or 12:29)
      const isTargetTime = (hour === 8 || hour === 18) && minutes === 30;
      const lastNotified = localStorage.getItem("lastWeatherNotification");
      const user = auth.currentUser;

      if (isTargetTime && lastNotified !== minuteKey && user) {
        weatherInfo.notified = true;

        const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");
        await addDoc(userWeatherRef, weatherInfo);

        if (Notification.permission === "granted") {
          const notificationBody = `Temp: ${temp}°C\n Humidity: ${humidity}%\n ${description}\n ${advisoryText}`;
          new Notification("🌦 Weather Advisory", {
            body: notificationBody,
            icon: weatherInfo.icon,
          });
        }

        localStorage.setItem("lastWeatherNotification", minuteKey);
      }

      // Forecast: hourly
      const forecastResponse = await axios.get(API_URL_FORECAST, {
        params: { q: location, units: "metric", appid: API_KEY },
      });

      const hourlyData = forecastResponse.data.list.slice(0, 12).map((entry) => ({
        time: new Date(entry.dt_txt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temp: entry.main.temp,
      }));
      setHourlyForecast(hourlyData);

      // Forecast: daily
      const weeklyData = [];
      const uniqueDays = new Set();
      for (const entry of forecastResponse.data.list) {
        const date = new Date(entry.dt_txt).toDateString();
        if (!uniqueDays.has(date)) {
          uniqueDays.add(date);
          weeklyData.push({
            date,
            temp: entry.main.temp,
            description: entry.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`,
          });
          if (weeklyData.length === 7) break;
        }
      }
      setWeeklyForecast(weeklyData);
      setError(null);
    } catch (err) {
      console.error("Weather fetch error:", err);
      setError("Unable to fetch weather data.");
      setCurrentWeather(null);
      setWeeklyForecast([]);
      setHourlyForecast([]);
    }
  };

  useEffect(() => {
    if (!location) return;

    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    fetchWeatherData(); // Initial fetch

    const interval = setInterval(() => {
      fetchWeatherData();
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [location]);

  return {
    currentWeather,
    weeklyForecast,
    hourlyForecast,
    error,
  };
};

export default useWeatherData;
