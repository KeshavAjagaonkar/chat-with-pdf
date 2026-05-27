import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/upload.js";
import chatRoute from "./routes/chat.js";
import documentsRoute from "./routes/documents.js";
import messagesRoute from "./routes/messages.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: function (origin, callback) {
    const allowed = [
      "https://chat-with-pdf-lac-six.vercel.app",
      "http://localhost:3000",
    ];


    if (!origin) return callback(null, true);


    if (allowed.includes(origin)) return callback(null, true);


    if (origin.endsWith(".vercel.app") && origin.includes("chat-with-pdf")) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());

app.use("/api/upload", uploadRoute);
app.use("/api/chat", chatRoute);
app.use("/api/documents", documentsRoute);
app.use("/api/messages", messagesRoute);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});