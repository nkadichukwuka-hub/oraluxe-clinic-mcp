# Oraluxe Clinic MCP Server

A Model Context Protocol server that lets Claude read and manage the booking enquiries collected by the
[Oraluxe Dental](https://oraluxe-dental.vercel.app) website and its n8n triage automation.

Ask Claude things like "what urgent enquiries are still waiting?", "is Amara a returning patient?" or
"mark ENQ-1004 as booked and note that she wants 9am".

## Tools
| Tool | What it does |
|---|---|
| `clinic_overview` | Counts by status/urgency/category/treatment and urgent enquiries still unanswered |
| `list_enquiries` | Filter by status, urgency, category, date; most urgent first |
| `search_enquiries` | Free-text search with the same filters |
| `get_enquiry` | Full record including staff notes |
| `patient_history` | Every enquiry from one email address |
| `update_enquiry_status` | New -> Contacted -> Booked -> Closed, with optional note |
| `add_note` | Internal staff note (never contacts the patient) |

The server never emails or messages patients.

## Data
Records use the same columns the n8n workflow writes to Google Sheets (`id, receivedAt, name, email, phone,
treatment, message, category, urgency, summary, status`) plus `notes`. This version reads a JSON file
(`data/enquiries.json`, or the path in `ORALUXE_DATA_FILE`). The bundled data is fictional demo data;
`npm run seed` regenerates it. Swapping `src/store.ts` for a Google Sheets backend is the next step.

## Use it
```bash
npm install
npm run build
npm test
```
Claude Code: open this folder (the `.mcp.json` registers the server), or run
`claude mcp add oraluxe-clinic -- node /full/path/to/dist/index.js`.
Claude Desktop: add the same `command`/`args` under `mcpServers` in `claude_desktop_config.json`.
