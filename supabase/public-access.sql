-- Allow public read access for Ruangans
CREATE POLICY "Public can view rooms"
ON ruangans FOR SELECT
USING (true);

-- Allow public read access for Assets
CREATE POLICY "Public can view assets"
ON assets FOR SELECT
USING (true);

-- Allow public read access for Users (needed for Operator name display)
CREATE POLICY "Public can view users"
ON users FOR SELECT
USING (true);
