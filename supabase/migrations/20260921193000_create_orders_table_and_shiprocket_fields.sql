/*
  # Create Orders Table and Shiprocket Tracking Fields

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `order_number` (text, unique order reference e.g. ORD-2026-XXXX)
      - `shiprocket_order_id` (text) - Shiprocket Order ID returned by API
      - `shipment_id` (text) - Shiprocket Shipment ID
      - `awb_code` (text) - Air Waybill tracking code
      - `courier_name` (text) - Assigned courier company name
      - `shipping_mode` (text) - 'courier' or 'transport'
      - `pincode` (text) - Delivery pincode
      - `subtotal_amount` (numeric) - Items subtotal
      - `shipping_charge` (numeric) - Courier or transport freight charge
      - `total_amount` (numeric) - Total payable order amount
      - `status` (text) - Order status ('PENDING', 'MANIFESTED', 'SHIPPED', 'DELIVERED', 'CANCELLED')
      - `items` (jsonb) - Order line items summary
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `orders` table
    - Users can read their own orders
    - Users can insert their own orders
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  shiprocket_order_id text,
  shipment_id text,
  awb_code text,
  courier_name text,
  shipping_mode text NOT NULL DEFAULT 'courier',
  pincode text,
  subtotal_amount numeric NOT NULL DEFAULT 0,
  shipping_charge numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PENDING',
  items jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add pincode column to user_profiles if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'pincode'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN pincode text;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own orders
CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own orders
CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast user order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_awb_code ON orders(awb_code);
