import { useState } from "react";
import "../styles.css";

interface SymptomFormProps {
  onSubmit: (symptoms: string) => void;
  isLoading: boolean;
}

export function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="symptoms" className="lbl">Describe your symptoms: </label>
        <textarea
          id="symptoms"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., I have a fever and cough for 3 days..."
          disabled={isLoading}
          rows={2}
          cols={50}
        ></textarea>
      </div>
      <button type="submit" disabled={isLoading || !input.trim()}>
        {isLoading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
}