import axios from "axios";
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { cloudinary } from "../cloudinary.js";
import { buildCompositeArgs, offsetsFromStartTimes, type ChunkInfo, type Clip } from "./composite.js";

function chunkIndexOf(publicId: string) {
  const match = publicId.match(/(\d+)(?:\.\w+)?$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

// All chunks of one track, in recording order, with their recorder's start time if known.
export async function listChunks(prefix: string): Promise<ChunkInfo[]> {
  const chunks: ChunkInfo[] = [];
  let nextCursor: string | undefined = undefined;

  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      resource_type: "raw",
      prefix,
      context: true,
      max_results: 100,
      next_cursor: nextCursor,
    });

    res.resources.forEach((r: any) => {
      const startedAt = Number(r.context?.custom?.started_at);
      chunks.push({ publicId: r.public_id, ...(Number.isFinite(startedAt) ? { startedAt } : {}) });
    });
    nextCursor = res.next_cursor;
  } while (nextCursor);

  // Sort by the numeric chunk index, not as strings ("_10" would sort before "_9").
  chunks.sort((a, b) => chunkIndexOf(a.publicId) - chunkIndexOf(b.publicId));
  return chunks;
}

function runFfmpeg(args: string[], stdinWriter?: (stdin: NodeJS.WritableStream) => Promise<void>) {
  return new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args]);
    let stderr = "";

    ffmpeg.stderr.on("data", (data) => (stderr += data.toString()));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr}`));
    });

    if (stdinWriter) {
      stdinWriter(ffmpeg.stdin)
        .then(() => ffmpeg.stdin.end())
        .catch((err) => {
          ffmpeg.kill();
          reject(err);
        });
    }
  });
}

async function mergeChunks(publicIds: string[], outputPath: string) {

  // MediaRecorder chunks are pieces of one continuous WebM stream, so they can be
  // concatenated and remuxed without re-encoding.
  await runFfmpeg(["-f", "webm", "-i", "pipe:0", "-c", "copy", outputPath], async (stdin) => {
    for (const id of publicIds) {
      const url = cloudinary.url(id, { resource_type: "raw" });
      const response = await axios.get(url, { responseType: "stream" });
      await new Promise<void>((res, rej) => {
        response.data.on("end", res);
        response.data.on("error", rej);
        response.data.pipe(stdin, { end: false });
      });
    }
  });
  return outputPath;
}

async function withTempDir<T>(fn: (dir: string) => Promise<T>) {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "recio-"));
  try {
    return await fn(dir);
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
}

export async function mergeAndUpload(prefix: string, chunks: ChunkInfo[]) {
  if (chunks.length === 0) {
    console.log("No chunks found for prefix " + prefix);
    return "not found";
  }
  return withTempDir(async (dir) => {
    const outputFile = path.join(dir, "merged.webm");
    await mergeChunks(chunks.map((c) => c.publicId), outputFile);
    const uploadRes = await cloudinary.uploader.upload(outputFile, {
      resource_type: "raw",
      folder: "merged_videos",
      public_id: `${prefix}merged`,
      overwrite: true
    });

    console.log("✅ Uploaded merged video to Cloudinary:", uploadRes.secure_url);
    return uploadRes.secure_url as string;
  });
}

async function download(url: string, localPath: string) {
  const writer = fs.createWriteStream(localPath);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
  await new Promise<void>((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function probe(file: string) {
  const out = await new Promise<string>((resolve, reject) => {
    const ffprobe = spawn("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", file]);
    let stdout = "";
    ffprobe.stdout.on("data", (d) => (stdout += d.toString()));
    ffprobe.on("error", reject);
    ffprobe.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error(`ffprobe exited with code ${code}`))));
  });
  const info = JSON.parse(out);
  return {
    duration: Number(info.format?.duration) || 0,
    hasAudio: (info.streams ?? []).some((s: any) => s.codec_type === "audio"),
  };
}

// The combined video for a session where someone shared their screen: people side by
// side, switching to the screen layout only during each share (see composite.ts).
export async function mergeAndUploadComposite(
  cameras: { url: string; startedAt?: number | undefined }[],
  screenSegments: { publicIds: string[]; startedAt?: number | undefined }[],
) {
  return withTempDir(async (dir) => {
    const cameraFiles: string[] = [];
    for (let i = 0; i < cameras.length; i++) {
      const file = path.join(dir, `camera_${i}.webm`);
      await download(cameras[i]!.url, file);
      cameraFiles.push(file);
    }

    const screenFiles: string[] = [];
    for (let i = 0; i < screenSegments.length; i++) {
      const file = path.join(dir, `screen_${i}.webm`);
      await mergeChunks(screenSegments[i]!.publicIds, file);
      screenFiles.push(file);
    }

    const offsets = offsetsFromStartTimes({
      cameras: cameras.map((c) => c.startedAt),
      screens: screenSegments.map((s) => s.startedAt),
    });
    const toClips = async (files: string[], fileOffsets: number[]): Promise<Clip[]> =>
      Promise.all(files.map(async (file, i) => ({ file, offset: fileOffsets[i] ?? 0, ...(await probe(file)) })));

    const outputPath = path.join(dir, "final.webm");
    await runFfmpeg(buildCompositeArgs(
      { cameras: await toClips(cameraFiles, offsets.cameras), screens: await toClips(screenFiles, offsets.screens) },
      outputPath,
    ));

    const uploadResult = await cloudinary.uploader.upload(outputPath, { resource_type: "raw", overwrite: true });
    console.log("Uploaded combined video with screen share to Cloudinary:", uploadResult.secure_url);
    return uploadResult.secure_url as string;
  });
}

export async function mergeAndUploadSideBySide(participantUrls: string[]) {
  if (participantUrls.length === 0) {
    throw new Error("No participant videos provided");
  }

  if (participantUrls.length === 1) {
    return participantUrls[0];
  }

  return withTempDir(async (dir) => {
    const localFiles: string[] = [];

    for (let i = 0; i < participantUrls.length; i++) {
      const localPath = path.join(dir, `participant_${i}.webm`);
      const writer = fs.createWriteStream(localPath);
      const response = await axios.get(participantUrls[i]!, { responseType: "stream" });
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      localFiles.push(localPath);
    }

    const outputPath = path.join(dir, "final.webm");

    const ffmpegArgs: string[] = [];
    localFiles.forEach((f) => ffmpegArgs.push("-i", f));

    const width = 320;
    const height = 240;

    const scaleParts = localFiles.map((_, i) => `[${i}:v]scale=${width}:${height}[v${i}]`);
    const layout = localFiles.map((_, i) => `${i * width}_0`).join("|");

    const videoStack = `${scaleParts.join(";")};${localFiles.map((_, i) => `[v${i}]`).join("")}xstack=inputs=${localFiles.length}:layout=${layout}[v]`;

    const audioMix = `${localFiles.map((_, i) => `[${i}:a]`).join("")}amix=inputs=${localFiles.length}:normalize=0[a]`;

    ffmpegArgs.push(
      "-filter_complex", `${videoStack};${audioMix}`,
      "-map", "[v]",
      "-map", "[a]",
      "-c:v", "libvpx-vp9",
      "-deadline", "realtime",
      "-cpu-used", "8",
      "-row-mt", "1",
      "-c:a", "libopus",
      outputPath
    );

    await runFfmpeg(ffmpegArgs);

    const uploadResult = await cloudinary.uploader.upload(outputPath, {
      resource_type: "raw",
      overwrite: true
    });

    console.log("Uploaded final video to Cloudinary:", uploadResult.secure_url);
    return uploadResult.secure_url as string;
  });
}
