import { API_URL } from "@/config/api";
import React, { useState } from "react";
import ReactStars from "react-rating-stars-component";

export default function RateCounselor({ counselorId }) {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Replace with your backend API endpoint
    const apiUrl = `${API_URL}/ratings`;
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization if needed
        },
        body: JSON.stringify({
          counselorId,
          rating,
          comment,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit rating");
      setSuccess(true);
      setComment("");
      setRating(0);
      setTimeout(() => {
        setShow(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      alert("Error submitting rating!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Rate Button */}
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        onClick={() => setShow(true)}
      >
        Rate Counselor
      </button>

      {/* Modal/Card */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-purple-600 text-xl"
              onClick={() => setShow(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <h4 className="text-lg font-semibold text-purple-700 mb-2">Make Your Review</h4>
              <textarea
                name="comment"
                placeholder="Your comments here ..."
                className="border rounded p-2 resize-none focus:ring-2 focus:ring-purple-400"
                value={comment}
                onChange={e => setComment(e.target.value)}
                required
                rows={3}
              />
              <div className="flex items-center gap-3">
                <ReactStars
                  count={5}
                  value={rating}
                  onChange={setRating}
                  size={32}
                  activeColor="#a21caf"
                  isHalf={true}
                />
                <span className="text-lg font-bold text-purple-700">{rating}</span>
              </div>
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              {success && <div className="text-green-600 font-semibold">Thank you for your review!</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
