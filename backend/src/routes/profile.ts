import express, { Request, Response } from "express";
import pool from "../config/database";
import {
  authenticateToken,
  requireVerified,
  AuthRequest,
} from "../middleware/auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Get public profile by username
router.get("/:username", async (req: Request, res: Response): Promise<void> => {
  try {
    // Decode URL-encoded username to handle special characters like $, @, etc.
    const username = decodeURIComponent(req.params.username);

    // Get user and profile - using correct column names
    const result = await pool.query(
      `SELECT 
        u.username,
        u.uid,
        u.display_name,
        u.bio as user_bio,
        u.avatar,
        p.id as profile_id,
        p.display_name as profile_display_name,
        p.bio as profile_bio,
        p.background_image,
        p.background_video,
        p.background_audio,
        p.custom_pfp,
        p.custom_cursor,
        p.accent_color,
        p.text_color,
        p.background_color,
        p.icon_color,
        p.background_effect,
        p.username_effect,
        p.profile_opacity,
        p.profile_blur,
        p.monochrome_icons,
        p.animated_title,
        p.typewriter_effect,
        p.typewriter_speed,
        p.enable_gradient,
        p.glow_username,
        p.glow_socials,
        p.glow_badges,
        p.view_count,
        p.location
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE LOWER(u.username) = LOWER($1) AND u.is_verified = TRUE`,
      [username],
    );

    if (result.rows.length === 0) {
      // Check if user exists but is not verified
      const unverifiedCheck = await pool.query(
        "SELECT username, is_verified FROM users WHERE LOWER(username) = LOWER($1)",
        [username]
      );
      
      if (unverifiedCheck.rows.length > 0 && !unverifiedCheck.rows[0].is_verified) {
        res.status(403).json({ error: "This profile is not available. The user needs to verify their email." });
        return;
      }
      
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile = result.rows[0];

    // Check if user is banned
    const banCheck = await pool.query(
      "SELECT 1 FROM banned_users WHERE user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1))",
      [username]
    );

    if (banCheck.rows.length > 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    // Get links
    const linksResult = await pool.query(
      "SELECT id, platform, url, title, icon, custom_icon, clicks FROM links WHERE user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1)) AND is_active = TRUE ORDER BY position",
      [username],
    );

    // Get user badges
    const badgesResult = await pool.query(
      `SELECT b.id, b.name, b.icon, b.color, ub.is_monochrome as monochrome
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       WHERE ub.user_id = (SELECT id FROM users WHERE LOWER(username) = LOWER($1))
       ORDER BY ub.display_order`,
      [username]
    );

    // Increment view count (async, don't wait)
    if (profile.profile_id) {
      pool
        .query("UPDATE profiles SET view_count = view_count + 1 WHERE id = $1", [
          profile.profile_id,
        ])
        .catch((err) => console.error("View count update error:", err));
    }

    res.json({
      username: profile.username,
      uid: profile.uid,
      displayName: profile.profile_display_name || profile.display_name || profile.username,
      bio: profile.profile_bio || profile.user_bio,
      avatar: profile.custom_pfp || profile.avatar,
      backgroundImage: profile.background_image,
      backgroundVideo: profile.background_video,
      backgroundAudio: profile.background_audio,
      customCursor: profile.custom_cursor,
      accentColor: profile.accent_color,
      textColor: profile.text_color,
      backgroundColor: profile.background_color,
      iconColor: profile.icon_color,
      backgroundEffect: profile.background_effect,
      usernameEffect: profile.username_effect,
      profileOpacity: profile.profile_opacity,
      profileBlur: profile.profile_blur,
      monochromeIcons: profile.monochrome_icons,
      animatedTitle: profile.animated_title,
      typewriterEffect: profile.typewriter_effect,
      typewriterSpeed: profile.typewriter_speed,
      enableGradient: profile.enable_gradient,
      glowUsername: profile.glow_username,
      glowSocials: profile.glow_socials,
      glowBadges: profile.glow_badges,
      viewCount: profile.view_count || 0,
      location: profile.location,
      links: linksResult.rows,
      badges: badgesResult.rows,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

// Get own profile
router.get(
  "/me/profile",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT 
          u.id as user_id,
          u.username,
          u.email,
          u.uid,
          u.display_name as user_display_name,
          u.bio as user_bio,
          u.avatar as user_avatar,
          u.discord_id,
          u.discord_avatar,
          u.is_admin,
          u.role,
          p.*
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE u.id = $1`,
        [req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const profile = result.rows[0];

      // Get links
      const linksResult = await pool.query(
        "SELECT * FROM links WHERE user_id = $1 ORDER BY position",
        [req.userId],
      );

      // Get badges
      const badgesResult = await pool.query(
        `SELECT b.id, b.name, b.icon, b.color, b.description, ub.is_monochrome as monochrome
         FROM badges b 
         JOIN user_badges ub ON b.id = ub.badge_id 
         WHERE ub.user_id = $1
         ORDER BY ub.display_order`,
        [req.userId]
      );

      res.json({
        ...profile,
        displayName: profile.display_name || profile.user_display_name || profile.username,
        links: linksResult.rows,
        badges: badgesResult.rows,
      });
    } catch (error) {
      console.error("Get own profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  },
);

// Update profile
router.put(
  "/me/profile",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const updates = req.body;
      
      // Build dynamic update query
      const allowedFields = [
        'display_name', 'bio', 'location', 'background_image', 'background_video',
        'background_audio', 'custom_pfp', 'custom_cursor', 'accent_color', 'text_color',
        'background_color', 'icon_color', 'background_effect', 'username_effect',
        'profile_opacity', 'profile_blur', 'monochrome_icons', 'animated_title',
        'swap_box_colors', 'volume_control', 'typewriter_effect', 'typewriter_speed',
        'enable_gradient', 'gradient_start', 'gradient_end', 'glow_username',
        'glow_socials', 'glow_badges', 'discord_presence', 'meta_title', 'meta_description',
        'use_discord_pfp', 'use_discord_decoration'
      ];

      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (allowedFields.includes(snakeKey)) {
          setClauses.push(`${snakeKey} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        res.status(400).json({ error: "No valid fields to update" });
        return;
      }

      setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.userId);

      const result = await pool.query(
        `UPDATE profiles SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
        values,
      );

      if (result.rows.length === 0) {
        // Create profile if it doesn't exist
        await pool.query(
          "INSERT INTO profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
          [req.userId]
        );
        
        // Retry update
        const retryResult = await pool.query(
          `UPDATE profiles SET ${setClauses.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
          values,
        );
        res.json(retryResult.rows[0]);
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

// Get all links
router.get(
  "/me/links",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        "SELECT * FROM links WHERE user_id = $1 ORDER BY position",
        [req.userId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Get links error:", error);
      res.status(500).json({ error: "Failed to get links" });
    }
  }
);

// Add link
router.post(
  "/me/links",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { platform, url, title, icon, customIcon } = req.body;

      if (!platform || !url) {
        res.status(400).json({ error: "Platform and URL are required" });
        return;
      }

      // Get max position
      const maxPosResult = await pool.query(
        "SELECT COALESCE(MAX(position), -1) as max_pos FROM links WHERE user_id = $1",
        [req.userId]
      );

      const position = maxPosResult.rows[0].max_pos + 1;

      const result = await pool.query(
        "INSERT INTO links (user_id, platform, url, title, icon, custom_icon, position) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [req.userId, platform, url, title, icon, customIcon, position]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Add link error:", error);
      res.status(500).json({ error: "Failed to add link" });
    }
  }
);

// Update link
router.put(
  "/me/links/:id",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { url, title, isActive } = req.body;

      const result = await pool.query(
        `UPDATE links SET 
          url = COALESCE($1, url),
          title = COALESCE($2, title),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND user_id = $5 RETURNING *`,
        [url, title, isActive, id, req.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Link not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update link error:", error);
      res.status(500).json({ error: "Failed to update link" });
    }
  }
);

// Delete link
router.delete(
  "/me/links/:id",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        "DELETE FROM links WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, req.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Link not found" });
        return;
      }

      res.json({ message: "Link deleted successfully" });
    } catch (error) {
      console.error("Delete link error:", error);
      res.status(500).json({ error: "Failed to delete link" });
    }
  }
);

// Reorder links
router.put(
  "/me/links/reorder",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { linkIds } = req.body;

      if (!Array.isArray(linkIds)) {
        res.status(400).json({ error: "linkIds must be an array" });
        return;
      }

      // Update positions
      for (let i = 0; i < linkIds.length; i++) {
        await pool.query(
          "UPDATE links SET position = $1 WHERE id = $2 AND user_id = $3",
          [i, linkIds[i], req.userId]
        );
      }

      res.json({ message: "Links reordered successfully" });
    } catch (error) {
      console.error("Reorder links error:", error);
      res.status(500).json({ error: "Failed to reorder links" });
    }
  }
);

// Get user badges
router.get(
  "/me/badges",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Get all available badges
      const allBadgesResult = await pool.query(
        "SELECT * FROM badges ORDER BY name"
      );

      // Get user's badges
      const userBadgesResult = await pool.query(
        `SELECT b.*, ub.is_monochrome as monochrome, ub.assigned_at 
         FROM badges b 
         JOIN user_badges ub ON b.id = ub.badge_id 
         WHERE ub.user_id = $1
         ORDER BY ub.display_order`,
        [req.userId]
      );

      res.json({
        allBadges: allBadgesResult.rows,
        userBadges: userBadgesResult.rows
      });
    } catch (error) {
      console.error("Get badges error:", error);
      res.status(500).json({ error: "Failed to get badges" });
    }
  }
);

// Toggle badge monochrome
router.put(
  "/me/badges/:badgeId/monochrome",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { badgeId } = req.params;
      const { monochrome } = req.body;

      const result = await pool.query(
        `UPDATE user_badges 
         SET is_monochrome = $1
         WHERE user_id = $2 AND badge_id = $3
         RETURNING *`,
        [monochrome, req.userId, badgeId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Badge not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update badge error:", error);
      res.status(500).json({ error: "Failed to update badge" });
    }
  }
);

// Update account settings
router.put(
  "/me/account",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { username, displayName, email } = req.body;

      // Check if username is taken
      if (username) {
        const existingUser = await pool.query(
          "SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2",
          [username, req.userId]
        );

        if (existingUser.rows.length > 0) {
          res.status(400).json({ error: "Username already taken" });
          return;
        }
      }

      // Update user
      const userResult = await pool.query(
        `UPDATE users 
         SET username = COALESCE($1, username),
             display_name = COALESCE($2, display_name),
             email = COALESCE($3, email),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, username, email, uid, role, is_verified as "isVerified", is_admin as "isAdmin", display_name as "displayName"`,
        [username, displayName, email, req.userId]
      );

      res.json(userResult.rows[0]);
    } catch (error) {
      console.error("Update account error:", error);
      res.status(500).json({ error: "Failed to update account" });
    }
  }
);

// Change password
router.put(
  "/me/password",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const bcrypt = require("bcryptjs");

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: "Current password and new password are required" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: "New password must be at least 6 characters" });
        return;
      }

      // Get current password hash
      const userResult = await pool.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [req.userId]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
      if (!isValid) {
        res.status(400).json({ error: "Current password is incorrect" });
        return;
      }

      // Hash new password
      const newHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await pool.query(
        "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [newHash, req.userId]
      );

      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  }
);

// Get templates
router.get(
  "/templates",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { sort = 'trending', search, tab } = req.query;

      let orderBy = 'uses_count DESC';
      if (sort === 'popular') orderBy = 'uses_count DESC';
      if (sort === 'newest') orderBy = 'created_at DESC';
      if (sort === 'stars') orderBy = 'stars_count DESC';

      let whereClause = 'is_public = TRUE';
      const values: any[] = [];

      if (search) {
        values.push(`%${search}%`);
        whereClause += ` AND (name ILIKE $${values.length} OR $${values.length} = ANY(tags))`;
      }

      const result = await pool.query(
        `SELECT t.*, u.username as creator_username, u.avatar as creator_avatar
         FROM templates t
         JOIN users u ON t.user_id = u.id
         WHERE ${whereClause}
         ORDER BY ${orderBy}
         LIMIT 50`,
        values
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get templates error:", error);
      res.status(500).json({ error: "Failed to get templates" });
    }
  }
);

// Get my templates
router.get(
  "/me/templates",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get my templates error:", error);
      res.status(500).json({ error: "Failed to get templates" });
    }
  }
);

// Create template
router.post(
  "/me/templates",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, settings, tags, isPublic } = req.body;

      if (!name || !settings) {
        res.status(400).json({ error: "Name and settings are required" });
        return;
      }

      // Generate unique share code
      const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const result = await pool.query(
        `INSERT INTO templates (user_id, name, share_code, settings, tags, is_public)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.userId, name, shareCode, JSON.stringify(settings), tags || [], isPublic !== false]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create template error:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  }
);

// Use template
router.post(
  "/templates/:shareCode/use",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { shareCode } = req.params;

      // Get template
      const templateResult = await pool.query(
        "SELECT * FROM templates WHERE share_code = $1",
        [shareCode]
      );

      if (templateResult.rows.length === 0) {
        res.status(404).json({ error: "Template not found" });
        return;
      }

      const template = templateResult.rows[0];

      // Apply settings to user's profile
      const settings = template.settings;
      
      // Update profile with template settings
      await pool.query(
        `UPDATE profiles SET
          accent_color = COALESCE($1, accent_color),
          text_color = COALESCE($2, text_color),
          background_color = COALESCE($3, background_color),
          icon_color = COALESCE($4, icon_color),
          background_effect = COALESCE($5, background_effect),
          username_effect = COALESCE($6, username_effect),
          monochrome_icons = COALESCE($7, monochrome_icons),
          enable_gradient = COALESCE($8, enable_gradient),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9`,
        [
          settings.accentColor,
          settings.textColor,
          settings.backgroundColor,
          settings.iconColor,
          settings.backgroundEffect,
          settings.usernameEffect,
          settings.monochromeIcons,
          settings.enableGradient,
          req.userId
        ]
      );

      // Increment uses count
      await pool.query(
        "UPDATE templates SET uses_count = uses_count + 1 WHERE id = $1",
        [template.id]
      );

      res.json({ message: "Template applied successfully" });
    } catch (error) {
      console.error("Use template error:", error);
      res.status(500).json({ error: "Failed to use template" });
    }
  }
);

// Favorite template
router.post(
  "/templates/:id/favorite",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await pool.query(
        `INSERT INTO template_favorites (user_id, template_id) VALUES ($1, $2)
         ON CONFLICT (user_id, template_id) DO NOTHING`,
        [req.userId, id]
      );

      // Update stars count
      await pool.query(
        "UPDATE templates SET stars_count = (SELECT COUNT(*) FROM template_favorites WHERE template_id = $1) WHERE id = $1",
        [id]
      );

      res.json({ message: "Template favorited" });
    } catch (error) {
      console.error("Favorite template error:", error);
      res.status(500).json({ error: "Failed to favorite template" });
    }
  }
);

// Unfavorite template
router.delete(
  "/templates/:id/favorite",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await pool.query(
        "DELETE FROM template_favorites WHERE user_id = $1 AND template_id = $2",
        [req.userId, id]
      );

      // Update stars count
      await pool.query(
        "UPDATE templates SET stars_count = (SELECT COUNT(*) FROM template_favorites WHERE template_id = $1) WHERE id = $1",
        [id]
      );

      res.json({ message: "Template unfavorited" });
    } catch (error) {
      console.error("Unfavorite template error:", error);
      res.status(500).json({ error: "Failed to unfavorite template" });
    }
  }
);

// Get favorite templates
router.get(
  "/me/favorites",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await pool.query(
        `SELECT t.*, u.username as creator_username
         FROM templates t
         JOIN template_favorites tf ON t.id = tf.template_id
         JOIN users u ON t.user_id = u.id
         WHERE tf.user_id = $1
         ORDER BY tf.created_at DESC`,
        [req.userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get favorites error:", error);
      res.status(500).json({ error: "Failed to get favorites" });
    }
  }
);

// File upload endpoint
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'image/x-icon', 'application/octet-stream'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.cur')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file
router.post(
  "/me/upload",
  authenticateToken,
  requireVerified,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const { type } = req.body; // background, avatar, audio, cursor
      const fileUrl = `/uploads/${req.file.filename}`;

      // Update profile with the file URL based on type
      let column = '';
      switch (type) {
        case 'background':
          if (req.file.mimetype.startsWith('video/')) {
            column = 'background_video';
          } else {
            column = 'background_image';
          }
          break;
        case 'avatar':
          column = 'custom_pfp';
          break;
        case 'audio':
          column = 'background_audio';
          break;
        case 'cursor':
          column = 'custom_cursor';
          break;
        default:
          res.status(400).json({ error: "Invalid upload type" });
          return;
      }

      await pool.query(
        `UPDATE profiles SET ${column} = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
        [fileUrl, req.userId]
      );

      res.json({ url: fileUrl, type });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  }
);

export default router;
