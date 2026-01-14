-- Add UID column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS uid VARCHAR(8) UNIQUE;

-- Add admin role column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Add discord_id for admin assignment
ALTER TABLE users ADD COLUMN IF NOT EXISTS discord_id VARCHAR(50);

-- Create function to generate 8-character alphanumeric UID
CREATE OR REPLACE FUNCTION generate_uid() RETURNS VARCHAR(8) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(8) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with UIDs
UPDATE users SET uid = generate_uid() WHERE uid IS NULL;

-- Create trigger to auto-generate UID on insert
CREATE OR REPLACE FUNCTION set_user_uid() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.uid IS NULL THEN
    NEW.uid := generate_uid();
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM users WHERE uid = NEW.uid) LOOP
      NEW.uid := generate_uid();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_user_uid ON users;
CREATE TRIGGER trigger_set_user_uid
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_uid();

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'custom',
  icon VARCHAR(50),
  color VARCHAR(20) DEFAULT '#00FF00',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
  monochrome BOOLEAN DEFAULT FALSE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

-- Insert default badges
INSERT INTO badges (name, type, icon, color) VALUES
  ('Verified', 'verified', 'check-circle', '#3B82F6'),
  ('Staff', 'staff', 'wrench', '#3B82F6'),
  ('Admin', 'admin', 'shield', '#EF4444')
ON CONFLICT DO NOTHING;

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  share_code VARCHAR(6) UNIQUE,
  settings JSONB NOT NULL DEFAULT '{}',
  screenshot_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to generate 6-character template share code
CREATE OR REPLACE FUNCTION generate_template_code() RETURNS VARCHAR(6) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(6) := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate template share code
CREATE OR REPLACE FUNCTION set_template_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := generate_template_code();
    WHILE EXISTS (SELECT 1 FROM templates WHERE share_code = NEW.share_code) LOOP
      NEW.share_code := generate_template_code();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_template_code ON templates;
CREATE TRIGGER trigger_set_template_code
  BEFORE INSERT ON templates
  FOR EACH ROW
  EXECUTE FUNCTION set_template_code();

-- Create audit_logs table for admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  target_user_id INTEGER REFERENCES users(id),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  reason TEXT,
  banned_by INTEGER REFERENCES users(id),
  banned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add profile settings columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_image TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_video TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS background_audio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS song_title VARCHAR(100);

-- Create platform_links table for social platforms
CREATE TABLE IF NOT EXISTS platform_links (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  custom_name VARCHAR(100),
  custom_icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_uid ON users(uid);
CREATE INDEX IF NOT EXISTS idx_templates_share_code ON templates(share_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_user_id);
