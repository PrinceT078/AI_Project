import { useState } from "react";
import "../styles.css";

interface FollowupFormProps {
  questions: string[];
  onSubmit: (answers: string[]) => void;
  isLoading: boolean;
}

export function FollowupForm({ questions, onSubmit, isLoading }: FollowupFormProps) {
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(""));

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (answers.every((a) => a.trim())) {
      onSubmit(answers);
    }
  };

  const allAnswered = answers.every((a) => a.trim());

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h3>Additional Information Needed</h3>
      <div className="followup-questions">
        {questions.map((question, index) => (
          <div key={index} className="form-group">
            <label htmlFor={`q${index}`}>{question}</label>
            <input
              id={`q${index}`}
              type="text"
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Your answer..."
              disabled={isLoading}
            />
          </div>
        ))}
      </div>
      <button type="submit" disabled={isLoading || !allAnswered}>
        {isLoading ? "Processing..." : "Submit Answers"}
      </button>
    </form>
  );
}