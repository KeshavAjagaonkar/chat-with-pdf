import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

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

        // Save both messages to the database for chat history.
        // We do this AFTER getting the AI response so:
        // 1. The user's question and the AI answer are saved together
        // 2. If the AI call fails, we don't save a question with no answer
        //
        // We use Promise.all to save both in parallel (faster).
        // If saving fails, we log the error but still return the answer —
        // a lost history entry is better than a failed chat response.
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
            // Don't fail the chat response — user already got their answer
        }

        return res.json(response.data);

    } catch (error) {
        console.error("Chat error:", error.message);
        return res.status(500).json({ error: "Failed to get answer" });
    }
});

export default router;