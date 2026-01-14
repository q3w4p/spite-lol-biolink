import express, { Request, Response } from "express";
import pool from "../config/database";
import {
  authenticateToken,
  requireVerified,
  AuthRequest,
} from "../middleware/auth";

const router = express.Router();

// Generate 6-character share code
const generateShareCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Get all public templates
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.share_code, t.screenshot, t.uses_count, t.created_at,
              u.username as creator_username
       FROM templates t
       JOIN users u ON t.user_id = u.id
       WHERE t.is_public = TRUE
       ORDER BY t.uses_count DESC
       LIMIT 50`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get templates error:", error);
    res.status(500).json({ error: "Failed to get templates" });
  }
});

// Get template by share code
router.get("/code/:shareCode", async (req: Request, res: Response): Promise<void> => {
  try {
    const { shareCode } = req.params;

    const result = await pool.query(
      `SELECT t.*, u.username as creator_username
       FROM templates t
       JOIN users u ON t.user_id = u.id
       WHERE t.share_code = $1`,
      [shareCode.toUpperCase()]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Template not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get template error:", error);
    res.status(500).json({ error: "Failed to get template" });
  }
});

// Get my templates
router.get(
  "/me",
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

// Create template from current settings
router.post(
  "/",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, screenshotUrl, isPublic = true } = req.body;

      if (!name) {
        res.status(400).json({ error: "Template name is required" });
        return;
      }

      // Get current profile settings
      const profileResult = await pool.query(
        `SELECT settings, theme, custom_css, background_image, background_video
         FROM profiles WHERE user_id = $1`,
        [req.userId]
      );

      if (profileResult.rows.length === 0) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }

      const profile = profileResult.rows[0];

      // Generate unique share code
      let shareCode = generateShareCode();
      let codeExists = true;
      while (codeExists) {
        const codeCheck = await pool.query(
          "SELECT id FROM templates WHERE share_code = $1",
          [shareCode]
        );
        if (codeCheck.rows.length === 0) {
          codeExists = false;
        } else {
          shareCode = generateShareCode();
        }
      }

      // Create template
      const templateSettings = {
        settings: profile.settings,
        theme: profile.theme,
        customCss: profile.custom_css,
        backgroundImage: profile.background_image,
        backgroundVideo: profile.background_video,
      };

      const result = await pool.query(
        `INSERT INTO templates (user_id, name, share_code, settings, screenshot_url, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.userId, name, shareCode, JSON.stringify(templateSettings), screenshotUrl, isPublic]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Create template error:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  }
);

// Apply template to profile
router.post(
  "/apply/:shareCode",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { shareCode } = req.params;

      // Get template
      const templateResult = await pool.query(
        "SELECT * FROM templates WHERE share_code = $1",
        [shareCode.toUpperCase()]
      );

      if (templateResult.rows.length === 0) {
        res.status(404).json({ error: "Template not found" });
        return;
      }

      const template = templateResult.rows[0];
      const templateSettings = template.settings;

      // Apply to profile
      await pool.query(
        `UPDATE profiles 
         SET settings = $1,
             theme = $2,
             custom_css = $3,
             background_image = $4,
             background_video = $5
         WHERE user_id = $6`,
        [
          JSON.stringify(templateSettings.settings),
          templateSettings.theme,
          templateSettings.customCss,
          templateSettings.backgroundImage,
          templateSettings.backgroundVideo,
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
      console.error("Apply template error:", error);
      res.status(500).json({ error: "Failed to apply template" });
    }
  }
);

// Delete template
router.delete(
  "/:templateId",
  authenticateToken,
  requireVerified,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { templateId } = req.params;

      const result = await pool.query(
        "DELETE FROM templates WHERE id = $1 AND user_id = $2 RETURNING id",
        [templateId, req.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "Template not found" });
        return;
      }

      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Delete template error:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  }
);

export default router;
