import React, { useState } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { IoIosNotifications } from "react-icons/io";
import ricebg from '../assets/ricebg.png';
import waterlevel from'../assets/water-level.png';
import moisture from '../assets/moisturizing.png';
import { LiaTemperatureLowSolid } from "react-icons/lia";

const HomePage = () => {
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
      <main className="p-2 lg:ml-64 bg-gray-300">
       
          <div className="flex w-full items-center h-max px-4 mb-2">
            <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl flex-grow pl-4 sm:pl-8 md:pl-12">
              Dashboard
            </h1>
            <button className="ml-auto">
              <IoIosNotifications className="w-[22px] h-[22px] sm:w-[35px] sm:h-[35px] md:w-[40px] md:h-[40px]" />
            </button>
          </div>
      <div
          className="flex flex-col w-full h-[150px] md:h-max bg-cover bg-no-repeat bg-center rounded-md mb-2"
          style={{
            backgroundImage: `url(${ricebg})`,
            backgroundSize: '100% 100%', // Stretches the image to fit the div
          }}
        >
          {/* Top section */}
          <div className="flex justify-between w-full h-max px-4 py-1">
            <span className="text-sm sm:text-2xl md:text-3xl text-white">Rice variety</span>

            <span className="flex items-center text-sm sm:text-2xl md:text-3xl text-white">
              38°C
              <LiaTemperatureLowSolid className=" w-5 h-5" />
            </span>
          </div>

          {/* Bottom section */}
          <div className="flex flex-col items-center justify-center w-full sm:h-[200px] md:h-[250px] lg:h-[300px]">
            <h1 className="text-4xl sm:text-6xl md:text-8xl text-white">DAY 1</h1>
            <h2 className="text-white text-sm md:text-5xl pt-5">Vegetative Stage</h2>
          </div>
          <div className="flex items-center justify-center w-full pt-5 pb-5">
            <h2 className="text-white text-sm md:text-4xl">Irregation Status: Close</h2>
          </div>

        </div>
        <div className=" flex flex-col md:flex-row">
            <div className="w-full h-[200px] md:h-[400px] bg-slate-900 rounded-md text-white">
              <h1>weather</h1>
            </div>
            <div className="flex  flex-row w-full h-max my-2 md:my-0">

            <div className="w-full flex flex-col h-[150px] md:h-[400px] bg-slate-900 mx-2 rounded-md text-white relative">
                    {/* Image positioned at top-right corner */}
                    <div className="absolute top-0 right-0 p-4">
                      <img
                        src={waterlevel}
                        alt="Water Level"
                        className="w-15 h-[40px] md:w-[100px] md:h-[100px]"
                      />
                    </div>

                    {/* Centered text: 80cm */}
                    <div className="flex flex-col justify-center items-center h-full">
                      <div>
                      <span className="text-6xl sm:text-4xl md:text-[150px]">80</span>
                      <span className="md:text-[50px]">cm</span>
                      </div>
                      <div className="flex h-max"> 
                      <h1 className="text-xl md:text-[50px]">Water Level</h1>
                      </div>
                     
                    </div>
            </div>
            <div className="w-full flex flex-col h-[150px] md:h-[400px] bg-slate-900 mx-2 rounded-md text-white relative">
                    {/* Image positioned at top-right corner */}
                    <div className="absolute top-0 right-0 p-4">
                      <img
                        src={moisture}
                        alt="Water Level"
                        className="w-15 h-[40px] md:w-[100px] md:h-[100px]"
                      />
                    </div>

                    {/* Centered text: 80cm */}
                    <div className="flex flex-col justify-center items-center h-full">
                      <div>
                      <span className="text-6xl sm:text-4xl md:text-[150px]">50</span>
                      <span className="md:text-[50px]">%</span>
                      </div>
                      <div className="flex h-max"> 
                      <h1 className="text-xl md:text-[50px]">Soil Moisture</h1>
                      </div>
                     
                    </div>
            </div>

              


            </div>
        </div>
        <div className="flex justify-between w-full h-max px-4 py-1">
           
            <button className="bg-red-800 w-full h-10 m-1 md:w-40 md:h-15 rounded-md">
              <p>Close</p>
            </button>
            <button className="bg-green-600 w-full h-10 m-1 md:w-40 md:h-15 rounded-md">
              <p>Open</p>
            </button>
          </div>
      
       
      </main>
    </div>
  );
};

export default HomePage;
