import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const resumeKnowledgeBase = `
You are chatting on Anand Prince Purty's portfolio website.

Profile:
- Name: Anand Prince Purty
- Location: Buffalo, New York
- Portfolio: andydoes.tech
- GitHub: github.com/z-anxprincex1
- LinkedIn: linkedin.com/in/anandprince1
- Email: anandprincepurty@gmail.com

Education:
- Master of Science in Computer Science, University at Buffalo SUNY, Jan 2024 - May 2025
- Bachelor of Engineering in Computer Science, Rajalakshmi Engineering College, Aug 2020 - May 2024

Experience:
- Community Dreams Foundation, Software Engineer (Backend & AI Systems), Sep 2025 - Present
- Built scalable backend data pipelines using Python and GCP.
- Used PostgreSQL and Supabase for structured data and Firebase for real-time unstructured interactions.
- Reduced data retrieval latency by 25%.
- Built an XGBoost-based recommendation model using user activity and listing metadata.
- Improved prediction accuracy to 90% and increased relevance of marketplace matches.
- Automated CI/CD using Google Cloud Build and Cloud Run.
- Reduced deployment time by 40%.
- Optimized REST APIs for concurrent matching requests across 2,000+ lab records with real-time filtering and workload-aware availability updates.
- Collaborated on a Next.js frontend with Firebase Authentication for secure user access and backend integration.

Projects:
- Multi-Modal Deep Learning for VQA: combines ResNet image features and BERT text embeddings to answer image questions.
- VirtualEye - Drowning Detection: real-time drowning detection using YOLOv5, IBM Cloud, and Flask alerts.
- Signease - Sign Language Detection: browser-based sign language translation using MobileNet SSD and TensorFlow.js.
- Skin Disease Classification CNN: CNN model reaching 93% accuracy on dermatology image classification.
- Smart Door Lock with Face Detection: Raspberry Pi security system with facial recognition and fingerprint validation.
- Colabify: real-time collaborative document editor built with Next.js, TypeScript, Supabase, WebRTC, LiveKit, PDF.js, and Gemini 1.5 Flash.
- PeekersNest: AI-powered shopping deals platform using Next.js and Gemini to aggregate and rank listings.
- Dental AI Matching API: Python and Flask backend matching clinics with labs using multi-criteria ranking and recommendation.
- LLM-based Text-to-SQL: React, Python, and Flask app using OpenAI and schema-aware prompting to turn natural language into SQL.

Behavior rules:
- Answer as Anand's portfolio assistant.
- Use only the information in this knowledge base and the user's question.
- Be warm, casual, concise, and helpful.
- Speak in first person when describing Anand's work, for example: "I built..." or "My experience includes..."
- Keep replies short by default.
- Prefer 1 to 3 short paragraphs or chat-sized chunks.
- Avoid sounding formal, robotic, or resume-stiff.
- If listing multiple points, keep each point brief.
- If the answer is not in the knowledge base, say that briefly and suggest LinkedIn or email for more detail.
- Avoid inventing facts, dates, metrics, employers, or technologies.
`.trim();

const buildChatResponse = async ({
  apiKey,
  model,
  message,
  history,
}: {
  apiKey: string;
  model: string;
  message: string;
  history: Array<{ role: "user" | "assistant"; text: string }>;
}) => {
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: resumeKnowledgeBase,
        },
        ...history.map((item) => ({
          role: item.role,
          content: item.text,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
      max_output_tokens: 220,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `OpenAI request failed with status ${response.status}`);
  }

  const data = await response.json();
  const extractTextFromOutput = (value: unknown): string[] => {
    if (!value) return [];

    if (typeof value === "string") {
      return value.trim() ? [value.trim()] : [];
    }

    if (Array.isArray(value)) {
      return value.flatMap(extractTextFromOutput);
    }

    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      const collected: string[] = [];

      if (record.type === "output_text" && typeof record.text === "string") {
        collected.push(record.text.trim());
      }

      if (typeof record.output_text === "string") {
        collected.push(record.output_text.trim());
      }

      if (typeof record.text === "string" && record.type !== "input_text") {
        collected.push(record.text.trim());
      }

      if (typeof record.value === "string") {
        collected.push(record.value.trim());
      }

      for (const nested of Object.values(record)) {
        if (nested && typeof nested === "object") {
          collected.push(...extractTextFromOutput(nested));
        }
      }

      return collected.filter(Boolean);
    }

    return [];
  };

  const outputText = Array.from(new Set([
    ...(typeof data.output_text === "string" ? [data.output_text.trim()] : []),
    ...extractTextFromOutput(data.output),
  ]))
    .join("\n\n")
    .trim();

  if (outputText) {
    return outputText;
  }

  const fallbackResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: resumeKnowledgeBase,
        },
        ...history.map((item) => ({
          role: item.role,
          content: item.text,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      max_completion_tokens: 220,
    }),
  });

  if (!fallbackResponse.ok) {
    const fallbackDetails = await fallbackResponse.text();
    throw new Error(fallbackDetails || "The assistant returned an empty response.");
  }

  const fallbackData = await fallbackResponse.json();
  const fallbackText = fallbackData.choices?.[0]?.message?.content;

  if (typeof fallbackText === "string" && fallbackText.trim()) {
    return fallbackText.trim();
  }

  if (Array.isArray(fallbackText)) {
    const joinedText = fallbackText
      .map((item: { type?: string; text?: string }) => item?.text || "")
      .join("\n\n")
      .trim();

    if (joinedText) {
      return joinedText;
    }
  }

  throw new Error("The assistant returned an empty response.");
};

const chatApiPlugin = ({
  apiKey,
  model,
}: {
  apiKey?: string;
  model: string;
}) => {
  const handler = async (req: NodeJS.ReadableStream & { method?: string }, res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  }) => {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Method not allowed." }));
      return;
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "OpenAI API key not found in .env." }));
      return;
    }

    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      const parsed = JSON.parse(body || "{}") as {
        message?: string;
        history?: Array<{ role: "user" | "assistant"; text: string }>;
      };
      const message = parsed.message?.trim();

      if (!message) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Message is required." }));
        return;
      }

      const reply = await buildChatResponse({
        apiKey,
        model,
        message,
        history: Array.isArray(parsed.history) ? parsed.history.slice(-6) : [],
      });

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ reply }));
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Something went wrong.",
        }),
      );
    }
  };

  return {
    name: "portfolio-chat-api",
    configureServer(server: {
      middlewares: { use: (path: string, handler: typeof handler) => void };
    }) {
      server.middlewares.use("/api/chat", handler);
    },
    configurePreviewServer(server: {
      middlewares: { use: (path: string, handler: typeof handler) => void };
    }) {
      server.middlewares.use("/api/chat", handler);
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      chatApiPlugin({
        apiKey: env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY,
        model: env.OPENAI_MODEL || env.VITE_OPENAI_MODEL || "gpt-5.4-mini",
      }),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
