import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { FaCog, FaHistory } from "react-icons/fa";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { PiPlantBold } from "react-icons/pi";
import { RxActivityLog } from "react-icons/rx";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { BiSolidDashboard } from "react-icons/bi";
import { IoLogOutSharp } from "react-icons/io5";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current URL path

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
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
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/homepage"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <BiSolidDashboard />
          <Link to="/homepage">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Dashboard
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/weather"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <TiWeatherPartlySunny />
          <Link to="/weather">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Weather
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/plan"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <PiPlantBold />
          <Link to="/plan">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Planting Plan
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/activity"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <RxActivityLog />
          <Link to="/activity">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Activity
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/plantinghistory"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <FaHistory />
          <Link to="/plantinghistory">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Planting History
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/analytics"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <TbBrandGoogleAnalytics />
          <Link to="/analytics">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Analytics
            </span>
          </Link>
        </li>
        <li
          className={`flex items-center py-3 px-2 space-x-4 rounded cursor-pointer transition-all
            ${
              location.pathname === "/setting"
                ? "bg-blue-600 text-white"
                : "hover:bg-blue-600 hover:text-white"
            }`}
        >
          <FaCog />
          <Link to="/setting">
            <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
              Settings
            </span>
          </Link>
        </li>
        {/* Logout Button */}
        <li
          className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer hover:bg-red-600 hover:text-white"
          onClick={handleLogout}
        >
          <IoLogOutSharp />
          <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>
            Logout
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
