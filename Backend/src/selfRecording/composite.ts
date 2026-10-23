// Builds the ffmpeg arguments for the combined video of a session.
//
// Layout: the cameras fill the frame side by side. While someone shares their screen,
// the frame switches to the screen on the left with the cameras in a column on the right,
// and switches back when the share ends. Each clip is placed at its real start time.

// A track on the session timeline. `offset` is when it started, in seconds after the
// earliest camera; `duration` is its length in seconds.
export type Clip = { file: string; offset: number; duration: number; hasAudio: boolean };

const WIDTH = 1280;
const HEIGHT = 720;
const SIDEBAR = 320;
const FPS = 30;
const BACKGROUND = "0x0a0a0a";

export function shareWindows(screens: Clip[]) {
  return [...screens]
    .sort((a, b) => a.offset - b.offset)
    .map((s) => ({ start: s.offset, end: s.offset + s.duration }));
}

export function totalDuration(cameras: Clip[], screens: Clip[]) {
  return Math.max(0, ...[...cameras, ...screens].map((c) => c.offset + c.duration));
}

// Converts each track's recorder start time (epoch ms) into an offset in seconds.
// Tracks recorded before start times existed have none and are placed at zero.
export function offsetsFromStartTimes(starts: { cameras: (number | undefined)[]; screens: (number | undefined)[] }) {
  const known = starts.cameras.filter((t): t is number => t !== undefined);
  const base = known.length > 0 ? Math.min(...known) : undefined;
  const toOffset = (t: number | undefined) => (t === undefined || base === undefined ? 0 : Math.max(0, (t - base) / 1000));
  return { cameras: starts.cameras.map(toOffset), screens: starts.screens.map(toOffset) };
}

const even = (n: number) => Math.floor(n / 2) * 2;

// Scale to fill a w×h box, cropping the overflow, like `object-fit: cover`.
const cover = (w: number, h: number) => `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;

function gridCells(count: number) {
  const cols = count <= 1 ? 1 : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const w = even(WIDTH / cols);
  const h = even(HEIGHT / rows);
  return Array.from({ length: count }, (_, i) => ({ x: (i % cols) * w, y: Math.floor(i / cols) * h, w, h }));
}

function sidebarCells(count: number) {
  const h = even(Math.min(HEIGHT / 4, HEIGHT / count));
  const top = even((HEIGHT - h * count) / 2);
  return Array.from({ length: count }, (_, i) => ({ x: WIDTH - SIDEBAR, y: top + i * h, w: SIDEBAR, h }));
}

export function buildCompositeArgs(input: { cameras: Clip[]; screens: Clip[] }, output: string): string[] {
  const { cameras, screens } = input;
  const total = totalDuration(cameras, screens);
  const filters: string[] = [];
  const inputs = [...cameras, ...screens].flatMap((c) => ["-i", c.file]);

  // Two canvases: the people-only layout, and the screen-share layout.
  filters.push(`color=c=${BACKGROUND}:s=${WIDTH}x${HEIGHT}:r=${FPS}:d=${total}[people0]`);

  cameras.forEach((cam, i) => {
    filters.push(`[${i}:v]setpts=PTS-STARTPTS+${cam.offset}/TB,fps=${FPS}${screens.length > 0 ? `,split=2[cam${i}][side${i}]` : `[cam${i}]`}`);
  });

  gridCells(cameras.length).forEach((cell, i) => {
    filters.push(`[cam${i}]${cover(cell.w, cell.h)}[grid${i}]`);
    filters.push(`[people${i}][grid${i}]overlay=${cell.x}:${cell.y}:eof_action=pass[people${i + 1}]`);
  });
  let videoOut = `people${cameras.length}`;

  if (screens.length > 0) {
    filters.push(`color=c=${BACKGROUND}:s=${WIDTH}x${HEIGHT}:r=${FPS}:d=${total}[share0]`);
    let layer = 0;

    screens.forEach((screen, j) => {
      const index = cameras.length + j;
      const w = WIDTH - SIDEBAR;
      filters.push(
        `[${index}:v]setpts=PTS-STARTPTS+${screen.offset}/TB,fps=${FPS},` +
        `scale=${w}:${HEIGHT}:force_original_aspect_ratio=decrease,pad=${w}:${HEIGHT}:(ow-iw)/2:(oh-ih)/2:color=${BACKGROUND}[screen${j}]`
      );
      filters.push(`[share${layer}][screen${j}]overlay=0:0:eof_action=pass[share${layer + 1}]`);
      layer++;
    });

    sidebarCells(cameras.length).forEach((cell, i) => {
      filters.push(`[side${i}]${cover(cell.w, cell.h)}[sidebar${i}]`);
      filters.push(`[share${layer}][sidebar${i}]overlay=${cell.x}:${cell.y}:eof_action=pass[share${layer + 1}]`);
      layer++;
    });

    // Show the share layout only while a screen is being shared.
    const enable = shareWindows(screens).map((w) => `between(t,${w.start},${w.end})`).join("+");
    filters.push(`[${videoOut}][share${layer}]overlay=0:0:enable='${enable}'[video]`);
    videoOut = "video";
  }

  // Everyone's microphones, each delayed to its start time. Screen tracks are video only.
  const voices = cameras.map((cam, i) => ({ cam, i })).filter(({ cam }) => cam.hasAudio);
  voices.forEach(({ cam, i }) => {
    filters.push(`[${i}:a]asetpts=PTS-STARTPTS,adelay=${Math.round(cam.offset * 1000)}:all=1[voice${i}]`);
  });
  if (voices.length > 0) {
    filters.push(`${voices.map(({ i }) => `[voice${i}]`).join("")}amix=inputs=${voices.length}:normalize=0:duration=longest[audio]`);
  }

  return [
    ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", `[${videoOut}]`,
    ...(voices.length > 0 ? ["-map", "[audio]", "-c:a", "libopus"] : []),
    "-c:v", "libvpx-vp9", "-deadline", "realtime", "-cpu-used", "8", "-row-mt", "1",
    "-t", String(total),
    output,
  ];
}

// A recording chunk on Cloudinary, with its recorder's start time if it was sent.
export type ChunkInfo = { publicId: string; startedAt?: number };

// Each time someone starts sharing, the browser starts a new recorder with a new start
// time. Consecutive chunks with the same start time belong to one share.
export function groupSegments(chunks: ChunkInfo[]) {
  const segments: { startedAt: number | undefined; publicIds: string[] }[] = [];
  for (const chunk of chunks) {
    const last = segments[segments.length - 1];
    if (last && last.startedAt === chunk.startedAt) last.publicIds.push(chunk.publicId);
    else segments.push({ startedAt: chunk.startedAt, publicIds: [chunk.publicId] });
  }
  return segments;
}
