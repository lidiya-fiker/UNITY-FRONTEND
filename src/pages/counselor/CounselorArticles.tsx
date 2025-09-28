import { useState, useEffect } from "react";
import { IconPlus } from "@tabler/icons-react";
import Navbar from "./component/Navbar";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/config/api";

type MyJwtPayload = { id: string; email: string; [key: string]: unknown };

type Article = {
  id: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

const CounselorArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Decode token and fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const decoded = jwtDecode<MyJwtPayload>(token);
        const id = decoded.id;
        setUserId(id);

        const res = await fetch(`${API_URL}/counselors/profile/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setStatus(userData.status);
          setIsApproved(userData.isApproved);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Normalize approval and status for logic
  const approved = isApproved === true;
  const activeStatus = status?.toLowerCase() === "active";
  const canPost = activeStatus && approved;

  // Fetch articles when userId is set
  useEffect(() => {
    const fetchArticles = async () => {
      if (!userId) return;

      try {
        const res = await fetch(`${API_URL}/articles/by-counselor/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.reverse());
        } else {
          console.error("Failed to fetch articles");
        }
      } catch (err) {
        console.error("Error fetching articles:", err);
      }
    };

    fetchArticles();
  }, [userId]);

  // Handle posting new article
  const handlePost = async () => {
    if (title.trim() === "" || description.trim() === "") return;

    if (!canPost) {
      alert(
        "Your account is not active or approved. You cannot post articles.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/articles/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        setTitle("");
        setDescription("");
        setShowForm(false);
        // Refresh articles
        const refreshed = await fetch(
          `${API_URL}/articles/by-counselor/${userId}`,
        );
        if (refreshed.ok) {
          const data = await refreshed.json();
          setArticles(data.reverse());
        }
      } else {
        const err = await res.json();
        setError(err.message || "Failed to post article");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error posting article: " + err.message);
      } else {
        setError("Error posting article: Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center">Loading profile...</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 relative font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-[#4b2a75] mb-8 text-center">
          Your Articles
        </h1>

        {!canPost && (
          <p className="text-center text-red-600 mb-6">
            Your account is not active or approved. You cannot post articles.
            Please complete your profile and wait for notification!
          </p>
        )}

        {canPost && showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-[#4b2a75] mb-4">
              Write a description
            </h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border p-3 mb-4 rounded-md focus:ring-2 focus:ring-[#4b2a75]"
            />
            <textarea
              placeholder="Write your article here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border p-3 mb-4 h-32 rounded-md resize-none focus:ring-2 focus:ring-[#4b2a75]"
            />

            <div className="text-right">
              <button
                onClick={handlePost}
                disabled={loading}
                className="bg-[#4b2a75] text-white px-6 py-2 rounded-md hover:bg-[#3a2057] transition disabled:opacity-50">
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}

        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="fixed bottom-8 right-8 bg-[#4b2a75] text-white p-4 rounded-full shadow-lg hover:bg-[#3a2057] transition">
            <IconPlus size={24} />
          </button>
        )}

        <div className="space-y-6">
          {articles.map((article, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-[#4b2a75] mb-4">
                {article.title}
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">
                {article.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CounselorArticles;
