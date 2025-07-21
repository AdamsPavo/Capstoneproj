import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  const [harvestList, setHarvestList] = useState([]);
  const [selectedVariety, setSelectedVariety] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedHectare, setSelectedHectare] = useState("");

  const [summary, setSummary] = useState({
    totalHarvest: 0,
    topHarvest: 0,
    prevHarvest: 0,
    latestHarvest: 0,
    percentageChange: 0,
    trendSymbol: "",
    averageYieldPerCycle: 0,
  });

  const [avgTransplant, setAvgTransplant] = useState(0);
  const [avgDirect, setAvgDirect] = useState(0);

  const displayLabels = {
    totalHarvest: "Total Harvest (Sacks)",
    topHarvest: "Top Harvest (Sacks)",
    prevHarvest: "Previous Harvest (Sacks)",
    latestHarvest: "Latest Harvest (Sacks)",
    percentageChange: "Change from Previous (%)",
    averageYieldPerCycle: "Avg Yield per Cycle (Sacks)",
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;

      try {
        const harvestRef = collection(db, `users/${user.uid}/harvestData`);
        const querySnapshot = await getDocs(harvestRef);

        let data = [];
        let varietyMap = {};
        let methodMap = {};
        let timelineMap = {};
        let transplantTotal = 0, transplantCount = 0;
        let directTotal = 0, directCount = 0;

        querySnapshot.forEach((doc) => {
          const { riceVariety, harvestAmount, plantingMethod, harvestDate, hectareCoverage } = doc.data();
          data.push({ riceVariety, yield: harvestAmount, plantingMethod, date: harvestDate, hectare: hectareCoverage });

          varietyMap[riceVariety] = (varietyMap[riceVariety] || 0) + harvestAmount;
          methodMap[plantingMethod] = (methodMap[plantingMethod] || 0) + harvestAmount;

          const formattedDate = new Date(harvestDate).toLocaleString('default', { month: 'short', year: 'numeric' });
          timelineMap[formattedDate] = (timelineMap[formattedDate] || 0) + harvestAmount;

          if (plantingMethod.toLowerCase() === "transplanting") {
            transplantTotal += harvestAmount;
            transplantCount++;
          } else if (plantingMethod.toLowerCase() === "direct") {
            directTotal += harvestAmount;
            directCount++;
          }
        });

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        setVarietyData(Object.entries(varietyMap).map(([variety, yieldVal]) => ({ variety, yield: yieldVal })));
        setMethodData(Object.entries(methodMap).map(([method, yieldVal]) => ({ method, yield: yieldVal })));
        setHarvestTimeline(Object.entries(timelineMap).map(([date, yieldVal]) => ({ date, yield: yieldVal })));
        setHarvestList(data);

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

        setSummary({ totalHarvest, topHarvest, latestHarvest, prevHarvest, percentageChange, trendSymbol, averageYieldPerCycle });
        setAvgTransplant(transplantCount > 0 ? (transplantTotal / transplantCount).toFixed(2) : 0);
        setAvgDirect(directCount > 0 ? (directTotal / directCount).toFixed(2) : 0);
      } catch (error) {
        console.error("Error fetching harvest data:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const COLORS = ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"];

  const filteredHarvestList = harvestList.filter(entry => {
    const entryYear = new Date(entry.date).getFullYear();
    return (
      (selectedVariety === "" || entry.riceVariety === selectedVariety) &&
      (selectedMethod === "" || entry.plantingMethod === selectedMethod) &&
      (selectedYear === "" || entryYear === parseInt(selectedYear)) &&
      (selectedHectare === "" || String(entry.hectare) === selectedHectare)
    );
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-4 lg:ml-64 bg-gray-300">
        <h1 className="text-2xl font-bold mb-4"> Harvest Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(summary)
            .filter(([key]) => key !== "trendSymbol" && key !== "percentageChange")
            .map(([key, value]) => (
              <div key={key} className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-gray-600 text-sm uppercase">{displayLabels[key] || key}</h2>
                <p className="text-2xl font-bold">
                  {typeof value === "number" ? Number(value).toLocaleString() : value}
                  {key === "latestHarvest" && summary.prevHarvest > 0 && (
                    <span className={summary.percentageChange >= 0 ? "text-green-600" : "text-red-600"}>
                      {" "}{summary.trendSymbol} {summary.percentageChange.toFixed(2)}%
                    </span>
                  )}
                </p>
              </div>
            ))}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-lg font-bold mb-2 text-center"> Harvest Records (with Trends)</h2>

          <div className="flex flex-wrap gap-4 justify-center mb-4">
            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedVariety}
              onChange={(e) => setSelectedVariety(e.target.value)}
            >
              <option value="">All Varieties</option>
              {[...new Set(harvestList.map(item => item.riceVariety))].map((variety, index) => (
                <option key={index} value={variety}>{variety}</option>
              ))}
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="">All Methods</option>
              {[...new Set(harvestList.map(item => item.plantingMethod))].map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {[...new Set(harvestList.map(item => new Date(item.date).getFullYear()))].sort((a, b) => b - a)
                .map((year, index) => (
                  <option key={index} value={year}>{year}</option>
                ))}
            </select>

            <select
              className="border rounded px-3 py-2 text-sm"
              value={selectedHectare}
              onChange={(e) => setSelectedHectare(e.target.value)}
            >
              <option value="">All Hectares</option>
              {[...new Set(harvestList.map(item => item.hectare))].map((hectare, index) => (
                <option key={index} value={String(hectare)}>{hectare} ha</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
              <table className="table-auto w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Date</th>
                    <th className="px-4 py-2 border-b">Rice Variety</th>
                    <th className="px-4 py-2 border-b">Method</th>
                    <th className="px-4 py-2 border-b">Hectare</th>
                    <th className="px-4 py-2 border-b">Yield (Sacks)</th>
                    <th className="px-4 py-2 border-b">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHarvestList.map((entry, index) => {
                    const currYield = entry.yield;
                    const prevYield = filteredHarvestList[index + 1]?.yield;
                    let trend = "-";

                    if (prevYield !== undefined) {
                      const diff = currYield - prevYield;
                      const percent = ((diff / prevYield) * 100).toFixed(2);
                      const symbol = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
                      trend = `${symbol} ${percent}%`;
                    }

                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{entry.riceVariety}</td>
                        <td className="px-4 py-2">{entry.plantingMethod}</td>
                        <td className="px-4 py-2">{entry.hectare} ha</td>
                        <td className="px-4 py-2">{entry.yield.toLocaleString()}</td>
                        <td className={`px-4 py-2 font-bold ${trend.includes("↑") ? "text-green-600" : trend.includes("↓") ? "text-red-600" : "text-gray-600"}`}>{trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2 text-center">Harvest by Variety</h2>
            {varietyData.length === 0 ? <p className="text-center text-gray-500">No data available.</p> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varietyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="variety" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="yield" animationDuration={800}>
                    {varietyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

         <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center w-full">
            <h2 className="text-lg font-bold mb-4 w-full text-center"> Yield by Planting Method</h2>
            {methodData.length === 0 ? <p className="text-center text-gray-500">No data available.</p> : (
              <div className="flex flex-col md:flex-row w-full items-center justify-center">
                <div className="flex justify-center w-full md:w-1/2">
                  <ResponsiveContainer width={250} height={300}>
                    <PieChart>
                      <Pie data={methodData} dataKey="yield" nameKey="method" cx="50%" cy="50%" outerRadius={100} label>
                        {methodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col md:w-1/2 md:pl-6 space-y-2">
                  {methodData.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-4 h-4 inline-block rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                      <span className="text-sm font-medium">{entry.method}: <strong>{entry.yield.toLocaleString()} Sacks</strong></span>
                    </div>
                  ))}
                  <div className="mt-4 text-sm text-gray-700">
                    <p><b>Average harvest(Transplanting):</b> <strong className="text-yellow-500">{avgTransplant}</strong></p>
                    <p><b>Average harvest(Direct):</b> <strong className="text-yellow-500">{avgDirect}</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
          <h2 className="text-lg font-bold mb-2 text-center"> Yield Trend (Time Series)</h2>
          {harvestTimeline.length === 0 ? <p className="text-center text-gray-500">No data available.</p> : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={[...harvestTimeline].map((entry) => ({ ...entry, date: new Date(entry.date) })).sort((a, b) => a.date - b.date)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)} />
                <YAxis />
                <Tooltip labelFormatter={(value) => new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(value)} />
                <Legend />
                <Area type="monotone" dataKey="yield" stroke="#8884d8" fill="#8884d8" strokeWidth={2} animationDuration={1000} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>


      </main>
    </div>
  );
};

export default Analytics;
