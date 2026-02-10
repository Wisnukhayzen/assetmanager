-- 1. Reset Skema (Hapus tabel lama agar tidak konflik tipe data)
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS ruangans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Bersihkan Type lama
DO $$ 
BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS kondisi_asset CASCADE;
EXCEPTION
    WHEN others THEN null;
END $$;

-- 3. Buat Type Enum
CREATE TYPE user_role AS ENUM ('admin', 'operator');
CREATE TYPE kondisi_asset AS ENUM ('baik', 'rusak_ringan', 'rusak_berat');

-- 4. Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 5. Tabel Users (DISESUAIKAN: id UUID, password dihapus)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    -- password dihapus karena menggunakan Supabase Auth
    profile_picture TEXT, 
    role user_role DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Ruangans (DISESUAIKAN: user_id UUID)
CREATE TABLE ruangans (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- Diubah jadi UUID
    name VARCHAR(100) NOT NULL,
    header_img TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ruangan_id INTEGER REFERENCES ruangans(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    merk VARCHAR(50),
    tahun INTEGER, 
    kode VARCHAR(50),
    nup VARCHAR(50),
    milik VARCHAR(100),
    jumlah INTEGER DEFAULT 1,
    kondisi kondisi_asset DEFAULT 'baik',
    foto TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Index
CREATE INDEX idx_assets_ruangan ON assets(ruangan_id);
CREATE INDEX idx_ruangans_user ON ruangans(user_id);
CREATE INDEX idx_assets_kondisi ON assets(kondisi);

-- 9. Trigger untuk updated_at (Otomatis update waktu edit)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ruangans_updated_at BEFORE UPDATE ON ruangans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. INSERT USER ADMIN
-- GANTI 'UUID_DARI_AUTH' DENGAN ID USER YANG ANDA COPY DARI MENU AUTHENTICATION
-- Contoh: VALUES ('1cf170dd-f959-4f6a-acce-bdb51a8958fd', ...)

/* 
INSERT INTO users (id, name, email, role)
VALUES (
  'GANTI_DENGAN_UUID_DARI_SUPABASE_AUTH', 
  'Admin Aplikasi',
  'admin@email.com',
  'admin'
); 
*/
