import { useState } from "react";
import { Eye, EyeOff, Leaf, LockKeyhole, Mail, MapPin, ShieldCheck, ShoppingBag, Truck, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import ProcessingIndicator from "../../components/common/ProcessingIndicator";

export default function Login({ onAuth }) {
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const [registerMode, setRegisterMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", identifier: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const update = event => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async event => {
    event.preventDefault();
    setError("");
    if (registerMode && form.password !== form.confirmPassword) return setError("Passwords do not match");
    setSaving(true);
    try {
      const result = registerMode ? await api.register({ name: form.name, email: form.email, phone: form.phone, password: form.password }) : await api.login({ identifier: form.identifier, password: form.password });
      localStorage.setItem("nm_token", result.token);
      localStorage.setItem("nm_user", JSON.stringify(result.user));
      onAuth(result.user);
      navigate(query.get("next") || "/account");
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const switchMode = () => { setRegisterMode(!registerMode); setError(""); setForm({ name: "", email: "", phone: "", identifier: "", password: "", confirmPassword: "" }); };
  const benefits = [[Truck, "Local delivery", "Fresh to your door"], [ShieldCheck, "Trusted shops", "Local and reliable"], [ShoppingBag, "Easy shopping", "Everything in one place"], [Leaf, "Better everyday", "Made for your area"]];
  return <div className={`auth-page ${registerMode ? "signup-page" : "login-page"}`}>
    <div className="auth-shell">
      <section className="auth-visual" aria-labelledby="auth-title">
        <div className="auth-decor auth-decor-one"><Leaf size={30} /></div><div className="auth-decor auth-decor-two"><MapPin size={24} /></div>
        <div className="auth-logo"><img src="/logo.png" alt="NIJER MARKET logo" /></div>
        <span className="auth-kicker">Your local market, online</span>
        <h1 id="auth-title">{registerMode ? "Welcome to NIJER MARKET" : "Welcome back"}</h1>
        <p>{registerMode ? "Shop from trusted local stores." : "Sign in to shop from trusted local stores."}</p>
        <div className="auth-market-art" aria-hidden="true"><span><Leaf /></span><span><ShoppingBag /></span><span><MapPin /></span></div>
      </section>
      <section className="auth-form-panel" aria-label={registerMode ? "Create account" : "Sign in"}>
        {registerMode && <div className="auth-benefits">{benefits.map(([Icon, title, detail]) => <div key={title}><span><Icon size={17} /></span><strong>{title}</strong><small>{detail}</small></div>)}</div>}
        <div className="auth-form-heading"><span>{registerMode ? "Get started" : "Account access"}</span><h2>{registerMode ? "Create your account" : "Sign in"}</h2><p>{registerMode ? "It only takes a minute." : "Use your email or phone number."}</p></div>
        <form onSubmit={submit} className="auth-form">
          {registerMode ? <>
            <label><span>Full name</span><div className="auth-input"><UserRound size={17} /><input name="name" autoComplete="name" placeholder="Enter your full name" required minLength="2" value={form.name} onChange={update} /></div></label>
            <label><span>Email <em>or phone number</em></span><div className="auth-input"><Mail size={17} /><input name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} /></div><div className="auth-input auth-phone-input"><MapPin size={17} /><input name="phone" type="tel" autoComplete="tel" placeholder="Phone number (optional)" value={form.phone} onChange={update} /></div></label>
          </> : <label><span>Email or phone number</span><div className="auth-input"><Mail size={17} /><input name="identifier" autoComplete="username" placeholder="Email or phone number" required value={form.identifier} onChange={update} /></div></label>}
          <label><span>Password</span><div className="auth-input"><LockKeyhole size={17} /><input name="password" type={showPassword ? "text" : "password"} autoComplete={registerMode ? "new-password" : "current-password"} placeholder="At least 6 characters" minLength="6" required value={form.password} onChange={update} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
          {registerMode && <label><span>Confirm password</span><div className="auth-input"><LockKeyhole size={17} /><input name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" minLength="6" required value={form.confirmPassword} onChange={update} /><button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}>{showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>}
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary-btn full auth-submit" disabled={saving} aria-busy={saving}>{saving ? <ProcessingIndicator>{registerMode ? "Creating account..." : "Signing in..."}</ProcessingIndicator> : <>{registerMode ? "Create Account" : "Sign In"}<span aria-hidden="true">→</span></>}</button>
        </form>
        {registerMode && <p className="auth-terms">By continuing, you agree to our Terms &amp; Conditions and Privacy Policy.</p>}
        <p className="auth-switch">{registerMode ? "Already have an account?" : "New to NIJER MARKET?"} <button type="button" onClick={switchMode}>{registerMode ? "Sign in" : "Create an account"} →</button></p>
      </section>
    </div>
  </div>;
}
