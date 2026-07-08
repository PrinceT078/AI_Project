import { StateGraph, START, END } from "@langchain/langgraph";
import { GraphStateAnnotation } from "./state.js";
import { extractSymptoms } from "./nodes/extractSymptoms.js";
import { classifyUrgency } from "./nodes/classifyUrgency.ts";
import { generateSummary } from "./nodes/generateSummary.ts";
import { validateInput } from "./nodes/validateInput.ts";
import { requiresFollowup } from "./nodes/requireFollowup.ts";
import { askFollowup } from "./nodes/askFollowup.ts";
import { ASK_FOLLOWUP, CLASSIFY_URGENCY, EXTRACT_SYMPTOMS, GENERATE_SUMMARY, REQUIRES_FOLLOWUP, VALIDATE_INPUT } from "../utils/constant.ts";

const workflow = new StateGraph(GraphStateAnnotation);
workflow.addNode(VALIDATE_INPUT, validateInput);
workflow.addNode(EXTRACT_SYMPTOMS, extractSymptoms);
workflow.addNode(REQUIRES_FOLLOWUP, requiresFollowup);
workflow.addNode(ASK_FOLLOWUP, askFollowup);
workflow.addNode(CLASSIFY_URGENCY, classifyUrgency);
workflow.addNode(GENERATE_SUMMARY, generateSummary);

workflow.addEdge(START, VALIDATE_INPUT);
workflow.addEdge(VALIDATE_INPUT, EXTRACT_SYMPTOMS);
workflow.addEdge(EXTRACT_SYMPTOMS, CLASSIFY_URGENCY);
workflow.addEdge(CLASSIFY_URGENCY, REQUIRES_FOLLOWUP);

workflow.addConditionalEdges(
  REQUIRES_FOLLOWUP,
  (state) => (state.requiresFollowup ? ASK_FOLLOWUP : GENERATE_SUMMARY),
  [ASK_FOLLOWUP, GENERATE_SUMMARY],
);

workflow.addEdge(ASK_FOLLOWUP, END);
workflow.addEdge(GENERATE_SUMMARY, END);
// workflow.addEdge(EXTRACT_SYMPTOMS, CLASSIFY_URGENCY);
// workflow.addEdge(CLASSIFY_URGENCY, GENERATE_SUMMARY);
// workflow.addEdge(GENERATE_SUMMARY, END);

export const graph = workflow.compile();
