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

        const requestState = await clerk.authenticateRequest(req, {
            headerToken: token,
        });

        if (!requestState.isAuthenticated) {
            return res.status(401).json({ error: "Invalid token" });
        }

        req.userId = requestState.toAuth().userId;
        next();

    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ error: "Invalid token" });
    }
};