import { type Request, type Response } from "express";
import { Ollama } from "ollama";
import { graph } from "../graph/graph.ts";
import { v4 as uuidv4 } from "uuid";
import {
  getSession,
  saveSession,
} from "../utils/sessionHelper.ts";
import { classifyUrgency } from "../graph/nodes/classifyUrgency.ts";
import { generateSummary } from "../graph/nodes/generateSummary.ts";
import { retrieveGuidelines } from "../retrieval/retriever.ts";
import { checkpointer } from "../db/checkpointer.ts";

class OllamaController {
  private ollama: Ollama;
  private model: string = "llama3.2";
  constructor() {
    this.ollama = new Ollama({
      host: "http://localhost:11434",
    });
  }

  public async getHealth(req: Request, res: Response) {
    return res.json({ status: "ok" });
  }

  public async getOllamaResponse(req: Request, res: Response) {
    try {
      console.log("Processing patientInput with Ollama...");
      const { patientInput } = req.body;
      console.log(`Received patientInput: ${patientInput}`);
      const response = await this.ollama.generate({
        model: this.model,
        prompt: patientInput,
      });

      console.log(`Ollama response: ${JSON.stringify(response)}`);
      return res.json({ response: response.response });
    } catch (error: any) {
      console.error(
        `Error occurred while generating Ollama response: ${error}`,
      );
      return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  }

  public async getChatResponse(req: Request, res: Response) {
    console.log("**Processing patientInput**");
    try {
      const sessionId: string = uuidv4();
      const { patientInput } = req.body;
      console.log(`Received patientInput: ${patientInput}`);
      const result = await graph.invoke({
        patientInput,
        sessionId,
        symptoms: [],
        retrievedGuidelines: [],
        citedGuidelineIds: [],
        requiresFollowup: false,
        followupQuestions: [],
        followupAnswers: [],
        urgency: "MEDIUM",
        confidence: 0,
        summary: "",
        symptomRetryCount: 0,
        maxSymptomRetries: 1,
      });

      saveSession(sessionId, result);

      if (result.requiresFollowup) {
        console.log("Follow-up required. Returning follow-up questions.");
        return res.json({
          sessionId,
          requiresFollowup: true,
          followupQuestions: result.followupQuestions,
        });
      }

      console.log("No follow up questions. Returning response");
      return res.json({
        sessionId,
        requiresFollowup: false,
        urgency: result.urgency,
        confidence: result.confidence,
        summary: result.summary,
      });
    } catch (error: any) {
      console.error(
        `Error occurred while generating Ollama response: ${error}`,
      );
      return res
        .status(500)
        .json({ error: error.message || "Internal Server Error" });
    }
  }

  public async processFollowupAnswers(req: Request, res: Response) {
    try {
      console.log("Processing follow-up answers");
      const { sessionId, followupAnswers } = req.body;

      if (!followupAnswers || followupAnswers.length === 0) {
        return res.status(400).json({ error: "No answers provided" });
      }

      let state = getSession(sessionId);
      if (!state) {
        return res.status(404).json({ error: "Session expired" });
      }

      const updatedState = {
        ...state,
        followupAnswers,
        retrievedGuidelines: await retrieveGuidelines(state.symptoms ?? [], 3),
      };
      // patientInput: `${state.patientInput} Additional info: ${followupAnswers.join(", ")}`,

      const result = await classifyUrgency(updatedState);
      const finalResult = await generateSummary(result);

      // clearSession(sessionId);
      saveSession(sessionId, finalResult);
      checkpointer.clearCheckpoints(sessionId); // Cleanup checkpoints

      return res.json({
        urgency: finalResult.urgency,
        confidence: finalResult.confidence,
        summary: finalResult.summary,
      });
    } catch (error: any) {
      console.error(
        `Error occurred while processing follow-up answers: ${error}`,
      );
      return res.status(500).json({ error: error.message || "Error processing follow-up answers" });
    }
  }
}

export default OllamaController;
