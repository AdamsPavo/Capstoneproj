import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { auth, db } from "../firebase";
import greenProf from "../assets/greenprof.jpg";
import {
  updateProfile,
  updatePassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaKey, FaSignOutAlt } from "react-icons/fa";

const Setting = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [deviceIP, setDeviceIP] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setPhotoURL(
        user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png"
      );

      // Fetch IP from Firestore
      const fetchIP = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.esp32ip) {
            setDeviceIP(data.esp32ip);
          }
        }
      };

      fetchIP();
    }
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleChangeName = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: newName });
      setUsername(newName);
      setNewName("");
      setShowNameModal(false);
    } catch (error) {
      alert("Failed to update name.");
      console.error(error);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      alert("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setShowPassModal(false);
    } catch (error) {
      alert("Failed to update password.");
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert("Failed to log out.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-6">
            <div className="flex flex-col items-center">
              <img src={greenProf} alt="Profile" className="w-46 h-46" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                {username.toUpperCase()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                🌐 Connected Device IP: <span className="font-semibold">{deviceIP || "Not Set"}</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowConnectModal(true)}
                className="w-full flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 font-semibold px-4 py-2 rounded-lg transition-all"
              >
                📡 Connect Device
              </button>
              <button
                onClick={() => setShowNameModal(true)}
                className="w-full flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <FaUserEdit className="text-blue-700" />
                Change Name
              </button>
              <button
                onClick={() => setShowPassModal(true)}
                className="w-full flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <FaKey className="text-yellow-700" />
                Change Password
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold px-4 py-2 rounded-lg transition-all"
              >
                <FaSignOutAlt className="text-red-700" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      </main>

      {showConnectModal && (
        <Modal title="Connect to Device">
          <div className="text-mb text-gray-600 mb-4 space-y-2">
            <p><b>Steps to connect your ESP32 device to Wi-Fi:</b></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Power on your ESP32 device.</li>
              <li>On your phone or laptop, go to Wi-Fi settings and connect to: <b>ESP32-Setup</b></li>
              <li>The defult Password is "12345678"</li>
              <li>Once connected, open a browser and go to: <b><a href="http://192.168.4.1" target="_blank" className="text-blue-600 underline">http://192.168.4.1</a></b></li>
              <li>Enter your Wi-Fi name (SSID) and password, then submit.</li>
              <li>The device will display its assigned IP address (copy this).</li>
              <li>Paste the IP address below to connect this app to the device.</li>
            </ol>
          </div>

          <input
            type="text"
            placeholder="Enter ESP32 IP Address"
            className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={deviceIP}
            onChange={(e) => setDeviceIP(e.target.value)}
          />
          <p className="text-sm text-gray-500 mb-2">
            Current IP: {deviceIP || "Not Set"}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowConnectModal(false)}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                const user = auth.currentUser;
                if (user) {
                  await setDoc(doc(db, "users", user.uid), {
                    esp32ip: deviceIP
                  }, { merge: true });

                  alert("✅ IP saved to your account!");
                  setShowConnectModal(false);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showNameModal && (
        <Modal title="Change Name">
          <input
            type="text"
            placeholder="New username"
            className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowNameModal(false)}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeName}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showPassModal && (
        <Modal title="Change Password">
          <input
            type="password"
            placeholder="New password"
            className="w-full border p-2 mb-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full border p-2 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPassModal(false)}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showLogoutModal && (
        <Modal title="Log Out">
          <p className="mb-4 text-gray-700">Are you sure you want to log out?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Log Out
            </button>
          </div>
        </Modal>
      )}

    </div>
  );
};

function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default Setting;
