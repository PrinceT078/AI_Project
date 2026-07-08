import "../styles.css";

interface SummaryViewProps {
  urgency: string;
  confidence: number;
  summary: string;
  onReset: () => void;
}

export function SummaryView({ urgency, confidence, summary, onReset }: SummaryViewProps) {
  const urgencyColor = {
    LOW: "#28a745",
    MEDIUM: "#ffc107",
    HIGH: "#dc3545",
  }[urgency] || "#6c757d";

  return (
    <div className="summary-container">
      <div className="summary-header">
        <h2>Clinical Summary</h2>
      </div>

      <div className="summary-meta">
        <div className="meta-item">
          <span className="label">Urgency Level: </span>
          <span className="urgency" style={{ color: urgencyColor }}>
            {urgency}
          </span>
        </div>
        <div className="meta-item">
          <span className="label">Confidence Score: </span>
          <span className="confidence">{confidence}%</span>
        </div>
      </div>

      <div className="summary-text">
        <p>{summary}</p>
      </div>

      <button onClick={onReset} className="reset-button">
        Start New Assessment
      </button>
    </div>
  );
}