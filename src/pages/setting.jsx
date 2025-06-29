import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import Sidebar from "../component/sidebar";
import { auth } from "../firebase";
import {
  updateProfile,
  updatePassword,
  signOut,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUsername(user.displayName || "");
      setPhotoURL(user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png");
    }
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleChangeName = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName,
      });
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateProfile(auth.currentUser, { photoURL: url });
      setPhotoURL(url);
      alert("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isOpen} />

      <main className="p-2 lg:ml-64 bg-gray-300">
        <div className="flex items-center justify-center min-h-screen bg-gray-300">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col items-center">
              <img
                src={photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-2 border-2 border-gray-400"
              />
              <label
                htmlFor="profile-pic-upload"
                className="text-sm text-blue-600 hover:underline cursor-pointer mb-4"
              >
                Edit Photo
              </label>
              <input
                id="profile-pic-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <h2 className="text-lg font-semibold mb-4 text-center">
                {username.toUpperCase()}
              </h2>

              <div className="w-full space-y-1">
                <button
                  onClick={() => setShowNameModal(true)}
                  className="w-full bg-gray-200 border border-black px-4 py-2 text-left"
                >
                  Change Name
                </button>
                <button
                  onClick={() => setShowPassModal(true)}
                  className="w-full bg-gray-200 border border-black px-4 py-2 text-left"
                >
                  Change Password
                </button>
                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full bg-gray-200 border border-black px-4 py-2 text-left"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showNameModal && (
        <Modal title="Change Name">
          <input
            type="text"
            placeholder="New username"
            className="w-full border p-2 mb-4 rounded"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setShowNameModal(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeName}
              className="bg-blue-600 text-white px-4 py-2 rounded"
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
            className="w-full border p-2 mb-2 rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full border p-2 mb-4 rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setShowPassModal(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showLogoutModal && (
        <Modal title="Log Out">
          <p className="mb-4">Are you sure you want to log out?</p>
          <div className="flex justify-between gap-2">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Log Out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Move Modal function outside of return
function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default Setting;
