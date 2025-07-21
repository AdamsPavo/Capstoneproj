import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Check if username already exists
      const usernameRef = doc(db, "users", formData.name);
      const docSnap = await getDoc(usernameRef);

      if (docSnap.exists()) {
        setError("Username is already taken. Please choose another.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Update display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });

      // Save user data in Firestore using name as doc ID
      await setDoc(doc(db, "users", formData.name), {
        uid: userCredential.user.uid,
        email: formData.email,
        createdAt: new Date(),
      });

      navigate("/signin");
    } catch (error) {
      setError("Failed to create an account. Please try again.");
      console.error("Signup Error:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Create your Account
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type={showPassword.password ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("password")}
            className="absolute inset-y-0 right-3 pt-7 flex items-center text-gray-500 focus:outline-none"
          >
            {showPassword.password ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="mb-6 relative">
          <label className="block text-gray-700 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-300"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility("confirmPassword")}
            className="absolute inset-y-0 right-3 pt-7 flex items-center text-gray-500 focus:outline-none"
          >
            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring focus:ring-indigo-300"
        >
          Sign Up
        </button>
        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;
