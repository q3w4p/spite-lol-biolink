import express, { Response } from "express";
import pool from "../config/database";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth";
import { Resend } from "resend";

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// Owner secret key (should be in env in production)
const OWNER_SECRET = process.env.OWNER_SECRET || "spite_owner_secret_2024";

// Middleware to check if user is owner
const requireOwner = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const result = await pool.query(
      "SELECT role, uid FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: "Owner access required" });
      return;
    }

    // UID 1 is always owner
    if (result.rows[0].uid !== 1 && result.rows[0].role !== 'owner') {
      res.status(403).json({ error: "Owner access required" });
      return;
    }

    next();
  } catch (error) {
    console.error("Owner check error:", error);
    res.status(500).json({ error: "Authorization failed" });
  }
};

// Log admin action
const logAction = async (adminId: number, action: string, targetUserId: number | null, details: any, ipAddress: string) => {
  try {
    await pool.query(
      "INSERT INTO audit_log (admin_id, action, target_user_id, details) VALUES ($1, $2, $3, $4)",
      [adminId, action, targetUserId, JSON.stringify(details)]
    );
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

// Owner panel access (secret endpoint)
router.post(
  "/owner/verify",
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { secret } = req.body;

      if (secret !== OWNER_SECRET) {
        res.status(403).json({ error: "Invalid secret" });
        return;
      }

      // Grant owner role
      await pool.query(
        "UPDATE users SET role = 'owner', is_admin = TRUE WHERE id = $1",
        [req.userId]
      );

      await logAction(req.userId!, 'OWNER_ACCESS', null, { method: 'secret_key' }, req.ip || '');

      res.json({ message: "Owner access granted", role: 'owner' });
    } catch (error) {
      console.error("Owner verify error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  }
);

// Grant admin by UID or Discord ID (owner only)
router.post(
  "/owner/grant-admin",
  authenticateToken,
  requireOwner,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, discordId } = req.body;

      if (!uid && !discordId) {
        res.status(400).json({ error: "UID or Discord ID required" });
        return;
      }

      let targetUser;
      if (uid) {
        const result = await pool.query(
          "SELECT id, username FROM users WHERE uid = $1",
          [parseInt(uid)]
        );
        targetUser = result.rows[0];
      } else if (discordId) {
        const result = await pool.query(
          "SELECT id, username FROM users WHERE discord_id = $1",
          [discordId]
        );
        targetUser = result.rows[0];
      }

      if (!targetUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await pool.query(
        "UPDATE users SET role = 'admin', is_admin = TRUE WHERE id = $1",
        [targetUser.id]
      );

      await logAction(req.userId!, 'GRANT_ADMIN', targetUser.id, { uid, discordId }, req.ip || '');

      res.json({ message: `Admin granted to ${targetUser.username}` });
    } catch (error) {
      console.error("Grant admin error:", error);
      res.status(500).json({ error: "Failed to grant admin" });
    }
  }
);

// Revoke admin (owner only)
router.post(
  "/owner/revoke-admin",
  authenticateToken,
  requireOwner,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.body;

      if (!uid) {
        res.status(400).json({ error: "UID required" });
        return;
      }

      const result = await pool.query(
        "UPDATE users SET role = 'user', is_admin = FALSE WHERE uid = $1 AND role != 'owner' RETURNING id, username",
        [parseInt(uid)]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found or is owner" });
        return;
      }

      await logAction(req.userId!, 'REVOKE_ADMIN', result.rows[0].id, { uid }, req.ip || '');

      res.json({ message: `Admin revoked from ${result.rows[0].username}` });
    } catch (error) {
      console.error("Revoke admin error:", error);
      res.status(500).json({ error: "Failed to revoke admin" });
    }
  }
);

// All admin routes below require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Get platform statistics
router.get("/stats", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE is_verified = TRUE) as verified_users,
        (SELECT COUNT(*) FROM profiles) as total_profiles,
        (SELECT COUNT(*) FROM links) as total_links,
        (SELECT COALESCE(SUM(view_count), 0) FROM profiles) as total_views,
        (SELECT COALESCE(SUM(clicks), 0) FROM links) as total_clicks,
        (SELECT COUNT(*) FROM banned_users) as banned_users,
        (SELECT COUNT(*) FROM badges) as total_badges,
        (SELECT COUNT(*) FROM user_badges) as assigned_badges,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours') as new_users_today,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Get all users with search
router.get("/users", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.uid,
        u.role,
        u.is_verified,
        u.is_admin,
        u.discord_id,
        u.discord_username,
        u.created_at,
        p.view_count,
        (SELECT COUNT(*) FROM links l WHERE l.user_id = u.id) as link_count,
        (SELECT COUNT(*) FROM user_badges ub WHERE ub.user_id = u.id) as badge_count,
        CASE WHEN bu.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned,
        bu.reason as ban_reason
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN banned_users bu ON u.id = bu.user_id
    `;

    const params: any[] = [];
    if (search) {
      query += ` WHERE u.username ILIKE $1 OR u.email ILIKE $1 OR CAST(u.uid AS TEXT) ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    let countQuery = "SELECT COUNT(*) FROM users";
    let countParams: any[] = [];
    if (search) {
      countQuery += ` WHERE username ILIKE $1 OR email ILIKE $1 OR CAST(uid AS TEXT) ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const countResult = await pool.query(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalUsers,
        pages: Math.ceil(totalUsers / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Get user by ID
router.get("/users/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const userResult = await pool.query(
      `SELECT 
        u.*,
        p.*,
        CASE WHEN bu.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned,
        bu.reason as ban_reason,
        bu.banned_at
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN banned_users bu ON u.id = bu.user_id
      WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const linksResult = await pool.query(
      "SELECT * FROM links WHERE user_id = $1 ORDER BY position",
      [userId]
    );

    const badgesResult = await pool.query(
      `SELECT b.*, ub.is_monochrome, ub.assigned_at, 
              admin.username as assigned_by_username
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       LEFT JOIN users admin ON ub.assigned_by = admin.id
       WHERE ub.user_id = $1
       ORDER BY ub.display_order`,
      [userId]
    );

    res.json({
      user: userResult.rows[0],
      links: linksResult.rows,
      badges: badgesResult.rows,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get user by UID
router.get("/users/uid/:uid", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;

    const userResult = await pool.query(
      `SELECT 
        u.*,
        p.*,
        CASE WHEN bu.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned,
        bu.reason as ban_reason
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN banned_users bu ON u.id = bu.user_id
      WHERE u.uid = $1`,
      [parseInt(uid)]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const badgesResult = await pool.query(
      `SELECT b.*, ub.is_monochrome, ub.assigned_at
       FROM badges b 
       JOIN user_badges ub ON b.id = ub.badge_id 
       WHERE ub.user_id = $1`,
      [userResult.rows[0].id]
    );

    res.json({
      user: userResult.rows[0],
      badges: badgesResult.rows,
    });
  } catch (error) {
    console.error("Get user by UID error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Ban user
router.post("/ban", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    // Get target user
    const userResult = await pool.query(
      "SELECT id, username, role, uid FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = userResult.rows[0];

    // Can't ban admins, owners, or UID 1
    if (targetUser.role === 'admin' || targetUser.role === 'owner' || targetUser.uid === 1) {
      res.status(403).json({ error: "Cannot ban admin or owner" });
      return;
    }

    // Add to banned users
    await pool.query(
      "INSERT INTO banned_users (user_id, reason, banned_by) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET reason = $2, banned_by = $3, banned_at = NOW()",
      [targetUser.id, reason || 'No reason provided', req.userId]
    );

    // Delete sessions
    await pool.query("DELETE FROM sessions WHERE user_id = $1", [targetUser.id]);

    await logAction(req.userId!, 'BAN_USER', targetUser.id, { reason }, req.ip || '');

    res.json({ message: `User ${targetUser.username} (UID: ${targetUser.uid}) has been banned` });
  } catch (error) {
    console.error("Ban user error:", error);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

// Unban user
router.post("/unban", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    const userResult = await pool.query(
      "SELECT id, username, uid FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = userResult.rows[0];

    await pool.query("DELETE FROM banned_users WHERE user_id = $1", [targetUser.id]);

    await logAction(req.userId!, 'UNBAN_USER', targetUser.id, {}, req.ip || '');

    res.json({ message: `User ${targetUser.username} (UID: ${targetUser.uid}) has been unbanned` });
  } catch (error) {
    console.error("Unban user error:", error);
    res.status(500).json({ error: "Failed to unban user" });
  }
});

// Get all badges
router.get("/badges", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT b.*, 
              (SELECT COUNT(*) FROM user_badges ub WHERE ub.badge_id = b.id) as assigned_count
       FROM badges b 
       ORDER BY b.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ error: "Failed to get badges" });
  }
});

// Create new badge
router.post("/badges", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, icon, color } = req.body;

    if (!name || !icon) {
      res.status(400).json({ error: "Name and icon are required" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO badges (name, description, icon, color) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, description || '', icon, color || '#059669']
    );

    await logAction(req.userId!, 'CREATE_BADGE', null, { name, icon, color }, req.ip || '');

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: "Badge with this name already exists" });
      return;
    }
    console.error("Create badge error:", error);
    res.status(500).json({ error: "Failed to create badge" });
  }
});

// Update badge
router.put("/badges/:badgeId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { badgeId } = req.params;
    const { name, description, icon, color } = req.body;

    const result = await pool.query(
      `UPDATE badges 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           icon = COALESCE($3, icon),
           color = COALESCE($4, color)
       WHERE id = $5
       RETURNING *`,
      [name, description, icon, color, badgeId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Badge not found" });
      return;
    }

    await logAction(req.userId!, 'UPDATE_BADGE', null, { badgeId, name }, req.ip || '');

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update badge error:", error);
    res.status(500).json({ error: "Failed to update badge" });
  }
});

// Delete badge
router.delete("/badges/:badgeId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { badgeId } = req.params;

    // First remove all user assignments
    await pool.query("DELETE FROM user_badges WHERE badge_id = $1", [badgeId]);

    const result = await pool.query(
      "DELETE FROM badges WHERE id = $1 RETURNING name",
      [badgeId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Badge not found" });
      return;
    }

    await logAction(req.userId!, 'DELETE_BADGE', null, { badgeId, name: result.rows[0].name }, req.ip || '');

    res.json({ message: `Badge "${result.rows[0].name}" deleted` });
  } catch (error) {
    console.error("Delete badge error:", error);
    res.status(500).json({ error: "Failed to delete badge" });
  }
});

// Assign badge to user
router.post("/users/:userId/badges", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { badgeId } = req.body;

    if (!badgeId) {
      res.status(400).json({ error: "Badge ID required" });
      return;
    }

    // Check user exists
    const userResult = await pool.query(
      "SELECT id, username, uid FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check badge exists
    const badgeResult = await pool.query(
      "SELECT id, name FROM badges WHERE id = $1",
      [badgeId]
    );

    if (badgeResult.rows.length === 0) {
      res.status(404).json({ error: "Badge not found" });
      return;
    }

    // Get max display order
    const orderResult = await pool.query(
      "SELECT COALESCE(MAX(display_order), -1) as max_order FROM user_badges WHERE user_id = $1",
      [userId]
    );

    const displayOrder = orderResult.rows[0].max_order + 1;

    // Assign badge
    await pool.query(
      `INSERT INTO user_badges (user_id, badge_id, assigned_by, display_order) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, badge_id) DO NOTHING`,
      [userId, badgeId, req.userId, displayOrder]
    );

    await logAction(req.userId!, 'ASSIGN_BADGE', parseInt(userId), { 
      badgeId, 
      badgeName: badgeResult.rows[0].name 
    }, req.ip || '');

    res.json({ 
      message: `Badge "${badgeResult.rows[0].name}" assigned to ${userResult.rows[0].username} (UID: ${userResult.rows[0].uid})` 
    });
  } catch (error) {
    console.error("Assign badge error:", error);
    res.status(500).json({ error: "Failed to assign badge" });
  }
});

// Remove badge from user
router.delete("/users/:userId/badges/:badgeId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, badgeId } = req.params;

    const userResult = await pool.query(
      "SELECT username, uid FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const badgeResult = await pool.query(
      "SELECT name FROM badges WHERE id = $1",
      [badgeId]
    );

    await pool.query(
      "DELETE FROM user_badges WHERE user_id = $1 AND badge_id = $2",
      [userId, badgeId]
    );

    await logAction(req.userId!, 'REMOVE_BADGE', parseInt(userId), { 
      badgeId,
      badgeName: badgeResult.rows[0]?.name 
    }, req.ip || '');

    res.json({ 
      message: `Badge removed from ${userResult.rows[0].username} (UID: ${userResult.rows[0].uid})` 
    });
  } catch (error) {
    console.error("Remove badge error:", error);
    res.status(500).json({ error: "Failed to remove badge" });
  }
});

// Send email to user
router.post("/send-email", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, subject, message, fromName } = req.body;

    if (!userId || !subject || !message) {
      res.status(400).json({ error: "User ID, subject, and message are required" });
      return;
    }

    // Get user email
    const userResult = await pool.query(
      "SELECT email, username, uid FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult.rows[0];

    // Send email via Resend
    await resend.emails.send({
      from: `${fromName || 'spite.lol Support'} <help@spite.lol>`,
      to: user.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #059669; font-size: 28px; margin: 0;">spite.lol</h1>
            </div>
            <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
              <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi ${user.username},
              </p>
              <div style="color: #e5e5e5; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">
                ${message}
              </div>
            </div>
            <div style="text-align: center; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent from spite.lol support.
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
                If you didn't expect this email, please ignore it.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    await logAction(req.userId!, 'SEND_EMAIL', parseInt(userId), { subject }, req.ip || '');

    res.json({ message: `Email sent to ${user.username} (${user.email})` });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Send bulk email (to all users or filtered)
router.post("/send-bulk-email", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, message, filter, fromName } = req.body;

    if (!subject || !message) {
      res.status(400).json({ error: "Subject and message are required" });
      return;
    }

    // Build query based on filter
    let query = "SELECT email, username FROM users WHERE is_verified = TRUE";
    if (filter === 'verified') {
      // Already filtered
    } else if (filter === 'admins') {
      query += " AND is_admin = TRUE";
    }

    const usersResult = await pool.query(query);

    // Send emails (in batches to avoid rate limits)
    let sentCount = 0;
    for (const user of usersResult.rows) {
      try {
        await resend.emails.send({
          from: `${fromName || 'spite.lol'} <help@spite.lol>`,
          to: user.email,
          subject: subject,
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0a0a0a; font-family: 'Inter', sans-serif;">
              <h1 style="color: #059669; text-align: center;">spite.lol</h1>
              <div style="background: rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; margin-top: 24px;">
                <p style="color: #e5e5e5;">Hi ${user.username},</p>
                <div style="color: #e5e5e5; white-space: pre-wrap;">${message}</div>
              </div>
            </div>
          `,
        });
        sentCount++;
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    await logAction(req.userId!, 'SEND_BULK_EMAIL', null, { subject, filter, sentCount }, req.ip || '');

    res.json({ message: `Sent ${sentCount} emails` });
  } catch (error) {
    console.error("Send bulk email error:", error);
    res.status(500).json({ error: "Failed to send bulk email" });
  }
});

// Strip effects/background from profile
router.post("/strip-effects", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, stripBackground, stripEffects, stripAudio } = req.body;

    if (!userId) {
      res.status(400).json({ error: "User ID required" });
      return;
    }

    const userResult = await pool.query(
      "SELECT u.id, u.username, u.uid FROM users u WHERE u.id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const targetUser = userResult.rows[0];
    const updates: string[] = [];
    const strippedItems: string[] = [];

    if (stripBackground) {
      updates.push("background_image = NULL, background_video = NULL");
      strippedItems.push('background');
    }
    if (stripEffects) {
      updates.push("background_effect = 'none', username_effect = 'none', custom_cursor = NULL");
      strippedItems.push('effects');
    }
    if (stripAudio) {
      updates.push("background_audio = NULL");
      strippedItems.push('audio');
    }

    if (updates.length > 0) {
      await pool.query(
        `UPDATE profiles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
        [targetUser.id]
      );
    }

    await logAction(req.userId!, 'STRIP_EFFECTS', targetUser.id, { strippedItems }, req.ip || '');

    res.json({ message: `Stripped ${strippedItems.join(', ')} from ${targetUser.username} (UID: ${targetUser.uid})` });
  } catch (error) {
    console.error("Strip effects error:", error);
    res.status(500).json({ error: "Failed to strip effects" });
  }
});

// Get audit logs
router.get("/audit-logs", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const result = await pool.query(
      `SELECT al.*, 
              admin.username as admin_username,
              target.username as target_username,
              target.uid as target_uid
       FROM audit_log al
       LEFT JOIN users admin ON al.admin_id = admin.id
       LEFT JOIN users target ON al.target_user_id = target.id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query("SELECT COUNT(*) FROM audit_log");

    res.json({
      logs: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ error: "Failed to get audit logs" });
  }
});

// Delete user
router.delete("/users/:userId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (Number(userId) === req.userId) {
      res.status(400).json({ error: "Cannot delete your own account" });
      return;
    }

    // Check if target is admin/owner or UID 1
    const targetCheck = await pool.query(
      "SELECT role, uid, username FROM users WHERE id = $1",
      [userId]
    );

    if (targetCheck.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const target = targetCheck.rows[0];
    if (target.role === 'admin' || target.role === 'owner' || target.uid === 1) {
      res.status(403).json({ error: "Cannot delete admin or owner" });
      return;
    }

    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    await logAction(req.userId!, 'DELETE_USER', Number(userId), { username: target.username, uid: target.uid }, req.ip || '');

    res.json({ message: `User ${target.username} (UID: ${target.uid}) deleted` });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Update user status
router.put("/users/:userId/status", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isVerified, isAdmin } = req.body;

    // Prevent removing admin from yourself
    if (Number(userId) === req.userId && isAdmin === false) {
      res.status(400).json({ error: "Cannot remove admin from yourself" });
      return;
    }

    const result = await pool.query(
      `UPDATE users 
       SET is_verified = COALESCE($1, is_verified),
           is_admin = COALESCE($2, is_admin),
           role = CASE WHEN $2 = TRUE THEN 'admin' WHEN $2 = FALSE THEN 'user' ELSE role END
       WHERE id = $3
       RETURNING id, username, email, uid, is_verified, is_admin, role`,
      [isVerified, isAdmin, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await logAction(req.userId!, 'UPDATE_USER_STATUS', Number(userId), { isVerified, isAdmin }, req.ip || '');

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Get recent activity
router.get("/activity", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recentUsers = await pool.query(
      "SELECT id, username, email, uid, created_at FROM users ORDER BY created_at DESC LIMIT 10"
    );

    const recentLinks = await pool.query(
      `SELECT 
        l.id,
        l.title,
        l.url,
        l.created_at,
        u.username,
        u.uid
      FROM links l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10`
    );

    const recentBadges = await pool.query(
      `SELECT 
        ub.assigned_at,
        b.name as badge_name,
        b.icon as badge_icon,
        u.username,
        u.uid,
        admin.username as assigned_by
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      JOIN users u ON ub.user_id = u.id
      LEFT JOIN users admin ON ub.assigned_by = admin.id
      ORDER BY ub.assigned_at DESC
      LIMIT 10`
    );

    const recentBans = await pool.query(
      `SELECT 
        bu.banned_at,
        bu.reason,
        u.username,
        u.uid,
        admin.username as banned_by
      FROM banned_users bu
      JOIN users u ON bu.user_id = u.id
      LEFT JOIN users admin ON bu.banned_by = admin.id
      ORDER BY bu.banned_at DESC
      LIMIT 10`
    );

    res.json({
      recentUsers: recentUsers.rows,
      recentLinks: recentLinks.rows,
      recentBadges: recentBadges.rows,
      recentBans: recentBans.rows,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    res.status(500).json({ error: "Failed to get activity" });
  }
});

// Get banned users list
router.get("/banned", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT 
        bu.*,
        u.username,
        u.email,
        u.uid,
        admin.username as banned_by_username
      FROM banned_users bu
      JOIN users u ON bu.user_id = u.id
      LEFT JOIN users admin ON bu.banned_by = admin.id
      ORDER BY bu.banned_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get banned users error:", error);
    res.status(500).json({ error: "Failed to get banned users" });
  }
});

export default router;
