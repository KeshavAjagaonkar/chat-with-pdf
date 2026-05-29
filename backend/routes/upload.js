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

router.post("/", requireAuth, upload.array("files", 5), async (req, res) => {
    const files = req.files || [];
    try {
        // Check if fileFilter rejected any file (non-PDF)
        if (req.fileValidationError) {
            for (const file of files) {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            }
            return res.status(400).json({ error: req.fileValidationError });
        }

        const userId = req.userId;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        let documentId = null;

        // Process all files sequentially to ensure the first file initializes document_id
        // and subsequent files append their contents to the exact same document ID.
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append("file", fs.createReadStream(file.path), file.originalname);
            formData.append("user_id", userId);
            if (documentId) {
                formData.append("document_id", documentId.toString());
            }

            const response = await axios.post(
                `${process.env.PYTHON_SERVICE_URL}/process`,
                formData,
                { headers: formData.getHeaders() }
            );

            if (i === 0) {
                documentId = response.data.document_id;
            }
        }

        // Cleanup all local temporary files
        for (const file of files) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        return res.json({
            document_id: documentId,
            filenames: files.map((f) => f.originalname),
            status: "processing",
        });

    } catch (error) {
        // Clean up all local temporary files under failure modes
        for (const file of files) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
        }

        // Handle multer file-size errors specifically.
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ error: "Each file must be under 10MB" });
        }
        console.error("Upload error:", error.message);
        return res.status(500).json({ error: "Failed to process PDFs" });
    }
});

export default router;