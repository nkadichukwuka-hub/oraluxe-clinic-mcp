#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { STATUSES, get, load, query, update, type Enquiry } from "./store.js";

const server = new McpServer({ name: "oraluxe-clinic", version: "1.0.0" });

const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
});
const fail = (message: string) => ({ isError: true, content: [{ type: "text" as const, text: message }] });

const brief = (e: Enquiry) => ({
  id: e.id, receivedAt: e.receivedAt, name: e.name, treatment: e.treatment,
  urgency: e.urgency, category: e.category, status: e.status, summary: e.summary,
});

const filters = {
  status: z.enum(["New", "Contacted", "Booked", "Closed"]).optional().describe("Workflow status"),
  urgency: z.enum(["high", "medium", "low"]).optional(),
  category: z.enum(["emergency", "routine", "cosmetic", "question"]).optional().describe("Category assigned by the Gemini triage step"),
  since: z.string().optional().describe("ISO date/time; only enquiries received on or after this"),
  limit: z.number().int().min(1).max(100).optional().describe("Max results (default 20)"),
};

server.registerTool(
  "list_enquiries",
  {
    title: "List enquiries",
    description: "List booking enquiries, most urgent first then newest. Use for 'what's waiting', 'show emergencies', 'new enquiries since Monday'.",
    inputSchema: filters,
    annotations: { readOnlyHint: true },
  },
  async (args) => text(query(args).map(brief)),
);

server.registerTool(
  "get_enquiry",
  {
    title: "Get enquiry",
    description: "Full details of one enquiry, including the patient's message, contact details and staff notes.",
    inputSchema: { id: z.string().describe("Enquiry ID, e.g. ENQ-1004") },
    annotations: { readOnlyHint: true },
  },
  async ({ id }) => {
    const e = get(id);
    return e ? text(e) : fail(`No enquiry with ID ${id}`);
  },
);

server.registerTool(
  "search_enquiries",
  {
    title: "Search enquiries",
    description: "Free-text search across name, email, treatment, message and summary.",
    inputSchema: { query: z.string().min(1), ...filters },
    annotations: { readOnlyHint: true },
  },
  async ({ query: q, ...rest }) => text(query({ ...rest, text: q }).map(brief)),
);

server.registerTool(
  "patient_history",
  {
    title: "Patient history",
    description: "All enquiries from one email address, oldest first. Use to check whether someone is a returning patient before replying.",
    inputSchema: { email: z.string().email() },
    annotations: { readOnlyHint: true },
  },
  async ({ email }) => {
    const rows = query({ email, limit: 100 }).sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
    return rows.length ? text(rows) : fail(`No enquiries from ${email}`);
  },
);

server.registerTool(
  "update_enquiry_status",
  {
    title: "Update status",
    description: "Move an enquiry through New -> Contacted -> Booked -> Closed. Optionally records a note.",
    inputSchema: { id: z.string(), status: z.enum(["New", "Contacted", "Booked", "Closed"]), note: z.string().optional() },
    annotations: { readOnlyHint: false, idempotentHint: true },
  },
  async ({ id, status, note }) => {
    const e = update(id, (row) => {
      row.status = status;
      if (note) row.notes.push({ at: new Date().toISOString(), text: note });
    });
    return e ? text(brief(e)) : fail(`No enquiry with ID ${id}`);
  },
);

server.registerTool(
  "add_note",
  {
    title: "Add note",
    description: "Attach an internal staff note to an enquiry (e.g. 'called, left voicemail'). Does not contact the patient.",
    inputSchema: { id: z.string(), note: z.string().min(1) },
    annotations: { readOnlyHint: false },
  },
  async ({ id, note }) => {
    const e = update(id, (row) => row.notes.push({ at: new Date().toISOString(), text: note }));
    return e ? text(e) : fail(`No enquiry with ID ${id}`);
  },
);

server.registerTool(
  "clinic_overview",
  {
    title: "Clinic overview",
    description: "Counts by status, urgency, category and treatment, plus the oldest unanswered urgent enquiries. Good first call for a daily briefing.",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    const rows = load();
    const tally = (key: (e: Enquiry) => string) =>
      rows.reduce<Record<string, number>>((acc, e) => ((acc[key(e)] = (acc[key(e)] ?? 0) + 1), acc), {});
    const waitingUrgent = rows
      .filter((e) => e.urgency === "high" && e.status === "New")
      .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
      .map(brief);
    return text({
      total: rows.length,
      byStatus: { ...Object.fromEntries(STATUSES.map((s) => [s, 0])), ...tally((e) => e.status) },
      byUrgency: tally((e) => e.urgency),
      byCategory: tally((e) => e.category),
      byTreatment: tally((e) => e.treatment),
      urgentStillNew: waitingUrgent,
    });
  },
);

await server.connect(new StdioServerTransport());
