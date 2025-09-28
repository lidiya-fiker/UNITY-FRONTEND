import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultUser from "../../../asset/userDefault.png";
import { API_URL } from "@/config/api";

const Navbar = () => {
  interface MyJwtPayload {
    id: string;
    email: string;
    [key: string]: unknown;
  }

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const cardRef = useRef(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const userId = decoded.id; // ✅ Now this works!
        setUserId(userId);
        const res = await axios.get(`${API_URL}/counselors/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch notifications (initial + polling)
  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");

    const fetchAllNotifications = async () => {
      try {
        const res = await fetch(
          `${API_URL}/notifications?role=COUNSELOR&userId=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const all = await res.json();
        setNotifications(all);

        const unread = all.filter((n) => !n.isRead);
        setNotificationCount(unread.length); // ✅ Only unread count
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchAllNotifications();

    const interval = setInterval(fetchAllNotifications, 5000); // poll every 10s
    return () => clearInterval(interval);
  }, [userId]);

  // Close notification card on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as read when opened
  useEffect(() => {
    if (!showNotifications || notificationCount === 0) return;

    const markAsRead = async () => {
      try {
        await fetch(`${API_URL}/notifications/mark-read`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId, role: "COUNSELOR" }),
        });

        setNotificationCount(0); // ✅ Clear after marking
        // Optional: also update the notification list to reflect isRead = true
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    };

    markAsRead();
  }, [showNotifications]);

  // Notification Bell component
  function NotificationBell({ onClick }) {
    return (
      <button onClick={onClick} className="relative focus:outline-none">
        <svg
          className="w-7 h-7 text-gray-700 hover:text-purple-700 transition"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>
    );
  }

  // Notification Card with message field and recipient select
  function NotificationCard({ show }) {
    if (!show) return null;

    return (
      <div
        ref={cardRef}
        className="absolute right-8 top-16 w-96 bg-white rounded-xl shadow-lg p-5 z-50 border border-gray-200 flex flex-col">
        <h2 className="font-semibold text-lg mb-3">Notifications 🔔</h2>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications yet.</p>
          ) : (
            notifications.map((note, i) => (
              <div
                key={i}
                className={`rounded p-3 text-sm ${
                  note.isRead ? "bg-gray-100" : "bg-purple-100 font-semibold"
                }`}>
                {note.message}
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(note.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
  return (
    <nav className="bg-white shadow flex items-center justify-between px-8 py-4 sticky top-0 z-50">
      {/* Left side - logo */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex place-items-end ml-10">
          <div className=" rounded-full p-1 ">
            <img
              src="/src/asset/logo.png"
              alt="Unity Logo"
              className="h-12 w-max"
            />
          </div>
        </Link>
      </div>

      {/* Right side - nav items */}
      <ul className="flex items-center gap-8 text-gray-700 font-medium">
        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => navigate("/counselor-dashboard")}
          title="dashboard">
          DashBoard
        </li>
        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => navigate("/counselor-articles")}
          title="Your Posts">
          Your Posts
        </li>
        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => navigate("/calendar")}
          title="setavailablity">
          set Availablity
        </li>
        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => navigate("/")}
          title="Logout">
          Logout
        </li>
        <li>
          <NotificationBell onClick={() => setShowNotifications((s) => !s)} />
        </li>

        <li
          onClick={() => navigate("/counselor/complete-profile")}
          className="cursor-pointer">
          <img
            src={
              profile?.profilePicture
                ? `${API_URL}/uploads/profile-pictures/${profile.profilePicture}`
                : defaultUser
            }
            alt="P"
            className="w-10 h-10 rounded-full border object-cover"
          />
        </li>
      </ul>

      <NotificationCard show={showNotifications} />
    </nav>
  );
};

export default Navbar;
