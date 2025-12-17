import { GoogleGenAI } from "@google/genai";
import { InsightRequest } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateEfficiencyInsight = async (data: InsightRequest): Promise<string> => {
  const { inputs, results } = data;

  const prompt = `
    You are a witty Legal Operations Consultant who hates inefficiency.
    
    Context:
    A commercial attorney (Solo/Small Firm) is currently drowning in manual document drafting.
    - Manual Process: ${inputs.hoursPerDocManual} hours/doc (Painful).
    - Automated Process: ${inputs.minutesPerDocAuto} minutes/doc (Magic).
    - Volume: ${inputs.monthlyVolume} docs/month.
    - Rate: $${inputs.hourlyRate}/hr.
    - Setup: $${inputs.setupCost.toLocaleString()}.
    - Savings: $${results.annualSavings.toLocaleString()} & ${results.hoursSavedAnnually.toLocaleString()} hours.
    - Break-even: ${Math.ceil(results.roiDays)} days.

    Task:
    Write a 3-paragraph summary that is professional but has personality (smart, punchy, slightly humorous).
    
    1. The Reality Check: Validate the misery of spending ${inputs.hoursPerDocManual} hours on a standard doc. Mention that the investment pays for itself in just ${Math.ceil(results.roiDays)} days (a "no-brainer").
    2. The Freedom: Explain what saving ~${Math.round(results.hoursSavedAnnually / 12)} hours/month actually feels like (sanity restored).
    3. The "Roller Skate" Factor: Suggest one serious business move (like landing a whale client) AND one completely fun/unexpected hobby (like roller derby, learning the banjo, competitive napping, or attending clown college) they can finally pursue with the recovered time.

    Tone: Witty, sharp, peer-to-peer, but mathematically sound. Keep it under 150 words. Do not use markdown headers.
  `;

  if (!ai) {
    return "AI insights unavailable. Please configure your Gemini API key.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster response on simple summarization
      }
    });

    return response.text || "Unable to generate insight at this time.";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Analysis unavailable. Please try again.";
  }
};