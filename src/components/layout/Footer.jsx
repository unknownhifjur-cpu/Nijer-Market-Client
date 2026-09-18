import { ArrowUpRight, Heart, Mail, MapPin, Phone, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const shopLinks = [
  ["Shop all products", "/shop"],
  ["Fresh food", "/shop?category=Fresh%20Food"]
];

const quickLinks = [
  ["My orders", "/orders"],
  ["Wishlist", "/wishlist"]
];

export default function Footer() {
  const linkGroup = (title, links, label) => <div className="footer-column">
    <h2>{title}</h2>
    <nav aria-label={label} className="footer-links">
      {links.map(([linkLabel, href]) => <Link to={href} key={href}>{linkLabel}<ArrowUpRight size={15} aria-hidden="true" /></Link>)}
    </nav>
  </div>;

  return <footer className="footer">
    <div className="footer-main">
      <section className="footer-brand" aria-labelledby="footer-brand-title">
        <Link to="/" className="footer-logo" aria-label="NIJER MARKET home"><img src="/logo.png" alt="NIJER MARKET logo" /></Link>
        <p id="footer-brand-title">আপনার এলাকা, আপনার নিজের বাজার।</p>
        <span>Trusted local shops, delivered to your door.</span>
        <div className="footer-trust" aria-label="Shopping benefits">
          <span><ShieldCheck size={17} aria-hidden="true" /> Secure shopping</span>
          <span><Truck size={17} aria-hidden="true" /> Local delivery</span>
        </div>
      </section>
      <nav className="footer-mobile-links" aria-label="Mobile footer links">
        <Link to="/shop">Shop</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/wishlist">Wishlist</Link>
        <a href="tel:+919876543210">Help</a>
      </nav>
      {linkGroup("Explore", shopLinks, "Explore")}
      {linkGroup("Quick links", quickLinks, "Quick links")}
      <section className="footer-column footer-contact" aria-labelledby="footer-contact-title">
        <h2 id="footer-contact-title">Need help?</h2>
        <div className="footer-contact-list">
          <a href="tel:+919876543210" aria-label="Call NIJER MARKET at plus 91 98765 43210"><span className="footer-icon"><Phone size={16} aria-hidden="true" /></span><span>+91 959388 1943</span></a>
          <a href="mailto:hello@nijermarket.local" aria-label="Email NIJER MARKET at hello at nijer market dot local"><span className="footer-icon"><Mail size={16} aria-hidden="true" /></span><span>hello@nijermarket.local</span></a>
          <span><span className="footer-icon"><MapPin size={16} aria-hidden="true" /></span><span>Serving your local area</span></span>
        </div>
      </section>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} NIJER MARKET</span><span>Made for local shopping <Heart size={14} fill="currentColor" aria-hidden="true" /></span></div>
  </footer>;
}
