import express from "express"
import cors from "cors"
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import {Webhook} from "svix";
import { inngest, functions } from "./inngest/index.js";
import workspaceRouter from "./routes/workspaceRouters.js";
import { protect } from "./middlewares/authMiddleware.js";
import projectrouter from "./routes/projectRouters.js";
import taskRouter from "./routes/taskRouters.js";
import commentRouter from "./routes/commentRouters.js";

const app = express();

// 🔥 Clerk webhook → Inngest bridge
app.post(
  "/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
      const evt = wh.verify(req.body.toString(), req.headers);

      await inngest.send({
        name: evt.type,
        data: evt.data,
      });

      res.status(200).json({ ok: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  }
);

app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(clerkMiddleware())

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

// Routes 
app.use("/api/workspaces", protect, workspaceRouter)
app.use("/api/projects", protect, projectrouter)
app.use("/api/tasks", protect, taskRouter)
app.use("/api/comments", protect, commentRouter)

app.get("/",(req,res)=>{
  res.send("Welcome To Project Management System");
})

const port = process.env.PORT || 8081;
app.listen(port, ()=>{
    console.log(`Server Listing On Port ${port}`);
})