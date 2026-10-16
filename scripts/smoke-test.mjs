// Starts the built server over stdio and calls each tool once.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { copyFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(tmpdir(), "oraluxe-"));
const dataFile = path.join(dir, "enquiries.json");
copyFileSync("data/enquiries.json", dataFile); // never touch the real data in tests

const client = new Client({ name: "smoke", version: "0" });
await client.connect(new StdioClientTransport({ command: "node", args: ["dist/index.js"], env: { ...process.env, ORALUXE_DATA_FILE: dataFile } }));

const call = async (name, args = {}) => {
  const r = await client.callTool({ name, arguments: args });
  const t = r.content[0].text;
  return { err: !!r.isError, data: r.isError ? t : JSON.parse(t) };
};
let failed = 0;
const check = (label, ok) => { console.log(`${ok ? "PASS" : "FAIL"}  ${label}`); if (!ok) failed++; };

const tools = (await client.listTools()).tools.map((t) => t.name);
check("7 tools registered", tools.length === 7);

const urgent = await call("list_enquiries", { urgency: "high", status: "New" });
check("list_enquiries filters", urgent.data.length > 0 && urgent.data.every((e) => e.urgency === "high" && e.status === "New"));

const first = urgent.data[0].id;
check("get_enquiry", (await call("get_enquiry", { id: first })).data.id === first);
check("get_enquiry unknown id errors", (await call("get_enquiry", { id: "ENQ-0" })).err);
check("search_enquiries", (await call("search_enquiries", { query: "whitening" })).data.length > 0);

const email = (await call("get_enquiry", { id: first })).data.email;
check("patient_history", (await call("patient_history", { email })).data.length >= 1);

const upd = await call("update_enquiry_status", { id: first, status: "Contacted", note: "Called patient" });
check("update_enquiry_status", upd.data.status === "Contacted");
check("note persisted", (await call("get_enquiry", { id: first })).data.notes.length === 1);
check("add_note", (await call("add_note", { id: first, note: "Booked for 9am" })).data.notes.length === 2);

const ov = await call("clinic_overview");
check("clinic_overview", ov.data.total === 30 && ov.data.byStatus.Contacted >= 1);

await client.close();
process.exit(failed ? 1 : 0);
