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
  <li className={`${location.pathname === "/homepage" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/homepage" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <BiSolidDashboard />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Dashboard</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/weather" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/weather" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <TiWeatherPartlySunny />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Weather</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/plan" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/plan" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <PiPlantBold />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Planting Plan</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/activity" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/activity" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <RxActivityLog />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Activity Logs</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/plantinghistory" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/plantinghistory" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <FaHistory />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Planting History</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/analytics" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/analytics" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <TbBrandGoogleAnalytics />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Analytics</span>
    </Link>
  </li>

  <li className={`${location.pathname === "/setting" ? "bg-green-600 text-white" : "hover:bg-green-600 hover:text-white"}`}>
    <Link to="/setting" className="flex items-center py-3 px-2 space-x-4 rounded cursor-pointer w-full">
      <FaCog />
      <span className={`${isOpen ? "inline" : "hidden"} md:inline`}>Settings</span>
    </Link>
  </li>
</ul>

    </div>
  );
};

export default Sidebar;
