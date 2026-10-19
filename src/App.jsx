import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "./services/api";
import { useLocalState } from "./hooks/useLocalState";
import Header from "./components/layout/Header";
import NotificationPanel from "./components/layout/NotificationPanel";
import BottomNav from "./components/layout/BottomNav";
import Footer from "./components/layout/Footer";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const { pathname } = useLocation();
  const [cart, setCart] = useLocalState("nm_cart", []);
  const [wishlist, setWishlist] = useLocalState("nm_wishlist", []);
  const [checkoutAddressDraft, setCheckoutAddressDraft] = useState(null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nm_user")) || null; } catch { return null; }
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastSeenAt, setLastSeenAt] = useState(() => localStorage.getItem("nm_notifications_seen_at") || "1970-01-01T00:00:00.000Z");

  useEffect(() => {
    if (!user || !localStorage.getItem("nm_token")) return;
    api.me().then(result => localStorage.setItem("nm_user", JSON.stringify(result.user))).catch(() => {
      localStorage.removeItem("nm_token"); localStorage.removeItem("nm_user"); setUser(null);
    });
  }, [user]);

  useEffect(() => { api.announcements().then(result => setNotifications(Array.isArray(result) ? result : [])).catch(() => setNotifications([])); }, []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const unreadCount = notifications.filter(item => new Date(item.createdAt).getTime() > new Date(lastSeenAt).getTime()).length;
  const addToCart = product => setCart(previous => { const found = previous.find(item => item._id === product._id); return found ? previous.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item) : [...previous, { ...product, quantity: 1 }]; });
  const toggleWish = product => setWishlist(previous => previous.some(item => item._id === product._id) ? previous.filter(item => item._id !== product._id) : [...previous, product]);
  const logout = () => { localStorage.removeItem("nm_token"); localStorage.removeItem("nm_user"); setUser(null); setCheckoutAddressDraft(null); };
  const toggleNotifications = () => setShowNotifications(open => { if (!open) { const now = new Date().toISOString(); localStorage.setItem("nm_notifications_seen_at", now); setLastSeenAt(now); } return !open; });

  const routeProps = { cart, setCart, clearCart: () => setCart([]), wishlist, toggleWish, addToCart, user, onAuth: setUser, onLogout: logout, checkoutAddressDraft, setCheckoutAddressDraft };
  return <div className="app-shell">
    <Header cartCount={cartCount} notificationCount={unreadCount} onToggleNotifications={toggleNotifications} showNotifications={showNotifications}/>
    <NotificationPanel open={showNotifications} notifications={notifications} onClose={() => setShowNotifications(false)}/>
    <main className="container"><AppRoutes {...routeProps}/></main>
    <BottomNav cartCount={cartCount}/>{pathname === "/" && <Footer/>}
  </div>;
}
