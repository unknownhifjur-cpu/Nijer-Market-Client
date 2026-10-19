export default function BrandLoader({ title = "Loading...", detail = "Getting things ready for you." }) {
  return (
    <div className="loading brand-loader" role="status" aria-live="polite">
      <span className="brand-loader-mark">
        <img src="/pwa-192.png" alt="" />
      </span>
      <span className="brand-loader-ring" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{detail}</p>
    </div>
  );
}
