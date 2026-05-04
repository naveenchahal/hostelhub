
 
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(prompt, json = true) {
  if (!process.env.GROQ_API_KEY) return null;
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });
    return res.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.log('Groq Error:', err.message);
    return null;
  }
}

// ── 1. Auto-prioritize complaint ──────────────────────────────────────────────
async function analyzeComplaintPriority(title, description, category) {
  const prompt = `
You are a hostel management assistant. Analyze this complaint and respond ONLY with a JSON object:
{
  "priority": "low|medium|high|urgent",
  "reason": "one sentence explanation"
}

Complaint Category: ${category}
Title: ${title}
Description: ${description}

Rules: "urgent" = safety/security/no power/water; "high" = significant inconvenience affecting studies; "medium" = moderate issue; "low" = cosmetic/minor.
Respond ONLY valid JSON, no markdown, no extra text.`;

  const text = await callGroq(prompt);
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch { return { priority: 'medium', reason: 'Auto-analysis unavailable' }; }
}

// ── 2. Suggested marketplace price ───────────────────────────────────────────
async function suggestMarketplacePrice(title, description, category, condition) {
  const prompt = `
You are a price estimator for a college hostel marketplace in India (prices in INR).
Item: ${title}
Description: ${description || 'N/A'}
Category: ${category}
Condition: ${condition}

Respond ONLY with JSON: { "suggestedPrice": <number>, "priceRange": { "min": <number>, "max": <number> }, "reasoning": "brief reason" }
No markdown, no extra text, valid JSON only.`;

  const text = await callGroq(prompt);
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch { return { suggestedPrice: null, reasoning: 'Price suggestion unavailable' }; }
}

// ── 3. Leave risk scoring ─────────────────────────────────────────────────────
async function scoreLeaveRisk(student, leaveData) {
  const prompt = `
You are a hostel warden AI assistant. Score the risk of this leave application (0=safe, 100=very risky).
Student Year: ${student.year || 'unknown'}
Destination: ${leaveData.destination}
Duration: ${Math.ceil((new Date(leaveData.returnDate) - new Date(leaveData.departureDate)) / 86400000)} days
Reason: ${leaveData.reason}
Day of week departure: ${new Date(leaveData.departureDate).toLocaleDateString('en', { weekday: 'long' })}

Respond ONLY with JSON: { "riskScore": <0-100>, "flags": ["reason1", "reason2"], "recommendation": "approve|review|flag" }
No markdown, no extra text, valid JSON only.`;

  const text = await callGroq(prompt);
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch { return { riskScore: 0, flags: [], recommendation: 'approve' }; }
}

// ── 4. Weekly mess feedback summary ──────────────────────────────────────────
async function generateMessSummary(feedbackData) {
  const prompt = `
Analyze this hostel mess feedback data for the week and generate a brief report for the warden.
Data: ${JSON.stringify(feedbackData)}

Respond ONLY with JSON:
{
  "overallSentiment": "positive|neutral|negative",
  "avgRating": <number>,
  "topComplaints": ["item1", "item2"],
  "popularItems": ["item1", "item2"],
  "wardenAdvice": "2-3 actionable sentences",
  "weeklyGrade": "A|B|C|D|F"
}
No markdown, no extra text, valid JSON only.`;

  const text = await callGroq(prompt);
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch { return { overallSentiment: 'neutral', wardenAdvice: 'Analysis unavailable.' }; }
}

// ── 5. Hostel AI Chatbot ──────────────────────────────────────────────────────
async function hostelChatbot(userMessage, context) {
  const prompt = `
You are HostelBot, a friendly and helpful AI assistant for ${context.hostelName || 'a college hostel'}.
You help students with: leave procedures, mess timings, complaint filing, marketplace, rules, and general queries.

Important hostel info you know:
- Mess timings: Breakfast 7-9am, Lunch 12-2pm, Snacks 5-6pm, Dinner 7-10pm
- Gate curfew: 10pm on weekdays, 11pm on weekends
- Leave applications must be submitted 24hrs in advance
- Complaints are resolved within 48-72 hours typically

Student asks: "${userMessage}"

Reply in 2-4 sentences, friendly and helpful tone. If you don't know something specific, guide them to contact their warden.`;

  const reply = await callGroq(prompt, false);
  return reply || "Hi! I'm HostelBot 🤖. I'm having trouble connecting right now. Please contact your warden directly for assistance.";
}

module.exports = {
  analyzeComplaintPriority,
  suggestMarketplacePrice,
  scoreLeaveRisk,
  generateMessSummary,
  hostelChatbot,
};