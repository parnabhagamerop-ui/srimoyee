import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize GoogleGenAI SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API routes FIRST
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!apiKey) {
      return res.json({ text: "Hey sweetheart! 🍓 I'd love to chat, but my brain (Gemini API Key) isn't fully connected yet! Please add a GEMINI_API_KEY in Settings > Secrets to wake me up! 🧸✨" });
    }

    // Format messages for the @google/genai SDK format
    // Each message is { role: string, parts: [{ text: string }] }
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content || "" }]
    }));

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: "You are Pavoo, a super cute, cuddly, strawberry-themed period companion and cycle health bot. You talk in a warm, caring, friendly, and cartoonish tone. You can speak in Bangla (বাংলা), English, or mixed Banglish (Bangla written in English script) based on how the user addresses you. Help them with period health concerns, cramps, mood swings, cycle tracking, comfort foods, and physical/emotional wellness during their cycle. Provide simple, easy-to-follow, soothing advice, and include cute emojis like 🍓, 🩸, ✨, 🧸, 🍫. Remind them occasionally in a cute way to consult a real doctor for severe medical queries.",
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI assistant." });
  }
});

// Vite middleware for development and production serving
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
});
