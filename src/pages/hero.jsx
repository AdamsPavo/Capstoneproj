import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../assets/logo.png";

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
      <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-white">
        <div className="flex items-center justify-center md:w-1/2 mb-6 md:mb-0">
          <img
            src={logo}
            alt="P-Tubigan Logo"
            className="w-100 h-100 md:w-200 md:h-200 sm:w-30 sm:h-30"
          />
        </div>
        <div className="text-center md:text-left md:w-1/2">
          <h1 className="text-2xl md:text-7xl sm:text-6xl font-bold text-black mb-4">
            Let’s revolutionize rice farming together
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Stay smart, save water, and grow better.
          </p>
          <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-y-0 md:space-x-4 md:justify-start">
            <Link to="/signin">
              <button className="px-4 py-2 w-40 h-10 text-md font-semibold border border-blue-500 text-blue-500 rounded-2xl hover:bg-blue-200 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <button className="px-4 py-2 w-40 h-10 text-md font-semibold bg-blue-500 text-white rounded-2xl hover:bg-blue-600 md:px-8 md:py-3 md:w-40 md:h-auto md:text-base">
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
