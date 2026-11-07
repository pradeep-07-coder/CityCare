-- database/seeds/001_seed.sql
BEGIN;

-- Insert default Admin User (Password: Admin@1234)
-- Bcrypt hash generated with 10 salt rounds
INSERT INTO users (email, password_hash, role, is_active)
VALUES (
    'admin@citycare.com',
    '$2b$10$wK1VqJ.Gz9S/OqXmE3Lg8eA8H.E/8Sg8wV1q3gX5Y6Z7A8B9C0D1E',
    'ADMIN',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert initial Departments
INSERT INTO departments (name, description, location) VALUES
('Cardiology', 'Heart and vascular medical care', 'Block B, Floor 2'),
('Pediatrics', 'Child and adolescent healthcare', 'Block A, Floor 1'),
('Orthopedics', 'Bone and joint surgery and treatment', 'Block C, Floor 3')
ON CONFLICT (name) DO NOTHING;

COMMIT;