export function LoadingSpinner({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}