import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export type Status = "New" | "Contacted" | "Booked" | "Closed";
export const STATUSES: Status[] = ["New", "Contacted", "Booked", "Closed"];

export interface Note { at: string; text: string }
export interface Enquiry {
  id: string;
  receivedAt: string;
  name: string;
  email: string;
  phone: string;
  treatment: string;
  message: string;
  category: "emergency" | "routine" | "cosmetic" | "question";
  urgency: "high" | "medium" | "low";
  summary: string;
  status: Status;
  notes: Note[];
}

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = process.env.ORALUXE_DATA_FILE ?? path.resolve(here, "../data/enquiries.json");

export function load(): Enquiry[] {
  if (!existsSync(DATA_FILE)) return [];
  return JSON.parse(readFileSync(DATA_FILE, "utf8")) as Enquiry[];
}

export function save(rows: Enquiry[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));
}

const URGENCY_RANK = { high: 0, medium: 1, low: 2 } as const;

export interface Filter {
  status?: Status;
  urgency?: Enquiry["urgency"];
  category?: Enquiry["category"];
  since?: string;
  text?: string;
  email?: string;
  limit?: number;
}

/** Urgent first, then newest first. */
export function query(f: Filter): Enquiry[] {
  const text = f.text?.toLowerCase();
  const since = f.since ? Date.parse(f.since) : undefined;
  return load()
    .filter((e) => !f.status || e.status === f.status)
    .filter((e) => !f.urgency || e.urgency === f.urgency)
    .filter((e) => !f.category || e.category === f.category)
    .filter((e) => !f.email || e.email.toLowerCase() === f.email.toLowerCase())
    .filter((e) => since === undefined || Date.parse(e.receivedAt) >= since)
    .filter((e) => !text || [e.name, e.email, e.treatment, e.message, e.summary].join(" ").toLowerCase().includes(text))
    .sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || b.receivedAt.localeCompare(a.receivedAt))
    .slice(0, f.limit ?? 20);
}

export function get(id: string): Enquiry | undefined {
  return load().find((e) => e.id.toLowerCase() === id.toLowerCase());
}

export function update(id: string, fn: (e: Enquiry) => void): Enquiry | undefined {
  const rows = load();
  const row = rows.find((e) => e.id.toLowerCase() === id.toLowerCase());
  if (!row) return undefined;
  fn(row);
  save(rows);
  return row;
}
