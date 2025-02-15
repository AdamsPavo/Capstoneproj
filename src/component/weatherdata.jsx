import { useState, useEffect } from "react";
import axios from "axios";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const useWeatherData = (location) => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [weeklyForecast, setWeeklyForecast] = useState([]);
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "default_fallback_key";
  const API_URL_CURRENT = "https://api.openweathermap.org/data/2.5/weather";
  const API_URL_FORECAST = "https://api.openweathermap.org/data/2.5/forecast";

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!location || !user) return;

    const fetchWeatherData = async () => {
      try {
        // Fetch current weather
        const currentResponse = await axios.get(API_URL_CURRENT, {
          params: { q: location, units: "metric", appid: API_KEY },
        });

        const newWeatherData = {
          temp: currentResponse.data.main.temp,
          description: currentResponse.data.weather[0].description,
          humidity: currentResponse.data.main.humidity,
          timestamp: new Date().toISOString(),
        };

        setCurrentWeather({
          ...newWeatherData,
          icon: `https://openweathermap.org/img/wn/${currentResponse.data.weather[0].icon}@2x.png`,
        });

        // Save to Firestore only if there's a significant change
        const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");
        const q = query(userWeatherRef, orderBy("timestamp", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        const lastWeatherData = querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() : null;

        if (!lastWeatherData || lastWeatherData.description !== newWeatherData.description || lastWeatherData.temp !== newWeatherData.temp) {
          await addDoc(userWeatherRef, newWeatherData);
        }

        // Fetch forecast data
        const forecastResponse = await axios.get(API_URL_FORECAST, {
          params: { q: location, units: "metric", appid: API_KEY },
        });

        // Extract hourly forecast (next 12 hours)
        const hourlyData = forecastResponse.data.list.slice(0, 12).map((entry) => ({
          time: new Date(entry.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: entry.main.temp,
        }));
        setHourlyForecast(hourlyData);

        // Extract weekly forecast (7 days)
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
            if (weeklyData.length === 8) break;
          }
        }
        setWeeklyForecast(weeklyData);

        setError(null);
      } catch (err) {
        setError("Unable to fetch weather data. Please try again later.");
        setCurrentWeather(null);
        setWeeklyForecast([]);
        setHourlyForecast([]);
      }
    };

    // Fetch weather history in real-time
    const fetchWeatherHistoryRealTime = () => {
      if (!user) return () => {}; // Return an empty cleanup function if no user

      const userWeatherRef = collection(db, "users", user.uid, "weatherUpdates");
      const q = query(userWeatherRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setWeatherHistory(historyData);
      });

      return unsubscribe;
    };

    fetchWeatherData();
    const unsubscribeHistory = fetchWeatherHistoryRealTime();

    return () => unsubscribeHistory();
  }, [location, user]);

  return { currentWeather, weeklyForecast, hourlyForecast, weatherHistory, error };
};

export default useWeatherData;
