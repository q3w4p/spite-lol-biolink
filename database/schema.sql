-- spite.lol Database Schema
-- PostgreSQL (Aiven Cloud)
-- Sequential UIDs (1, 2, 3, etc.)
-- UID 1 = Owner (automatic owner panel access)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE - Sequential UID
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uid INTEGER UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(500),
    
    -- Discord OAuth
    discord_id VARCHAR(50) UNIQUE,
    discord_avatar VARCHAR(255),
    discord_username VARCHAR(100),
    use_discord_avatar BOOLEAN DEFAULT FALSE,
    discord_avatar_decoration BOOLEAN DEFAULT FALSE,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Role & Admin (UID 1 is always owner)
    role VARCHAR(20) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sequence for UIDs (starts at 1)
CREATE SEQUENCE IF NOT EXISTS user_uid_seq START 1;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id);

-- ============================================
-- VERIFICATION CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON verification_codes(user_id);

-- ============================================
-- SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Bio & Location
    bio TEXT,
    location VARCHAR(100),
    
    -- Custom media
    background_image VARCHAR(500),
    background_video VARCHAR(500),
    background_audio VARCHAR(500),
    custom_pfp VARCHAR(500),
    custom_cursor VARCHAR(500),
    use_discord_pfp BOOLEAN DEFAULT FALSE,
    use_discord_decoration BOOLEAN DEFAULT FALSE,
    
    -- Colors
    accent_color VARCHAR(7) DEFAULT '#059669',
    text_color VARCHAR(7) DEFAULT '#ffffff',
    background_color VARCHAR(7) DEFAULT '#000000',
    icon_color VARCHAR(7) DEFAULT '#ffffff',
    
    -- Effects
    background_effect VARCHAR(50) DEFAULT 'none',
    username_effect VARCHAR(50) DEFAULT 'none',
    profile_opacity INTEGER DEFAULT 100,
    profile_blur INTEGER DEFAULT 0,
    
    -- Toggles
    monochrome_icons BOOLEAN DEFAULT FALSE,
    animated_title BOOLEAN DEFAULT TRUE,
    swap_box_colors BOOLEAN DEFAULT FALSE,
    volume_control BOOLEAN DEFAULT TRUE,
    typewriter_effect BOOLEAN DEFAULT FALSE,
    typewriter_speed INTEGER DEFAULT 50,
    
    -- Gradient
    enable_gradient BOOLEAN DEFAULT FALSE,
    gradient_start VARCHAR(7) DEFAULT '#059669',
    gradient_end VARCHAR(7) DEFAULT '#10b981',
    
    -- Glow
    glow_username BOOLEAN DEFAULT FALSE,
    glow_socials BOOLEAN DEFAULT FALSE,
    glow_badges BOOLEAN DEFAULT FALSE,
    
    -- Discord presence
    discord_presence BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(100),
    meta_description VARCHAR(255),
    
    -- View count
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================
-- LINKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS links (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    title VARCHAR(100),
    icon VARCHAR(50),
    custom_icon VARCHAR(500),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#059669',
    is_purchasable BOOLEAN DEFAULT FALSE,
    is_earnable BOOLEAN DEFAULT FALSE,
    earn_action VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    is_monochrome BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ============================================
-- CUSTOM BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS custom_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    icon_url TEXT NOT NULL,
    is_monochrome BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_badges_user_id ON custom_badges(user_id);

-- ============================================
-- TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    share_code VARCHAR(6) UNIQUE NOT NULL,
    settings JSONB NOT NULL,
    screenshot VARCHAR(500),
    tags TEXT[],
    is_public BOOLEAN DEFAULT TRUE,
    uses_count INTEGER DEFAULT 0,
    stars_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_share_code ON templates(share_code);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

-- ============================================
-- TEMPLATE FAVORITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS template_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON template_favorites(user_id);

-- ============================================
-- ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visitor_ip VARCHAR(45),
    visitor_country VARCHAR(2),
    visitor_device VARCHAR(20),
    visitor_browser VARCHAR(50),
    referrer VARCHAR(500),
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visited_at ON analytics(visited_at);

-- ============================================
-- BANNED USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS banned_users (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    banned_by INTEGER REFERENCES users(id),
    banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON banned_users(user_id);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_target_user_id ON audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- IMAGE HOST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    size INTEGER,
    mime_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);

-- ============================================
-- GUESTBOOK TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS guestbook (
    id SERIAL PRIMARY KEY,
    profile_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    author_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100),
    message TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guestbook_profile_user_id ON guestbook(profile_user_id);

-- ============================================
-- INSERT DEFAULT BADGES
-- ============================================
INSERT INTO badges (name, description, icon, color, is_purchasable, is_earnable, earn_action) VALUES
    ('Staff', 'Be a part of the spite.lol staff team.', 'Wrench', '#3b82f6', false, false, NULL),
    ('Helper', 'Be active and help users in the community.', 'HelpCircle', '#eab308', false, true, 'join_discord'),
    ('Premium', 'Purchase the premium package.', 'Crown', '#a855f7', true, false, NULL),
    ('Verified', 'Purchase or be a known content creator.', 'BadgeCheck', '#3b82f6', true, true, NULL),
    ('Donor', 'Donate at least $10 to spite.lol.', 'Heart', '#ef4444', false, true, 'donate'),
    ('Gifter', 'Gift a spite.lol product to another user.', 'Gift', '#f97316', false, true, 'gift'),
    ('OG', 'Be an early supporter of spite.lol.', 'Star', '#eab308', false, true, NULL),
    ('Bug Hunter', 'Report a bug to the spite.lol team.', 'Bug', '#22c55e', false, true, 'report_bug'),
    ('Server Booster', 'Boost the spite.lol discord server.', 'Zap', '#f472b6', false, true, 'boost_server'),
    ('Image Host', 'Purchase the Image Host.', 'Image', '#f97316', true, false, NULL),
    ('Domain Legend', 'Add a public custom domain to spite.lol Image Host.', 'Globe', '#ef4444', false, true, 'add_domain'),
    ('Winner', 'Win a spite.lol event.', 'Trophy', '#eab308', false, true, NULL),
    ('Second Place', 'Get second place in a spite.lol event.', 'Medal', '#9ca3af', false, true, NULL),
    ('Third Place', 'Get third place in a spite.lol event.', 'Award', '#cd7f32', false, true, NULL),
    ('The Million', 'Celebration badge for 1M users.', 'Users', '#a855f7', false, true, NULL)
ON CONFLICT (name) DO NOTHING;
