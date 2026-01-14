-- spite.lol Database Schema
-- PostgreSQL (Aiven Cloud)
-- Last updated: 2026-01-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    uid VARCHAR(8) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(500),
    
    -- Discord OAuth
    discord_id VARCHAR(50) UNIQUE,
    discord_avatar VARCHAR(255),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Role & Admin
    role VARCHAR(20) DEFAULT 'user',
    is_admin BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    
    -- Custom media
    background_image VARCHAR(500),
    background_video VARCHAR(500),
    background_audio VARCHAR(500),
    custom_pfp VARCHAR(500),
    use_discord_pfp BOOLEAN DEFAULT FALSE,
    use_discord_decoration BOOLEAN DEFAULT FALSE,
    
    -- Settings (JSON)
    settings JSONB DEFAULT '{"monochromeIcons": false, "iconPreset": "minimalist", "typewriterEffect": false, "typewriterSpeed": 50, "cursorEffect": "none", "cursorColor": "#059669", "cursorDensity": 50}'::jsonb,
    
    -- Theme
    theme VARCHAR(50) DEFAULT 'default',
    accent_color VARCHAR(7) DEFAULT '#059669',
    
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
    title VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50),
    platform VARCHAR(50),
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
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    monochrome BOOLEAN DEFAULT FALSE,
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

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
    is_public BOOLEAN DEFAULT TRUE,
    uses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_templates_share_code ON templates(share_code);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);

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
    action VARCHAR(50) NOT NULL,
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
-- OWNER PANEL ACCESS
-- ============================================
CREATE TABLE IF NOT EXISTS owner_access (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DEFAULT BADGES (if not exists)
-- ============================================
INSERT INTO badges (name, type, icon, color, description) 
SELECT 'Verified', 'verified', 'check-circle', '#3B82F6', 'Verified account'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE type = 'verified');

INSERT INTO badges (name, type, icon, color, description) 
SELECT 'Staff', 'staff', 'tool', '#3B82F6', 'spite.lol staff member'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE type = 'staff');

INSERT INTO badges (name, type, icon, color, description) 
SELECT 'Admin', 'admin', 'shield', '#EF4444', 'Site administrator'
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE type = 'admin');
