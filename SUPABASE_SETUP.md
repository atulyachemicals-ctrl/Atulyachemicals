# Supabase Database & Auth Setup Guide

Follow this guide to enable **Google Sign-In** and set up your Supabase database tables for **User Profiles** and **Cart Items**.

---

## Step 1: Execute SQL in Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project (`mfoeqlvqgtiptvicxrtm`).
3. Click on **SQL Editor** in the left sidebar.
4. Click **New Query**, paste the SQL script below, and click **Run**.

```sql
-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  company_name TEXT,
  gst_number TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view and edit their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Create Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  chemical_name TEXT NOT NULL,
  cas_number TEXT,
  hsn_code TEXT,
  packaging TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  weight_kg NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own cart items"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Anyone can insert cart items"
  ON public.cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own cart items"
  ON public.cart_items FOR UPDATE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can delete own cart items"
  ON public.cart_items FOR DELETE
  USING (auth.uid() = user_id OR session_id IS NOT NULL);
-- 3. Create Orders & Shiprocket Tracking Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  shiprocket_order_id TEXT,
  shipment_id TEXT,
  awb_code TEXT,
  courier_name TEXT,
  shipping_mode TEXT NOT NULL DEFAULT 'courier',
  pincode TEXT,
  subtotal_amount NUMERIC NOT NULL DEFAULT 0,
  shipping_charge NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Step 2: Enable Google Provider in Supabase Dashboard

To allow visitors to click **"Continue with Google"**:

1. In Supabase Dashboard, navigate to **Authentication > Providers**.
2. Find **Google** in the list and toggle it **Enabled**.
3. Create OAuth Credentials in Google Cloud Console:
   - Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
   - Click **Create Credentials > OAuth client ID**.
   - Choose **Web Application**.
   - Under **Authorized JavaScript origins**, add your Vercel URL (e.g. `https://your-app.vercel.app`).
   - Under **Authorized redirect URIs**, add your Supabase Callback URL found in the Supabase Google Provider settings:
     `https://mfoeqlvqgtiptvicxrtm.supabase.co/auth/v1/callback`
4. Copy the generated **Client ID** and **Client Secret** from Google Cloud Console into the Supabase Google Provider configuration settings and click **Save**.

---

## Step 3: Configure Vercel Domain in Supabase URL Configuration (Crucial for Vercel Deployment!)

When deployed to Vercel, Supabase needs to know your live Vercel domain URL so it redirects back to Vercel instead of `localhost`:

1. Go to **Supabase Dashboard > Authentication > URL Configuration**.
2. Set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`).
3. Under **Redirect URLs**, click **Add URL** and add:
   - `https://your-app.vercel.app/**`
   - `https://*.vercel.app/**`
4. Click **Save**.

---

## Step 4: Add Environment Variables in Vercel

In your **Vercel Project Dashboard > Settings > Environment Variables**:
Add the following 2 keys:

- `VITE_SUPABASE_URL` = `https://mfoeqlvqgtiptvicxrtm.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Then trigger a **Redeploy** on Vercel.
