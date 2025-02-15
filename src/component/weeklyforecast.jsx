import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { color } from "chart.js/helpers";

// Register the required chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WeeklyWeatherGraph = ({ weeklyForecast }) => {
  // Prepare data for the chart
  const labels = weeklyForecast.map((day) =>
    new Date(day.date).toLocaleDateString("en-US", { weekday: "long" })
  );
  const temperatures = weeklyForecast.map((day) => day.temp);

  // Chart data configuration
  const data = {
    labels: labels, // Day names
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatures,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  // Chart options configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Weekly Forecast",
        font: {
          size: 18,
          color: "white",
        },
        color: "white", // Title color
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="h-64 md:h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyWeatherGraph;
