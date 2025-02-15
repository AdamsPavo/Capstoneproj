import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";




const PlantingHistory = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />
      
        {/* Main Content */}
      <main className="p-2 lg:ml-64 bg-gray-300">
            <h1>PalntingHistory</h1>
      </main>
    </div>
  );
};

export default PlantingHistory;
