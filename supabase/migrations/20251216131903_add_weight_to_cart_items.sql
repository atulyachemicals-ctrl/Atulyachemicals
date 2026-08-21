/*
  # Add Weight to Cart Items

  1. Changes
    - Add `weight_kg` column to `cart_items` table to store the weight of each item in kilograms
    - This enables calculation of total order weight for shipping charge logic

  2. Important Notes
    - Weight is stored in kilograms (kg) for consistency
    - Default value is 0 to handle items without weight specified
*/

-- Add weight_kg column to cart_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'weight_kg'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN weight_kg numeric DEFAULT 0 NOT NULL;
  END IF;
END $$;