import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// Original non-streaming chat route (kept as fallback)
router.post("/", requireAuth, async (req, res) => {
    try {
        const { question, document_id } = req.body;
        const userId = req.userId;

        if (!question || !document_id) {
            return res.status(400).json({ error: "question and document_id are required" });
        }

        const response = await axios.post(
            `${process.env.PYTHON_SERVICE_URL}/chat`,
            { question, document_id, user_id: userId }

        );

        const answer = response.data.answer;

        try {
            await Promise.all([
                axios.post(`${process.env.PYTHON_SERVICE_URL}/messages`, {
                    document_id,
                    user_id: userId,
                    role: "user",
                    content: question,
                }),
                axios.post(`${process.env.PYTHON_SERVICE_URL}/messages`, {
                    document_id,
                    user_id: userId,
                    role: "assistant",
                    content: answer,
                }),
            ]);
        } catch (saveError) {
            console.error("Failed to save messages:", saveError.message);
        }

        return res.json(response.data);

    } catch (error) {
        console.error("Chat error:", error.message);
        return res.status(500).json({ error: "Failed to get answer" });
    }
});

// POST /api/chat/stream — streaming version.
// Proxies the SSE stream from Python directly to the frontend.
//
// How it works:
// 1. Node sends the question to Python's /chat/stream endpoint
// 2. Python returns a Server-Sent Events stream
// 3. Node pipes each chunk straight to the frontend as it arrives
// 4. When the stream ends ([DONE] signal), Node saves both messages
//
// The frontend reads this stream using the Fetch API's ReadableStream,
// not axios (which buffers the full response).
router.post("/stream", requireAuth, async (req, res) => {
    try {
        const { question, document_id, chat_history } = req.body;
        const userId = req.userId;

        if (!question || !document_id) {
            return res.status(400).json({ error: "question and document_id are required" });
        }

        // Set SSE headers BEFORE starting to stream.
        // This tells the browser to expect a long-lived stream.
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Request the stream from Python.
        // responseType: 'stream' tells axios to return a Node.js ReadableStream
        // instead of buffering the entire response in memory.
        const response = await axios.post(
            `${process.env.PYTHON_SERVICE_URL}/chat/stream`,
            { question, document_id, user_id: userId, chat_history: chat_history || [] },
            { responseType: "stream" }
        );

        // Collect the full answer while streaming to the frontend.
        // We need the complete text to save to the messages table.
        let fullAnswer = "";

        response.data.on("data", (chunk) => {
            const text = chunk.toString();
            // Forward each chunk directly to the frontend
            res.write(text);

            // Parse the SSE data to build the full answer.
            // Each line looks like: "data: some text\n\n"
            const lines = text.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ") && line.trim() !== "data: [DONE]") {
                    fullAnswer += line.slice(6); // Remove "data: " prefix
                }
            }
        });

        response.data.on("end", async () => {
            res.end();

            // Save both messages after the stream completes.
            try {
                await Promise.all([
                    axios.post(`${process.env.PYTHON_SERVICE_URL}/messages`, {
                        document_id,
                        user_id: userId,
                        role: "user",
                        content: question,
                    }),
                    axios.post(`${process.env.PYTHON_SERVICE_URL}/messages`, {
                        document_id,
                        user_id: userId,
                        role: "assistant",
                        content: fullAnswer,
                    }),
                ]);
            } catch (saveError) {
                console.error("Failed to save messages:", saveError.message);
            }
        });

        response.data.on("error", (err) => {
            console.error("Stream error:", err.message);
            res.end();
        });

    } catch (error) {
        console.error("Stream chat error:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Failed to get answer" });
        }
        res.end();
    }
});

export default router;