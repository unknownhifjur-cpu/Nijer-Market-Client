import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { heroSlides } from "./heroSlides";
import "./HomeHero.css";

function productImageForSlide(slide, index, products) {
  const availableProducts = products.filter(product => typeof product.image === "string" && product.image.trim());
  if (!availableProducts.length) return null;

  if (slide.offerProduct) {
    const offer = availableProducts.find(product => Number(product.discount) > 0 || Number(product.price) < Number(product.mrp));
    if (offer) return { src: offer.image, alt: `${offer.nameBn || offer.name} product image` };
  }

  if (slide.productKeywords?.length) {
    const match = availableProducts.find(product => {
      const searchableText = [
        product.name,
        product.nameBn,
        product.nameBanglish,
        product.category,
        product.brand,
        ...(Array.isArray(product.tags) ? product.tags : [])
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      return slide.productKeywords.some(keyword => searchableText.includes(keyword.toLocaleLowerCase()));
    });
    if (match) return { src: match.image, alt: `${match.nameBn || match.name} product image` };
  }

  const fallback = availableProducts[index % availableProducts.length];
  return { src: fallback.image, alt: `${fallback.nameBn || fallback.name} product image` };
}

export default function HomeHero({ products }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = event => setReducedMotion(event.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (hovered || focusWithin || reducedMotion || heroSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1) % heroSlides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [focusWithin, hovered, reducedMotion]);

  const slide = heroSlides[activeIndex];
  const productImage = productImageForSlide(slide, activeIndex, products);
  const imageUrl = slide.imageUrl || productImage?.src || "";
  const imageAlt = slide.imageUrl ? slide.imageAlt : productImage?.alt || slide.imageAlt;
  const imageFailed = failedImages[slide.id];

  const goToSlide = index => {
    setActiveIndex((index + heroSlides.length) % heroSlides.length);
  };

  return (
    <section
      className="nm-hero"
      style={{
        "--nm-hero-bg": slide.background,
        "--nm-hero-text": slide.textColor,
        "--nm-hero-accent": slide.accentColor,
        "--nm-hero-button-text": slide.primaryTextColor
      }}
      aria-roledescription="carousel"
      aria-label="NIJER MARKET offers"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
    >
      <div className="nm-hero-copy" key={slide.id}>
        <span className="nm-hero-label">{slide.label}</span>
        <p className="nm-hero-eyebrow">{slide.eyebrow}</p>
        <h1 id="home-hero-title">{slide.title}</h1>
        <p className="nm-hero-description">{slide.subtitle}</p>
        <div className="nm-hero-actions">
          <Link className="nm-hero-primary" to={slide.primaryAction.href}>
            {slide.primaryAction.label}
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
          {slide.secondaryAction && (
            <Link className="nm-hero-secondary" to={slide.secondaryAction.href}>
              {slide.secondaryAction.label}
            </Link>
          )}
        </div>
      </div>

      <div className="nm-hero-visual">
        {imageUrl && !imageFailed ? (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={imageAlt}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            fetchPriority={activeIndex === 0 ? "high" : "auto"}
            decoding="async"
            style={{ objectPosition: slide.imagePosition || "center" }}
            onError={() => setFailedImages(current => ({ ...current, [slide.id]: true }))}
          />
        ) : (
          <div className="nm-hero-image-fallback" role="img" aria-label={`Promotional image unavailable. ${slide.title}`}>
            <span aria-hidden="true">NIJER MARKET</span>
          </div>
        )}
      </div>

      <div className="nm-hero-controls">
        <span className="nm-hero-count" aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}</span>
        <div className="nm-hero-dots" aria-label="Choose a promotion">
          {heroSlides.map((item, index) => (
            <button
              className={`nm-hero-dot${activeIndex === index ? " is-active" : ""}`}
              type="button"
              key={item.id}
              aria-label={`Show promotion ${index + 1}: ${item.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        <div className="nm-hero-arrows">
          <button type="button" aria-label="Previous promotion" onClick={() => goToSlide(activeIndex - 1)}>
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next promotion" onClick={() => goToSlide(activeIndex + 1)}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <span className="nm-hero-live" aria-live="off">{slide.title}</span>
    </section>
  );
}
