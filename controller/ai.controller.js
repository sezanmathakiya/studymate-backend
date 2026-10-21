
import { GoogleGenAI } from "@google/genai";

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 9;
const MAX_OUTPUT_TOKENS = 6000;

export const chatWithAI = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        message: "AI service is not configured.",
      });
    }

    const { message, history = [] } = req.body ?? {};

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a question.",
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message: "Question must be 2000 characters or less.",
      });
    }

    if (
      !Array.isArray(history) ||
      history.length > MAX_HISTORY_MESSAGES
    ) {
      return res.status(400).json({
        message: "Chat history is invalid or too long.",
      });
    }

    const validHistory = history.every(
      (item) =>
        item &&
        ["user", "model"].includes(item.role) &&
        typeof item.text === "string" &&
        item.text.length <= MAX_MESSAGE_LENGTH
    );

    if (!validHistory) {
      return res.status(400).json({
        message: "Chat history contains invalid messages.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = [
      ...history.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      })),
      {
        role: "user",
        parts: [{ text: message.trim() }],
      },
    ];

    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction:
          "You are StudyMate AI, a helpful educational assistant. " +
          "Explain concepts clearly with examples. Help students learn " +
          "Java, DBMS, computer networks, mathematics, and programming. " +
          "Reply in the language used by the student when practical. " +
          "For requests for complete topic lists, cover all major topics " +
          "and organize them with numbered headings and subtopics. " +
          "If the answer is too long, prioritize completeness and clarity. " +
          "If unsure, clearly say so instead of inventing facts.",
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
    });

    const answer = result.text;

    if (!answer) {
      console.error(
        "Gemini returned no text. Finish reason:",
        result.candidates?.[0]?.finishReason ?? "unknown"
      );

      return res.status(502).json({
        message: "AI returned an empty response. Please try again.",
      });
    }

    const finishReason = result.candidates?.[0]?.finishReason;

    console.log("AI response finish reason:", finishReason ?? "unknown");

    if (finishReason === "MAX_TOKENS") {
      console.warn(
        "AI response may be incomplete because the output token limit was reached."
      );
    }

    return res.status(200).json({
      answer,
      finishReason: finishReason ?? null,
      possiblyIncomplete: finishReason === "MAX_TOKENS",
    });
  } catch (error) {
    console.error(
      "AI request failed:",
      error.status || error.code || "unknown"
    );

    if (error.status === 429) {
      return res.status(429).json({
        message: "AI usage limit reached. Please try again later.",
      });
    }

    return res.status(502).json({
      message: "AI service is temporarily unavailable.",
    });
  }
};
