import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CircleCheck,
  ClipboardList,
  ListChecks,
  Package,
  PackageCheck,
  PackageOpen,
  RefreshCw,
  ShoppingBasket,
  Truck,
  User
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import BrandLoader from "../../components/common/BrandLoader";
import "./Orders.css";

const ORDER_STAGES = ["Placed", "Confirmed", "Picking", "Sorting", "Packing", "Packed", "Out for Delivery", "Delivered"];
const STAGE_ICONS = {
  Placed: ClipboardList,
  Confirmed: BadgeCheck,
  Picking: ShoppingBasket,
  Sorting: ListChecks,
  Packing: PackageOpen,
  Packed: PackageCheck,
  "Out for Delivery": Truck,
  Delivered: CircleCheck
};

const PAYMENT_STATES = {
  paid: { label: "Payment confirmed", className: "payment-paid" },
  payment_submitted: { label: "Payment awaiting confirmation", className: "payment-payment_submitted" },
  payment_rejected: { label: "Payment not confirmed", className: "payment-payment_rejected" },
  unpaid: { label: "Pay on delivery", className: "payment-unpaid" }
};

function paymentState(order) {
  const status = order.paymentStatus || (order.paymentMethod === "UPI" ? "payment_submitted" : "unpaid");
  return PAYMENT_STATES[status] || PAYMENT_STATES.unpaid;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

function TrackingTimeline({ order }) {
  const currentStatus = order.status || "Placed";
  const failed = currentStatus === "Failed Delivery";
  const cancelled = currentStatus === "Cancelled";
  const activeIndex = failed ? ORDER_STAGES.indexOf("Out for Delivery") : ORDER_STAGES.indexOf(currentStatus);
  const history = Array.isArray(order.trackingHistory) ? order.trackingHistory : [];

  return (
    <div className={`order-tracking${failed ? " is-failed" : ""}`}>
      <div className="order-tracking-heading">
        <div>
          <h3>Order progress</h3>
          <strong className={`order-current-status${cancelled || failed ? " is-alert" : ""}`}>
            {cancelled ? "Cancelled" : failed ? "Delivery unsuccessful" : currentStatus}
          </strong>
        </div>
        {cancelled || failed ? <span className="order-status-note">{cancelled ? "This order will not be processed." : "Contact the shop for help with delivery."}</span> : null}
      </div>
      <ol className="order-stepper" aria-label={`Order status: ${currentStatus}`}>
        {ORDER_STAGES.map((stage, index) => {
          const event = history.find(item => item.status === stage);
          const StageIcon = STAGE_ICONS[stage];
          const completed = cancelled
            ? Boolean(event)
            : activeIndex >= 0 && index < activeIndex;
          const current = !cancelled && index === activeIndex;
          return (
            <li
              className={`order-step${completed ? " is-complete" : ""}${current ? " is-current" : ""}${cancelled ? " is-cancelled" : ""}`}
              key={stage}
              aria-current={current ? "step" : undefined}
            >
              <span className="order-step-marker" aria-hidden="true"><StageIcon size={15} /></span>
              <span className="order-step-label">{stage}</span>
              <time>{formatDate(event?.timestamp)}</time>
            </li>
          );
        })}
      </ol>
      {history.some(item => typeof item.status === "string" && item.status.startsWith("Payment ")) && (
        <div className="order-payment-events">
          {history.filter(item => typeof item.status === "string" && item.status.startsWith("Payment ")).map((item, index) => (
            <p key={`${item.status}-${item.timestamp}-${index}`}>
              <strong>{item.status}</strong>
              {formatDate(item.timestamp) && <time>{formatDate(item.timestamp)}</time>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState("");
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
    if (!token) return undefined;
    let active = true;
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

  const cancelOrder = async order => {
    const number = order.orderNumber || String(order._id).slice(-8);
    if (!window.confirm(`Cancel order ${number}?`)) return;
    setCancelling(order._id);
    setError("");
    try {
      const updatedOrder = await api.cancelOrder(order._id);
      setOrders(current => current.map(item => item._id === updatedOrder._id ? updatedOrder : item));
    } catch (err) {
      setError(err.message || "Unable to cancel this order");
    } finally {
      setCancelling("");
    }
  };

  if (!token) return <div className="empty"><User size={48} /><h2>Please sign in</h2><p className="muted">Sign in to view your orders.</p><Link className="primary-btn" to="/login?next=/orders">Sign In</Link></div>;
  if (loading) return <BrandLoader title="Loading orders..." detail="Please wait." />;
  if (error && !orders.length) return <div className="empty"><Package size={48} /><h2>We could not load your orders</h2><p className="error">{error}</p><button className="primary-btn" onClick={loadOrders}>Try Again</button></div>;

  return (
    <section className="orders-page">
      <div className="section-heading">
        <h1>My Orders</h1>
        <button className="outline-btn" onClick={loadOrders} disabled={loading}><RefreshCw size={15} /> Refresh</button>
      </div>
      {error && <p className="error order-page-error" role="alert">{error}</p>}
      {orders.length === 0 ? (
        <div className="empty"><Package size={48} /><h2>No orders yet</h2><p className="muted">Your orders will appear here.</p><Link className="primary-btn" to="/shop">Start Shopping</Link></div>
      ) : (
        <div className="orders-list">
          {orders.map(order => {
            const items = Array.isArray(order.items) ? order.items : [];
            const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
            const payment = paymentState(order);
            const number = order.orderNumber || `#${String(order._id).slice(-8)}`;
            const canCancel = order.status === "Placed" && order.paymentStatus !== "paid";
            return (
              <article className="order-card order-track-card" key={order._id}>
                <header className="order-top order-track-header">
                  <div>
                    <b>Order {number}</b>
                    <small>{formatDate(order.createdAt)}{itemCount ? ` · ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}</small>
                  </div>
                  {canCancel && <button className="order-cancel-button" type="button" disabled={Boolean(cancelling)} onClick={() => cancelOrder(order)}>
                    {cancelling === order._id ? "Cancelling…" : "Cancel order"}
                  </button>}
                </header>
                <div className="order-tracking-payment">
                  <span className={`payment-status ${payment.className}`}>{payment.label}</span>
                  <span>{order.paymentMethod === "UPI" ? "UPI" : "Cash on Delivery"}</span>
                </div>
                <TrackingTimeline order={order} />
                <div className="order-items order-track-items">
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
