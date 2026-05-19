import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { question, document_id } = req.body;

        if (!question || !document_id) {
            return res.status(400).json({ error: "question and document_id are required" });
        }

        const response = await axios.post(
            `${process.env.PYTHON_SERVICE_URL}/chat`,
            { question, document_id }
        );

        return res.json(response.data);

    } catch (error) {
        console.error("Chat error:", error.message);
        return res.status(500).json({ error: "Failed to get answer" });
    }
});

export default router;