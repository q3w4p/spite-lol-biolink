import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// SpaceMail configuration
const SPACEMAIL_FROM = "no-reply@spite.lol";
const SUPPORT_EMAIL = "contact@spite.lol";

// Darker emerald green accent color
const ACCENT_COLOR = "#059669";

export const sendVerificationEmail = async (
  email: string,
  code: string,
  username: string,
): Promise<void> => {
  try {
    await resend.emails.send({
      from: SPACEMAIL_FROM,
      to: email,
      subject: "Verify Your Spite.lol Account",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #000000;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #0a0a0a;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #1a1a1a;
            }
            .header {
              background: #000000;
              padding: 40px 30px;
              text-align: center;
              border-bottom: 1px solid ${ACCENT_COLOR};
            }
            .logo {
              display: inline-flex;
              align-items: center;
              gap: 12px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: ${ACCENT_COLOR};
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #000;
              font-weight: bold;
              font-size: 20px;
            }
            .logo-text {
              color: ${ACCENT_COLOR};
              font-size: 28px;
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
              background: #0f0f0f;
              border: 2px solid ${ACCENT_COLOR};
              padding: 30px;
              text-align: center;
              border-radius: 12px;
              margin: 30px 0;
            }
            .code {
              font-size: 42px;
              font-weight: 700;
              color: ${ACCENT_COLOR};
              letter-spacing: 8px;
              font-family: 'JetBrains Mono', 'Courier New', monospace;
            }
            .expiry {
              color: #888;
              font-size: 14px;
              margin-top: 10px;
            }
            .footer {
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #1a1a1a;
              background: #050505;
            }
            .footer a {
              color: ${ACCENT_COLOR};
              text-decoration: none;
            }
            .warning {
              background: #1a0a0a;
              border-left: 4px solid #ff4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #ff8888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">&gt;_</div>
                <span class="logo-text">spite.lol</span>
              </div>
            </div>
            <div class="content">
              <p>Hey <strong style="color: ${ACCENT_COLOR};">${username}</strong>,</p>
              <p>Thanks for signing up! Here's your verification code to activate your account:</p>

              <div class="code-box">
                <div class="code">${code}</div>
                <div class="expiry">Expires in 5 minutes</div>
              </div>

              <p>Enter this code on the verification page to complete your registration.</p>

              <div class="warning">
                <strong>Security Notice:</strong><br>
                This code expires in 5 minutes. Never share it with anyone. We'll never ask for your code via email, phone, or DM.
              </div>

              <p>If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
              <p>&copy; ${new Date().getFullYear()} spite.lol - Your personal biolink hub</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hey ${username},

Thanks for signing up for spite.lol!

Your verification code is: ${code}

This code expires in 5 minutes.

Enter this code on the verification page to complete your registration.

If you didn't request this code, you can safely ignore this email.

Need help? ${SUPPORT_EMAIL}

- The spite.lol team
      `,
    });
    console.log(`✓ Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send verification email");
  }
};

export const sendWelcomeEmail = async (
  email: string,
  username: string,
  uid: string,
): Promise<void> => {
  try {
    await resend.emails.send({
      from: SPACEMAIL_FROM,
      to: email,
      subject: "Welcome to Spite.lol!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #000000;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #0a0a0a;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #1a1a1a;
            }
            .header {
              background: #000000;
              padding: 40px 30px;
              text-align: center;
              border-bottom: 1px solid ${ACCENT_COLOR};
            }
            .logo {
              display: inline-flex;
              align-items: center;
              gap: 12px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: ${ACCENT_COLOR};
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #000;
              font-weight: bold;
              font-size: 20px;
            }
            .logo-text {
              color: ${ACCENT_COLOR};
              font-size: 28px;
              font-weight: 700;
            }
            .content {
              padding: 40px 30px;
              color: #e0e0e0;
            }
            .profile-url {
              background: #0f0f0f;
              border: 1px solid ${ACCENT_COLOR};
              padding: 20px;
              text-align: center;
              border-radius: 12px;
              margin: 20px 0;
            }
            .profile-url a {
              color: ${ACCENT_COLOR};
              font-size: 20px;
              font-weight: 600;
              text-decoration: none;
            }
            .uid-box {
              background: #0f0f0f;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              font-family: 'JetBrains Mono', monospace;
              color: #888;
            }
            .uid-box strong {
              color: ${ACCENT_COLOR};
            }
            .button {
              display: inline-block;
              background: #0a0a0a;
              color: ${ACCENT_COLOR};
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              border: 1px solid ${ACCENT_COLOR};
            }
            .footer {
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #1a1a1a;
              background: #050505;
            }
            .footer a {
              color: ${ACCENT_COLOR};
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">&gt;_</div>
                <span class="logo-text">spite.lol</span>
              </div>
            </div>
            <div class="content">
              <p>Hey <strong style="color: ${ACCENT_COLOR};">${username}</strong>,</p>
              <p>Your account has been verified! Welcome to spite.lol!</p>
              
              <p>Your biolink is now live at:</p>
              <div class="profile-url">
                <a href="https://spite.lol/${username}">spite.lol/${username}</a>
              </div>

              <div class="uid-box">
                Your UID: <strong>${uid}</strong>
              </div>

              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://spite.lol'}/dashboard" class="button">Go to Dashboard →</a>
              </p>

              <p>Start customizing your profile, adding links, and sharing your personal hub with the world!</p>
              
              <p><strong style="color: ${ACCENT_COLOR};">All premium features are FREE:</strong></p>
              <ul style="color: #888;">
                <li>Custom themes & backgrounds</li>
                <li>Cursor effects (snowflakes, rain, stars)</li>
                <li>Typewriter text animations</li>
                <li>Music player widget</li>
                <li>Profile analytics</li>
                <li>Custom badges</li>
                <li>And much more...</li>
              </ul>
            </div>
            <div class="footer">
              <p>Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
              <p>&copy; ${new Date().getFullYear()} spite.lol</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`✓ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};


export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  username: string,
): Promise<void> => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'https://spite.lol'}/reset-password?token=${resetToken}`;
    
    await resend.emails.send({
      from: SPACEMAIL_FROM,
      to: email,
      subject: "Reset Your Spite.lol Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: #000000;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #0a0a0a;
              border-radius: 16px;
              overflow: hidden;
              border: 1px solid #1a1a1a;
            }
            .header {
              background: #000000;
              padding: 40px 30px;
              text-align: center;
              border-bottom: 1px solid ${ACCENT_COLOR};
            }
            .logo {
              display: inline-flex;
              align-items: center;
              gap: 12px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: ${ACCENT_COLOR};
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #000;
              font-weight: bold;
              font-size: 20px;
            }
            .logo-text {
              color: ${ACCENT_COLOR};
              font-size: 28px;
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
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background: ${ACCENT_COLOR};
              color: #000000;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 700;
              font-size: 16px;
            }
            .link-box {
              background: #0f0f0f;
              border: 1px solid #333;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              word-break: break-all;
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              color: #888;
            }
            .expiry {
              color: #888;
              font-size: 14px;
              text-align: center;
            }
            .footer {
              padding: 30px;
              text-align: center;
              color: #666;
              font-size: 14px;
              border-top: 1px solid #1a1a1a;
              background: #050505;
            }
            .footer a {
              color: ${ACCENT_COLOR};
              text-decoration: none;
            }
            .warning {
              background: #1a0a0a;
              border-left: 4px solid #ff4444;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #ff8888;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <div class="logo-icon">&gt;_</div>
                <span class="logo-text">spite.lol</span>
              </div>
            </div>
            <div class="content">
              <p>Hey <strong style="color: ${ACCENT_COLOR};">${username}</strong>,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>

              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <p class="expiry">This link expires in 1 hour</p>

              <p>Or copy and paste this link into your browser:</p>
              <div class="link-box">${resetUrl}</div>

              <div class="warning">
                <strong>Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>Need help? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
              <p>&copy; ${new Date().getFullYear()} spite.lol - Your personal biolink hub</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hey ${username},

We received a request to reset your password.

Click here to reset your password: ${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Need help? ${SUPPORT_EMAIL}

- The spite.lol team
      `,
    });
    console.log(`✓ Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
