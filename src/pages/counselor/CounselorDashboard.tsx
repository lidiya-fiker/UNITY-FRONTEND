import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { IconPlus } from "@tabler/icons-react";
import Navbar from "./component/Navbar";
import { API_URL } from "@/config/api";

export default function CounselorDashboard() {
  interface MyJwtPayload {
    id: string;
    email: string;
    [key: string]: unknown;
  }
  // Sample clients for selection and display
  const clients = [
    "Abebe Kebede",
    "Abebe Kebede",
    "Abebe Kebede",
    "Abebe Kebede",
    "Melos Werkuk",
    "Melos Werkuk",
    "Melos Werkuk",
    "Helen Tesfaye",
    "Sara Alemu",
    "Daniel Bekele",
  ];

  const navigate = useNavigate();
  const upcomingScrollRef = useRef(null);
  const clientsScrollRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Add a slight delay (500ms) to ensure everything is ready after sign-up
      await new Promise((res) => setTimeout(res, 500));

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const res = await axios.get(
          `${API_URL}/counselors/profile/${decoded.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  // Scroll container styles to hide scrollbar but allow scrolling + drag scroll support
  // We implement mouse drag scroll for better UX without scrollbar visible
  function useDragScroll(ref) {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      let isDown = false;
      let startX;
      let scrollLeft;

      function onMouseDown(e) {
        isDown = true;
        el.classList.add("cursor-grabbing");
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      }
      function onMouseLeave() {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      }
      function onMouseUp() {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      }
      function onMouseMove(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 2; //scroll-fast
        el.scrollLeft = scrollLeft - walk;
      }

      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mouseleave", onMouseLeave);
      el.addEventListener("mouseup", onMouseUp);
      el.addEventListener("mousemove", onMouseMove);

      return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mouseleave", onMouseLeave);
        el.removeEventListener("mouseup", onMouseUp);
        el.removeEventListener("mousemove", onMouseMove);
      };
    }, [ref]);
  }

  // Apply drag scroll to horizontal scroll containers
  useDragScroll(upcomingScrollRef);
  useDragScroll(clientsScrollRef);

  return (
    <div className="min-h-screen bg-gray-100 relative font-sans">
      {/* Navbar */}
      <Navbar />
      {/* Main Dashboard Box */}
      <main className="max-w-[1280px] mx-auto mt-12 bg-purple-100 rounded-xl p-10 shadow-lg min-h-[600px]">
        {/* Welcome + Job Application side by side */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-800 whitespace-nowrap">
            Welcome {profile?.firstName || "Counselor"},Thank you for being
            here!
          </h1>
          <button
            onClick={() => navigate("/counselor/complete-profile")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition whitespace-nowrap"
            aria-label="Job Application">
            Edit Your profile
          </button>
        </section>

        {/* Upcoming Sessions - horizontal scroll without scrollbar */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-center mb-6">
            UPCOMING SESSIONS
          </h2>
          <div
            ref={upcomingScrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar cursor-grab"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}>
            {[
              "Pre-Marital Guidance Session",
              "Conflict Resolution",
              "Conflict Resolution",
              "Family Counseling",
              "Stress Management",
            ].map((title, idx) => (
              <div
                key={idx}
                className="min-w-[250px] bg-white rounded-lg p-5 border flex flex-col justify-center text-center shadow-sm select-none">
                <div className="font-semibold mb-2">{title}</div>
                <div className="text-gray-600">Date: 12/03/2018</div>
                <div className="text-gray-600">Time: 2:00pm LT</div>
                <div className="text-gray-600">Client: MELOS WERKUK</div>
              </div>
            ))}
          </div>
        </section>

        {/* Your Clients - horizontal scroll without scrollbar */}
        <section>
          <h2 className="text-2xl font-semibold text-center mb-6">
            YOUR CLIENTS
          </h2>
          <div
            ref={clientsScrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar cursor-grab"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}>
            {clients.map((client, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center bg-white rounded-lg p-4 w-32 border shadow-sm flex-shrink-0 select-none"
                title={client}>
                <div className="bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center mb-3">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                </div>
                <span className="text-sm font-medium truncate max-w-full">
                  {client}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Tailwind custom styles for hiding scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}
