import { useEffect, useRef, useState } from "react";
import { Copy, CreditCard, Package, QrCode } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";

// One id per checkout visit: double clicks or retries reuse it, so the server never creates duplicate orders.
function newRequestId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Checkout({ cart, clearCart }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", phone: "", paymentMethod: "COD", utr: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState({ upiId: "", qrCodeUrl: "", enabled: false });
  const [saving, setSaving] = useState(false);
  const [clientRequestId, setClientRequestId] = useState(newRequestId);
  const [quote, setQuote] = useState(null);
  const quoteToken = useRef(0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const localDelivery = subtotal >= 499 || subtotal === 0 ? 0 : 60;
  // Server quote is authoritative; local math only covers the first paint.
  const payable = quote ? quote.total : subtotal + localDelivery;

  useEffect(() => { api.paymentConfig().then(setPaymentConfig).catch(() => setPaymentConfig({ upiId: "", qrCodeUrl: "", enabled: false })); }, []);

  useEffect(() => {
    const token = ++quoteToken.current;
    const items = cart.map(item => ({ productId: item._id, quantity: item.quantity }));
    const timer = setTimeout(() => {
      const apply = setter => { if (quoteToken.current === token) setter(); };
      if (!items.length) { apply(() => setQuote(null)); return; }
      api.quoteOrder(items)
        .then(result => apply(() => setQuote(result)))
        .catch(() => apply(() => setQuote(null)));
    }, 250);
    return () => clearTimeout(timer);
  }, [cart]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate("/orders"), 2500);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const submit = async event => {
    event.preventDefault();
    setError("");
    if (!localStorage.getItem("nm_token")) return navigate("/login?next=/checkout");
    setSaving(true);
    try {
      const order = await api.createOrder({
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        address: form.address,
        phone: form.phone,
        paymentMethod: form.paymentMethod,
        utr: form.paymentMethod === "UPI" ? form.utr.trim() : "",
        clientRequestId,
        expectedTotal: payable
      });
      setDone(order);
      setClientRequestId(newRequestId());
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyUpi = async () => {
    try { await navigator.clipboard.writeText(paymentConfig.upiId); } catch { setError("Copy is unavailable. Please select the UPI ID manually."); }
  };

  if (!cart.length && !done) return <div className="empty"><h2>Cart is empty</h2><Link to="/shop" className="primary-btn">Shop Now</Link></div>;

  if (done) return (
    <div className="success-box">
      <Package size={52} />
      <h1>Order placed!</h1>
      <p>Order ID: <b>{done._id}</b></p>
      {done.paymentMethod === "UPI" && (
        <p className="payment-notice"><strong>Payment submitted successfully.</strong><br />Your payment is waiting for confirmation from the shop.</p>
      )}
      <Link to="/orders" className="primary-btn">View My Orders</Link>
      <small className="muted">Redirecting to My Orders…</small>
    </div>
  );

  return (
    <section>
      <div className="section-heading"><h1>Secure Checkout</h1></div>
      <form className="checkout-layout" onSubmit={submit}>
        <div className="form-card">
          <h2>Delivery details</h2>
          <label>Phone<input required value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+91..." /></label>
          <label>Address<textarea required value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} placeholder="House / village / road / PIN" /></label>
          <h2>Payment</h2>
          <label className="radio"><input type="radio" checked={form.paymentMethod === "COD"} onChange={() => setForm({ ...form, paymentMethod: "COD", utr: "" })} /> Cash on Delivery</label>
          <label className="radio">
            <input type="radio" checked={form.paymentMethod === "UPI"} onChange={() => setForm({ ...form, paymentMethod: "UPI" })} disabled={!paymentConfig.enabled} />
            UPI / QR Payment{!paymentConfig.enabled && <small className="muted"> (currently unavailable)</small>}
          </label>
          {form.paymentMethod === "UPI" && (
            <div className="upi-panel">
              <div className="upi-heading"><CreditCard size={19} /><strong>Pay manually via UPI</strong></div>
              <p>Pay the exact amount to the UPI ID or QR below, then select “I Have Paid”. Your order will wait for shop confirmation.</p>
              <div className="upi-amount">Payable amount <b>{money(payable)}</b></div>
              <div className="upi-id-row">
                <span>UPI ID: <b>{paymentConfig.upiId || "Not configured"}</b></span>
                <button type="button" onClick={copyUpi} disabled={!paymentConfig.upiId}><Copy size={15} /> Copy UPI ID</button>
              </div>
              {paymentConfig.qrCodeUrl
                ? <img className="upi-qr" src={paymentConfig.qrCodeUrl} alt="Shop UPI QR code" />
                : <div className="upi-qr-placeholder"><QrCode size={32} /><span>QR code is not configured</span></div>}
              <p>Scan the QR code or use the UPI ID to complete the payment yourself.</p>
              <label>UTR / transaction reference <small>(optional)</small>
                <input value={form.utr} onChange={event => setForm({ ...form, utr: event.target.value })} minLength="6" maxLength="80" placeholder="Enter reference after payment" />
              </label>
            </div>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary-btn full" type="submit" disabled={saving || (form.paymentMethod === "UPI" && !quote)}>
            {saving ? "Submitting..." : form.paymentMethod === "UPI" ? "I Have Paid" : "Place Order"} · {money(payable)}
          </button>
        </div>
        <aside className="summary">
          <h2>Your order</h2>
          {cart.map(item => <div key={item._id}><span>{item.name} × {item.quantity}</span><b>{money(item.price * item.quantity)}</b></div>)}
          <hr />
          <div><span>Delivery</span><b>{(quote ? quote.delivery : localDelivery) ? money(quote ? quote.delivery : localDelivery) : "FREE"}</b></div>
          <div className="total"><span>Total</span><b>{money(payable)}</b></div>
        </aside>
      </form>
    </section>
  );
}