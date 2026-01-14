import express, { Request, Response } from "express";
import pool from "../config/database";
import {
  authenticateToken,
  requireVerified,
  AuthRequest,
} from "../middleware/auth";

const router = express.Router();

// Get public profile by username
router.get("/:username", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    // Get user and profile
    const result = await pool.query(
      `SELECT 
        u.username,
        u.uid,
        p.display_name,
        p.bio,
        p.avatar_url,
        p.theme,
        p.custom_css,
        p.view_count,
        p.settings,
        p.background_image,
        p.background_video,
        p.background_audio,
        p.song_title,
        p.id as profile_id
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.username = $1 AND u.is_verified = TRUE`,
      [username.toLowerCase()],
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile = result.rows[0];

    // Check if user is banned
    const banCheck = await pool.query(
      "SELECT 1 FROM banned_users bu JOIN profiles p ON bu.user_id = p.user_id WHERE p.id = $1",
      [profile.profile_id]
    );

    if (banCheck.rows.length > 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    // Get links
    const linksResult = await pool.query(
      "SELECT id, title, url, icon, position FROM links WHERE profile_id = $1 AND is_active = TRUE ORDER BY position",
      [profile.profile_id],
    );

    // Get social links
    const socialResult = await pool.query(
      "SELECT platform, url FROM social_links WHERE profile_id = $1 ORDER BY position",
      [profile.profile_id],
    );

    // Get platform links
    const platformLinksResult = await pool.query(
      "SELECT platform, url, custom_name, custom_icon FROM platform_links WHERE user_id = (SELECT user_id FROM profiles WHERE id = $1) ORDER BY display_order",
      [profile.profile_id],
    );

    // Get user badges
    const badgesResult = await pool.query(
      `SELECT b.id, b.name, b.type, b.icon, b.color, ub.monochrome 
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       JOIN profiles p ON ub.user_id = p.user_id
       WHERE p.id = $1`,
      [profile.profile_id]
    );

    // Increment view count (async, don't wait)
    pool
      .query("UPDATE profiles SET view_count = view_count + 1 WHERE id = $1", [
        profile.profile_id,
      ])
      .catch((err) => console.error("View count update error:", err));

    res.json({
      username: profile.username,
      uid: profile.uid,
      displayName: profile.display_name,
      bio: profile.bio,
      avatar: profile.avatar_url,
      theme: profile.theme,
      customCss: profile.custom_css,
      viewCount: profile.view_count,
      settings: profile.settings || {},
      backgroundImage: profile.background_image,
      backgroundVideo: profile.background_video,
      audioUrl: profile.background_audio,
      songTitle: profile.song_title,
      links: linksResult.rows,
      socialLinks: socialResult.rows,
      platformLinks: platformLinksResult.rows,
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
        p.*,
        u.username,
        u.email,
        u.uid
      FROM profiles p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1`,
        [req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const profile = result.rows[0];

      // Get links
      const linksResult = await pool.query(
        "SELECT * FROM links WHERE profile_id = $1 ORDER BY position",
        [profile.id],
      );

      // Get social links
      const socialResult = await pool.query(
        "SELECT * FROM social_links WHERE profile_id = $1 ORDER BY position",
        [profile.id],
      );

      // Get platform links
      const platformLinksResult = await pool.query(
        "SELECT * FROM platform_links WHERE user_id = $1 ORDER BY display_order",
        [req.userId],
      );

      // Get badges
      const badgesResult = await pool.query(
        `SELECT b.id, b.name, b.type, b.icon, b.color, ub.monochrome 
         FROM badges b 
         JOIN user_badges ub ON b.id = ub.badge_id 
         WHERE ub.user_id = $1`,
        [req.userId]
      );

      res.json({
        ...profile,
        links: linksResult.rows,
        socialLinks: socialResult.rows,
        platformLinks: platformLinksResult.rows,
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
      const { displayName, bio, avatarUrl, theme, customCss, settings, backgroundImage, backgroundVideo, backgroundAudio, songTitle } = req.body;

      const result = await pool.query(
        `UPDATE profiles 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url),
           theme = COALESCE($4, theme),
           custom_css = COALESCE($5, custom_css),
           settings = COALESCE($6, settings),
           background_image = COALESCE($7, background_image),
           background_video = COALESCE($8, background_video),
           background_audio = COALESCE($9, background_audio),
           song_title = COALESCE($10, song_title)
       WHERE user_id = $11
       RETURNING *`,
        [displayName, bio, avatarUrl, theme, customCss, settings ? JSON.stringify(settings) : null, backgroundImage, backgroundVideo, backgroundAudio, songTitle, req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

// Update profile settings only
router.put(
  "/me/settings",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { settings } = req.body;

      const result = await pool.query(
        `UPDATE profiles 
       SET settings = $1
       WHERE user_id = $2
       RETURNING settings`,
        [JSON.stringify(settings), req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  },
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
       SET monochrome = $1
       WHERE user_id = $2 AND badge_id = $3
       RETURNING *`,
        [monochrome, req.userId, badgeId],
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
  },
);

// Add platform link
router.post(
  "/me/platform-links",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { platform, url, customName, customIcon } = req.body;

      if (!platform || !url) {
        res.status(400).json({ error: "Platform and URL are required" });
        return;
      }

      // Get max display order
      const maxOrderResult = await pool.query(
        "SELECT COALESCE(MAX(display_order), -1) as max_order FROM platform_links WHERE user_id = $1",
        [req.userId],
      );

      const displayOrder = maxOrderResult.rows[0].max_order + 1;

      const result = await pool.query(
        "INSERT INTO platform_links (user_id, platform, url, custom_name, custom_icon, display_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [req.userId, platform, url, customName, customIcon, displayOrder],
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Add platform link error:", error);
      res.status(500).json({ error: "Failed to add platform link" });
    }
  },
);

// Delete platform link
router.delete(
  "/me/platform-links/:linkId",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { linkId } = req.params;

      const result = await pool.query(
        "DELETE FROM platform_links WHERE id = $1 AND user_id = $2 RETURNING id",
        [linkId, req.userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Platform link not found" });
        return;
      }

      res.json({ message: "Platform link deleted successfully" });
    } catch (error) {
      console.error("Delete platform link error:", error);
      res.status(500).json({ error: "Failed to delete platform link" });
    }
  },
);

// Add link
router.post(
  "/me/links",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, url, icon } = req.body;

      if (!title || !url) {
        res.status(400).json({ error: "Title and URL are required" });
        return;
      }

      // Get profile ID
      const profileResult = await pool.query(
        "SELECT id FROM profiles WHERE user_id = $1",
        [req.userId],
      );

      if (profileResult.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const profileId = profileResult.rows[0].id;

      // Get max position
      const maxPosResult = await pool.query(
        "SELECT COALESCE(MAX(position), -1) as max_pos FROM links WHERE profile_id = $1",
        [profileId],
      );

      const position = maxPosResult.rows[0].max_pos + 1;

      // Create link
      const result = await pool.query(
        "INSERT INTO links (profile_id, title, url, icon, position) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [profileId, title, url, icon, position],
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Add link error:", error);
      res.status(500).json({ error: "Failed to add link" });
    }
  },
);

// Update link
router.put(
  "/me/links/:linkId",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { linkId } = req.params;
      const { title, url, icon, isActive } = req.body;

      // Verify ownership
      const ownershipResult = await pool.query(
        "SELECT l.id FROM links l JOIN profiles p ON l.profile_id = p.id WHERE l.id = $1 AND p.user_id = $2",
        [linkId, req.userId],
      );

      if (ownershipResult.rows.length === 0) {
        res.status(404).json({ error: "Link not found" });
        return;
      }

      const result = await pool.query(
        `UPDATE links 
       SET title = COALESCE($1, title),
           url = COALESCE($2, url),
           icon = COALESCE($3, icon),
           is_active = COALESCE($4, is_active)
       WHERE id = $5
       RETURNING *`,
        [title, url, icon, isActive, linkId],
      );

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Update link error:", error);
      res.status(500).json({ error: "Failed to update link" });
    }
  },
);

// Delete link
router.delete(
  "/me/links/:linkId",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { linkId } = req.params;

      // Verify ownership
      const result = await pool.query(
        "DELETE FROM links l USING profiles p WHERE l.id = $1 AND l.profile_id = p.id AND p.user_id = $2 RETURNING l.id",
        [linkId, req.userId],
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
  },
);

// Reorder links
router.put(
  "/me/links/reorder",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { linkIds } = req.body; // Array of link IDs in desired order

      if (!Array.isArray(linkIds)) {
        res.status(400).json({ error: "linkIds must be an array" });
        return;
      }

      // Get profile ID
      const profileResult = await pool.query(
        "SELECT id FROM profiles WHERE user_id = $1",
        [req.userId],
      );

      if (profileResult.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const profileId = profileResult.rows[0].id;

      // Update positions
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        for (let i = 0; i < linkIds.length; i++) {
          await client.query(
            "UPDATE links SET position = $1 WHERE id = $2 AND profile_id = $3",
            [i, linkIds[i], profileId],
          );
        }

        await client.query("COMMIT");
        res.json({ message: "Links reordered successfully" });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Reorder links error:", error);
      res.status(500).json({ error: "Failed to reorder links" });
    }
  },
);

// Track link click
router.post(
  "/:username/click/:linkId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { linkId } = req.params;

      await pool.query(
        "UPDATE links SET click_count = click_count + 1 WHERE id = $1",
        [linkId],
      );

      res.json({ message: "Click tracked" });
    } catch (error) {
      console.error("Track click error:", error);
      res.status(500).json({ error: "Failed to track click" });
    }
  },
);

export default router;
