import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

// GET /api/documents
// Returns all documents belonging to the authenticated user.
//
// Flow:
// 1. requireAuth middleware verifies Clerk JWT and extracts userId
// 2. We forward userId to Python service as a query parameter
// 3. Python queries PostgreSQL and returns the documents
// 4. We pass the response straight back to the frontend
//
// Why proxy through Node instead of calling Python directly from frontend?
// - The Python service URL is internal (not exposed to the internet)
// - Auth verification happens here in Node, keeping Python auth-free
router.get("/", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;

        const response = await axios.get(
            `${process.env.PYTHON_SERVICE_URL}/documents`,
            { params: { user_id: userId } }
        );

        return res.json(response.data);

    } catch (error) {
        console.error("Documents fetch error:", error.message);
        return res.status(500).json({ error: "Failed to fetch documents" });
    }
});

// DELETE /api/documents/:id
// Deletes a specific document and all its associated data.
// Uses URL param :id (REST convention for targeting a specific resource).
// The Python service also verifies ownership — defense in depth.
router.delete("/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const documentId = req.params.id;

        const response = await axios.delete(
            `${process.env.PYTHON_SERVICE_URL}/documents`,
            { params: { document_id: documentId, user_id: userId } }
        );

        return res.json(response.data);

    } catch (error) {
        // Forward 403 from Python (ownership check failed)
        if (error.response && error.response.status === 403) {
            return res.status(403).json({ error: "You don't have access to this document" });
        }
        console.error("Document delete error:", error.message);
        return res.status(500).json({ error: "Failed to delete document" });
    }
});

// GET /api/documents/status/:id
// Returns the real-time ingestion and embedding status of a document.
router.get("/status/:id", requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const documentId = req.params.id;

        const response = await axios.get(
            `${process.env.PYTHON_SERVICE_URL}/documents/status/${documentId}`,
            { params: { user_id: userId } }
        );

        return res.json(response.data);

    } catch (error) {
        if (error.response && error.response.status === 403) {
            return res.status(403).json({ error: "You don't have access to this document" });
        }
        console.error("Document status error:", error.message);
        return res.status(500).json({ error: "Failed to fetch document status" });
    }
});

export default router;
