import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

export const sendRecordingEmail = async (to: string, links: string) => {
  console.log("userEmail", to);

  await transporter.sendMail({
    from: `"Recio" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your session recordings are ready 🎉",
    html: `
      <h2>Your recordings are ready</h2>
      <p>You can access your session recordings below:</p>
      ${links}
      <br/>
      <p>Thanks for using our platform!</p>
    `,
  });
  console.log("Email sent bro");
};