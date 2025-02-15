import React, { useEffect, useState } from "react";
import { IoIosNotifications } from "react-icons/io";
import { Link } from "react-router-dom";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const NotificationBadge = () => {
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Firestore query to fetch unread notifications
        const notificationsRef = collection(db, "users", user.uid, "weatherUpdates");
        const q = query(notificationsRef, where("read", "==", false), orderBy("timestamp", "desc"));

        const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
          setNewNotificationsCount(snapshot.size); // Set the count of unread notifications
        });

        return () => unsubscribeFirestore();
      }
    });


    return () => unsubscribeAuth();
  }, []);

  const handleClick = async () => {
    if (!user) return;

    // Mark notifications as read in Firestore
    const notificationsRef = collection(db, "users", user.uid, "weatherUpdates");
    const q = query(notificationsRef, where("read", "==", false));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (docSnap) => {
      const notificationDocRef = doc(db, "users", user.uid, "weatherUpdates", docSnap.id);
      await updateDoc(notificationDocRef, { read: true }); // Mark as read
    });

    setNewNotificationsCount(0); // Reset badge
  };

  return (
    <Link to="/notification" onClick={handleClick}>
      <button className="relative ml-auto">
        <IoIosNotifications className="w-[22px] h-[22px] sm:w-[35px] sm:h-[35px] md:w-[40px] md:h-[40px]" />
        {newNotificationsCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center w-5 h-5">
            {newNotificationsCount}
          </span>
        )}
      </button>
    </Link>
  );
};

export default NotificationBadge;
