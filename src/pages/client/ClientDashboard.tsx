import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "./component/Navbar";
import Rating from "react-rating-stars-component";

export default function ClientDashboard() {
  interface MyJwtPayload {
    id: string;
    email: string;
    [key: string]: any;
  }

  const navigate = useNavigate();
  const counselorScrollRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [counselors, setCounselors] = useState([]);
  const [rated, setRated] = useState({});

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [thankYou, setThankYou] = useState(false);
  const [comments, setComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [formError, setFormError] = useState("");

  const [sessions, setSessions] = useState([]);
  const upcomingScrollRef = useRef(null);
  // f35a4d7c-979f-493d-b032-aa91a1b984eb

  // --- Fetch Client Profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Add a slight delay (500ms) to ensure everything is ready after sign-up
      await new Promise((res) => setTimeout(res, 500));

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const res = await axios.get(
          `http://localhost:3000/clients/profile/${decoded.id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const userId = decoded.id;
        console.log(userId);
        setProfile(res.data);
        setClientId(userId);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/clientbooking/${clientId}`,
        );
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    if (clientId) fetchSessions();
  }, [clientId]); // <-- Add clientId here

  // --- Fetch Counselors ---
  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await fetch("http://localhost:3000/counselors");
        const data = await res.json();
        setCounselors(data);
      } catch (err) {
        console.error("Failed to fetch counselors", err);
      }
    };
    fetchCounselors();
  }, []);

  // --- Fetch Client's Previous Reviews ---
  useEffect(() => {
    if (!clientId) return;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/reviews/client/${clientId}`,
        );
        const ratingsMap = {};
        res.data.forEach((review) => {
          const counselorId = review.counselor?.userId || review.counselorId;
          ratingsMap[counselorId] = review.rating;
        });
        setRated(ratingsMap);
      } catch (err) {
        console.error("Failed to fetch client reviews", err);
      }
    };
    fetchReviews();
  }, [clientId]);

  // --- Drag Scroll Hook ---
  const useDragScroll = (ref) => {
    useEffect(() => {
      const el = ref.current;
      if (!el) return;

      let isDown = false,
        startX,
        scrollLeft;
      const onMouseDown = (e) => {
        isDown = true;
        el.classList.add("cursor-grabbing");
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
      };
      const stop = () => {
        isDown = false;
        el.classList.remove("cursor-grabbing");
      };
      const onMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        el.scrollLeft = scrollLeft - (x - startX) * 2;
      };

      el.addEventListener("mousedown", onMouseDown);
      el.addEventListener("mouseleave", stop);
      el.addEventListener("mouseup", stop);
      el.addEventListener("mousemove", onMouseMove);

      return () => {
        el.removeEventListener("mousedown", onMouseDown);
        el.removeEventListener("mouseleave", stop);
        el.removeEventListener("mouseup", stop);
        el.removeEventListener("mousemove", onMouseMove);
      };
    }, [ref]);
  };

  useDragScroll(upcomingScrollRef);
  useDragScroll(counselorScrollRef);

  // --- Submit Review ---
  const submitReview = async () => {
    const comment = comments[selectedCounselor.id]?.trim();
    const rating = ratings[selectedCounselor.id] || 0;

    if (!comment) {
      setFormError("Please enter a comment before submitting your review.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/reviews", {
        counselorId: selectedCounselor.id,
        clientId,
        comment,
        rating,
      });

      setRated((prev) => ({
        ...prev,
        [selectedCounselor.id]: rating,
      }));
      setThankYou(true);
      setFormError("");
    } catch (err) {
      setFormError("Failed to submit review.");
    }
  };

  return (
    <div className="min-h-screen bg-purple-100 font-sans">
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-20 bg-purple-100 rounded-xl p-10 ">
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-bold text-purple-800">
            Welcome {profile?.user?.firstName || "User"}!
          </h1>
          <button
            onClick={() => navigate("/book-session")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg">
            Book Session
          </button>
        </section>

        {/* Upcoming Sessions */}
        <section className="mb-7 ml-30">
          <h4 className="text-2xl font-medium text-center mb-4 text-gray-500">
            Your Sessions
          </h4>
          <div
            ref={upcomingScrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar cursor-grab">
            {sessions.map((session, idx) => (
              <div
                key={idx}
                className="min-w-[250px] bg-white rounded-lg p-5 border text-center shadow-sm cursor-pointer">
                <div
                  className="font-semibold mb-2"
                  onClick={() => {
                    if (session.zoomJoinUrl) {
                      window.open(session.zoomJoinUrl, "_blank"); // open in a new tab
                    } else {
                      alert("No Zoom link available for this session.");
                    }
                  }}>
                  join session
                </div>
                <div className="text-gray-600">
                  Date: {session.schedule.date}
                </div>
                <div className="text-gray-600">
                  Time: {session.schedule.startTime}
                </div>
                <button
                  className="mt-2 px-3 py-1 bg-purple-400 text-white rounded shadow hover:bg-purple-700 transition duration-200"
                  onClick={() =>
                    navigate("/reschedule", { state: { sessions } })
                  }>
                  Reschedule
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Counselor Section */}
        <section className="mb-12 ">
          <h2 className="text-2xl font-medium text-center mb-4 text-gray-500">
            Your Counselors
          </h2>
          <div
            ref={counselorScrollRef}
            className="flex space-x-6 overflow-x-auto no-scrollbar px-4 ml-32">
            {counselors.map((counselor, idx) => {
              const fullName = `${counselor.firstName ?? "Unknown"} ${
                counselor.lastName ?? ""
              }`.trim();
              const counselorId = counselor.id;
              const profilePic = counselor.image;
              const initial =
                counselor.firstName?.charAt(0).toUpperCase() || "?";

              return (
                <div
                  key={counselorId ?? idx}
                  className="min-w-[250px] bg-white rounded-lg p-4 border shadow-sm flex flex-col items-center">
                  {profilePic ? (
                    <img
                      src={`http://localhost:3000/uploads/profile-pictures/${profilePic}`}
                      alt={fullName}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-purple-200 rounded-full flex items-center justify-center text-2xl font-bold text-purple-700 mb-3">
                      {initial}
                    </div>
                  )}

                  <div className="font-semibold mb-1 text-gray-800">
                    {fullName}
                  </div>

                  {rated[counselorId] ? (
                    <Rating
                      count={5}
                      size={20}
                      edit={false}
                      value={rated[counselorId]}
                      activeColor="#ffd700"
                    />
                  ) : (
                    <button
                      className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-4 rounded text-sm"
                      onClick={() => {
                        setModalOpen(true);
                        setSelectedCounselor(counselor);
                        setThankYou(false);
                        setFormError("");
                      }}>
                      Rate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Rating Modal */}
      {modalOpen && selectedCounselor && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 z-50 flex justify-center items-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-700 text-lg"
              onClick={() => {
                setModalOpen(false);
                setSelectedCounselor(null);
              }}>
              ✕
            </button>

            {!thankYou ? (
              <>
                <h3 className="text-lg font-semibold mb-3 text-center">
                  Rate {selectedCounselor.firstName}
                </h3>
                <textarea
                  value={comments[selectedCounselor.id] || ""}
                  onChange={(e) => {
                    setComments((prev) => ({
                      ...prev,
                      [selectedCounselor.id]: e.target.value,
                    }));
                    setFormError("");
                  }}
                  placeholder="Write your feedback..."
                  className="w-full p-2 border border-gray-300 rounded mb-2 text-sm"
                  rows={3}
                />
                {formError && (
                  <p className="text-red-500 text-sm mb-2">{formError}</p>
                )}
                <Rating
                  count={5}
                  size={28}
                  activeColor="#ffd700"
                  value={ratings[selectedCounselor.id] || 0}
                  onChange={(val) =>
                    setRatings((prev) => ({
                      ...prev,
                      [selectedCounselor.id]: val,
                    }))
                  }
                />
                <button
                  className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                  onClick={submitReview}>
                  Submit Review
                </button>
              </>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-xl font-semibold mb-2 text-green-600">
                  Thank you!
                </h3>
                <p className="text-sm text-gray-600">
                  Your review has been submitted.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
