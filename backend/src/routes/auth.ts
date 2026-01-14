import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import pool from "../config/database";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/emailServiceResend";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Generate 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate 8-character alphanumeric UID
const generateUID = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

    // Username validation (alphanumeric, underscore, hyphen only)
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      res.status(400).json({
        error:
          "Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens",
      });
      return;
    }

    // Email validation
    if (!validator.isEmail(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    // Password strength
    if (password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    // Check if username or email already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR email = $2",
      [username.toLowerCase(), email.toLowerCase()],
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate unique UID
    let uid = generateUID();
    let uidExists = true;
    while (uidExists) {
      const uidCheck = await pool.query("SELECT id FROM users WHERE uid = $1", [uid]);
      if (uidCheck.rows.length === 0) {
        uidExists = false;
      } else {
        uid = generateUID();
      }
    }

    // Create user with UID
    const userResult = await pool.query(
      "INSERT INTO users (username, email, password_hash, uid) VALUES ($1, $2, $3, $4) RETURNING id, username, email, uid",
      [username.toLowerCase(), email.toLowerCase(), passwordHash, uid],
    );

    const user = userResult.rows[0];

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    await pool.query(
      "INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [user.id, verificationCode, expiresAt],
    );

    // Send verification email via SpaceMail
    await sendVerificationEmail(email, verificationCode, username);

    res.status(201).json({
      message:
        "Registration successful! Check your email for verification code.",
      userId: user.id,
      username: user.username,
      email: user.email,
      uid: user.uid,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify email with code
router.post(
  "/verify-email",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, code } = req.body;

      if (!userId || !code) {
        res.status(400).json({ error: "User ID and code are required" });
        return;
      }

      // Find valid verification code
      const result = await pool.query(
        "SELECT * FROM verification_codes WHERE user_id = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [userId, code],
      );

      if (result.rows.length === 0) {
        res.status(400).json({ error: "Invalid or expired verification code" });
        return;
      }

      // Update user as verified
      await pool.query("UPDATE users SET is_verified = TRUE WHERE id = $1", [
        userId,
      ]);

      // Create default profile with settings
      await pool.query(
        "INSERT INTO profiles (user_id, settings) VALUES ($1, $2)",
        [userId, JSON.stringify({
          monochromeIcons: false,
          iconPreset: 'minimalist',
          typewriterEffect: false,
          typewriterSpeed: 50,
          cursorEffect: 'none',
          cursorColor: '#00FF00',
          cursorDensity: 50
        })]
      );

      // Delete used verification codes
      await pool.query("DELETE FROM verification_codes WHERE user_id = $1", [
        userId,
      ]);

      // Get user info for welcome email
      const userResult = await pool.query(
        "SELECT username, email, uid FROM users WHERE id = $1",
        [userId],
      );

      const user = userResult.rows[0];
      await sendWelcomeEmail(user.email, user.username, user.uid);

      res.json({ message: "Email verified successfully!", uid: user.uid });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  },
);

// Resend verification code
router.post(
  "/resend-code",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      // Get user info
      const userResult = await pool.query(
        "SELECT username, email, is_verified FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = userResult.rows[0];

      if (user.is_verified) {
        res.status(400).json({ error: "Email already verified" });
        return;
      }

      // Delete old codes
      await pool.query("DELETE FROM verification_codes WHERE user_id = $1", [
        userId,
      ]);

      // Generate new code with 5-minute expiry
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        "INSERT INTO verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
        [userId, verificationCode, expiresAt],
      );

      // Send email via SpaceMail
      await sendVerificationEmail(user.email, verificationCode, user.username);

      res.json({ message: "Verification code sent!" });
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ error: "Failed to resend code" });
    }
  },
);

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    // Find user (can login with username, email, or UID)
    const userResult = await pool.query(
      "SELECT id, username, email, password_hash, is_verified, is_admin, uid, role FROM users WHERE username = $1 OR email = $1 OR uid = $1",
      [username.toLowerCase()],
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = userResult.rows[0];

    // Check if user is banned
    const banCheck = await pool.query(
      "SELECT reason FROM banned_users WHERE user_id = $1",
      [user.id]
    );

    if (banCheck.rows.length > 0) {
      res.status(403).json({ error: "Account suspended", reason: banCheck.rows[0].reason });
      return;
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, uid: user.uid },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" },
    );

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await pool.query(
      "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, token, expiresAt],
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        uid: user.uid,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout
router.post(
  "/logout",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];

      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  },
);

// Get current user
router.get(
  "/me",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userResult = await pool.query(
        "SELECT id, username, email, is_verified, is_admin, uid, role, created_at FROM users WHERE id = $1",
        [req.userId],
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = userResult.rows[0];

      // Get user badges
      const badgesResult = await pool.query(
        `SELECT b.id, b.name, b.type, b.icon, b.color, ub.monochrome 
         FROM badges b 
         JOIN user_badges ub ON b.id = ub.badge_id 
         WHERE ub.user_id = $1`,
        [req.userId]
      );

      res.json({
        ...user,
        badges: badgesResult.rows
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  },
);

// Discord OAuth - Initiate
router.get('/discord', (req: Request, res: Response) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  // Use the backend URL for callback, not frontend
  const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/discord/callback`);
  const scope = encodeURIComponent('identify email');
  
  const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}`;
  
  res.redirect(discordAuthUrl);
});

// Discord OAuth - Callback
router.get('/discord/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.query;

    if (!code) {
      res.redirect('/login?error=discord_auth_failed');
      return;
    }

    // Exchange code for access token
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
        redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/auth/discord/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      res.redirect('/login?error=discord_token_failed');
      return;
    }

    // Get user info from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordUser = await userResponse.json();

    if (!discordUser.id) {
      res.redirect('/login?error=discord_user_failed');
      return;
    }

    // Check if user exists with this Discord ID
    let result = await pool.query(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordUser.id]
    );

    let user;

    if (result.rows.length === 0) {
      // Check if email already exists
      if (discordUser.email) {
        const emailCheck = await pool.query(
          'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
          [discordUser.email]
        );

        if (emailCheck.rows.length > 0) {
          // Link Discord to existing account
          await pool.query(
            'UPDATE users SET discord_id = $1, discord_avatar = $2 WHERE id = $3',
            [discordUser.id, discordUser.avatar, emailCheck.rows[0].id]
          );
          user = emailCheck.rows[0];
        }
      }

      if (!user) {
        // Create new user
        let uid = generateUID();
        let uidExists = true;
        while (uidExists) {
          const uidCheck = await pool.query('SELECT id FROM users WHERE uid = $1', [uid]);
          if (uidCheck.rows.length === 0) {
            uidExists = false;
          } else {
            uid = generateUID();
          }
        }

        // Generate username from Discord username
        let username = discordUser.username.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (username.length < 3) username = `user${uid.slice(0, 4).toLowerCase()}`;
        
        // Check if username exists
        const usernameCheck = await pool.query(
          'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
          [username]
        );
        if (usernameCheck.rows.length > 0) {
          username = `${username}${uid.slice(0, 4).toLowerCase()}`;
        }

        const insertResult = await pool.query(
          `INSERT INTO users (username, email, uid, discord_id, discord_avatar, is_verified)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING *`,
          [username, discordUser.email, uid, discordUser.id, discordUser.avatar]
        );

        user = insertResult.rows[0];

        // Create default profile
        await pool.query(
          "INSERT INTO profiles (user_id, settings) VALUES ($1, $2)",
          [user.id, JSON.stringify({
            monochromeIcons: false,
            iconPreset: 'minimalist',
            typewriterEffect: false,
            typewriterSpeed: 50,
            cursorEffect: 'none',
            cursorColor: '#10B981',
            cursorDensity: 50
          })]
        );
      }
    } else {
      user = result.rows[0];
      // Update Discord avatar
      await pool.query(
        'UPDATE users SET discord_avatar = $1 WHERE id = $2',
        [discordUser.avatar, user.id]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, uid: user.uid },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || '';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    res.redirect('/login?error=discord_auth_failed');
  }
});

export default router;
