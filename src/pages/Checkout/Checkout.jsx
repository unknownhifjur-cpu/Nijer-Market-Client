import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Copy, CreditCard, MapPin, Package, QrCode } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { money } from "../../utils/format";
import ProcessingIndicator from "../../components/common/ProcessingIndicator";
import { deliveryMapCenter, deliveryPostOffices, deliveryVillages } from "../../constants/deliveryLocations";
import "./Checkout.css";

const DeliveryLocationPicker = lazy(() => import("./DeliveryLocationPicker"));

const emptyAddress = {
  fullName: "",
  phone: "",
  locality: "",
  village: "",
  villageCustom: false,
  postOffice: "",
  postOfficeCustom: false,
  district: "Malda",
  pinCode: "732210",
  paymentMethod: "COD",
  utr: ""
};

function formFromSavedAddress(address) {
  return {
    ...emptyAddress,
    ...address,
    villageCustom: Boolean(address.villageCustom) || !deliveryVillages.includes(address.village),
    postOfficeCustom: Boolean(address.postOfficeCustom) || !deliveryPostOffices.includes(address.postOffice),
    district: "Malda",
    pinCode: "732210"
  };
}

function locationFromAddress(address) {
  if (
    !Number.isFinite(address?.latitude) ||
    !Number.isFinite(address?.longitude) ||
    address.latitude < -90 ||
    address.latitude > 90 ||
    address.longitude < -180 ||
    address.longitude > 180
  ) return null;
  return { latitude: address.latitude, longitude: address.longitude };
}

function mapCenterFromLocation(location) {
  return location ? [location.latitude, location.longitude] : null;
}

// One id per checkout visit: double clicks or retries reuse it, so the server never creates duplicate orders.
function newRequestId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function addressError(address) {
  if (address.fullName.trim().length < 2) return "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(address.phone)) return "Enter a valid 10-digit Indian mobile number.";
  if (address.locality.trim().length < 2) return "Enter your para or locality name.";
  if (address.village.trim().length < 2) return "Enter a village name with at least 2 characters.";
  if (!address.villageCustom && (!deliveryVillages.length || !deliveryVillages.includes(address.village.trim()))) {
    return "Choose a listed village or select “My village is not listed” to enter it manually.";
  }
  if (address.postOffice.trim().length < 2) return "Enter a Post Office name with at least 2 characters.";
  if (!address.postOfficeCustom && (!deliveryPostOffices.length || !deliveryPostOffices.includes(address.postOffice.trim()))) {
    return "Choose a listed Post Office or select the manual-entry option.";
  }
  return "";
}

function LocationField({ id, label, options, value, custom, onChange, onCustomChange }) {
  const listId = `${id}-options`;
  return (
    <div className="checkout-field">
      <label htmlFor={custom ? `${id}-manual` : id}>{label}<span aria-hidden="true"> *</span></label>
      {custom ? (
        <>
          <input
            id={`${id}-manual`}
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder={`Type your ${label.toLowerCase()}`}
            autoComplete="off"
            maxLength="100"
            required
          />
          <button className="co-town-toggle co-inline-link" type="button" onClick={() => onCustomChange(false)}>
            Choose from the available list
          </button>
        </>
      ) : (
        <>
          <input
            id={id}
            list={listId}
            value={value}
            onChange={event => onChange(event.target.value)}
            placeholder={options.length ? `Search or select ${label.toLowerCase()}` : `No ${label.toLowerCase()} list yet`}
            autoComplete="off"
            maxLength="100"
            required
          />
          <datalist id={listId}>
            {options.map(option => <option key={option} value={option} />)}
          </datalist>
          <button className="location-toggle" type="button" onClick={() => onCustomChange(true)}>
            {options.length ? `My ${label.toLowerCase()} is not listed` : `Enter ${label.toLowerCase()} manually`}
          </button>
          {!options.length && <small className="field-help">Location choices have not been configured yet. You can enter this manually.</small>}
        </>
      )}
    </div>
  );
}

export default function Checkout({ cart, clearCart, addressDraft, setAddressDraft }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...emptyAddress, ...(addressDraft || {}) }));
  const [isAuthenticated] = useState(() => Boolean(localStorage.getItem("nm_token")));
  const [selectedLocation, setSelectedLocation] = useState(() => locationFromAddress(addressDraft));
  const [pendingLocation, setPendingLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(() => mapCenterFromLocation(locationFromAddress(addressDraft)) || deliveryMapCenter);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");
  const [locationError, setLocationError] = useState("");
  const draftRef = useRef(addressDraft);
  const addressRequestStarted = useRef(false);
  const locationRequestInProgress = useRef(false);
  const [savedAddress, setSavedAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(Boolean(localStorage.getItem("nm_token")));
  const [addressSelected, setAddressSelected] = useState(Boolean(addressDraft));
  const [addressNotice, setAddressNotice] = useState(null);
  const [formError, setFormError] = useState("");
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

  useEffect(() => {
    api.paymentConfig().then(setPaymentConfig).catch(() => setPaymentConfig({ upiId: "", qrCodeUrl: "", enabled: false }));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || addressRequestStarted.current) return;
    addressRequestStarted.current = true;
    let active = true;
    setLoadingAddress(true);
    api.deliveryAddress()
      .then(result => {
        if (!active) return;
        setSavedAddress(result.address || null);
        if (result.address && !draftRef.current) {
          setForm(formFromSavedAddress(result.address));
          setAddressSelected(true);
        }
        const savedLocation = !draftRef.current ? locationFromAddress(result.address) : null;
        if (savedLocation) {
          setSelectedLocation(savedLocation);
          setMapCenter(mapCenterFromLocation(savedLocation));
        }
      })
      .catch(loadError => {
        if (!active) return;
        setAddressNotice({ type: "error", text: `${loadError.message}. You can still enter an address below.` });
      })
      .finally(() => {
        if (active) setLoadingAddress(false);
      });
    return () => { active = false; };
  }, [isAuthenticated]);

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

  const updateAddress = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    setFormError("");
    setAddressSelected(false);
    if (!isAuthenticated) {
      draftRef.current = next;
      setAddressDraft(next);
    }
  };

  const requestCurrentLocation = () => {
    if (locationRequestInProgress.current || saving) return;
    setLocationError("");
    setLocationStatus("");
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access. You can still enter your delivery address manually.");
      return;
    }

    locationRequestInProgress.current = true;
    setLocationLoading(true);
    setLocationStatus("Waiting for your device location…");
    try {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          if (
            !Number.isFinite(location.latitude) ||
            !Number.isFinite(location.longitude) ||
            location.latitude < -90 ||
            location.latitude > 90 ||
            location.longitude < -180 ||
            location.longitude > 180
          ) {
            setLocationError("Your device returned an invalid location. You can continue with manual address entry.");
            setLocationStatus("");
          } else {
            setPendingLocation(location);
            setMapCenter(mapCenterFromLocation(location));
            setLocationStatus("Location found. Review the point on the map and confirm it before attaching it to your address.");
          }
          locationRequestInProgress.current = false;
          setLocationLoading(false);
        },
        positionError => {
          const message = positionError.code === 1
            ? "Location permission was denied. Allow location access in your browser or enter your address manually."
            : positionError.code === 3
              ? "Your location request timed out. Check GPS reception and try again, or enter your address manually."
              : "Your device could not determine a location. Check GPS and connection availability, or enter your address manually.";
          setLocationError(message);
          setLocationStatus("");
          locationRequestInProgress.current = false;
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    } catch {
      setLocationError("Your browser could not start location access. Check that this page is using HTTPS, or enter your address manually.");
      setLocationStatus("");
      locationRequestInProgress.current = false;
      setLocationLoading(false);
    }
  };

  const selectMapLocation = location => {
    setLocationError("");
    setLocationStatus("Map point selected. Confirm it to attach it to your address.");
    setPendingLocation(location);
  };

  const confirmLocation = () => {
    if (!pendingLocation || saving) return;
    const next = {
      ...form,
      latitude: pendingLocation.latitude,
      longitude: pendingLocation.longitude
    };
    setForm(next);
    setSelectedLocation(pendingLocation);
    setPendingLocation(null);
    setAddressSelected(false);
    setFormError("");
    setLocationError("");
    setLocationStatus("Delivery point confirmed. Review your address fields before placing the order.");
    if (!isAuthenticated) {
      draftRef.current = next;
      setAddressDraft(next);
    }
  };

  const clearLocation = () => {
    const next = { ...form };
    delete next.latitude;
    delete next.longitude;
    setForm(next);
    setSelectedLocation(null);
    setPendingLocation(null);
    setAddressSelected(false);
    setLocationError("");
    setLocationStatus("Delivery point cleared. You can continue with your written address.");
    if (!isAuthenticated) {
      draftRef.current = next;
      setAddressDraft(next);
    }
  };

  const useAddress = () => {
    const validationMessage = addressError(form);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormError("");
    setAddressSelected(true);
  };

  const saveAddress = async () => {
    const validationMessage = addressError(form);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormError("");
    setAddressNotice(null);
    setSaving(true);
    try {
      const result = await api.saveDeliveryAddress({
        ...form,
        district: "Malda",
        pinCode: "732210"
      });
      setSavedAddress(result.address);
      setForm(previous => ({ ...previous, ...formFromSavedAddress(result.address) }));
      setAddressSelected(true);
      draftRef.current = null;
      setAddressDraft(null);
      setAddressNotice({ type: "success", text: "Your delivery address was saved to your account." });
    } catch (saveError) {
      setAddressNotice({ type: "error", text: `${saveError.message}. Your changes are still on this page.` });
    } finally {
      setSaving(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    setError("");
    const validationMessage = addressError(form);
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormError("");
    if (loadingAddress) {
      setError("Please wait while we finish checking your saved delivery address.");
      return;
    }
    if (!isAuthenticated) {
      setError("Sign in or create an account to place your order. Your address draft will remain on this page while you sign in.");
      return;
    }
    if (savedAddress && !addressSelected) {
      setError("Review your changes, then choose “Use This Address” before placing the order.");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const order = await api.createOrder({
        items: cart.map(item => ({ productId: item._id, quantity: item.quantity })),
        deliveryAddress: {
          ...form,
          district: "Malda",
          pinCode: "732210"
        },
        paymentMethod: form.paymentMethod,
        utr: form.paymentMethod === "UPI" ? form.utr.trim() : "",
        clientRequestId,
        expectedTotal: payable
      });
      setDone(order);
      setClientRequestId(newRequestId());
      draftRef.current = null;
      setAddressDraft(null);
      clearCart();
    } catch (submitError) {
      setError(submitError.message);
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
      <form className="checkout-layout co-checkout-layout" onSubmit={submit}>
        <div className="form-card co-form-card">
          <div className="delivery-heading co-delivery-header">
            <div className="co-delivery-title"><MapPin size={20} aria-hidden="true" /><h2>Delivery address</h2></div>
            {loadingAddress && <span className="address-loading co-address-loading" role="status">Loading saved address…</span>}
          </div>
          <p className="co-required-note"><span className="co-required-asterisk">*</span> required</p>
          {addressNotice && (
            <p className={`address-notice ${addressNotice.type} co-message ${addressNotice.type}`} role={addressNotice.type === "error" ? "alert" : "status"}>
              {addressNotice.type === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : null}{addressNotice.text}
            </p>
          )}
          {!isAuthenticated && (
            <div className="guest-checkout-note co-guest-callout">
              <p>You can enter your delivery details without an account. Sign in or create an account to place your order and save this address to your account.</p>
              <Link className="outline-btn" to="/login?next=/checkout">Sign in or create an account</Link>
              <small>This address draft is kept only in this page session until you sign in. It is not saved across devices.</small>
            </div>
          )}
          <Suspense fallback={<p className="co-location-status" role="status">Loading location tools…</p>}>
            <DeliveryLocationPicker
              center={mapCenter}
              pendingLocation={pendingLocation}
              selectedLocation={selectedLocation}
              loading={locationLoading}
              disabled={saving}
              status={locationStatus}
              error={locationError}
              onUseCurrentLocation={requestCurrentLocation}
              onSelectLocation={selectMapLocation}
              onConfirmLocation={confirmLocation}
              onClearLocation={clearLocation}
            />
          </Suspense>
          <fieldset className="delivery-fields co-delivery-fields" disabled={saving} aria-label="Delivery address details">
            <legend className="co-visually-hidden">Delivery address</legend>
            <div className="checkout-field">
              <label htmlFor="delivery-name">Full name<span aria-hidden="true"> *</span></label>
              <input id="delivery-name" autoComplete="name" value={form.fullName} onChange={event => updateAddress("fullName", event.target.value)} placeholder="Name of the person receiving the order" maxLength="80" required />
            </div>
            <div className="checkout-field">
              <label htmlFor="delivery-phone">Phone number<span aria-hidden="true"> *</span></label>
              <input id="delivery-phone" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" title="Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9" value={form.phone} onChange={event => updateAddress("phone", event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit Indian mobile number" maxLength="10" required />
            </div>
            <div className="checkout-field delivery-field-wide">
              <label htmlFor="delivery-locality">Para / locality name<span aria-hidden="true"> *</span></label>
              <input id="delivery-locality" autoComplete="address-line1" value={form.locality} onChange={event => updateAddress("locality", event.target.value)} placeholder="House, para, or nearby landmark" maxLength="120" required />
            </div>
            <LocationField id="delivery-village" label="Village" options={deliveryVillages} value={form.village} custom={form.villageCustom} onChange={value => updateAddress("village", value)} onCustomChange={value => updateAddress("villageCustom", value)} />
            <LocationField id="delivery-post-office" label="Post Office" options={deliveryPostOffices} value={form.postOffice} custom={form.postOfficeCustom} onChange={value => updateAddress("postOffice", value)} onCustomChange={value => updateAddress("postOfficeCustom", value)} />
            <div className="fixed-address-fields">
              <div className="checkout-field">
                <label htmlFor="delivery-district">District</label>
                <input id="delivery-district" className="co-readonly-field" value="Malda" readOnly aria-readonly="true" aria-hidden="true" />
              </div>
              <div className="checkout-field">
                <label htmlFor="delivery-pin">PIN code</label>
                <input id="delivery-pin" className="co-readonly-field" value="732210" readOnly aria-readonly="true" inputMode="numeric" aria-hidden="true" />
              </div>
            </div>
          </fieldset>
          {formError && <p className="error co-message error" role="alert">{formError}</p>}
          <div className="address-actions co-address-actions">
            {isAuthenticated && <button className="outline-btn" type="button" onClick={saveAddress} disabled={saving || loadingAddress}>Save Address</button>}
            <button className={`outline-btn use-address-btn co-use-address-btn ${addressSelected ? "is-selected" : ""}`} type="button" onClick={useAddress} aria-pressed={addressSelected}><CheckCircle2 size={17} aria-hidden="true" />{addressSelected ? "Address Selected" : "Use This Address"}</button>
          </div>
          {isAuthenticated && savedAddress && <small className="field-help">This account has one saved delivery address. Saving edits updates that address.</small>}
          <div className="co-section-divider" aria-hidden="true" />
          <div className="co-payment-section">
            <h2 className="payment-title co-section-title"><CreditCard size={18} aria-hidden="true" />Payment</h2>
            <div className="payment-options co-payment-options" role="radiogroup" aria-label="Payment method">
              <label className={`radio co-payment-option ${form.paymentMethod === "COD" ? "is-active" : ""}`}>
                <input type="radio" checked={form.paymentMethod === "COD"} onChange={() => setForm({ ...form, paymentMethod: "COD", utr: "" })} />
                <span className="co-payment-copy">
                  <span>
                    <strong>Cash on Delivery</strong>
                    <small>Pay when your order arrives</small>
                  </span>
                  <CreditCard size={18} aria-hidden="true" />
                </span>
              </label>
              <label className={`radio co-payment-option ${form.paymentMethod === "UPI" ? "is-active" : ""} ${!paymentConfig.enabled ? "is-disabled" : ""}`}>
                <input type="radio" checked={form.paymentMethod === "UPI"} onChange={() => setForm({ ...form, paymentMethod: "UPI" })} disabled={!paymentConfig.enabled} />
                <span className="co-payment-copy">
                  <span>
                    <strong>UPI / QR Payment</strong>
                    <small>{paymentConfig.enabled ? "Pay now with your UPI app" : "Currently unavailable"}</small>
                  </span>
                  <QrCode size={18} aria-hidden="true" />
                </span>
              </label>
            </div>
            {form.paymentMethod === "UPI" && (
              <div className="upi-panel co-upi-panel">
                <div className="upi-heading co-upi-header"><CreditCard size={19} aria-hidden="true" /><strong>Pay manually via UPI</strong></div>
                <p>Pay the exact amount to the UPI ID or QR below, then select “I Have Paid”. Your order will wait for shop confirmation.</p>
                <div className="upi-amount co-upi-amount">Payable amount <b>{money(payable)}</b></div>
                <div className="upi-id-row co-upi-row">
                  <span>UPI ID: <b>{paymentConfig.upiId || "Not configured"}</b></span>
                  <button className="co-copy-btn" type="button" onClick={copyUpi} disabled={!paymentConfig.upiId}><Copy size={15} aria-hidden="true" /> Copy</button>
                </div>
                <div className="co-qr-wrap">
                  {paymentConfig.qrCodeUrl
                    ? <div className="co-qr-frame"><img src={paymentConfig.qrCodeUrl} alt="Shop UPI QR code" /></div>
                    : <div className="co-qr-frame co-qr-placeholder"><QrCode size={32} aria-hidden="true" /><span>QR code is not configured</span></div>}
                </div>
                <p>Scan the QR code or use the UPI ID to complete the payment yourself.</p>
                <div className="co-utr-field">
                  <label htmlFor="upi-utr">UTR / transaction reference <small>(optional)</small></label>
                  <input id="upi-utr" value={form.utr} onChange={event => setForm({ ...form, utr: event.target.value })} minLength="6" maxLength="80" placeholder="Enter reference after payment" />
                </div>
              </div>
            )}
          </div>
          {error && <p className="error co-message error" role="alert">{error}</p>}
          <button className="primary-btn full co-submit-btn" type="submit" disabled={saving || (form.paymentMethod === "UPI" && !quote)} aria-busy={saving}>
            {saving ? <ProcessingIndicator>Processing your order...</ProcessingIndicator> : <>{form.paymentMethod === "UPI" ? "I Have Paid" : "Place Order"} · {money(payable)}</>}
          </button>
        </div>
        <aside className="summary co-summary-panel">
          <h2>Your order</h2>
          <ul className="co-summary-list">
            {cart.map(item => (
              <li key={item._id} className="co-summary-item">
                <span>{item.name} × {item.quantity}</span>
                <b>{money(item.price * item.quantity)}</b>
              </li>
            ))}
          </ul>
          <div className="co-summary-item co-summary-total">
            <span>Delivery</span>
            <b className="co-summary-delivery-free">{(quote ? quote.delivery : localDelivery) ? money(quote ? quote.delivery : localDelivery) : "FREE"}</b>
          </div>
          <div className="co-summary-item co-summary-total">
            <span>Total</span>
            <b>{money(payable)}</b>
          </div>
        </aside>
      </form>
    </section>
  );
}
