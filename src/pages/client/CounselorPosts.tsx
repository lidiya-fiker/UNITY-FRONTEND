
import React, { useEffect, useState } from "react";
import { IconHeart } from "@tabler/icons-react";
import Navbar from './component/Navbar';

const CounselorPosts = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(() => {
    return JSON.parse(localStorage.getItem("likedPosts") || "{}");
  });

  useEffect(() => {
    fetch("http://localhost:3000/articles")
      .then((res) => res.json())
      .then((data) => {
        // Sort posts by createdAt (newest first)
        const sortedPosts = data.sort((a, b) => {
          const dateA = new Date(a.createdAt || '1970-01-01');
          const dateB = new Date(b.createdAt || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });
        setPosts(sortedPosts);
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
  }, [likedPosts]);

  const handleLikeToggle = (postId) => {
    setLikedPosts((prev) => {
      const isLiked = !!prev[postId];
      const updatedLikes = { ...prev };

      if (isLiked) {
        delete updatedLikes[postId];
      } else {
        updatedLikes[postId] = (prev[postId] || 0) + 1;
      }

      return updatedLikes;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-purple-100 to-purple-100 font-sans flex flex-col">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

    

      {/* Scrollable Posts Section */}
      <main className="mt-[200px] sm:mt-[100px] flex-grow overflow-y-auto pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 animate-fade-in"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={
                        post.counselor?.profilePicture
                          ? `http://localhost:3000/uploads/profile-pictures/${post.counselor.profilePicture}`
                          : "/path/to/default-avatar.png"
                      }
                      alt={
                        post.counselor?.user?.firstName
                          ? `Counselor ${post.counselor.user.firstName}`
                          : "Counselor"
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                      onError={(e) => (e.currentTarget.src = "/path/to/default-avatar.png")}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Counselor {post.counselor?.user?.firstName || "Anonymous"}
                      </h3>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-3">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {post.description}
                  </p>

                  <div className="flex items-center space-x-2 text-purple-600">
                    <button
                      onClick={() => handleLikeToggle(post.id)}
                      className="flex items-center space-x-1 hover:text-purple-800 transition"
                    >
                      <IconHeart
                        size={20}
                        className={likedPosts[post.id] ? "fill-purple-600" : ""}
                      />
                      <span>{(post.likes || 0) + (likedPosts[post.id] || 0)}</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-gray-600 text-lg text-center py-8 animate-fade-in">
                No posts available at the moment.
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        .bg-wave-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.3' d='M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,64C672,64,768,128,864,160C960,192,1056,192,1152,160C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
        }
        main::-webkit-scrollbar {
          width: 8px;
        }
        main::-webkit-scrollbar-track {
          background: transparent;
        }
        main::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 4px;
        }
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  );
};

export default CounselorPosts;