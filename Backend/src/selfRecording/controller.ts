import express from "express";
import multer from "multer";
import fs from "fs";
import os from "os";
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { Queue } from "bullmq";
import { chunkPublicId, cloudinary } from "../cloudinary.js";
import { requireAuth } from "../middlewares/AuthMiddleware.js";

const connection = {
  url: process.env.REDIS_URL || "",
};

export const videoQueue = new Queue("video-processing", {connection: connection});

const upload = multer({ dest: os.tmpdir() });
export const router = express.Router();
const prisma = new PrismaClient();

router.use(requireAuth);

router.post("/upload_chunk", upload.single("blob"), async(req, res) => {
  const { session_id, chunk_index, type, started_at } = req.body;
  const user = req.user!;

  if(!req.file){
    res.status(400).json({"message" : "blob is empty"})
    return;
  }

  const tmpPath = req.file.path;
  try{
      const index = Number(chunk_index);
      if (!session_id || !Number.isInteger(index) || index < 0) {
        res.status(400).json({ error: "session_id and a numeric chunk_index are required" });
        return;
      }

      const room = await prisma.room.findFirst({
        where: { id: session_id, participants: { some: { id: user.id } } },
        select: { id: true },
      });
      if (!room) {
        res.status(403).json({ error: "Not a participant of this room" });
        return;
      }

      // The participant is taken from the token, never from the request body.
      const participant = type === "screenShare" ? `${user.email}-screen` : user.email;
      // The recorder's start time lets the worker place this track on the session timeline.
      const startedAt = Number(started_at);
      const result = await cloudinary.uploader.upload(tmpPath, {
        resource_type: "raw",
        public_id: chunkPublicId(session_id, participant, index),
        format: "webm",
        ...(Number.isFinite(startedAt) && startedAt > 0 ? { context: { started_at: String(startedAt) } } : {}),
      });

      res.send({"url" : result})

    }catch(err : any){
      res.status(500).json({"error occured while uploading" : err.message})
    } finally {
      fs.promises.unlink(tmpPath).catch(() => {});
    }

})

router.post("/start_processing", async (req, res) => {
  const { sessionId } = req.body;
  const user = req.user!;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  const room = await prisma.room.findFirst({
    where: { id: sessionId, createdById: user.id },
    select: { id: true },
  });
  if (!room) {
    return res.status(403).json({ error: "Only the room creator can start processing" });
  }

  try {
    // Set timeout safeguard so server response won't hang forever if Redis is down
    const addJobPromise = videoQueue.add("process-recording", {
      sessionId,
      userEmail: user.email,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Redis queue timeout: videoQueue.add took longer than 10 seconds. Check REDIS_URL and connection settings.")), 10000)
    );

    const job = await Promise.race([addJobPromise, timeoutPromise]) as any;

    console.log(`[HTTP /start_processing] ✅ Successfully added job to queue! Job ID: ${job.id}`);

    res.json({
      status: "processing",
      message: "Recording processing started",
      jobId: job.id,
    });

  } catch (error: any) {
    console.error("[HTTP /start_processing] ❌ Failed to add job to queue:", error);
    res.status(500).json({ error: "Failed to start processing", details: error.message });
  }
});
