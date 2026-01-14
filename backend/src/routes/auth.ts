import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import pool from "../config/database";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../services/emailServiceResend";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Discord API response types
interface DiscordTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  verified?: boolean;
  flags?: number;
  banner?: string | null;
  accent_color?: number | null;
  premium_type?: number;
  public_flags?: number;
}

// Generate 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate secure reset token
const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Get next sequential UID
const getNextUID = async (): Promise<number> => {
  try {
    const result = await pool.query("SELECT NEXTVAL('user_uid_seq') as uid");
    return parseInt(result.rows[0].uid);
  } catch (error) {
    // If sequence doesn't exist, create it and try again
    await pool.query("CREATE SEQUENCE IF NOT EXISTS user_uid_seq START 1");
    const result = await pool.query("SELECT NEXTVAL('user_uid_seq') as uid");
    return parseInt(result.rows[0].uid);
  }
};

// Register new user
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    // Username validation - allow single characters and special characters
    // Minimum 1 character, maximum 50, allows letters, numbers, underscores, hyphens, and special chars
    if (username.length < 1 || username.length > 50) {
      res.status(400).json({
        error: "Username must be 1-50 characters",
      });
      return;
    }

    // Only disallow spaces and certain problematic characters
    if (/[\s<>]/.test(username)) {
      res.status(400).json({
        error: "Username cannot contain spaces or < > characters",
      });
      return;
    }

    // Email validation
    if (!validator.isEmail(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    // Password strength - minimum 6 characters
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Check if username or email already exists (case-insensitive)
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)",
      [username, email],
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get next sequential UID (1, 2, 3, etc.)
    const uid = await getNextUID();
    
    // UID 1 is automatically the owner/admin
    const isAdmin = uid === 1;

    // Create user with sequential UID
    const userResult = await pool.query(
      "INSERT INTO users (username, email, password_hash, uid, is_admin, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, uid, is_admin",
      [username.toLowerCase(), email.toLowerCase(), passwordHash, uid, isAdmin, isAdmin ? 'owner' : 'user'],
    );

    const user = userResult.rows[0];

    // Create default profile for user
    await pool.query(
      "INSERT INTO profiles (user_id) VALUES ($1)",
      [user.id]
    );

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await pool.query(
      "INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [user.id, verificationCode, expiresAt],
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode, username);

    res.status(201).json({
      message: "Registration successful. Please check your email for verification code.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        uid: user.uid,
        isAdmin: user.is_admin
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify email with code
router.post("/verify", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ error: "Email and verification code are required" });
      return;
    }

    // Find user by email
    const userResult = await pool.query(
      "SELECT id, username, email, uid, is_admin FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    // Check verification code
    const codeResult = await pool.query(
      "SELECT * FROM verification_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [user.id, code]
    );

    if (codeResult.rows.length === 0) {
      res.status(400).json({ error: "Invalid or expired verification code" });
      return;
    }

    // Mark user as verified
    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [user.id]);

    // Delete used verification codes
    await pool.query("DELETE FROM verification_codes WHERE user_id = $1", [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, uid: user.uid, isAdmin: user.is_admin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Send welcome email
    await sendWelcomeEmail(user.email, user.username, user.uid.toString());

    res.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        uid: user.uid,
        isAdmin: user.is_admin
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Resend verification code
router.post("/resend-code", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const userResult = await pool.query(
      "SELECT id, username, is_verified FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      res.status(400).json({ error: "Email is already verified" });
      return;
    }

    // Delete old codes
    await pool.query("DELETE FROM verification_codes WHERE user_id = $1", [user.id]);

    // Generate new code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [user.id, verificationCode, expiresAt]
    );

    await sendVerificationEmail(email, verificationCode, user.username);

    res.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Resend code error:", error);
    res.status(500).json({ error: "Failed to resend code" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    // Find user by username or email
    const userResult = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)",
      [username]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = userResult.rows[0];

    // Check if banned
    if (user.is_banned) {
      res.status(403).json({ error: "Account is banned", reason: user.ban_reason });
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Check if verified
    if (!user.is_verified) {
      res.status(403).json({ 
        error: "Email not verified", 
        needsVerification: true,
        email: user.email 
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, uid: user.uid, isAdmin: user.is_admin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        uid: user.uid,
        displayName: user.display_name,
        avatar: user.avatar,
        isAdmin: user.is_admin,
        isVerified: user.is_verified,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Forgot password - request reset
router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    // Find user by email
    const userResult = await pool.query(
      "SELECT id, username, email FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      return;
    }

    const user = userResult.rows[0];

    // Delete any existing reset tokens for this user
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [user.id]);

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Store hashed token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, hashedToken, expiresAt]
    );

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken, user.username);

    res.json({ message: "If an account with that email exists, a password reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Reset password with token
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    // Hash the provided token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid reset token
    const tokenResult = await pool.query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password
    await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [passwordHash, userId]
    );

    // Delete used token
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [userId]);

    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userResult = await pool.query(
      `SELECT u.*, p.* FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = $1`,
      [req.user?.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult.rows[0];
    
    // UID 1 always has owner access
    const isOwner = user.uid === 1;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        uid: user.uid,
        displayName: user.display_name,
        bio: user.bio,
        avatar: user.avatar,
        discordId: user.discord_id,
        discordAvatar: user.discord_avatar,
        discordUsername: user.discord_username,
        useDiscordAvatar: user.use_discord_avatar,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
        isOwner,
        role: user.role,
        createdAt: user.created_at,
        profile: {
          bio: user.bio,
          location: user.location,
          backgroundImage: user.background_image,
          backgroundVideo: user.background_video,
          backgroundAudio: user.background_audio,
          customPfp: user.custom_pfp,
          customCursor: user.custom_cursor,
          useDiscordPfp: user.use_discord_pfp,
          useDiscordDecoration: user.use_discord_decoration,
          accentColor: user.accent_color,
          textColor: user.text_color,
          backgroundColor: user.background_color,
          iconColor: user.icon_color,
          backgroundEffect: user.background_effect,
          usernameEffect: user.username_effect,
          profileOpacity: user.profile_opacity,
          profileBlur: user.profile_blur,
          monochromeIcons: user.monochrome_icons,
          animatedTitle: user.animated_title,
          swapBoxColors: user.swap_box_colors,
          volumeControl: user.volume_control,
          typewriterEffect: user.typewriter_effect,
          typewriterSpeed: user.typewriter_speed,
          enableGradient: user.enable_gradient,
          gradientStart: user.gradient_start,
          gradientEnd: user.gradient_end,
          glowUsername: user.glow_username,
          glowSocials: user.glow_socials,
          glowBadges: user.glow_badges,
          discordPresence: user.discord_presence,
          viewCount: user.view_count
        }
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Discord OAuth - Start
router.get("/discord", (req: Request, res: Response) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.DISCORD_REDIRECT_URI || '');
  const scope = encodeURIComponent('identify email');
  
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  
  res.redirect(discordAuthUrl);
});

// Discord OAuth - Callback
router.get("/discord/callback", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || '';
    
    if (!code) {
      res.redirect(`${frontendUrl}/login?error=no_code`);
      return;
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
      }),
    });

    const tokenData = await tokenResponse.json() as DiscordTokenResponse;

    if (!tokenData.access_token) {
      console.error("Discord token error:", tokenData);
      res.redirect(`${frontendUrl}/login?error=token_failed`);
      return;
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordUser = await userResponse.json() as DiscordUser;

    if (!discordUser.id) {
      console.error("Discord user error:", discordUser);
      res.redirect(`${frontendUrl}/login?error=user_failed`);
      return;
    }

    // Check if user exists with this Discord ID
    let userResult = await pool.query(
      "SELECT * FROM users WHERE discord_id = $1",
      [discordUser.id]
    );

    let user;

    if (userResult.rows.length > 0) {
      // User exists, update Discord info
      user = userResult.rows[0];
      await pool.query(
        "UPDATE users SET discord_avatar = $1, discord_username = $2 WHERE id = $3",
        [discordUser.avatar, discordUser.username, user.id]
      );
    } else {
      // Check if email exists
      if (discordUser.email) {
        userResult = await pool.query(
          "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
          [discordUser.email]
        );

        if (userResult.rows.length > 0) {
          // Link Discord to existing account
          user = userResult.rows[0];
          await pool.query(
            "UPDATE users SET discord_id = $1, discord_avatar = $2, discord_username = $3 WHERE id = $4",
            [discordUser.id, discordUser.avatar, discordUser.username, user.id]
          );
        }
      }

      if (!user) {
        // Create new user with Discord
        const uid = await getNextUID();
        const isAdmin = uid === 1;
        // Clean username but allow more characters
        const cleanUsername = discordUser.username.toLowerCase().replace(/[\s<>]/g, '') || `user${uid}`;
        
        // Make sure username is unique
        let finalUsername = cleanUsername;
        let counter = 1;
        while (true) {
          const check = await pool.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1)", [finalUsername]);
          if (check.rows.length === 0) break;
          finalUsername = `${cleanUsername}${counter}`;
          counter++;
        }

        userResult = await pool.query(
          `INSERT INTO users (username, email, uid, discord_id, discord_avatar, discord_username, is_verified, is_admin, role) 
           VALUES ($1, $2, $3, $4, $5, $6, true, $7, $8) 
           RETURNING *`,
          [finalUsername, discordUser.email?.toLowerCase() || `${discordUser.id}@discord.user`, uid, discordUser.id, discordUser.avatar, discordUser.username, isAdmin, isAdmin ? 'owner' : 'user']
        );
        user = userResult.rows[0];

        // Create default profile
        await pool.query("INSERT INTO profiles (user_id) VALUES ($1)", [user.id]);
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, uid: user.uid, isAdmin: user.is_admin },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Redirect to frontend with token
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Discord OAuth error:", error);
    const frontendUrl = process.env.FRONTEND_URL || '';
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
  }
});

// Logout
router.post("/logout", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Delete user sessions
    await pool.query("DELETE FROM sessions WHERE user_id = $1", [req.user?.userId]);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Check if user is owner (UID 1)
router.get("/check-owner", authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userResult = await pool.query(
      "SELECT uid FROM users WHERE id = $1",
      [req.user?.userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isOwner = userResult.rows[0].uid === 1;
    res.json({ isOwner });
  } catch (error) {
    console.error("Check owner error:", error);
    res.status(500).json({ error: "Failed to check owner status" });
  }
});

export default router;
