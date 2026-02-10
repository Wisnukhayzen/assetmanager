-- 1. Helper Function to prevent Infinite Recursion
-- This function runs with "SECURITY DEFINER" to bypass RLS when checking admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 2. Clean up old policies (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

DROP POLICY IF EXISTS "Users can view their assigned rooms" ON ruangans;
DROP POLICY IF EXISTS "Admins can insert rooms" ON ruangans;
DROP POLICY IF EXISTS "Users can update their assigned rooms" ON ruangans;
DROP POLICY IF EXISTS "Admins can delete rooms" ON ruangans;

DROP POLICY IF EXISTS "Users can view assets in their assigned rooms" ON assets;
DROP POLICY IF EXISTS "Users can insert assets in their assigned rooms" ON assets;
DROP POLICY IF EXISTS "Users can update assets in their assigned rooms" ON assets;
DROP POLICY IF EXISTS "Users can delete assets in their assigned rooms" ON assets;

-- 3. Users Policies
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON users FOR SELECT 
  USING (is_admin());

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can insert users" 
  ON users FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete users" 
  ON users FOR DELETE 
  USING (is_admin());

-- 4. Ruangans Policies
CREATE POLICY "Users and Admins can view rooms" 
  ON ruangans FOR SELECT 
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can insert rooms" 
  ON ruangans FOR INSERT 
  WITH CHECK (is_admin());

CREATE POLICY "Users and Admins can update rooms" 
  ON ruangans FOR UPDATE 
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Admins can delete rooms" 
  ON ruangans FOR DELETE 
  USING (is_admin());

-- 5. Assets Policies
CREATE POLICY "Users and Admins can view assets" 
  ON assets FOR SELECT 
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM ruangans 
      WHERE ruangans.id = assets.ruangan_id 
      AND ruangans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users and Admins can insert assets" 
  ON assets FOR INSERT 
  WITH CHECK (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM ruangans 
      WHERE ruangans.id = assets.ruangan_id 
      AND ruangans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users and Admins can update assets" 
  ON assets FOR UPDATE 
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM ruangans 
      WHERE ruangans.id = assets.ruangan_id 
      AND ruangans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users and Admins can delete assets" 
  ON assets FOR DELETE 
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM ruangans 
      WHERE ruangans.id = assets.ruangan_id 
      AND ruangans.user_id = auth.uid()
    )
  );
