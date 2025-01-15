import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import logo from "../assets/logo.png";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/createplan"); // Redirect to homepage after successful login
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error("SignIn Error:", error);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center h-screen bg-white mt-10">
        <div className="flex items-center justify-center md:w-1/2 mb-6 md:mb-0">
          <img
            src={logo}
            alt="P-Tubigan Logo"
            className="w-50 h-50 md:w-200 md:h-200"
          />
        </div>
        <div className="flex flex-col items-center justify-center md:w-1/2 bg-white h-full p-8 rounded-l-lg">
          <h1 className="text-3xl md:text-5xl font-bold text-black mb-8">
            Sign In your Account
          </h1>

          <form className="w-full max-w-md" onSubmit={handleSignIn}>
            {/* Email Field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
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
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="shadow appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300 w-full py-2 px-3 text-gray-700 leading-tight"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

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
    </>
  );
}

export default SignIn;
