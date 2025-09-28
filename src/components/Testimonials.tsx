import React, { useEffect, useState, useRef } from "react";
import { IconStar } from "@tabler/icons-react";
import axios from "axios";
import { ENDPOINTS } from "@/config/api";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    axios
      .get(ENDPOINTS.REVIEWS)
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  // Optional: Drag to scroll horizontally
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false,
      startX = 0,
      scrollLeft = 0;

    const onMouseDown = (e) => {
      isDown = true;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMouseUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2;
      el.scrollLeft = scrollLeft - walk;
    };

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
  }, []);

  return (
    <div className="py-16 bg-purple-100 -mx-4 px-4 my-16">
      <h2 className="text-2xl font-bold mb-2 text-center">Happy Clients</h2>
      <p className="text-center text-gray-600 text-sm mb-10">
        Read what our clients have to say about our service
      </p>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar cursor-grab px-2"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
        {reviews.length === 0 ? (
          <div className="text-center w-full text-gray-500">
            No reviews yet.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-slate-50 min-w-[300px] max-w-xs p-6 rounded-lg shadow-sm flex-shrink-0">
              <div className="flex text-yellow-400 mb-3">
                {[...Array(Math.round(review.rating))].map((_, i) => (
                  <IconStar key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm mb-6">{review.comment}</p>
              <p className="text-xs font-semibold">
                {review.client && review.client.user
                  ? `${review.client.user.firstName} ${review.client.user.lastName}`.toUpperCase()
                  : "Anonymous"}
              </p>
            </div>
          ))
        )}
      </div>
      {/* Hide scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Testimonials;
