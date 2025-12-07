# Nu Validator Guide for PixelPaws

## What is Nu Validator?

Nu Validator is an **HTML syntax validator** that checks if your HTML code follows the HTML5 specification correctly. Unlike WAVE (which checks accessibility), Nu Validator checks for:
- Proper HTML tags and structure
- Valid attributes
- Proper nesting
- Deprecated elements
- Type errors
- Missing required attributes

## How to Use Nu Validator

### Method 1: Online Validator (Easiest)
1. Go to: **https://validator.w3.org/**
2. Choose one of three options:
   - **Validate by URI** (easiest for deployed sites)
   - **Validate by File Upload** (for local files)
   - **Validate by Direct Input** (copy-paste HTML)

### Method 2: For Your PixelPaws Project

Since your files aren't deployed to w3.cs.jmu.edu yet, use **File Upload**:

1. Go to https://validator.w3.org/
2. Click **"Validate by File Upload"** tab
3. Upload each HTML file:
   - index.html
   - src/customize.html
   - src/play.html
   - src/shop.html
   - src/about.html
   - src/contact.html

### What to Look For

The validator will show:
- ✅ **No errors** = Passes validation
- ⚠️ **Warnings** = Not critical but should fix
- ❌ **Errors** = Must fix before submission

Common HTML errors to watch for:
- Missing closing tags
- Invalid attribute values
- Duplicate IDs
- Improperly nested elements
- Missing required attributes (like alt on images)
- Invalid ARIA attributes

---

## Interpreting Your WAVE Results

### Summary of Issues Found:

**Home Page:** 1 contrast issue (low priority)
**Customize Page:** 1 error (MUST FIX) - likely a missing label or ARIA issue
**Play Page:** 1 contrast issue, 1 alert (low priority)
**Shop Page:** 5 contrast issues (medium priority - visible colors too similar)
**About Page:** ✅ Clean! No issues
**Resources Page:** ✅ Clean! No issues

---

## Priority Fixes Needed

### HIGH PRIORITY (Must Fix):
1. **Customize Page Error** - Check for:
   - Missing form labels
   - Invalid ARIA attributes
   - Duplicate IDs

### MEDIUM PRIORITY (Should Fix):
2. **Contrast Issues** (6 total)
   - Home: 1 contrast issue
   - Play: 1 contrast issue
   - Shop: 5 contrast issues
   - Solution: Increase color contrast ratios to meet WCAG AA standard (4.5:1 for text)

### LOW PRIORITY (Nice to Have):
3. **Alerts** (2 total)
   - Play Page: 1 alert
   - Shop Page: 1 alert
   - These are usually suggestions, not errors

---

## Next Steps

I will help you:
1. Fix the Customize Page error
2. Fix contrast issues (especially in Shop page)
3. Add more ARIA labels
4. Improve error handling in JavaScript
5. Validate your HTML with Nu Validator

