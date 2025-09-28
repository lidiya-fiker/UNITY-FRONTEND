import React, { useState, useEffect } from "react";
import CounselorPosts from "./CounselorPosts";
import { useLocation, useNavigate } from "react-router-dom";
import { JwtPayload } from "jwt-decode";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "@/config/api";

interface MyJwtPayload extends JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AdminPanel = () => {
  const [counselors, setCounselors] = useState([]);
  const [clients, setClients] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const query = useQuery();
  const initialTab = query.get("tab") || "dashboard";
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Fetch clients
    fetch(`${API_URL}/admin/clients`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Failed to fetch clients:", err));

    // Fetch counselors
    fetch(`${API_URL}/admin/counselors`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCounselors(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to fetch counselors:", err));
  }, []);

  useEffect(() => {
    if (activeTab === "notifications" && userId) {
      fetch(`${API_URL}/notifications/mark-read`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId, role: "ADMIN" }),
      }).then(() => setNotificationCount(0)); // ✅ Reset unread count
    }
  }, [activeTab, userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchNotifications = () => {
      if (!userId) return;
      fetch(`${API_URL}/notifications?role=ADMIN&userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data);
          const unread = data.filter((n) => !n.isRead).length;
          setNotificationCount(unread);
        })
        .catch((err) => console.error("Failed to fetch notifications:", err));
    };

    // Run once immediately
    fetchNotifications();

    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/notifications?role=ADMIN&userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())

      .then((data) => {
        setNotifications(data);
        const unread = data.filter((n) => !n.isRead).length;
        setNotificationCount(unread); // ✅ Only unread
      })

      .catch((err) => console.error("Failed to fetch notifications:", err));
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<MyJwtPayload>(token);
      setUserId(decoded.id); // ✅ properly set userId from token
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/notifications?role=ADMIN&userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setNotifications)
      .catch((err) => console.error("Failed to fetch notifications:", err));
  }, [userId]);

  const handleConfirmedAction = async () => {
    const { type, counselor } = confirmAction;
    let endpoint = "";
    let method = "PATCH";

    if (type === "approve") {
      endpoint = `/admin/counselor/${counselor.id}/approve`;
    } else if (type === "activate" || type === "deactivate") {
      endpoint = `/admin/counselor/${counselor.id}/status/${
        type === "activate" ? "ACTIVE" : "INACTIVE"
      }`;
    }

    try {
      await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Refresh counselors after update
      const updated = await fetch(`${API_URL}/admin/counselors`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await updated.json();
      setCounselors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to update counselor status:", error);
    } finally {
      setConfirmAction(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "http://localhost:8080/";
  };

  const stats = {
    totalClients: clients.length,
    approvedCounselors: counselors.filter((c) => c.isApproved).length,
    heldSessions: 0,
    scheduledSessions: 0,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-purple-50 shadow-md p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-700 mb-8 overflow-hidden">
            Admin Dashboard
          </h1>
          <nav className="flex flex-col space-y-4 text-gray-700">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={tabStyle(activeTab, "dashboard")}>
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={tabStyle(activeTab, "clients")}>
              Clients
            </button>
            <button
              onClick={() => setActiveTab("counselors")}
              className={tabStyle(activeTab, "counselors")}>
              Manage Counselors
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={tabStyle(activeTab, "posts")}>
              Counselor Posts
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={tabStyle(activeTab, "notifications")}>
              🔔 Notifications
              {notificationCount > 0 && (
                <span className="ml-2 inline-block bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 mt-10 bg-gray-50 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center text-2xl font-bold text-purple-700 mb-20">
              Welcome Admin!
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-28 max-w-4xl mx-auto">
              <DashboardCard
                title="Total Clients"
                value={stats.totalClients}
                color="border-purple-600"
              />
              <DashboardCard
                title="Approved Counselors"
                value={stats.approvedCounselors}
                color="border-purple-400"
              />
              <DashboardCard
                title="Held Sessions"
                value={stats.heldSessions}
                color="border-yellow-400"
              />
              <DashboardCard
                title="Scheduled Sessions"
                value={stats.scheduledSessions}
                color="border-green-500"
              />
            </div>
          </div>
        )}

        {activeTab === "clients" && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-center">
              Clients
            </h2>
            <table className="min-w-full text-sm bg-white border rounded shadow">
              <thead className="bg-purple-100 text-purple-800">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Gender</th>
                  <th className="p-3 text-left">Marital</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {(client.firstName || "") + " " + (client.lastName || "")}
                    </td>
                    <td className="p-3">{client.email}</td>
                    <td className="p-3">{client.client?.phoneNumber || ""}</td>
                    <td className="p-3">{client.client?.gender || ""}</td>
                    <td className="p-3">
                      {client.client?.maritalStatus || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "counselors" && (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-center">
              Counselors
            </h2>
            <table className="min-w-full text-sm bg-white border rounded shadow">
              <thead className="bg-purple-100 text-purple-800">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Change Status</th>
                  <th className="p-3 text-left">Approval</th>
                  <th className="p-3 text-left">View Profile</th>
                </tr>
              </thead>
              <tbody>
                {counselors.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {(c.firstName || "") + " " + (c.lastName || "")}
                    </td>
                    <td className="p-3">{c.email || ""}</td>
                    <td className="p-3">
                      {c.status === "ACTIVE" ? (
                        <span className="text-green-600 font-medium">
                          Active
                        </span>
                      ) : (
                        <span
                          className="text-red-600 font
::contentReference[oaicite:30]{index=30}
 
// Continuing from previous AdminPanel.tsx
// ...
                        font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type:
                              c.status === "ACTIVE" ? "deactivate" : "activate",
                            counselor: c,
                          })
                        }
                        className={`px-3 py-1 rounded text-white text-xs ${
                          c.status === "ACTIVE"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}>
                        {c.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                    <td className="p-3">
                      {!c.isApproved ? (
                        <button
                          onClick={() =>
                            setConfirmAction({
                              type: "approve",
                              counselor: c,
                            })
                          }
                          className="px-3 py-1 rounded bg-purple-600 text-white text-xs hover:bg-purple-700">
                          Approve
                        </button>
                      ) : (
                        <span className="text-sm text-purple-500 font-medium">
                          Approved
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          (window.location.href = `/counselor/${c.id}`)
                        }
                        className="px-3 py-1 rounded border border-purple-500 text-purple-600 hover:bg-purple-100 text-xs">
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "posts" && <CounselorPosts />}

        {activeTab === "notifications" && (
          <div className="max-w-3xl mx-auto flex flex-col h-[80vh]">
            <h2 className="text-xl font-bold text-purple-700 mb-4 text-center">
              Notifications
            </h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6">
              {notifications.length === 0 && (
                <p className="text-center text-gray-500">
                  No notifications found.
                </p>
              )}
              {notifications.map((n, i) => (
                <div
                  key={i}
                  className="bg-white p-4 border rounded shadow border-purple-200">
                  <div className="text-sm text-purple-400 mb-1">
                    {n.type === "SYSTEM"
                      ? "System"
                      : n.role === "COUNSELOR"
                      ? `Counselor ${n.senderName || ""}`
                      : "Unknown Sender"}
                  </div>
                  <div className="text-gray-800">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to {confirmAction.type} this counselor?
            </h2>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                No
              </button>
              <button
                onClick={handleConfirmedAction}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const tabStyle = (activeTab, tabName) =>
  `text-left px-4 py-2 rounded transition text-sm ${
    activeTab === tabName
      ? "bg-purple-100 text-purple-700 font-semibold"
      : "hover:bg-purple-100 hover:text-purple-700"
  }`;

const DashboardCard = ({ title, value, color }) => (
  <div
    className={`bg-white shadow rounded-xl p-6 border-t-4 ${color} text-center`}>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminPanel;
