import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import groupRoutes from "./routes/group.routes";
import postRoutes from "./routes/post.routes"
import commentsRoutes from "./routes/comments.routes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/groups", groupRoutes);
app.use("/posts", postRoutes)
app.use("/comments", commentsRoutes)
app.use("/", (req, res) => {
    res.status(200).json({
        msg: "Backend up"
    })
})
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
