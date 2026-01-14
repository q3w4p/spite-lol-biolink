import express, { Response } from "express";
import pool from "../config/database";
import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "../middleware/auth";

const router = express.Router();

// Owner secret key (should be in env in production)
const OWNER_SECRET = process.env.OWNER_SECRET || "spite_owner_secret_2024";

// Middleware to check if user is owner
const requireOwner = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const result = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0 || result.rows[0].role !== 'owner') {
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
      "INSERT INTO audit_logs (admin_id, action, target_user_id, details, ip_address) VALUES ($1, $2, $3, $4, $5)",
      [adminId, action, targetUserId, JSON.stringify(details), ipAddress]
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
          [uid.toUpperCase()]
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
        [uid.toUpperCase()]
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
        (SELECT SUM(view_count) FROM profiles) as total_views,
        (SELECT SUM(click_count) FROM links) as total_clicks,
        (SELECT COUNT(*) FROM banned_users) as banned_users
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// Get all users
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
        u.created_at,
        p.view_count,
        (SELECT COUNT(*) FROM links l WHERE l.profile_id = p.id) as link_count,
        CASE WHEN bu.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN banned_users bu ON u.id = bu.user_id
    `;

    const params: any[] = [];
    if (search) {
      query += ` WHERE u.username ILIKE $1 OR u.email ILIKE $1 OR u.uid ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
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

// Get user details
router.get(
  "/users/:userId",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      const userResult = await pool.query(
        `SELECT 
        u.*,
        p.*,
        CASE WHEN bu.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_banned,
        bu.reason as ban_reason
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN banned_users bu ON u.id = bu.user_id
      WHERE u.id = $1`,
        [userId],
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const linksResult = await pool.query(
        "SELECT * FROM links WHERE profile_id = (SELECT id FROM profiles WHERE user_id = $1)",
        [userId],
      );

      const badgesResult = await pool.query(
        `SELECT b.*, ub.monochrome, ub.assigned_at 
         FROM badges b 
         JOIN user_badges ub ON b.id = ub.badge_id 
         WHERE ub.user_id = $1`,
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
  },
);

// Ban user
router.post(
  "/ban",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, reason } = req.body;

      if (!uid) {
        res.status(400).json({ error: "UID required" });
        return;
      }

      // Get target user
      const userResult = await pool.query(
        "SELECT id, username, role FROM users WHERE uid = $1",
        [uid.toUpperCase()]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const targetUser = userResult.rows[0];

      // Can't ban admins or owners
      if (targetUser.role === 'admin' || targetUser.role === 'owner') {
        res.status(403).json({ error: "Cannot ban admin or owner" });
        return;
      }

      // Add to banned users
      await pool.query(
        "INSERT INTO banned_users (user_id, reason, banned_by) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET reason = $2, banned_by = $3, banned_at = NOW()",
        [targetUser.id, reason, req.userId]
      );

      // Delete sessions
      await pool.query("DELETE FROM sessions WHERE user_id = $1", [targetUser.id]);

      await logAction(req.userId!, 'BAN_USER', targetUser.id, { uid, reason }, req.ip || '');

      res.json({ message: `User ${targetUser.username} banned` });
    } catch (error) {
      console.error("Ban user error:", error);
      res.status(500).json({ error: "Failed to ban user" });
    }
  }
);

// Unban user
router.post(
  "/unban",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid } = req.body;

      if (!uid) {
        res.status(400).json({ error: "UID required" });
        return;
      }

      const userResult = await pool.query(
        "SELECT id, username FROM users WHERE uid = $1",
        [uid.toUpperCase()]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const targetUser = userResult.rows[0];

      await pool.query("DELETE FROM banned_users WHERE user_id = $1", [targetUser.id]);

      await logAction(req.userId!, 'UNBAN_USER', targetUser.id, { uid }, req.ip || '');

      res.json({ message: `User ${targetUser.username} unbanned` });
    } catch (error) {
      console.error("Unban user error:", error);
      res.status(500).json({ error: "Failed to unban user" });
    }
  }
);

// Strip effects/background from profile
router.post(
  "/strip-effects",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, stripBackground, stripEffects, stripAudio } = req.body;

      if (!uid) {
        res.status(400).json({ error: "UID required" });
        return;
      }

      const userResult = await pool.query(
        "SELECT u.id, u.username FROM users u WHERE u.uid = $1",
        [uid.toUpperCase()]
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
        updates.push("settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{cursorEffect}', '\"none\"')");
        strippedItems.push('cursor effects');
      }
      if (stripAudio) {
        updates.push("background_audio = NULL, song_title = NULL");
        strippedItems.push('audio');
      }

      if (updates.length > 0) {
        await pool.query(
          `UPDATE profiles SET ${updates.join(', ')} WHERE user_id = $1`,
          [targetUser.id]
        );
      }

      await logAction(req.userId!, 'STRIP_EFFECTS', targetUser.id, { uid, strippedItems }, req.ip || '');

      res.json({ message: `Stripped ${strippedItems.join(', ')} from ${targetUser.username}` });
    } catch (error) {
      console.error("Strip effects error:", error);
      res.status(500).json({ error: "Failed to strip effects" });
    }
  }
);

// Assign badge to user
router.post(
  "/assign-badge",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, badgeType, badgeName, badgeIcon, badgeColor } = req.body;

      if (!uid || !badgeType) {
        res.status(400).json({ error: "UID and badge type required" });
        return;
      }

      const userResult = await pool.query(
        "SELECT id, username FROM users WHERE uid = $1",
        [uid.toUpperCase()]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const targetUser = userResult.rows[0];

      // Get or create badge
      let badgeId;
      const existingBadge = await pool.query(
        "SELECT id FROM badges WHERE type = $1",
        [badgeType]
      );

      if (existingBadge.rows.length > 0) {
        badgeId = existingBadge.rows[0].id;
      } else {
        const newBadge = await pool.query(
          "INSERT INTO badges (name, type, icon, color) VALUES ($1, $2, $3, $4) RETURNING id",
          [badgeName || badgeType, badgeType, badgeIcon || 'award', badgeColor || '#00FF00']
        );
        badgeId = newBadge.rows[0].id;
      }

      // Assign badge to user
      await pool.query(
        "INSERT INTO user_badges (user_id, badge_id, assigned_by) VALUES ($1, $2, $3) ON CONFLICT (user_id, badge_id) DO NOTHING",
        [targetUser.id, badgeId, req.userId]
      );

      await logAction(req.userId!, 'ASSIGN_BADGE', targetUser.id, { uid, badgeType }, req.ip || '');

      res.json({ message: `Badge assigned to ${targetUser.username}` });
    } catch (error) {
      console.error("Assign badge error:", error);
      res.status(500).json({ error: "Failed to assign badge" });
    }
  }
);

// Remove badge from user
router.post(
  "/remove-badge",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { uid, badgeType } = req.body;

      if (!uid || !badgeType) {
        res.status(400).json({ error: "UID and badge type required" });
        return;
      }

      const userResult = await pool.query(
        "SELECT id, username FROM users WHERE uid = $1",
        [uid.toUpperCase()]
      );

      if (userResult.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const targetUser = userResult.rows[0];

      await pool.query(
        "DELETE FROM user_badges WHERE user_id = $1 AND badge_id = (SELECT id FROM badges WHERE type = $2)",
        [targetUser.id, badgeType]
      );

      await logAction(req.userId!, 'REMOVE_BADGE', targetUser.id, { uid, badgeType }, req.ip || '');

      res.json({ message: `Badge removed from ${targetUser.username}` });
    } catch (error) {
      console.error("Remove badge error:", error);
      res.status(500).json({ error: "Failed to remove badge" });
    }
  }
);

// Get audit logs
router.get(
  "/audit-logs",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const result = await pool.query(
        `SELECT al.*, 
                admin.username as admin_username,
                target.username as target_username
         FROM audit_logs al
         LEFT JOIN users admin ON al.admin_id = admin.id
         LEFT JOIN users target ON al.target_user_id = target.id
         ORDER BY al.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Failed to get audit logs" });
    }
  }
);

// Delete user
router.delete(
  "/users/:userId",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Prevent deleting yourself
      if (Number(userId) === req.userId) {
        res.status(400).json({ error: "Cannot delete your own account" });
        return;
      }

      // Check if target is admin/owner
      const targetCheck = await pool.query(
        "SELECT role FROM users WHERE id = $1",
        [userId]
      );

      if (targetCheck.rows.length > 0 && (targetCheck.rows[0].role === 'admin' || targetCheck.rows[0].role === 'owner')) {
        res.status(403).json({ error: "Cannot delete admin or owner" });
        return;
      }

      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id, username",
        [userId],
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await logAction(req.userId!, 'DELETE_USER', Number(userId), { username: result.rows[0].username }, req.ip || '');

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
);

// Update user status
router.put(
  "/users/:userId/status",
  async (req: AuthRequest, res: Response): Promise<void> => {
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
           is_admin = COALESCE($2, is_admin)
       WHERE id = $3
       RETURNING id, username, email, is_verified, is_admin`,
        [isVerified, isAdmin, userId],
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
  },
);

// Get recent activity
router.get(
  "/activity",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const recentUsers = await pool.query(
        "SELECT id, username, email, uid, created_at FROM users ORDER BY created_at DESC LIMIT 10",
      );

      const recentLinks = await pool.query(
        `SELECT 
        l.id,
        l.title,
        l.url,
        l.created_at,
        u.username
      FROM links l
      JOIN profiles p ON l.profile_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10`,
      );

      res.json({
        recentUsers: recentUsers.rows,
        recentLinks: recentLinks.rows,
      });
    } catch (error) {
      console.error("Get activity error:", error);
      res.status(500).json({ error: "Failed to get activity" });
    }
  },
);

export default router;
