import { Router } from "express";
import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { createUser } from "./controllers.js";
import { hash, verify } from "@node-rs/argon2";

import nodemailer from "nodemailer";
import { db } from "../db.js";
import { checkIfUserExists } from "../auth/queries.js";
import { generateIdFromEntropySize } from "lucia";

const usersRouter = Router();

usersRouter.get("/user", async (req, res) => {
  const sessionId = parseCookies(req.headers.cookie ?? "").get("auth_session");
  console.log("sess", parseCookies(req.headers.cookie ?? ""));
  console.log("session", sessionId);
  if (sessionId) {
    const { user } = await lucia.validateSession(sessionId);
    console.log("user ", user);
    if (user) {
      if (user.google_id !== null) {
        return res.json({
          username: user.username,
          links_amount: user.links_amount,
          id: user.id,
        });
      }
      if (user.github_id !== null) {
        return res.json({
          username: user.username,
          links_amount: user.links_amount,
          id: user.id,
        });
      }
      const customUsername = user.email.slice(0, user.email.indexOf("@"));
      console.log(customUsername);
      return res.json({
        username: customUsername,
        links_amount: user.links_amount,
        id: user.id,
      });
    }
  } else {
    res.status(404).json({
      user: "Invalid User",
    });
  }
});

usersRouter.get("/user/delete/:id", async (req, res) => {
  const { id } = req.params;
  console.log("viene aca con este id", id);
  try {
    await db.query(
      `
          DELETE FROM users WHERE id = $1
    `,
      [id],
    );
    res.status(302).setHeader("Location", "http://localhost:3000/login").end();
  } catch (error) {
    console.log("error borrando al usuario", error);
  }
});

usersRouter.post("/user", createUser);

usersRouter.post("/user/reset-password", async (req, res) => {
  const { recovery_email } = req.body;

  try {
    const user = await checkIfUserExists(recovery_email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "an email will be sent to this email if an account is registered under it.",
      });
    }

    const token = generateIdFromEntropySize(10);
    let transporter = nodemailer.createTransport({
      host: "send.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
      },
    });

    // transporter.verify(function (error, success) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Server is ready to take our messages");
    //   }
    // });

    const otp = Math.floor(Math.random() * 9000 + 1000);
    const hashedOTP = await hash(otp.toString(), {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    const otp_expires_at = new Date(Date.now() + 2 * 60 * 1000);
    const token_expires_at = new Date(Date.now() + 2 * 60 * 1000);

    const email = await db.query(
      `
        INSERT INTO verifications(otp,user_email, otp_expires_at,token, token_expires_at) VALUES($1,$2, $3, $4, $5) RETURNING user_email
      `,
      [hashedOTP, recovery_email, otp_expires_at, token, token_expires_at],
    );

    console.log("ee", email);
    const info = await transporter.sendMail({
      from: "info@demomailtrap.com",
      to: req.body.recovery_email.toString(),
      subject: "Swordly Restore Password",

      html: `<!DOCTYPE html>
      <html lang="en" >
      <head>
        <meta charset="UTF-8">
        <title>CodePen - OTP Email Template</title>
        
      
      </head>
      <body>
      <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Swordly</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p>Thank you for using Swordly. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
          <p style="font-size:0.9em;">Regards,<br />Swordly</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Swordly</p>
            <p>Ibague</p>
          </div>
        </div>
      </div>
        
      </body>
      </html>`,
    });
    res.json({
      success: true,
      message:
        "an email will be sent to this email if an account is registered under it.",
      recovery_email: email.rows[0].user_email,
    });
  } catch (error) {
    res.json({
      success: true,
      message:
        "an email will be sent to this email if an account is registered under it.",
    });
  }
});

usersRouter.post("/user/validate-otp", async (req, res) => {
  console.log("vengo a validar");
  const { user_otp, recovery_email } = req.body;
  console.log(req.body);
  try {
    const otp_table = await db.query(
      `
      SELECT otp, id, token FROM verifications WHERE user_email = $1
    `,
      [recovery_email],
    );
    console.log("table", otp_table);
    const verifyOTP = await verify(otp_table.rows[0].otp, user_otp);
    console.log("o", verifyOTP);
    if (verifyOTP) {
      res.json({
        success: true,
        token: otp_table.rows[0].token,
      });
      return;
    }
  } catch (error) {
    console.log("vef", error);
    res.json({
      success: false,
    });
  }
});

usersRouter.post("/user/update-password/:token", async (req, res) => {
  const { token } = req.params;
  const { new_password } = req.body;
  const otp_table = await db.query(
    `
    SELECT user_email, token_expires_at FROM verifications WHERE token = $1
  `,
    [token],
  );

  //check if the token expired
  const hashNewPassword = hash(new_password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const updatedUser = await db.query(
    `
    UPDATE users SET password_hash = $1 WHERE email = $2
  `,
    [hashNewPassword, otp_table.rows[0].user_email],
  );

  res.json({
    success: true,
  });
});

export default usersRouter;
