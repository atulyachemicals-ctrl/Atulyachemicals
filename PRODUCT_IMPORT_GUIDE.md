# Product Import Guide for Atulya Chemicals

This guide explains how to import your 2,600+ products from the Excel file into Shopify with proper CAS Numbers and HSN Codes.

## Overview

The Excel file `xxx_e_commerce_list_2025-2026_do_it_(1)_(2).xlsx` contains your product catalog. You need to import this data into Shopify with custom metafields for CAS Number and HSN Code.

## Step 1: Prepare Shopify for Custom Metafields

Before importing, you need to create custom metafield definitions in Shopify:

1. **Log into your Shopify Admin**
2. **Navigate to Settings > Custom Data**
3. **Click "Products" under Metafields**
4. **Add two new metafield definitions:**

   **Metafield 1: CAS Number**
   - Namespace: `custom`
   - Key: `cas_number`
   - Name: `CAS Number`
   - Type: `Single line text`
   - Description: `Chemical Abstracts Service Registry Number`

   **Metafield 2: HSN Code**
   - Namespace: `custom`
   - Key: `hsn_code`
   - Name: `HSN Code`
   - Type: `Single line text`
   - Description: `Harmonized System of Nomenclature Code`

## Step 2: Convert Excel to Shopify CSV Format

Shopify requires a specific CSV format for product imports. Your Excel file needs to be converted to include these columns:

### Required Shopify Columns:
- `Handle` - Unique product identifier (auto-generated from title)
- `Title` - Product name
- `Body (HTML)` - Product description
- `Vendor` - Your company name (Atulya Chemicals)
- `Product Category` - Shopify product type
- `Type` - Product type/category
- `Tags` - Comma-separated tags
- `Published` - TRUE/FALSE
- `Option1 Name` - Packaging size (e.g., "Weight")
- `Option1 Value` - Specific packaging (e.g., "1 kg", "5 kg", "25 kg")
- `Variant SKU` - Stock keeping unit
- `Variant Grams` - Weight in grams (for shipping)
- `Variant Inventory Tracker` - shopify
- `Variant Inventory Policy` - deny (don't allow purchases when out of stock)
- `Variant Fulfillment Service` - manual
- `Variant Price` - Product price
- `Variant Requires Shipping` - TRUE
- `Variant Taxable` - TRUE
- `Image Src` - URL to product image (optional)
- `Image Position` - 1
- `Image Alt Text` - Product name
- `Metafield: cas_number [custom.cas_number]` - CAS Number from your Excel
- `Metafield: hsn_code [custom.hsn_code]` - HSN Code from your Excel

### Example CSV Structure:

```csv
Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Requires Shipping,Variant Taxable,"Metafield: cas_number [custom.cas_number]","Metafield: hsn_code [custom.hsn_code]"
acetic-acid,Acetic Acid,"High purity acetic acid for laboratory and industrial use",Atulya Chemicals,Organic Acids,"acids,organic",TRUE,Weight,1 kg,AA-1KG,1000,shopify,deny,manual,500.00,TRUE,TRUE,64-19-7,2915
acetic-acid,Acetic Acid,"High purity acetic acid for laboratory and industrial use",Atulya Chemicals,Organic Acids,"acids,organic",TRUE,Weight,5 kg,AA-5KG,5000,shopify,deny,manual,2300.00,TRUE,TRUE,64-19-7,2915
acetic-acid,Acetic Acid,"High purity acetic acid for laboratory and industrial use",Atulya Chemicals,Organic Acids,"acids,organic",TRUE,Weight,25 kg,AA-25KG,25000,shopify,deny,manual,10500.00,TRUE,TRUE,64-19-7,2915
```

**Important Notes:**
- Each variant (packaging size) needs its own row
- All rows for the same product should have the same `Handle`
- Weight should be in grams for accurate shipping calculations
- CAS Number and HSN Code are the same for all variants of a product

## Step 3: Create the Import CSV

### Option A: Manual Conversion (Recommended for Small Batches)

1. Open your Excel file
2. Create a new Excel workbook
3. Add all the Shopify columns listed above
4. Map your Excel data to Shopify columns:
   - Product Name → Title
   - CAS Number → Metafield: cas_number
   - HSN Code → Metafield: hsn_code
5. Create multiple rows for different packaging sizes
6. Save as CSV (UTF-8)

### Option B: Using a Spreadsheet Tool

1. Open your Excel file in Google Sheets or Excel
2. Create a new sheet with Shopify columns
3. Use formulas to map data from your original sheet
4. For multiple variants, create rows for each packaging option
5. Export as CSV

### Option C: Use Shopify's Product CSV Template

1. Download Shopify's product CSV template from your admin
2. Fill in your product data according to the template
3. Add the metafield columns for CAS Number and HSN Code

## Step 4: Import into Shopify

1. **Log into Shopify Admin**
2. **Navigate to Products**
3. **Click "Import" button**
4. **Upload your CSV file**
5. **Review the import preview**
6. **Click "Import products"**

### Import Tips:

- **Test First**: Import 10-20 products first to verify the format
- **Batch Import**: Import in batches of 500-1000 products
- **Monitor Progress**: Check for any import errors
- **Verify Metafields**: After import, verify that CAS Numbers and HSN Codes appear correctly

## Step 5: Verify Import

After importing, verify your products:

1. **Check Product Listings**
   - Navigate to Products in Shopify Admin
   - Open a few products randomly
   - Verify all details are correct

2. **Check Metafields**
   - In the product editor, scroll down to "Metafields"
   - Verify CAS Number and HSN Code appear correctly

3. **Check Variants**
   - Verify all packaging sizes are present
   - Check weights are correct (important for delivery logic)
   - Verify prices are correct

4. **Test on Frontend**
   - Open your website
   - Search for products by name, CAS Number, and HSN Code
   - Verify product details display correctly
   - Test add to cart functionality

## Step 6: Bulk Update (If Needed)

If you need to update products after import:

1. **Export Products**: Export your products from Shopify as CSV
2. **Make Changes**: Edit the CSV file
3. **Re-import**: Import the updated CSV (existing products will be updated)

## Common Issues and Solutions

### Issue: Metafields not appearing
**Solution**: Ensure metafield definitions were created in Step 1 with exact namespace and key names.

### Issue: Products not searchable by CAS/HSN
**Solution**: The Shopify Storefront API searches metafields automatically. Ensure the metafields are properly set.

### Issue: Wrong weights affecting delivery options
**Solution**: Re-import with corrected weight values. Weight must be in grams.

### Issue: Multiple variants not showing
**Solution**: Ensure all variant rows have the same Handle value and different Option1 Value.

## Product Data Mapping

Based on typical chemical product catalogs, here's likely mapping from your Excel:

| Your Excel Column | Shopify Column | Notes |
|-------------------|----------------|-------|
| Product Name | Title | Product name |
| CAS Number | Metafield: cas_number | Required for search |
| HSN Code | Metafield: hsn_code | Required for GST |
| Category | Type | Product category |
| Description | Body (HTML) | Product description |
| 1 kg Price | Variant Price | Create variant row |
| 5 kg Price | Variant Price | Create variant row |
| 25 kg Price | Variant Price | Create variant row |

## Next Steps

1. Create metafield definitions in Shopify
2. Prepare your CSV file
3. Test import with 10-20 products
4. Import remaining products in batches
5. Verify all products on the website
6. Test search functionality

## Support

For questions about:
- **Shopify Import**: Check Shopify's documentation or contact Shopify support
- **Website Issues**: The frontend is configured to work with your Shopify data automatically

## Important Reminders

- All products must have unique SKUs
- Weight is crucial for the delivery logic (under/over 20 kg)
- CAS Numbers and HSN Codes are essential for search and compliance
- Test thoroughly before going live with all products
