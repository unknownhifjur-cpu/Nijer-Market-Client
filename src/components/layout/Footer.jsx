import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";

const shopLinks = [
  ["Shop all products", "/shop"],
  ["Browse categories", "/shop"],
];

const quickLinks = [
  ["My orders", "/orders"],
  ["Wishlist", "/wishlist"],
];

export default function Footer() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installMessage, setInstallMessage] = useState("");

  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallMessage("");
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);

      setInstallMessage(
        isIos
          ? "In Safari, tap Share → Add to Home Screen."
          : "Open your browser menu and select Install app or Add to Home Screen."
      );
      return;
    }

    try {
      await installPrompt.prompt();

      const { outcome } = await installPrompt.userChoice;

      setInstallPrompt(null);
      setInstallMessage(
        outcome === "accepted" ? "Installation started." : ""
      );
    } catch (error) {
      console.error("App installation prompt failed:", error);
      setInstallMessage("Please try installing from your browser menu.");
    }
  };

  const renderLinkGroup = (title, links, ariaLabel) => (
    <div className="footer-column">
      <h2>{title}</h2>

      <nav className="footer-links" aria-label={ariaLabel}>
        {links.map(([label, href]) => (
          <Link to={href} key={href}>
            <span>{label}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* Brand */}
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <p id="footer-brand-title">
            আপনার এলাকা, আপনার নিজের বাজার।
          </p>

          <span>
            Everyday essentials, from shops you trust.
          </span>

          <div className="footer-trust" aria-label="Shopping benefits">
            <span>
              <ShieldCheck size={17} aria-hidden="true" />
              Secure shopping
            </span>

            <span>
              <Truck size={17} aria-hidden="true" />
              Local delivery
            </span>
          </div>

          {!isInstalled && (
            <div className="footer-install">
              <button
                type="button"
                className="footer-install-button"
                onClick={handleInstall}
              >
                <ArrowDownToLine size={17} aria-hidden="true" />
                Install App
              </button>

              {installMessage && (
                <p className="footer-install-message" role="status">
                  {installMessage}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Compact navigation for mobile */}
        <nav className="footer-mobile-links" aria-label="Quick navigation">
          <Link to="/shop">Shop</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <a href="tel:+919593881943">Help</a>
        </nav>

        {/* Desktop navigation */}
        {renderLinkGroup("Explore", shopLinks, "Explore products")}
        {renderLinkGroup("Your account", quickLinks, "Account links")}

        {/* Contact */}
        <section
          className="footer-column footer-contact"
          aria-labelledby="footer-contact-title"
        >
          <h2 id="footer-contact-title">We're here to help</h2>

          <div className="footer-contact-list">
            <a
              href="tel:+919593881943"
              aria-label="Call customer support"
            >
              <span className="footer-icon">
                <Phone size={16} aria-hidden="true" />
              </span>
              <span>+91 959388 1943</span>
            </a>

            <a
              href="mailto:nijermarket@gmail.com"
              aria-label="Email customer support"
            >
              <span className="footer-icon">
                <Mail size={16} aria-hidden="true" />
              </span>
              <span>nijermarket@gmail.com</span>
            </a>

            <span>
              <span className="footer-icon">
                <MapPin size={16} aria-hidden="true" />
              </span>
              <span>Chandranarayanpur, Malda </span>
            </span>
          </div>
        </section>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} NIJER MARKET</span>

        <span>
          Made for local shopping
          <Heart size={14} fill="currentColor" aria-hidden="true" />
        </span>
      </div>
    </footer>
  );
}
