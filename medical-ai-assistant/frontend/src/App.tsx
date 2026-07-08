import { useState } from "react";
import { SymptomForm } from "./components/SymptomForm";
import { FollowupForm } from "./components/FollowupForm";
import { SummaryView } from "./components/SummaryView";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { submitSymptoms, submitFollowupAnswers } from "./api/client";
import "./App.css";

type Stage = "input" | "followup" | "summary";

export default function App() {
  const [stage, setStage] = useState<Stage>("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session data
  const [sessionId, setSessionId] = useState<string>("");
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);

  // Summary data
  const [summary, setSummary] = useState({
    urgency: "",
    confidence: 0,
    summary: "",
  });

  const handleSymptomSubmit = async (symptoms: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitSymptoms(symptoms);
      setSessionId(response.sessionId);

      if (response.requiresFollowup) {
        setFollowupQuestions(response.followupQuestions || []);
        setStage("followup");
      } else {
        setSummary({
          urgency: response.urgency || "",
          confidence: response.confidence || 0,
          summary: response.summary || "",
        });
        setStage("summary");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowupSubmit = async (answers: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitFollowupAnswers(sessionId, answers);
      setSummary({
        urgency: response.urgency,
        confidence: response.confidence,
        summary: response.summary,
      });
      setStage("summary");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStage("input");
    setSessionId("");
    setFollowupQuestions([]);
    setSummary({ urgency: "", confidence: 0, summary: "" });
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Medical AI Assistant</h1>
        <p>Symptom Assessment Tool</p>
      </header>

      <main className="app-main">
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <LoadingSpinner
            message={
              stage === "followup"
                ? "Processing your answers..."
                : "Analyzing your symptoms..."
            }
          />
        ) : stage === "input" ? (
          <SymptomForm onSubmit={handleSymptomSubmit} isLoading={isLoading} />
        ) : stage === "followup" ? (
          <FollowupForm
            questions={followupQuestions}
            onSubmit={handleFollowupSubmit}
            isLoading={isLoading}
          />
        ) : (
          <SummaryView
            urgency={summary.urgency}
            confidence={summary.confidence}
            summary={summary.summary}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>⚠️ Disclaimer: This is not a medical diagnosis. Please consult a healthcare professional.</p>
      </footer>
    </div>
  );
}