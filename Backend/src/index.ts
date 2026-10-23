
import "dotenv/config";
import express from "express";
import crypto from "crypto";
import { PrismaClient } from "../src/generated/prisma/client.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AccessToken } from "livekit-server-sdk";
import { router } from "./selfRecording/controller.js";
import axios from "axios";
import type { JwtPayload } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import { requireAuth, signAuthToken } from "./middlewares/AuthMiddleware.js";

// Video processing is CPU heavy, so in production run it as its own process
// (`npm run worker`) and set RUN_WORKER_IN_API=false here.
if (process.env.RUN_WORKER_IN_API !== "false") {
  await import("./worker/worker.js");
}

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "" ;
const API_KEY = process.env.LIVEKIT_API_KEY ;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const Backend_url = process.env.BACKEND_URL;
const Frontend_url = process.env.FRONTEND_URL;

app.use("/api", router);


app.get("/auth/google", (req, res) => {
  const redirectUri = `${Backend_url}/auth/google/callback`; 
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const scope = "openid email profile";
  const responseType = "code";


  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
  
  res.redirect(googleAuthUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${Backend_url}/auth/google/callback`,
    grant_type: "authorization_code",
  });

  const { id_token } = tokenRes.data;

  // The id_token came straight from Google's token endpoint over TLS, so decoding is enough here.
  const decoded = jwt.decode(id_token);

  if (!decoded || typeof decoded === "string" || !("email" in decoded)) {
    return res.status(400).send("Invalid token");
  }

  const userEmail = (decoded as JwtPayload).email as string;

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: userEmail,
        // Google users have no password; store an unguessable hash so password sign-in can never match.
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
      },
    });
  }

  // Issue our own token instead of forwarding Google's. It goes in the URL fragment,
  // which browsers never send to servers, so it does not end up in access logs.
  const params = new URLSearchParams({ token: signAuthToken(user), email: user.email, userId: user.id });
  res.redirect(`${Frontend_url}/auth/callback#${params.toString()}`);
  
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    const token = signAuthToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });

  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

    const token = signAuthToken(user);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
          where: {
            email: email
          }
        });

        if (!user) {
            return res.status(400).json({ message: "User with this email does not exist" });
        }
        const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });

        const transporter = nodemailer.createTransport({
            secure: true,
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            to: email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset. Click <a href="${Frontend_url}/reset-password?token=${resetToken}">here</a> to reset your password. This link is valid for 15 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "Password reset link sent to email" });

    } catch (e) {
        console.error("Forgot Password Error:", e);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post('/reset-password', async (req, res) => {
    try {
        const {newPassword, token } = req.body;

        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        const user = await prisma.user.findUnique({
          where: {
            id: decoded.id
          } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log("hashedPassword", hashedPassword);
        user.password = hashedPassword;
        await prisma.user.update({
          where: { id: decoded.id },
          data: { password: hashedPassword },
        });

        res.json({ message: "Password reset successful" });

    } catch (e) {
        console.error("Reset Password Error:", e);
        res.status(500).json({ message: "Invalid or expired token" });
    }
});

const createToken = async ({roomName, participantId, role} : {roomName : string, participantId: string, role: "creator" | "guest"}) => {
 
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: participantId,
    ttl: '100m',
  });

  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true, canPublishData: role === "creator"});
  return await at.toJwt();
};


app.post('/getToken', requireAuth, async (req, res) => {
  try {
    const role = req.body.role === "creator" ? "creator" : "guest";
    const participant = req.user!;
    let room;

    if (role === "creator") {
      const roomName = typeof req.body.roomName === "string" ? req.body.roomName.trim() : "";
      if (!roomName || roomName.length > 60) {
        return res.status(400).json({ error: "Room name is required (max 60 characters)" });
      }

      room = await prisma.room.create({
        data: {
          name: roomName,
          createdBy: { connect: { id: participant.id } },
          participants: { connect: { id: participant.id } },
        },
      });
    } else {
      // Anyone with the invite link (room id) can join as a guest.
      const roomId = req.body.roomId;

      room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { participants: { where: { id: participant.id }, select: { id: true } } },
      });

      if (!room) {
        return res.status(400).json({ error: "Room does not exist" });
      }

      if (room.participants.length === 0) {
        await prisma.room.update({
          where: { id: room.id },
          data: { participants: { connect: { id: participant.id } } },
        });
      }
    }

    // Use the room id as the LiveKit room name: names are only unique per creator.
    const token = await createToken({ roomName: room.id, participantId: participant.email, role });
    res.json({ token, room: { id: room.id, name: room.name }, role });

  } catch (error: any) {
    if (error?.code === "P2002") {
      return res.status(409).json({ error: "You already have a room with this name" });
    }
    console.error("Error in /getToken:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post('/getRooms', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      roomsCreated: true,
      roomsJoined: true
    }
  });

  res.json({
    "roomsCreated" : user?.roomsCreated ?? [],
    "roomsJoined" : user?.roomsJoined ?? []
  });
});

app.post("/prev_mixed_urls", requireAuth, async (req, res) => {
    try{
      const fetchMixedUrls = await prisma.recording.findMany({
          where: {
            type: "mixed",
            room: {
              createdById: req.user!.id,
            },
          },
          select: {
            url: true,
            roomId: true,
            room: {
              select: {
                name: true
              }
            }
          },
      });

      const fetchedUrls = fetchMixedUrls.map(room => ({url: room.url, roomName: room.room.name, roomId: room.roomId}));
      res.json({"fetchedUrls" :  fetchedUrls});

    }catch(error){
      console.log("got an error while fetching the mixed urls", error);
      res.status(500).json({ error: "Internal server error" });
    }
});

// Only people who were in a room can see who else was in it or download its recordings.
async function isRoomMember(roomId: unknown, userId: string) {
  if (typeof roomId !== "string") return false;
  const room = await prisma.room.findFirst({
    where: { id: roomId, participants: { some: { id: userId } } },
    select: { id: true },
  });
  return room !== null;
}

app.post("/fetch_users_by_roomId", requireAuth, async (req, res) => {
  const { roomId } = req.body;
  if (!(await isRoomMember(roomId, req.user!.id))) {
    return res.status(403).json({ error: "Not a participant of this room" });
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { participants: { select: { id: true, email: true } } },
  });

  res.json({"fetchedUsers": room?.participants ?? []});
});

app.post("/fetch_url_by_userId_roomId_type", requireAuth, async (req, res) => {
    const {roomId, userId, type} = req.body;
    if (!(await isRoomMember(roomId, req.user!.id))) {
      return res.status(403).json({ error: "Not a participant of this room" });
    }

    const response = await prisma.recording.findFirst({
      where: {
        roomId: roomId,
        userId: userId,
        type: type
      },
      select: {
        url: true
      }
    });

    res.json(response);
});

app.listen(3000, () => console.log(" Server running on http://localhost:3000"));
