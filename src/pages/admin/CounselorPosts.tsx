import { API_URL } from '@/config/api';
import React, { useEffect, useState } from 'react';

const CounselorPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/articles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching posts:", err);
      });
  }, []);
return (
  <div className="h-full flex flex-col max-h-[80vh] overflow-hidden">
    <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Counselor Posts</h2>

    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center">No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="bg-white shadow rounded p-4 border-l-4 border-purple-500"
          >
            <h3 className="text-lg font-semibold text-purple-800">{post.title}</h3>
            <p className="text-sm text-gray-500 mb-2">
              By {post.counselor?.user?.firstName} {post.counselor?.user?.lastName}
            </p>
            <p className="text-gray-700 text-sm">{post.description}</p>
          </div>
        ))
      )}
    </div>
  </div>
);


};

export default CounselorPosts;
