import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../assets/logo.png";
import { Typewriter } from 'react-simple-typewriter';

function Hero() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Initially set to false

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoading(true); // Show loading screen only if user is signed in
        console.log("User already signed in. Redirecting to homepage.");
        setTimeout(() => {
          navigate("/homepage", { replace: true });
        }, 1500); // Loading screen duration
      }
    });

    return () => unsubscribe(); // Cleanup the listener
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <img
            src={logo}
            alt="Loading Logo"
            className="w-85 h-85 animate-spin"
          />
          <p className="text-lg text-gray-600 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-white px-4 md:px-8 lg:px-16 space-y-6 md:space-y-0 md:space-x-8">

        <div className="flex items-center justify-center md:w-1/2 mb-6 md:mb-0">
          <img
            src={logo}
            alt="P-Tubigan Logo"
            className="w-100 h-100 md:w-200 md:h-200 sm:w-30 sm:h-30"
          />
        </div>
        <div className="text-center md:text-left md:w-1/2">
          <h1 className="text-2xl md:text-6xl sm:text-6xl font-bold text-black mb-4">
            Let’s revolutionize rice farming together
          </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-green-700 font-semibold mt-2 sm:mt-4 pb-2 sm:pb-4 text-center sm:text-left">
          <Typewriter
            words={['Stay smart, save water, and grow better.']}
            loop={false}
            cursor
            cursorStyle="|"
            typeSpeed={60}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </p>


          <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-4 md:justify-start">
            <Link to="/signin">
              <button className="px-4 py-2 w-40 h-10 text-md font-semibold border border-green-600 text-green-600 rounded-2xl hover:bg-green-200 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 w-40 h-10 text-md font-semibold bg-green-600 text-white rounded-2xl hover:bg-green-800 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero;
