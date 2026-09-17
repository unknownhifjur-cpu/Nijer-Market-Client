import { Bell, Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header({ cartCount, notificationCount, onToggleNotifications, showNotifications }) {
  return <header className="topbar">
    <Link to="/" className="brand"><img src="/logo.png" alt="NIJER MARKET logo" className="brand-mark" /></Link>
    <nav className="desktop-nav" aria-label="Primary navigation">
      <Link to="/">Home</Link>
      <Link to="/shop">Shop</Link>
      <Link to="/orders">Orders</Link>
      <Link to="/wishlist">Wishlist</Link>
      <Link to="/account">Account</Link>
    </nav>
    <div className="header-actions">
      <button type="button" className={`notification-trigger ${showNotifications ? "active" : ""}`} onClick={onToggleNotifications} aria-label="Open notifications">
        <Bell/>{notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
      </button>
      <Link to="/wishlist"><Heart/></Link>
      <Link to="/cart" className="cart-icon"><ShoppingCart/>{cartCount > 0 && <span>{cartCount}</span>}</Link>
    </div>
  </header>;
}
