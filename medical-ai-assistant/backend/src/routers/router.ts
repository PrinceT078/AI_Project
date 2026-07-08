import express, { type Request, type Response } from "express";
import OllamaController from "../controller/controller.js";

const controller: OllamaController = new OllamaController();
const router = express.Router();

router.get("/health", async (req: Request, res: Response) =>
  controller.getHealth(req, res),
);

router.post("/test", async (req: Request, res: Response) =>
  controller.getOllamaResponse(req, res)
);

router.post("/chat", async (req: Request, res: Response) =>
  controller.getChatResponse(req, res)
);

router.post("/followup/answers", async (req: Request, res: Response) =>
  controller.processFollowupAnswers(req, res)
);

export default router;
