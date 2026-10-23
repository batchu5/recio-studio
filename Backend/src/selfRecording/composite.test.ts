import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { buildCompositeArgs, groupSegments, offsetsFromStartTimes, shareWindows, totalDuration } from "./composite.js";

test("a screen share is shown only between its start and end", () => {
  const windows = shareWindows([{ file: "s.webm", offset: 240, duration: 50, hasAudio: false }]);
  assert.deepEqual(windows, [{ start: 240, end: 290 }]);
});

test("sharing twice gives two separate windows, in time order", () => {
  const windows = shareWindows([
    { file: "b.webm", offset: 550, duration: 20, hasAudio: false },
    { file: "a.webm", offset: 240, duration: 50, hasAudio: false },
  ]);
  assert.deepEqual(windows, [{ start: 240, end: 290 }, { start: 550, end: 570 }]);
});

test("the combined video lasts until the last track ends", () => {
  const total = totalDuration(
    [{ file: "you.webm", offset: 0, duration: 300, hasAudio: true }, { file: "sam.webm", offset: 12, duration: 295, hasAudio: true }],
    [{ file: "s.webm", offset: 240, duration: 50, hasAudio: false }],
  );
  assert.equal(total, 307);
});

test("offsets are seconds after the earliest camera started", () => {
  const offsets = offsetsFromStartTimes({ cameras: [1_000_000, 1_012_500], screens: [1_240_000] });
  assert.deepEqual(offsets, { cameras: [0, 12.5], screens: [240] });
});

test("tracks without a start time (old recordings) start at zero", () => {
  const offsets = offsetsFromStartTimes({ cameras: [undefined, 1_005_000], screens: [undefined] });
  assert.deepEqual(offsets, { cameras: [0, 0], screens: [0] });
});

test("each start of screen sharing becomes its own segment", () => {
  const segments = groupSegments([
    { publicId: "room_sam-screen_0000000004", startedAt: 1_240_000 },
    { publicId: "room_sam-screen_0000000005", startedAt: 1_240_000 },
    { publicId: "room_sam-screen_0000000009", startedAt: 1_550_000 },
  ]);
  assert.deepEqual(segments, [
    { startedAt: 1_240_000, publicIds: ["room_sam-screen_0000000004", "room_sam-screen_0000000005"] },
    { startedAt: 1_550_000, publicIds: ["room_sam-screen_0000000009"] },
  ]);
});

test("chunks without a start time (old recordings) stay one segment", () => {
  const segments = groupSegments([{ publicId: "a_1" }, { publicId: "a_2" }]);
  assert.deepEqual(segments, [{ startedAt: undefined, publicIds: ["a_1", "a_2"] }]);
});

// Renders a real video: two cameras (red, blue) for 8s, and a green screen share from 3s to 5s.
// Checks the pixel where the screen sits in the share layout, before, during and after the share.
const hasFfmpeg = spawnSync("ffmpeg", ["-version"]).status === 0;

test("the rendered video switches to the screen layout only while sharing", { skip: !hasFfmpeg }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "recio-composite-test-"));
  try {
    const make = (name: string, color: string, seconds: number, audio: boolean) => {
      const file = path.join(dir, name);
      const args = ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `color=c=${color}:s=640x480:r=30:d=${seconds}`];
      if (audio) args.push("-f", "lavfi", "-i", `sine=d=${seconds}`);
      args.push("-c:v", "libvpx", "-b:v", "1M", ...(audio ? ["-c:a", "libopus"] : []), file);
      assert.equal(spawnSync("ffmpeg", args).status, 0, `could not create ${name}`);
      return file;
    };
    const you = make("you.webm", "red", 8, true);
    const sam = make("sam.webm", "blue", 8, true);
    const screen = make("screen.webm", "lime", 2, false);
    const output = path.join(dir, "combined.webm");

    const args = buildCompositeArgs(
      {
        cameras: [{ file: you, offset: 0, duration: 8, hasAudio: true }, { file: sam, offset: 0, duration: 8, hasAudio: true }],
        screens: [{ file: screen, offset: 3, duration: 2, hasAudio: false }],
      },
      output,
    );
    const run = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
    assert.equal(run.status, 0, run.stderr?.toString());

    // Middle of the screen area in the share layout. Outside a share this spot is a camera tile.
    // A 2×2 crop (a 1×1 crop is invalid for 4:2:0 video); the first pixel is enough.
    const pixel = (t: number) => {
      const out = spawnSync("ffmpeg", ["-loglevel", "error", "-ss", String(t), "-i", output, "-frames:v", "1", "-vf", "crop=2:2:480:360", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
      assert.ok(out.stdout.length >= 3, `could not read a frame at ${t}s: ${out.stderr}`);
      const [r = 0, g = 0, b = 0] = out.stdout;
      return { r, g, b };
    };
    type Rgb = { r: number, g: number, b: number };
    const isGreen = ({ r, g, b }: Rgb) => g > 150 && r < 100 && b < 100;
    // "You" (red) fills this spot in the people-only layout.
    const isRed = ({ r, g, b }: Rgb) => r > 150 && g < 100 && b < 100;

    assert.ok(isRed(pixel(1.5)), "people-only layout before the share starts");
    assert.ok(isGreen(pixel(4)), "screen is visible during the share");
    assert.ok(isRed(pixel(6.5)), "back to the people-only layout after the share");

    const duration = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", output]).stdout.toString());
    assert.ok(Math.abs(duration - 8) < 0.5, `combined video should last about 8s, got ${duration}`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
