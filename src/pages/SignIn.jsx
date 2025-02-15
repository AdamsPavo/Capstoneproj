import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Import Firestore instance
import logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // Get the logged-in user's ID
  
      console.log("User ID:", userId);
  
      // Corrected Firestore path for farmingPlans as a subcollection under users/{userId}
      const plansRef = collection(db, `users/${userId}/farmingPlans`);
      const q = query(plansRef);
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        console.log("Plan found. Redirecting to homepage.");
        navigate("/homepage"); // Redirect if a plan exists
      } else {
        console.log("No plan found. Redirecting to create plan.");
        navigate("/createplan"); // Redirect to create a plan if none exists
      }
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("SignIn Error:", error.message);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-white">
      <div className="flex items-center justify-center md:w-1/2 mb-6 md:mb-0">
        <img src={logo} alt="P-Tubigan Logo" className="w-[250px] md:w-[500px]" />
      </div>
      <div className="flex flex-col items-center justify-center bg-gray-300 shadow-lg p-8 rounded-l-lg">
        <h1 className="text-3xl md:text-5xl font-bold text-black mb-8">Sign In to Your Account</h1>

        <form className="w-full max-w-md" onSubmit={handleSignIn}>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="shadow appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300 w-full py-2 px-3 text-gray-700 leading-tight"
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="shadow appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300 w-full py-2 px-3 text-gray-700 leading-tight"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 pt-7 flex items-center text-gray-500 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Sign In Button */}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded 
              focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign In
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-500 mt-4">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
