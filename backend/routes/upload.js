import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";


dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", requireAuth, upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const userId = req.userId;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.path), file.originalname);
        formData.append("user_id", userId);

        const response = await axios.post(
            `${process.env.PYTHON_SERVICE_URL}/process`,
            formData,
            { headers: formData.getHeaders() }
        );

        fs.unlinkSync(file.path);
        return res.json(response.data);

    } catch (error) {
        console.error("Upload error:", error.message);
        return res.status(500).json({ error: "Failed to process PDF" });
    }
});

export default router;