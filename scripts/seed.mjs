// Generates fictional demo enquiries (same columns as the n8n "Oraluxe enquiries" sheet).
import { writeFileSync } from "node:fs";

const people = [
  ["Amara Okafor", "amara.okafor@example.com", "07700 900101"],
  ["Daniel Reyes", "daniel.reyes@example.com", "07700 900102"],
  ["Sarah Whitfield", "sarah.whitfield@example.com", "07700 900103"],
  ["Tunde Bello", "tunde.bello@example.com", "07700 900104"],
  ["Priya Nair", "priya.nair@example.com", "07700 900105"],
  ["Liam Carter", "liam.carter@example.com", "07700 900106"],
  ["Chloe Adeyemi", "chloe.adeyemi@example.com", "07700 900107"],
  ["Marcus Bell", "marcus.bell@example.com", "07700 900108"],
  ["Fatima Hassan", "fatima.hassan@example.com", "07700 900109"],
  ["Ben Thornton", "ben.thornton@example.com", "07700 900110"],
];
const templates = [
  ["Emergency Care", "emergency", "high", "Severe toothache since last night, face is swollen. Can someone see me today?", "Severe pain with facial swelling; needs same-day appointment."],
  ["Emergency Care", "emergency", "high", "I knocked a front tooth out playing football an hour ago.", "Knocked-out front tooth; time-critical."],
  ["Teeth Whitening", "cosmetic", "low", "How much is whitening and how long does it last?", "Asking price and longevity of whitening."],
  ["Teeth Whitening", "cosmetic", "low", "Getting married in June, want my teeth brighter. What do you recommend?", "Wedding whitening enquiry."],
  ["Routine Check-up", "routine", "medium", "Haven't been to a dentist in two years. Want a check-up and clean.", "New patient check-up and hygiene."],
  ["Routine Check-up", "routine", "medium", "Due my six-month check-up, any Saturday slots?", "Returning patient, wants Saturday check-up."],
  ["Invisalign", "cosmetic", "low", "Interested in clear aligners for slightly crooked bottom teeth.", "Aligner consultation enquiry."],
  ["Dental Implants", "routine", "medium", "Missing a molar for years. Am I a candidate for an implant?", "Implant consultation for missing molar."],
  ["General Question", "question", "low", "Do you accept NHS patients and what are your opening hours?", "Asks about NHS acceptance and opening hours."],
  ["General Question", "question", "low", "Is there parking near the clinic?", "Parking question."],
  ["Routine Check-up", "routine", "medium", "A filling fell out a few days ago. Not painful but sharp edge.", "Lost filling, no pain."],
  ["Emergency Care", "emergency", "high", "Bleeding gums that won't stop after an extraction elsewhere yesterday.", "Post-extraction bleeding; urgent."],
];
const statuses = ["New", "New", "New", "Contacted", "Booked", "Closed"];
const rows = [];
const base = new Date("2026-10-12T08:30:00Z").getTime();
for (let i = 0; i < 30; i++) {
  const p = people[(i * 7) % people.length];
  const t = templates[(i * 5) % templates.length];
  rows.push({
    id: `ENQ-${String(1001 + i)}`,
    receivedAt: new Date(base + i * 9.5 * 3600e3).toISOString(),
    name: p[0], email: p[1], phone: p[2],
    treatment: t[0], message: t[3],
    category: t[1], urgency: t[2], summary: t[4],
    status: i < 22 ? statuses[(i * 3) % statuses.length] : "New",
    notes: [],
  });
}
writeFileSync(new URL("../data/enquiries.json", import.meta.url), JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} demo enquiries`);
