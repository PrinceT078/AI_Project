import express, { type Request, type Response } from "express";
import router from "./routers/router.js";
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/", router);

// app.get("/health", (_req, res) => {
//   res.json({ status: "ok" });
// });

// app.post("/ask", async (req: Request, res: Response) => {
//   console.log("Received request to /ask endpoint");
//   const { patientInput } = req.body;
//   const response = await router.getOllamaResponse(req, res);
//   console.log(`Sending response`);
//   return res.status(200).json({ response });
// });

// app.post("/chat", async (req: Request, res: Response) => {
//   console.log("Received request to /chat endpoint");
//   const { patientInput } = req.body;
//   const result = await graph.invoke({
//     patientInput,
//     symptoms: "",
//   });
//   console.log(`Sending response`);
//   return res.status(200).json({ response: result.symptoms });
// });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
