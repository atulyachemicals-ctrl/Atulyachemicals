# Atulya Chemicals - B2B E-commerce Setup Guide

## Overview

This is a B2B e-commerce website for Atulya Chemicals, a chemical supplier with 2,600+ products. The frontend is built with React, TypeScript, and Tailwind CSS. Product data is fetched from a SheetDB API with automatic caching and pagination for optimal performance.

## Prerequisites

1. Node.js 18+ installed
2. Product data accessible via SheetDB API (already configured)

## Product Data Source

The website fetches chemical products from: `https://sheetdb.io/api/v1/15f3e8wndki3x`

### Features:
- **One-time API fetch** on initial load
- **24-hour localStorage caching** to minimize API calls
- **Pagination** with 25 chemicals per page
- **Real-time search** by Product Name, CAS Number, or HSN Code
- **Performance optimized** to handle 2,600+ products efficiently

## Shopify Setup

### 1. Create a Shopify Store

If you don't have a Shopify store yet:
1. Go to https://www.shopify.com/
2. Sign up for a Shopify account
3. Complete the store setup

### 2. Enable Storefront API

1. In your Shopify admin, go to **Settings** > **Apps and sales channels**
2. Click **Develop apps**
3. Click **Create an app**
4. Name your app (e.g., "Atulya Chemicals Frontend")
5. Click **Configure Storefront API scopes**
6. Enable the following scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_customers`
   - `unauthenticated_read_customers`
7. Click **Save**
8. Click **Install app**
9. Copy your **Storefront API access token**

### 3. Add Product Metafields

For each product, you need to add CAS Number and HSN Code as metafields:

1. Go to **Products** in your Shopify admin
2. Click on a product
3. Scroll to **Metafields**
4. Add the following custom metafields:
   - Namespace: `custom`
   - Key: `cas_number`
   - Type: `Single line text`
   - Value: (e.g., "7732-18-5")

   - Namespace: `custom`
   - Key: `hsn_code`
   - Type: `Single line text`
   - Value: (e.g., "28")

### 4. Configure Product Variants

Each product should have variants representing different packaging options:
1. Go to a product in your Shopify admin
2. Add variants for different packaging sizes (e.g., "1 kg", "5 kg", "25 kg")
3. Set the weight for each variant (important for delivery logic)

### 5. Set Up Checkout

The checkout will automatically collect:
- GST Number (add as a custom field in Shopify checkout settings)
- Billing Address
- Shipping Address

To add GST Number field:
1. Go to **Settings** > **Checkout**
2. Scroll to **Order processing**
3. Add a custom field for "GST Number"

## Frontend Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your Shopify credentials:

```env
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token_here
```

Replace:
- `your-store.myshopify.com` with your actual Shopify store domain
- `your_storefront_access_token_here` with the Storefront API access token from step 2

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Features

### Product Listing
- Grid-based layout optimized for 2,600+ products
- Product cards showing:
  - Product Name
  - CAS Number
  - HSN Code
  - Packaging variants
  - Price (for logged-in users)
  - Add to Cart button

### Search & Filters
- Global search by Product Name, CAS Number, or HSN Code
- Filter by CAS Number
- Filter by HSN Code
- Pagination with "Load More" functionality

### Authentication
- Sign Up with:
  - Name
  - Company Name
  - Mobile Number
  - Email
  - Password
- Sign In with email and password
- Connected to Shopify customer accounts

### Shopping Cart
- View cart items
- Update quantities
- Remove items
- See total weight
- Delivery method indicator:
  - Weight < 20 kg: Courier or Transport options
  - Weight ≥ 20 kg: Transport only
- Redirect to Shopify checkout

### Pages
- Product Listing (Home)
- Terms and Conditions
- About Us

## Design

- Clean, industrial, professional B2B design
- Neutral colors (white, grey, blue tones)
- Fully responsive (mobile, tablet, desktop)
- Fast loading with optimized performance

## Delivery Logic

The system automatically determines delivery options based on cart weight:

- **Under 20 kg**: Customer can choose between Courier or Transport
- **20 kg and above**: Only Transport option available

This logic is displayed in the cart drawer before checkout.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Shopify Storefront API
- **Checkout**: Shopify Checkout (hosted)

## Support

For questions or issues, please contact: info@atulyachemicals.com

## Notes

- This application uses Shopify for all commerce functionality (products, cart, checkout, orders, customer accounts)
- No custom backend is required
- All product data is managed through your Shopify admin
- Checkout is handled by Shopify's secure checkout flow
