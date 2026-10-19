import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Heart, LogOut, MapPin, Package, RefreshCw, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import BrandLoader from "../../components/common/BrandLoader";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function orderStatusClass(status) {
  return String(status || "Placed").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function OrderImage({ item }) {
  const [imageAvailable, setImageAvailable] = useState(Boolean(item?.image));
  if (!imageAvailable) return <Package size={20} aria-hidden="true" />;
  return <img src={item.image} alt="" loading="lazy" onError={() => setImageAvailable(false)} />;
}

function OrderPreview({ order }) {
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const date = formatDate(order.createdAt);
  const summary = firstItem
    ? `${firstItem.name || "Product"}${items.length > 1 ? ` + ${items.length - 1} more` : ` × ${firstItem.quantity || 1}`}`
    : "Order details unavailable";

  return <article className="account-order">
    <div className="account-order-image">
      <OrderImage item={firstItem} />
    </div>
    <div className="account-order-info">
      <strong className="account-order-name">{summary}</strong>
      <span className="account-order-meta">Order #{String(order._id || "").slice(-8) || "—"}{date ? ` · ${date}` : ""}{itemCount ? ` · ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}</span>
    </div>
    <div className="account-order-total">
      <strong>{money(order.total)}</strong>
      <span className={`account-order-status account-status-${orderStatusClass(order.status)}`}>{order.status || "Placed"}</span>
    </div>
    <Link className="account-order-link" to="/orders" aria-label={`View order ${String(order._id || "").slice(-8) || ""}`}>
      <span>View</span><ArrowRight size={16} aria-hidden="true" />
    </Link>
  </article>;
}

function StatCard({ icon: Icon, value, label, hint, to, tone = "green" }) {
  const content = <>
    <span className={`account-stat-icon account-stat-${tone}`}><Icon size={19} aria-hidden="true" /></span>
    <strong className="account-stat-value">{value}</strong>
    <span className="account-stat-label">{label}</span>
    {hint && <span className="account-stat-hint">{hint}</span>}
  </>;
  return to
    ? <Link className="account-stat-card" to={to}>{content}<ArrowRight className="account-stat-arrow" size={16} aria-hidden="true" /></Link>
    : <div className="account-stat-card">{content}</div>;
}

export default function Profile({ user, onLogout, cart = [], wishlist = [] }) {
  const [orders, setOrders] = useState([]);
  const [savedAddress, setSavedAddress] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [addressError, setAddressError] = useState("");

  const fetchAccountData = useCallback(() => user
    ? Promise.allSettled([api.myOrders(), api.deliveryAddress()])
    : Promise.resolve(null), [user]);
  const applyAccountData = useCallback(results => {
    if (!results) return;
    const [ordersResult, addressResult] = results;
    if (ordersResult.status === "fulfilled") {
      setOrders(Array.isArray(ordersResult.value) ? ordersResult.value : []);
      setOrdersError("");
    } else {
      setOrdersError(ordersResult.reason?.message || "Unable to load your orders.");
    }
    if (addressResult.status === "fulfilled") {
      setSavedAddress(addressResult.value?.address || null);
      setAddressError("");
    } else {
      setAddressError(addressResult.reason?.message || "Unable to load your saved address.");
    }
    setOrdersLoading(false);
    setAddressLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchAccountData().then(results => { if (active) applyAccountData(results); });
    return () => { active = false; };
  }, [applyAccountData, fetchAccountData]);

  if (!user) return <div className="account-signin">
    <span className="account-signin-icon"><UserRound size={26} aria-hidden="true" /></span>
    <h1>Sign in to your account</h1>
    <p>View your orders and keep your shopping details together.</p>
    <Link className="primary-btn" to="/login?next=/account">Sign In</Link>
  </div>;

  if (ordersLoading && addressLoading) return <BrandLoader title="Loading your account..." detail="Getting your account details ready." />;

  const displayName = String(user.name || user.phone || "Account").trim();
  const initials = displayName.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase();
  const createdDate = formatDate(user.createdAt);
  const cartCount = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const quickActions = [
    { to: "/orders", icon: Package, label: "My Orders" },
    { to: "/wishlist", icon: Heart, label: "My Wishlist" },
    { to: "/cart", icon: ShoppingCart, label: "View Cart" },
    { to: "/shop", icon: ShoppingBag, label: "Continue Shopping" }
  ];
  const retryAccountData = () => {
    setOrdersLoading(true);
    setAddressLoading(true);
    fetchAccountData().then(applyAccountData);
  };

  return <section className="account-dashboard" aria-labelledby="account-title">
    <header className="account-profile">
      <div className="account-avatar" aria-hidden="true">{initials || "N"}</div>
      <div className="account-profile-info">
        <span className="account-eyebrow">NIJER MARKET · MY ACCOUNT</span>
        <h1 id="account-title">{displayName}</h1>
        {(user.email || user.phone) && <p>{user.email || user.phone}</p>}
        {createdDate && <span className="account-member-since"><CalendarDays size={14} aria-hidden="true" /> Member since {createdDate}</span>}
      </div>
      <button type="button" className="account-logout" onClick={onLogout}><LogOut size={17} aria-hidden="true" /><span>Logout</span></button>
    </header>

    <section className="account-stats" aria-label="Account summary">
      <StatCard icon={Package} value={ordersLoading ? "…" : ordersError ? "—" : orders.length} label="Total Orders" hint="View your purchases" to="/orders" />
      <StatCard icon={Heart} value={wishlist.length} label="Wishlist Items" hint="Saved products" to="/wishlist" tone="orange" />
      <StatCard icon={MapPin} value={addressLoading ? "…" : addressError ? "—" : savedAddress ? "1" : "0"} label="Saved Addresses" hint={addressError ? "Address unavailable" : savedAddress ? "Saved for checkout" : "Add during checkout"} tone="mint" />
      <StatCard icon={ShoppingCart} value={cartCount} label="Cart Items" hint="Ready when you are" to="/cart" tone="sand" />
    </section>
    {addressError && <div className="account-inline-error" role="status"><span>{addressError}</span><button type="button" onClick={retryAccountData}>Retry</button></div>}

    <div className="account-content-grid">
      <section className="account-panel account-recent-orders" aria-labelledby="recent-orders-title">
        <div className="account-panel-heading">
          <div><span className="account-eyebrow">YOUR PURCHASES</span><h2 id="recent-orders-title">Recent Orders</h2></div>
          <Link to="/orders" className="account-view-all">View all <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        {ordersError ? <div className="account-orders-state" role="alert">
          <p>{ordersError}</p><button type="button" className="account-retry" onClick={retryAccountData}><RefreshCw size={15} aria-hidden="true" /> Try again</button>
        </div> : orders.length === 0 ? <div className="account-orders-state">
          <span className="account-empty-icon"><Package size={22} aria-hidden="true" /></span>
          <strong>No orders yet</strong><p>Your purchases will appear here after checkout.</p>
          <Link to="/shop" className="account-shop-link">Shop Now <ArrowRight size={15} aria-hidden="true" /></Link>
        </div> : <div className="account-orders-list">
          {orders.slice(0, 4).map(order => <OrderPreview key={order._id} order={order} />)}
        </div>}
      </section>

      <aside className="account-panel account-quick-actions" aria-labelledby="quick-actions-title">
        <div className="account-panel-heading">
          <div><span className="account-eyebrow">HERE FOR YOU</span><h2 id="quick-actions-title">Quick Actions</h2></div>
        </div>
        <nav className="account-actions-list" aria-label="Account shortcuts">
          {quickActions.map(({ to, icon: Icon, label }) => <Link to={to} className="account-action" key={to}>
            <span><Icon size={18} aria-hidden="true" /></span><strong>{label}</strong><ArrowRight size={16} aria-hidden="true" />
          </Link>)}
          <button type="button" className="account-action account-action-logout" onClick={onLogout}>
            <span><LogOut size={18} aria-hidden="true" /></span><strong>Logout</strong><ArrowRight size={16} aria-hidden="true" />
          </button>
        </nav>
      </aside>
    </div>
  </section>;
}
