import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import dotenv from "dotenv";
import { requireAuth } from "../middleware/auth.js";


dotenv.config();

const router = express.Router();

// Configure multer with validation rules.
// These are the REAL security checks — frontend validation is just UX.
// Anyone can bypass the frontend using curl, Postman, or browser devtools.
const upload = multer({
    dest: "uploads/",

    // fileFilter runs BEFORE the file is saved to disk.
    // cb(null, false) rejects the file; cb(null, true) accepts it.
    // We attach a custom error to req so we can return a clear message.
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            req.fileValidationError = "Only PDF files are allowed";
            return cb(null, false);
        }
        cb(null, true);
    },

    limits: {
        // 10MB in bytes — matches the frontend check.
        // If exceeded, multer throws a MulterError with code 'LIMIT_FILE_SIZE'.
        fileSize: 10 * 1024 * 1024,
    },
});

router.post("/", requireAuth, upload.single("file"), async (req, res) => {
    try {
        // Check if fileFilter rejected the file (non-PDF)
        if (req.fileValidationError) {
            return res.status(400).json({ error: req.fileValidationError });
        }

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
        // Handle multer file-size errors specifically.
        // Multer throws a special MulterError object when limits are exceeded.
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "File must be under 10MB" });
        }
        console.error("Upload error:", error.message);
        return res.status(500).json({ error: "Failed to process PDF" });
    }
});

export default router;