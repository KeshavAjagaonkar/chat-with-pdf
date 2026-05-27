import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// GET /api/messages?document_id=X
// Returns the chat history for a specific document belonging to the authenticated user.
//
// Why pass user_id from the auth token (not from the query string)?
// If the frontend passed user_id, a malicious user could read other people's
// chat history by changing the user_id parameter. By extracting it from the
// verified JWT, we guarantee they can only see their own messages.
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const documentId = req.query.document_id;

        if (!documentId) {
            return res.status(400).json({ error: "document_id query parameter is required" });
        }

        const response = await axios.get(
            `${process.env.PYTHON_SERVICE_URL}/messages`,
            { params: { document_id: documentId, user_id: userId } }
        );

        return res.json(response.data);

    } catch (error) {
        console.error("Messages fetch error:", error.message);
        return res.status(500).json({ error: "Failed to fetch messages" });
    }
});

export default router;
