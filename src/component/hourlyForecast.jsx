import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const HourlyForecast = ({ hourlyForecast }) => {
  if (!hourlyForecast || hourlyForecast.length === 0) {
    return <p className="text-center text-white">No hourly forecast data available.</p>;
  }

  // Prepare data for the hourly forecast graph
  const chartData = {
    labels: hourlyForecast.map((hour) => hour.time),
    datasets: [
      {
        label: "Temperature (°C)",
        data: hourlyForecast.map((hour) => hour.temp),
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          font: { size: 14 },
        },
      },
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: { size: 12 },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-xl md:text-2xl font-semibold text-center text-white mb-4">Hourly Forecast</h2>
      <div className="h-64 md:h-[350px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default HourlyForecast;
