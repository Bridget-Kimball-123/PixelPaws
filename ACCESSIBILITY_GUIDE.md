# Accessibility & Contrast Improvements Guide

## Issues Found by WAVE

### Summary:
- **Home Page:** 1 contrast error
- **Customize Page:** 1 error (likely resolved with better form labels)
- **Play Page:** 1 contrast error, 1 alert
- **Shop Page:** 5 contrast errors, 1 alert
- **About Page:** ✅ No issues
- **Resources Page:** ✅ No issues

---

## WCAG Contrast Requirements

To meet WCAG AA standards, you need:
- **Normal text:** 4.5:1 contrast ratio
- **Large text (18pt+ or 14pt+ bold):** 3:1 contrast ratio

### Tool to Check Contrast:
https://webaim.org/resources/contrastchecker/

---

## Issue Analysis & Solutions

### 1. Shop Page - 5 Contrast Errors (HIGHEST PRIORITY)

**Likely Problem:** Button colors or filter colors have insufficient contrast

**Solution:**
- Button text on colored backgrounds needs better contrast
- Ensure purple buttons have white text with good contrast ratio
- Check `.btn-primary`, `.btn-secondary` colors in shop.css

**CSS Fix Example:**
```css
/* Update button colors for better contrast */
.btn-primary {
    background-color: #660066; /* Dark purple */
    color: #FFFFFF;            /* Pure white text */
}

.btn-secondary {
    background-color: #FFB6C1; /* Light pink */
    color: #000000;            /* Black text */
}
```

### 2. Home & Play Pages - Contrast Errors

**Likely Problem:** Text on colored backgrounds (possibly weather backgrounds or stat bars)

**Solution:**
- Check weather-related element colors
- Ensure all text has sufficient contrast with its background

### 3. WAVE Alerts (2 total)

**Alert Investigation:**
- Run WAVE again and click on specific alerts
- They usually suggest missing elements (redundant links, etc.)

---

## Accessibility Improvements to Add

### 1. Add ARIA Landmarks to All Pages

```html
<!-- Add to HTML structure -->
<header role="banner">...</header>
<nav role="navigation" aria-label="Main navigation">...</nav>
<main role="main" id="main-content">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>
```

### 2. Add aria-labels to Interactive Elements

```html
<!-- Shop Page Filters -->
<select aria-label="Filter by accessory type" id="filter-type">
    <option value="">All Types</option>
</select>

<!-- Play Activity Buttons -->
<button aria-label="Pet your PixelPaw" data-activity="pet">
    🤚 Pet
</button>
```

### 3. Improve Form Accessibility

```html
<!-- Instead of just placeholders, use labels -->
<div class="form-group">
    <label for="pet-name">Pet Name:</label>
    <input type="text" 
           id="pet-name" 
           name="pet-name"
           aria-required="true"
           aria-describedby="name-help">
    <small id="name-help">Choose a name up to 20 characters</small>
</div>
```

### 4. Add Skip Link (if missing)

```html
<!-- At the very start of body -->
<a href="#main-content" class="skip-link">Skip to main content</a>

<style>
.skip-link {
    position: absolute;
    left: -10000px;
    z-index: 999;
}

.skip-link:focus {
    left: 0;
    top: 0;
    background: #660066;
    color: white;
    padding: 10px;
}
</style>
```

### 5. Improve Modal Accessibility

```html
<!-- Reset Modal (improve accessibility) -->
<div id="resetModal" 
     class="modal-overlay" 
     role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-hidden="true">
    <div class="modal-content">
        <h2 id="modal-title">Confirm Reset</h2>
        <!-- content -->
    </div>
</div>
```

### 6. Add aria-live for Dynamic Updates

```html
<!-- Health status container -->
<div class="pet-stats" 
     aria-live="polite" 
     aria-atomic="false"
     role="status">
    <div class="stat">
        <span aria-label="Hunger level">🍖 Hunger: <span class="hunger-percent">80</span>%</span>
    </div>
</div>
```

---

## CSS Improvements for Contrast

### Update Color Palette in main.css:

```css
:root {
    /* Better contrast for text */
    --text-dark: #2C2C2C;           /* Darker for better contrast */
    --primary-purple: #660066;       /* Dark purple - good contrast */
    --light-purple: #DFCDE7;         /* Keep for backgrounds */
    
    /* Button colors */
    --btn-primary-bg: #660066;       /* Dark purple */
    --btn-primary-text: #FFFFFF;     /* White text */
    --btn-secondary-bg: #FFB6C1;     /* Light pink */
    --btn-secondary-text: #000000;   /* Black text */
}
```

---

## Testing Accessibility

### Tools to Use:

1. **WAVE Browser Extension**
   - Re-run on each page
   - Aim for 0 errors

2. **Axe DevTools**
   - Chrome/Firefox extension
   - More comprehensive than WAVE
   - Great for finding specific issues

3. **Lighthouse (Chrome DevTools)**
   - Built into Chrome
   - Check Accessibility score
   - Aim for 90+

4. **Keyboard Navigation Testing**
   - Test all features with Tab key only
   - Ensure focus indicators are visible
   - Check all buttons/links are reachable

5. **Screen Reader Testing**
   - Use built-in screen readers (NVDA, JAWS)
   - Test navigation and content reading

---

## Implementation Steps

### Step 1: Fix Contrast Issues
- [ ] Update button colors in `styles/shop.css`
- [ ] Update text colors in `styles/main.css`
- [ ] Test with contrast checker

### Step 2: Add ARIA Landmarks
- [ ] Add roles to header, nav, main, footer
- [ ] Add aria-labels to all interactive elements
- [ ] Add aria-required to form fields

### Step 3: Improve Forms
- [ ] Add labels (not just placeholders)
- [ ] Add aria-describedby for hints
- [ ] Add aria-required where needed

### Step 4: Add Modals Accessibility
- [ ] Add role="dialog" to modals
- [ ] Add aria-modal="true"
- [ ] Add aria-labelledby pointing to title
- [ ] Add aria-hidden="true" when hidden

### Step 5: Test Everything
- [ ] Run WAVE on all pages
- [ ] Run Lighthouse audit
- [ ] Test keyboard navigation
- [ ] Test with screen reader

---

## Resources

- **WebAIM:** https://webaim.org/
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility

