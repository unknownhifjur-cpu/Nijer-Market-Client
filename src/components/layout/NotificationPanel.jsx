import { Bell } from "lucide-react";

export default function NotificationPanel({ open, notifications, onClose }) {
  if (!open) return null;
  return <div className="notification-panel-backdrop" onClick={onClose}>
    <aside className="notification-panel" onClick={event => event.stopPropagation()}>
      <div className="notification-panel-head"><div><span className="eyebrow">Updates</span><h3>Notifications</h3></div>
        <button type="button" className="notification-close" onClick={onClose} aria-label="Close notification panel">×</button>
      </div>
      {notifications.length === 0 ? <div className="notification-empty"><Bell size={28}/><p>No new announcements yet.</p></div> :
        <div className="notification-list">{notifications.map(item => <article className={`notification-item ${item.type || "info"}`} key={item._id}>
          <div className="notification-tag">{item.type === "offer" ? "Offer" : item.type === "alert" ? "Alert" : "Update"}</div>
          <h4>{item.title}</h4><p>{item.message}</p>
          <small>{new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
        </article>)}</div>}
    </aside>
  </div>;
}
