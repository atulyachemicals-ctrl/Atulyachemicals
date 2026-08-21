/*
  # Create Cart Items Table

  1. New Tables
    - `cart_items`
      - `id` (uuid, primary key) - Unique cart item identifier
      - `user_id` (uuid, nullable) - References auth.users for authenticated users
      - `session_id` (text, nullable) - Session identifier for anonymous users
      - `chemical_name` (text) - Name of the chemical product
      - `cas_number` (text) - CAS number of the chemical
      - `hsn_code` (text) - HSN code for the chemical
      - `packaging` (text) - Packaging size/type
      - `price` (numeric) - Price per unit
      - `quantity` (integer) - Quantity of items
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `cart_items` table
    - Add policy for authenticated users to manage their own cart
    - Add policy for anonymous users to manage their session cart

  3. Important Notes
    - Cart items can belong to authenticated users (via user_id) or anonymous users (via session_id)
    - Users can view, insert, update, and delete their own cart items
    - Anonymous users can manage cart items using their session_id
*/

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  chemical_name text NOT NULL,
  cas_number text,
  hsn_code text,
  packaging text NOT NULL,
  price numeric NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT cart_items_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own cart items
CREATE POLICY "Authenticated users can read own cart"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own cart items
CREATE POLICY "Authenticated users can insert own cart"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own cart items
CREATE POLICY "Authenticated users can update own cart"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete their own cart items
CREATE POLICY "Authenticated users can delete own cart"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Anonymous users can read their session cart items
CREATE POLICY "Anonymous users can read session cart"
  ON cart_items
  FOR SELECT
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can insert their session cart items
CREATE POLICY "Anonymous users can insert session cart"
  ON cart_items
  FOR INSERT
  TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Policy: Anonymous users can update their session cart items
CREATE POLICY "Anonymous users can update session cart"
  ON cart_items
  FOR UPDATE
  TO anon
  USING (session_id IS NOT NULL);

-- Policy: Anonymous users can delete their session cart items
CREATE POLICY "Anonymous users can delete session cart"
  ON cart_items
  FOR DELETE
  TO anon
  USING (session_id IS NOT NULL);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();