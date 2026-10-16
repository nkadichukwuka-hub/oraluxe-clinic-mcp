// Generates fictional demo enquiries (same columns as the n8n "Oraluxe enquiries" sheet).
// All people are made up. Dates are fixed so the demo is repeatable: NOW is the morning of the demo.
import { writeFileSync } from "node:fs";

const NOW = Date.parse("2026-10-16T07:30:00Z");
const P = {
  amara: ["Amara Okafor", "amara.okafor@example.com", "07700 900101"],
  daniel: ["Daniel Reyes", "daniel.reyes@example.com", "07700 900102"],
  sarah: ["Sarah Whitfield", "sarah.whitfield@example.com", "07700 900103"],
  tunde: ["Tunde Bello", "tunde.bello@example.com", "07700 900104"],
  priya: ["Priya Nair", "priya.nair@example.com", "07700 900105"],
  liam: ["Liam Carter", "liam.carter@example.com", "07700 900106"],
  chloe: ["Chloe Adeyemi", "chloe.adeyemi@example.com", "07700 900107"],
  marcus: ["Marcus Bell", "marcus.bell@example.com", "07700 900108"],
  fatima: ["Fatima Hassan", "fatima.hassan@example.com", "07700 900109"],
  ben: ["Ben Thornton", "ben.thornton@example.com", "07700 900110"],
  grace: ["Grace Mensah", "grace.mensah@example.com", "07700 900111"],
  oliver: ["Oliver Grant", "oliver.grant@example.com", "07700 900112"],
  nadia: ["Nadia Rahman", "nadia.rahman@example.com", "07700 900113"],
  jonas: ["Jonas Eriksen", "jonas.eriksen@example.com", "07700 900114"],
  ife: ["Ife Balogun", "ife.balogun@example.com", "07700 900115"],
  hannah: ["Hannah Price", "hannah.price@example.com", "07700 900116"],
};

// [hoursAgo, person, treatment, category, urgency, message, summary, status, notes: [hoursAfterReceipt, text][]]
const E = [
  [168, "amara", "Teeth Whitening", "cosmetic", "low", "How much is whitening and how long does it last? Thinking of doing it before the summer.", "Asks price and longevity of whitening.", "Closed", [[3, "Sent price list by email. Not ready to book yet."]]],
  [160, "oliver", "Routine Check-up", "routine", "medium", "I haven't seen a dentist in about two years. Would like a check-up and a clean.", "New patient wants check-up and hygiene.", "Booked", [[2, "Booked Tue 20 Oct, 10:15 with Dr Patel."]]],
  [150, "nadia", "General Question", "question", "low", "Do you accept NHS patients? And what are your opening hours on Saturdays?", "Asks about NHS acceptance and Saturday hours.", "Closed", [[1, "Replied: private only; Saturdays 9-1."]]],
  [141, "ben", "Dental Implants", "routine", "medium", "I've been missing a back molar for years and it's affecting how I chew. Am I a candidate for an implant?", "Implant consultation for a missing molar.", "Contacted", [[5, "Called, left voicemail."], [26, "Spoke to Ben. Wants a consultation after payday."]]],
  [132, "chloe", "Invisalign", "cosmetic", "low", "My bottom teeth have got a bit crooked since my brace came off. Is Invisalign possible for minor movement?", "Aligner consultation for minor relapse.", "Booked", [[4, "Consultation booked Thu 22 Oct, 4pm."]]],
  [120, "daniel", "Emergency Care", "emergency", "high", "Cracked a molar on an olive stone last night, sharp pain when I bite down. Need to be seen soon.", "Cracked molar with bite pain; same-day or next-day.", "Closed", [[1, "Seen same day. Temporary filling placed, follow-up needed."]]],
  [110, "sarah", "Teeth Whitening", "cosmetic", "low", "I'm getting married in June and want my teeth brighter. What do you recommend and when should I start?", "Wedding whitening enquiry.", "Contacted", [[6, "Emailed options. Waiting for reply."]]],
  [101, "grace", "Routine Check-up", "routine", "medium", "Due my six-month check-up. Are there any Saturday slots in the next few weeks?", "Returning patient wants a Saturday check-up.", "Booked", [[2, "Booked Sat 24 Oct, 9:30."]]],
  [96, "marcus", "General Question", "question", "low", "Is there parking near the clinic, and is it step-free? My mum uses a wheelchair.", "Parking and step-free access question.", "Closed", [[2, "Replied: ramp at front, 2 disabled bays outside."]]],
  [88, "jonas", "Routine Check-up", "routine", "medium", "A filling came out a few days ago. No pain, but there's a sharp edge catching my tongue.", "Lost filling, no pain.", "Contacted", [[3, "Offered Mon 19 Oct. Waiting to confirm."]]],
  [80, "hannah", "Dental Implants", "routine", "medium", "I lost a front tooth in a cycling accident in the summer and have a temporary bridge. Want to discuss a permanent option.", "Permanent replacement for front tooth.", "New", []],
  [74, "liam", "Invisalign", "cosmetic", "low", "Do you do payment plans for Invisalign? Roughly how long does treatment take?", "Asks about aligner payment plans and duration.", "New", []],
  [66, "ife", "Teeth Whitening", "cosmetic", "low", "Interested in whitening, but I have sensitive teeth. Is it safe for me?", "Whitening with sensitive teeth.", "Contacted", [[4, "Advised sensitivity check at consultation."]]],
  [58, "fatima", "Routine Check-up", "routine", "medium", "My son (age 7) needs his first check-up. Do you see children?", "Child's first check-up.", "Booked", [[2, "Booked Wed 21 Oct, 3:45."]]],
  [49, "priya", "General Question", "question", "low", "Can I book online for a hygienist only, without seeing a dentist?", "Asks about hygienist-only appointment.", "New", []],
  [44, "oliver", "Routine Check-up", "routine", "medium", "Following up on my booking: could I move my appointment to the following week if needed?", "Existing patient may reschedule.", "New", []],
  [38, "tunde", "Routine Check-up", "routine", "medium", "I get bleeding gums when I brush and it's been a month. Should I be worried?", "Bleeding gums for a month; should be checked.", "New", []],
  [31, "daniel", "Routine Check-up", "routine", "medium", "Back for the follow-up on the cracked molar. Can I book the permanent crown?", "Follow-up: wants permanent crown.", "New", []],
  [27, "amara", "Emergency Care", "emergency", "high", "Severe toothache since last night and my cheek is swollen. Can someone see me today? I'm in a lot of pain.", "Severe pain with facial swelling; needs same-day appointment.", "New", []],
  [20, "ben", "General Question", "question", "low", "Do you offer a discount if several family members book check-ups together?", "Asks about family discounts.", "New", []],
  [14, "grace", "Teeth Whitening", "cosmetic", "low", "I loved my last check-up. How do I get on the waiting list for whitening?", "Existing patient wants whitening waiting list.", "New", []],
  [9, "marcus", "Emergency Care", "emergency", "high", "My son knocked out a permanent front tooth at football about an hour ago. I have the tooth in milk. What should we do?", "Child's knocked-out permanent tooth; time-critical.", "New", []],
  [5, "sarah", "Emergency Care", "emergency", "high", "Bleeding that won't stop after an extraction at another clinic yesterday. I've tried gauze for 40 minutes.", "Post-extraction bleeding; urgent.", "New", []],
  [2, "nadia", "Invisalign", "cosmetic", "low", "Seen your Invisalign page. Do you offer a free consultation?", "Asks if aligner consultation is free.", "New", []],
];

const rows = E.map(([h, who, treatment, category, urgency, message, summary, status, notes], i) => {
  const receivedAt = NOW - h * 3600e3;
  return {
    id: `ENQ-${1001 + i}`,
    receivedAt: new Date(receivedAt).toISOString(),
    name: P[who][0], email: P[who][1], phone: P[who][2],
    treatment, message, category, urgency, summary, status,
    notes: notes.map(([after, text]) => ({ at: new Date(receivedAt + after * 3600e3).toISOString(), text })),
  };
});
writeFileSync(new URL("../data/enquiries.json", import.meta.url), JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} demo enquiries`);
