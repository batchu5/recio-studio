import { Worker } from "bullmq";
import { PrismaClient } from "../../src/generated/prisma/client.js";
import {
  mergeAndUpload,
  mergeAndUploadSideBySide,
} from "../selfRecording/controller.js";
import { sendRecordingEmail } from "../mail.js";
import dotenv from "dotenv";
dotenv.config();

const connection = {
  url: process.env.REDIS_URL || "",
};

const prisma = new PrismaClient();

console.log("[Worker Module] Initializing worker script...");
console.log(`[Worker Module] REDIS_URL status: ${process.env.REDIS_URL ? "CONFIGURED (" + process.env.REDIS_URL.split('@').pop() + ")" : "MISSING (using default localhost)"}`);

const worker = new Worker("video-processing", async (job) => {
  console.log(`[Worker] 🚀 Started job ${job.id} (${job.name})`);

  if (job.name === "process-recording") {
    const { sessionId, userEmail } = job.data;
    console.log(`[Worker] Job parameters - sessionId: ${sessionId}, userEmail: ${userEmail}`);

    console.log(`[Worker] Fetching room with id: ${sessionId}...`);
    const room = await prisma.room.findUnique({
      where: { id: sessionId },
      include: { participants: true },
    });

    if (!room) {
      console.error(`[Worker] ❌ Room not found for sessionId: ${sessionId}`);
      throw new Error(`Room not found: ${sessionId}`);
    }

    console.log(`[Worker] Room found. Name: '${room.name}', Participants count: ${room.participants.length}`);

    const urls: string[] = [];
    const screenShareurls: string[] = [];

    for (let i = 0; i < room.participants.length; i++) {
      const p = room.participants[i];

      if (!p) {
        console.warn(`[Worker] Participant at index ${i} is undefined. Skipping.`);
        continue;
      }

      console.log(`[Worker] Processing participant ${i + 1}/${room.participants.length}: ${p.email}`);

      console.log(`[Worker] Merging main video chunks for prefix: ${sessionId}_${p.email}_`);
      urls[i] = await mergeAndUpload(`${sessionId}_${p.email}_`);
      console.log(`[Worker] Main video result for ${p.email}: ${urls[i]}`);

      console.log(`[Worker] Merging screen share chunks for prefix: ${sessionId}_${p.email}-screen`);
      screenShareurls[i] = await mergeAndUpload(`${sessionId}_${p.email}-screen`);
      console.log(`[Worker] Screen share result for ${p.email}: ${screenShareurls[i]}`);
    }

    console.log("[Worker] Updating database with individual recordings...");
    await prisma.room.update({
      where: { id: sessionId },
      data: {
        recordings: {
          create: room.participants.flatMap((p, i) => {
            const recs: any[] = [];

            if (urls[i] && urls[i] !== "not found") {
              recs.push({
                url: urls[i],
                type: "individual",
                userId: p.id,
              });
            }

            if (screenShareurls[i] && screenShareurls[i] !== "not found") {
              recs.push({
                url: screenShareurls[i],
                type: "individual-screen",
                userId: p.id,
              });
            }

            return recs;
          }),
        },
      },
    });
    console.log("[Worker] ✅ Database updated with individual recordings.");

    console.log("[Worker] Starting side-by-side video merge...");
    const validUrls = urls.filter((u) => u && u !== "not found");
    let finalUrl: string | undefined = undefined;

    if (validUrls.length > 0) {
      finalUrl = await mergeAndUploadSideBySide(validUrls);
      console.log("[Worker] Side-by-side merge completed. Final URL:", finalUrl);

      if (finalUrl) {
        console.log("[Worker] Updating database with mixed recording...");
        await prisma.room.update({
          where: { id: sessionId },
          data: {
            recordings: {
              create: {
                url: finalUrl,
                type: "mixed",
              },
            },
          },
        });
        console.log("[Worker] ✅ Database updated with mixed recording.");
      }
    } else {
      console.warn("[Worker] No valid participant URLs available for side-by-side merge.");
    }

    console.log("🎉 [Worker] FULL PIPELINE DONE for session:", sessionId);
    if (process.env.FRONTEND_URL) {
      const link = `${process.env.FRONTEND_URL}/preStudio/${sessionId}`;
      console.log(`[Worker] Sending recording email to ${userEmail} with link: ${link}`);
      await sendRecordingEmail(userEmail, link);
      console.log("[Worker] ✅ Email sent successfully.");
    } else {
      console.warn("[Worker] FRONTEND_URL environment variable is not defined. Email skipped.");
    }

    return { urls, screenShareurls, finalUrl };
  }
}, { connection });

worker.on("ready", () => console.log("🟢 [Worker] BullMQ Worker connected to Redis and ready to receive jobs!"));
worker.on("completed", (job) => console.log(`✅ [Worker] Job ${job.id} completed successfully!`));
worker.on("failed", (job, err) => console.error(`❌ [Worker] Job ${job?.id} failed with error:`, err));
worker.on("error", (err) => console.error("💥 [Worker Error]:", err));

