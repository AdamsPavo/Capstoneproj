import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { Link } from "react-router-dom";
import logo from '../assets/logo.png'

const createPlan = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar isOpen={isOpen} />

      {/* Main Content */}
      <main className="p-2 lg:ml-64">
       
      <div className="flex flex-col items-center justify-center h-screen w-full bg-gray-50 p-4">

        <img
                  src={logo}
                  alt="P-Tubigan Logo"
                  className="w-[150px] h-[150px] md:w-200 md:h-200"
                />
        <h1 className="text-4xl font-bold text-start text-black mb-6">Start Your Rice Farming Journey</h1>
        <p className="text-sm text-gray-600 text-justify mb-8">
          To get started on your rice farming journey, the first step is to create a detailed planting plan. 
          This will help you organize your planting schedule, manage resources effectively, and ensure optimal growth. 
          Click the button below to begin your customized planting plan and set the foundation for a successful crop season.
        </p>
        <Link to="/farmingplan">
          <button className="bg-blue-600 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none">
            Create Plan
          </button>
        </Link>
     
    </div>
       
      </main>
    </div>
  );
};

export default createPlan;
