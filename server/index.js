import express from "express"
import cors from "cors"
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import {Webhook} from "svix";
import { inngest, functions } from "./inngest/index.js";

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
app.use(cors());

app.use(clerkMiddleware())

// Set up the "/api/inngest" (recommended) routes with the serve handler
// app.use("/api/inngest", serve({ client: inngest, functions }));
app.use(
  "/api/inngest", 
  serve({ 
    client: inngest, 
    functions,
    signingKey: process.env.INNGEST_SIGNING_KEY
  })
);

app.get("/",(req,res)=>{
  res.send("Welcome To Project Management System");
})

const port = process.env.PORT || 8081;
app.listen(port, ()=>{
    console.log(`Server Listing On Port ${port}`);
})