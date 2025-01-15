import React from "react";
import logo from "../assets/logo.png";
import { FaCog, FaHistory } from "react-icons/fa";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { PiPlantBold } from "react-icons/pi";
import { RxActivityLog } from "react-icons/rx";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { BiSolidDashboard } from "react-icons/bi";
import { IoLogOutSharp } from "react-icons/io5";
import { signOut } from "firebase/auth"; // Import the signOut method
import { auth } from "../firebase"; // Import the Firebase auth instance
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully");
      navigate("/"); // Redirect to the login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Sidebar - Only visible when `isOpen` is true */}
      <div
        className={`fixed top-0 left-0 h-full bg-white text-black z-50
        border-r border-gray-300 dark:border-gray-600 transition-all duration-300
        ${isOpen ? "w-64" : "w-0"} md:w-64`}
      >
        <div className="flex items-center space-x-2 mt-4 px-4">
          <img src={logo} alt="P-Tubigan Logo" className="w-12 h-12" />
          <h1
            className={`${
              isOpen ? "block" : "hidden"
            } md:block text-2xl font-bold text-left italic`}
          >
            PATUBIGAN
          </h1>
        </div>

        <ul className="flex flex-col mt-5 text-xl">
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <BiSolidDashboard />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Dashboard
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <TiWeatherPartlySunny />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Weather
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <PiPlantBold />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Planting plan
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <RxActivityLog />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Activity
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <FaHistory />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Planting history
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <TbBrandGoogleAnalytics />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Analytics
            </span>
          </li>
          <li className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer hover:bg-blue-600 hover:text-white">
            <FaCog />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Settings
            </span>
          </li>
          {/* Logout Button */}
          <li
              
            className="flex items-center py-3 px-2 space-x-4 hover:rounded hover:cursor-pointer"
            onClick={handleLogout}
          >
            <IoLogOutSharp />
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Logout</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
