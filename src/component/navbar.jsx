import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import Sidebar from "../component/sidebar";
import logo from '../assets/logo.png'

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <nav className="bg-blue-500 p-1 flex justify-between items-center lg:hidden">

  
      <img src={logo} alt="P-Tubigan Logo" className="w-12 h-12" />

    
      <h1 className="text-white text-3xl font-bold flex-grow text-center">
        PATUBIGAN
      </h1>

      
      <button
        onClick={toggleSidebar}
        className="text-white text-2xl"
      >
        <FaBars />
      </button>
</nav>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default Navbar;
