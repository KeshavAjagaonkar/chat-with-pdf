import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const payload = await clerk.verifyToken(token);

        req.userId = payload.sub;
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};