import express from "express"
import cors from "cors"
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(clerkMiddleware())

const port = process.env.PORT || 8081;

app.get("/",(req,res)=>{
    res.send("Welcome To Project Management System");
})

// Set up the "/api/inngest" (recommended) routes with the serve handler
app.use("/api/inngest", serve({ client: inngest, functions }));

app.listen(port, ()=>{
    console.log(`Server Listing On Port ${port}`);
})