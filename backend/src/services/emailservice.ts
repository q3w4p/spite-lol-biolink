import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  email: string,
  code: string,
  username: string,
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🔐 Verify Your Spite.lol Account",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #1a1a1a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #fff;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
            color: #e0e0e0;
          }
          .content p {
            line-height: 1.6;
            margin: 0 0 20px;
          }
          .code-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            border-radius: 12px;
            margin: 30px 0;
          }
          .code {
            font-size: 42px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .footer {
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
            border-top: 1px solid #333;
          }
          .warning {
            background: #2a1a1a;
            border-left: 4px solid #ff6b6b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 spite.lol</h1>
          </div>
          <div class="content">
            <p>Hey <strong>${username}</strong>! 👋</p>
            <p>Thanks for signing up! Here's your verification code to activate your account:</p>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <p>Enter this code on the verification page to complete your registration.</p>

            <div class="warning">
              <strong>⚠️ Security Notice:</strong><br>
              This code expires in 15 minutes. Never share it with anyone. We'll never ask for your code via email, phone, or DM.
            </div>

            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} spite.lol - Your personal biolink hub</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hey ${username}!

      Thanks for signing up for spite.lol! 

      Your verification code is: ${code}

      This code expires in 15 minutes.

      Enter this code on the verification page to complete your registration.

      If you didn't request this code, you can safely ignore this email.

      - The spite.lol team
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (
  email: string,
  username: string,
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "🎉 Welcome to Spite.lol!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: #1a1a1a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            color: #fff;
            margin: 0;
            font-size: 32px;
            font-weight: 700;
          }
          .content {
            padding: 40px 30px;
            color: #e0e0e0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            padding: 30px;
            text-align: center;
            color: #888;
            font-size: 14px;
            border-top: 1px solid #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <p>Hey <strong>${username}</strong>!</p>
            <p>Your account has been verified! 🎊</p>
            <p>Your biolink is now live at:</p>
            <p style="text-align: center; font-size: 20px; margin: 30px 0;">
              <strong>spite.lol/${username}</strong>
            </p>
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
            </p>
            <p>Start customizing your profile, adding links, and sharing your personal hub with the world!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} spite.lol</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✓ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
