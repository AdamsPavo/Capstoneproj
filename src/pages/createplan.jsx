import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";

function FarmingPlan() {
  // State for date fields
  const [startDate, setStartDate] = useState(null);
  const [firstApplication, setFirstApplication] = useState(null);
  const [secondApplication, setSecondApplication] = useState(null);
  const [thirdApplication, setThirdApplication] = useState(null);

  return (

    <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Sidebar />
        {/* Main Content */}
        <main className="p-2 lg:ml-64 bg-gray-300">

    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Create your farming plan</h2>
        <p className="text-gray-600 text-center mb-6">Provide farming details</p>
        <form>
          {/* Rice Variety */}
          <div className="mb-4">
            <label
              htmlFor="rice-variety"
              className="block text-sm font-medium text-gray-700"
            >
              Rice Variety:
            </label>
            <input
              type="text"
              id="rice-variety"
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter rice variety"
              required
            />
          </div>

          {/* Planting Method */}
          <div className="mb-4">
            <label
              htmlFor="planting-method"
              className="block text-sm font-medium text-gray-700"
            >
              Planting Method
            </label>
            <select
              id="planting-method"
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="direct" className="bg-blue-500 text-white">Direct</option>
              <option value="transplanting" className="bg-blue-500 text-white">Transplanting</option>
            </select>
          </div>

          {/* Planting Start Date */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
            >
              Planting Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select a date"
              required
            />
          </div>

          {/* Fertilizer Application Dates */}
          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
            >
              Fertilizer Application Date - First Application:
            </label>
            <DatePicker
              selected={firstApplication}
              onChange={(date) => setFirstApplication(date)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select a date"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
            >
              Second Application:
            </label>
            <DatePicker
              selected={secondApplication}
              onChange={(date) => setSecondApplication(date)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select a date"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700"
            >
              Third Application: (Optional)
            </label>
            <DatePicker
              selected={thirdApplication}
              onChange={(date) => setThirdApplication(date)}
              className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholderText="Select a date"
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            >
              Start Growing
            </button>
          </div>
        </form>
      </div>
    </div>
    /</main>
  </div>
  );
}

export default FarmingPlan;
