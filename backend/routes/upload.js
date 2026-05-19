import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(file.path), file.originalname);

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