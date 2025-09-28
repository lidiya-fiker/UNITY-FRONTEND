import { API_URL } from "@/config/api";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) return;

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const userId = decoded.id; // ✅ Now this works!
        console.log(userId);
        const res = await axios.get(`${API_URL}/clients/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched profile:", res.data); // ⬅️ Add this
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Sample notifications
  const notifications = [
    {
      id: 1,
      text: "hello abebe, here is your session link join and build a healthy relationship. https://www.figma.com/design/...",
    },
    {
      id: 2,
      text: "New Session Booked: Client Melos has scheduled a session for April 6 at 2:00 PM.",
    },
    {
      id: 3,
      text: "You have a session with Counselor Helen tomorrow at 10:00 AM.",
    },
    {
      id: 4,
      text: "lorem ipsum",
    },
    {
      id: 5,
      text: "hello , counselor you have registered successfully!!",
    },
  ];

  // Sample clients for selection and display
  const users = [
    "counselor Abebe Kebede",
    "client Abebe Kebede",
    "client Abebe Kebede",
    "client Abebe Kebede",
    "Melos Werkuk",
    "Melos Werkuk",
    "Melos Werkuk",
    "Helen Tesfaye",
    "Sara Alemu",
    "Daniel Bekele",
  ];

  // Notification Bell component
  function NotificationBell({ onClick }) {
    return (
      <button
        onClick={onClick}
        className="relative focus:outline-none"
        aria-label="Show notifications"
        title="Notifications">
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
      </button>
    );
  }

  // User Icon component
  function UserIcon({ onClick }) {
    return (
      <img
        src="../../../asset/userDefault.png"
        alt="User Profile"
        className="w-10 h-10 rounded-full border cursor-pointer hover:ring-2 hover:ring-purple-600 transition"
        onClick={onClick}
        title="Go to Register Counselor"
      />
    );
  }

  // Notification Card with message field and recipient select
  function NotificationCard({ show }) {
    if (!show) return null;

    return (
      <div className="absolute right-8 top-16 w-96 bg-white rounded-xl shadow-lg p-5 z-50 border border-gray-200 flex flex-col">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          Notifications{" "}
          <span role="img" aria-label="bell">
            🔔
          </span>
        </h2>
        <div className="space-y-2 max-h-52 overflow-y-auto mb-4 pr-1">
          {notifications.map((note) => (
            <div
              key={note.id}
              className="bg-gray-100 rounded p-2 text-sm break-words">
              {note.text}
            </div>
          ))}
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
          onClick={() => navigate("/adminDashboard")}
          title="dashboard">
          DashBoard
        </li>
        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => navigate("/counselor-posts")}
          title="counselor Posts">
          Counselor Posts
        </li>

        <li
          className="cursor-pointer hover:text-purple-700 transition"
          onClick={() => alert("Logout clicked")}
          title="Logout">
          Logout
        </li>
        <li>
          <NotificationBell onClick={() => setShowNotifications((s) => !s)} />
        </li>
        <li
          onClick={() => navigate("/client-complete-profile")}
          className="cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold text-lg uppercase">
            A
          </div>
        </li>
      </ul>

      <NotificationCard show={showNotifications} />
    </nav>
  );
};

export default Navbar;
