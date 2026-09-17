import { useEffect, useState } from "react";
import { Package, RefreshCw, User } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";

const PAYMENT_STATES = {
  paid: { label: "Payment received by shop", detail: "Payment has been confirmed by the shop.", className: "payment-paid", icon: "🟢" },
  payment_submitted: { label: "Payment submitted · waiting for confirmation", detail: "Payment submitted. Waiting for shop/admin confirmation.", className: "payment-payment_submitted", icon: "🟡" },
  payment_rejected: { label: "Payment could not be confirmed", detail: "Payment could not be confirmed. Please contact the shop or check your payment details.", className: "payment-payment_rejected", icon: "🔴" },
  unpaid: { label: "Payment due on delivery", detail: "", className: "payment-unpaid", icon: "⚪" }
};

function paymentState(order) {
  const status = order.paymentStatus || (order.paymentMethod === "UPI" ? "payment_submitted" : "unpaid");
  return PAYMENT_STATES[status] || PAYMENT_STATES.unpaid;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("nm_token");

  const loadOrders = async () => {
    setLoading(true);
    try {
      setOrders(await api.myOrders());
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load your orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    let active = true;
    // Background re-fetch so admin approval/rejection shows up without a manual reload.
    const fetchOrders = async () => {
      try {
        const data = await api.myOrders();
        if (!active) return;
        setOrders(data);
        setError("");
      } catch (err) {
        if (active) setError(err.message || "Unable to load your orders");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    const onFocus = () => fetchOrders();
    window.addEventListener("focus", onFocus);
    return () => { active = false; clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, [token]);

  if (!token) return <div className="empty"><User size={48} /><h2>Please sign in first</h2><p className="muted">Sign in to view and track your orders.</p><Link className="primary-btn" to="/login?next=/orders">Sign In</Link></div>;
  if (loading) return <div className="loading"><Package size={42} /><h2>Loading your orders...</h2><p className="muted">Please wait while we fetch your latest purchases.</p></div>;
  if (error) return <div className="empty"><Package size={48} /><h2>We could not load your orders</h2><p className="error">{error}</p><button className="primary-btn" onClick={loadOrders}>Try Again</button></div>;

  return (
    <section>
      <div className="section-heading">
        <div><h1>My Orders</h1><p className="muted">Track your purchases and delivery status.</p></div>
        <button className="outline-btn" onClick={loadOrders}><RefreshCw size={15} /> Refresh</button>
      </div>
      {orders.length === 0 ? (
        <div className="empty"><Package size={48} /><h2>No orders yet</h2><p className="muted">Your completed purchases will appear here.</p><Link className="primary-btn" to="/shop">Start Shopping</Link></div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date unavailable";
            const statusClass = String(order.status || "Placed").toLowerCase().replace(/\s+/g, "-");
            const payment = paymentState(order);
            return (
              <article className="order-card" key={order._id}>
                <div className="order-top">
                  <div>
                    <b>Order #{String(order._id).slice(-8)}</b>
                    <small>{date} · {itemCount} item{itemCount === 1 ? "" : "s"}</small>
                  </div>
                  <span className={`status status-${statusClass}`}>{order.status || "Placed"}</span>
                </div>
                <div className={`payment-status ${payment.className}`}>
                  <strong>{payment.icon} Payment: {payment.label}</strong>
                  {payment.detail && <small>{payment.detail}</small>}
                </div>
                <div className="order-items">
                  {items.map((item, index) => (
                    <div key={`${item.productId || item.name}-${index}`}>
                      <img src={item.image} alt="" />
                      <span>{item.name || "Product"} × {item.quantity}</span>
                      <b>{money(Number(item.price || 0) * Number(item.quantity || 0))}</b>
                    </div>
                  ))}
                </div>
                <div className="order-bottom"><span>Total</span><b>{money(order.total)}</b></div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}