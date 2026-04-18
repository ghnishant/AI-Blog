import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const systemFor = (body) => {
  switch (body.action) {
    case "generate":
      return "You are an expert blog writer. Write a compelling, well-structured blog post (600-900 words) on the user's topic. Use clear headings (## for sections), short paragraphs, and an engaging hook. Output Markdown only — no preamble.";
    case "grammar":
      return "You are a meticulous editor. Fix grammar, spelling, and punctuation in the user's text. Preserve their voice and meaning. Output the corrected text only — no commentary.";
    case "tone":
      return `You are a tone editor. Rewrite the user's text in a ${body.tone ?? "professional"} tone. Keep the meaning and structure. Output the rewritten text only.`;
    case "seo":
      return "You are an SEO strategist. Analyze the text and return: (1) 8-12 high-value SEO keywords/phrases, (2) a 155-char meta description, (3) 3 catchy SEO title suggestions. Format as Markdown with headings.";
    case "summary":
      return "You are a summarizer. Produce a concise 2-3 sentence summary of the text that captures the core insight. Output the summary only.";
    default:
      return "You are a helpful assistant.";
  }
};

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    if (!body.action) {
      return res.status(400).json({ error: "Missing action" });
    }

    const userContent = body.action === "generate"
      ? `Topic: ${body.topic ?? body.text ?? ""}`
      : (body.text ?? "");

    if (!userContent.trim()) {
      return res.status(400).json({ error: "Empty input" });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured in server/.env" });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemFor(body)
    });
    
    const result = await model.generateContent(userContent);
    const text = result.response.text();

    res.json({ result: text });
  } catch (err) {
    console.error("ai-assist error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
