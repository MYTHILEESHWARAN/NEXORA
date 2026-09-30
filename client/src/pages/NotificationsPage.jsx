import { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { HiHeart, HiChat, HiUserAdd, HiAtSymbol, HiCheckCircle, HiTrash } from "react-icons/hi";
import Avatar from "../components/common/Avatar.jsx";
import { NotificationSkeleton } from "../components/common/Skeleton.jsx";
import { notificationAPI } from "../services/api.js";
import { timeAgo } from "../utils/helpers.js";
import { useSocket } from "../context/SocketContext.jsx";
import toast from "react-hot-toast";

const typeConfig = {
  like: { icon: HiHeart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
  comment: { icon: HiChat, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  follow: { icon: HiUserAdd, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  mention: { icon: HiAtSymbol, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const outletCtx = useOutletContext();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await notificationAPI.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (notif) => {
      setNotifications(prev => [{ ...notif, createdAt: new Date() }, ...prev]);
      setUnreadCount(c => c + 1);
    };
    socket.on("newNotification", handler);
    return () => socket.off("newNotification", handler);
  }, [socket]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      outletCtx?.setUnreadNotifications(0);
      toast.success("All marked as read");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const handleMarkRead = async (notif) => {
    if (notif.read) return;
    try {
      await notificationAPI.markOneRead(notif._id);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs gap-1.5">
            <HiCheckCircle className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          Array(5).fill(0).map((_, i) => <NotificationSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No notifications yet</h3>
            <p className="text-sm text-gray-400">When someone interacts with you, it will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-nexora-border">
            {notifications.map(notif => {
              const config = typeConfig[notif.type] || typeConfig.mention;
              const Icon = config.icon;
              return (
                <div key={notif._id} onClick={() => handleMarkRead(notif)}
                  className={"flex items-center gap-3 p-4 transition-colors cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-800 " + (!notif.read ? "bg-primary-50/50 dark:bg-primary-950/30" : "")}>
                  <div className="relative flex-shrink-0">
                    <Avatar user={notif.sender} size="md" />
                    <div className={"absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center " + config.bg}>
                      <Icon className={"w-3 h-3 " + config.color} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={"text-sm " + (!notif.read ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>
                      <Link to={"/profile/" + notif.sender?.username} className="hover:underline font-bold">{notif.sender?.name}</Link>{" "}
                      {notif.message?.replace(notif.sender?.name || "", "").trim()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {notif.post?.image && (
                    <img src={"http://localhost:5000" + notif.post.image} alt="Post" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  {!notif.read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />}
                  <button onClick={e => { e.stopPropagation(); handleDelete(notif._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all flex-shrink-0">
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;