export default function ProcessingIndicator({ children }) {
  return (
    <span className="processing-label">
      <span className="processing-spinner" aria-hidden="true" />
      {children}
    </span>
  );
}
