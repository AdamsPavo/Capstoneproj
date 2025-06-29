import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { db } from "../firebase";

const Analytics = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [varietyData, setVarietyData] = useState([]);
  const [methodData, setMethodData] = useState([]);
  const [harvestTimeline, setHarvestTimeline] = useState([]);
  const [summary, setSummary] = useState({
    totalHarvest: 0,
    topHarvest: 0,
    prevHarvest: 0,
    latestHarvest: 0,
    percentageChange: 0,
    trendSymbol: "",
    averageYieldPerCycle: 0,
  });

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchHarvestData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      try {
        const harvestRef = collection(db, `users/${user.uid}/harvestData`);
        const querySnapshot = await getDocs(harvestRef);

        let data = [];
        let varietyMap = {};
        let methodMap = {};
        let timelineMap = {};

        querySnapshot.forEach((doc) => {
          const { riceVariety, harvestAmount, plantingMethod, harvestDate } = doc.data();
          data.push({ riceVariety, yield: harvestAmount, plantingMethod, date: harvestDate });

          // Group by rice variety
          varietyMap[riceVariety] = (varietyMap[riceVariety] || 0) + harvestAmount;

          // Group by planting method
          methodMap[plantingMethod] = (methodMap[plantingMethod] || 0) + harvestAmount;

          // Group by harvest timeline (Month-Year)
          const formattedDate = new Date(harvestDate).toLocaleString('default', { month: 'short', year: 'numeric' });
          timelineMap[formattedDate] = (timelineMap[formattedDate] || 0) + harvestAmount;
        });

        data.sort((a, b) => new Date(b.date) - new Date(a.date));


        setVarietyData(Object.entries(varietyMap).map(([variety, yieldVal]) => ({ variety, yield: yieldVal })));
        setMethodData(Object.entries(methodMap).map(([method, yieldVal]) => ({ method, yield: yieldVal })));
        setHarvestTimeline(Object.entries(timelineMap).map(([date, yieldVal]) => ({ date, yield: yieldVal })));

        // Calculate summary values
        const totalHarvest = data.reduce((sum, item) => sum + item.yield, 0);
        const topHarvest = Math.max(...data.map((item) => item.yield), 0);
        const latestHarvest = data.length > 0 ? data[0].yield : 0;
        const prevHarvest = data.length > 1 ? data[1].yield : 0;

        const averageYieldPerCycle = data.length > 0 ? (totalHarvest / data.length).toFixed(2) : 0;

        let percentageChange = 0;
        let trendSymbol = "";

        if (prevHarvest > 0) {
          percentageChange = ((latestHarvest - prevHarvest) / prevHarvest) * 100;
          trendSymbol = percentageChange >= 0 ? "↑" : "↓";
        }

        setSummary({ totalHarvest, topHarvest, latestHarvest, prevHarvest, percentageChange, averageYieldPerCycle });

      } catch (error) {
        console.error("Error fetching harvest data:", error);
      }
    };

    fetchHarvestData();
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50"];


  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-4 lg:ml-64 bg-gray-300">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>

        {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-gray-600 text-sm uppercase">{key.replace(/([A-Z])/g, " $1")}</h2>
            <p className="text-2xl font-bold">
              {value}{key === "latestHarvest" && (
                <span className={summary.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {summary.trendSymbol}      {summary.percentageChange.toFixed(2)}%
                </span>
              )}
            </p>
          </div>
        ))}
        
      </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Bar Chart - Harvest by Variety */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-bold mb-2 text-center">Harvest by Variety</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={varietyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="variety" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="yield">
              {varietyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>


          {/* Pie Chart - Harvest by Planting Method */}
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center w-full">
            {/* Title */}
            <h2 className="text-lg font-bold mb-4 w-full text-center">
              Harvest by Planting Method
            </h2>

            {/* Chart and Labels Container - Displayed in a row */}
            <div className="flex flex-col md:flex-row w-full items-center justify-center">
              {/* Pie Chart */}
              <div className="flex justify-center w-full md:w-1/2">
                <ResponsiveContainer width={250} height={300}>
                  <PieChart>
                    <Pie
                      data={methodData}
                      dataKey="yield"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {methodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Labels (Legend) beside the Pie Chart */}
              <div className="flex flex-col md:w-1/2 md:pl-6 space-y-2">
                {methodData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span
                      className="w-4 h-4 inline-block rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-sm font-medium">{entry.method}: <strong>{entry.yield} Sacks</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
            {/* Area Chart - Harvest Over Time */}
          <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-bold mb-2 text-center">Harvest Trend Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[...harvestTimeline]
                  .map((entry) => ({
                    ...entry,
                    date: new Date(entry.date), // Ensure date is converted to a Date object
                  }))
                  .sort((a, b) => a.date - b.date)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}
                />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value)} />
                <Legend />
                <Area type="monotone" dataKey="yield" stroke="#8884d8" fill="#8884d8" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

      </main>
    </div>
  );
};

export default Analytics;
