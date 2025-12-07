# PixelPaws - Validation & Testing Checklist

## Pre-Submission Validation Checklist

### HTML Validation (Nu Validator)

#### Steps to Validate:
1. Go to: https://validator.w3.org/
2. Click "Validate by File Upload" tab
3. Upload each HTML file and check results

#### Files to Validate:
- [ ] `/index.html` - Home page
- [ ] `/src/customize.html` - Customize page
- [ ] `/src/play.html` - Play page
- [ ] `/src/shop.html` - Shop page
- [ ] `/src/about.html` - About page
- [ ] `/src/contact.html` - Resources/Contact page

#### Expected Results:
- ✅ All files should validate with **0 errors**
- ⚠️ Any warnings should be reviewed and fixed

#### Common Issues to Watch For:
- Missing alt text on images
- Duplicate IDs on elements
- Invalid attribute values
- Unclosed tags
- Improper nesting

---

### CSS Validation

#### Steps to Validate:
1. Go to: https://jigsaw.w3.org/css-validator/
2. Click "Validate by File Upload"
3. Upload each CSS file

#### Files to Validate:
- [ ] `/src/styles/main.css`
- [ ] `/src/styles/customize.css`
- [ ] `/src/styles/pet.css`
- [ ] `/src/styles/play.css`
- [ ] `/src/styles/shop.css`
- [ ] `/src/styles/about.css`
- [ ] `/src/styles/contact.css`
- [ ] `/src/styles/home.css`

#### Expected Results:
- ✅ All files should validate with **0 errors**

---

### Accessibility Testing (WAVE & Beyond)

#### 1. WAVE Browser Extension Testing

For each page:
1. Open page in browser
2. Click WAVE extension icon
3. Review results

**Current WAVE Status:**
- [x] Home Page: 1 contrast error
- [x] Customize Page: 1 error (improved with error-handler)
- [x] Play Page: 1 contrast error, 1 alert
- [x] Shop Page: 5 contrast errors (improved with ARIA labels), 1 alert
- [x] About Page: ✅ 0 errors
- [x] Resources Page: ✅ 0 errors

**Target:**
- ✅ All pages: **0 ERRORS, 0 CONTRAST ISSUES**

#### 2. Axe DevTools Testing

1. Install Axe DevTools extension
2. Open each page
3. Run scan
4. Fix critical/serious issues

**Issues to Track:**
- [ ] All critical issues resolved
- [ ] All serious issues resolved
- [ ] Moderate issues reviewed

#### 3. Lighthouse Audit (Chrome DevTools)

1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Analyze page load"
4. Check "Accessibility" score

**Target:** ✅ **90+ Accessibility Score**

#### 4. Keyboard Navigation Test

For each page:
- [ ] Tab through all interactive elements
- [ ] Ensure focus is always visible
- [ ] All buttons/links are reachable
- [ ] Tab order makes logical sense
- [ ] No keyboard traps

#### 5. Screen Reader Test (Optional but Recommended)

- [ ] Use NVDA (Windows) or VoiceOver (Mac)
- [ ] Test navigation
- [ ] Test content reading
- [ ] Test form interaction

---

### Contrast Ratio Testing

#### Using WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/

For buttons and text elements:
1. Note the text color and background color
2. Enter both hex codes into checker
3. Verify contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text

**Elements to Check:**
- [ ] Buttons (primary, secondary)
- [ ] Links
- [ ] Input fields
- [ ] Status messages
- [ ] Weather display elements

**Current Color Palette:**
```
Primary Purple: #660066
Light Purple: #DFCDE7
Text Dark: #2C2C2C (or #660066)
White: #FFFFFF
Pink Button: #FFB6C1
Black Text: #000000
```

---

### Error Handling Validation

#### Test Error Scenarios:

1. **localStorage Full**
   - [ ] Save pet data when localStorage is full
   - [ ] Verify user sees error notification
   - [ ] App gracefully handles error

2. **API Failure (Weather)**
   - [ ] Disable internet, visit page
   - [ ] Verify graceful degradation
   - [ ] Check console for proper error logging

3. **File Import Errors**
   - [ ] Try importing invalid JSON
   - [ ] Try importing corrupted file
   - [ ] Verify helpful error message shown

4. **Geolocation Denied**
   - [ ] Deny location permission
   - [ ] Verify app still works with default weather

5. **Invalid Data in localStorage**
   - [ ] Manually corrupt localStorage data (via DevTools)
   - [ ] Reload page
   - [ ] Verify app handles gracefully

#### Error Handler Verification:
- [ ] Error handler script loads (check DevTools Console)
- [ ] Errors are logged (check `window.ErrorHandler.errorLog`)
- [ ] User notifications appear for critical errors
- [ ] App doesn't crash on errors

---

### Functionality Testing

#### Pet Customization:
- [ ] All colors work
- [ ] All ear styles work
- [ ] All face styles work
- [ ] All eye styles work
- [ ] All tail styles work
- [ ] Pet name saves/loads
- [ ] Save button saves to localStorage
- [ ] Reset button clears data
- [ ] Export creates JSON file
- [ ] Import loads JSON file

#### Shop:
- [ ] All 9 accessories display
- [ ] Filter by type works
- [ ] Filter by status works
- [ ] Purchase button works (health required)
- [ ] Equip button works
- [ ] Unequip button works
- [ ] Owned items persist
- [ ] Clear Filters button works

#### Play:
- [ ] All 6 activities work
- [ ] Health stats update
- [ ] Animations display
- [ ] Stats persist after refresh

#### Health System:
- [ ] Stats decay over time
- [ ] Stats update when playing
- [ ] Stats display on all pages
- [ ] Shop closes when happiness < 50%

#### Weather System:
- [ ] Weather API calls work
- [ ] Weather affects mood
- [ ] Background changes with weather
- [ ] Graceful fallback without location

---

### Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Check:**
- [ ] All features work
- [ ] Styling looks correct
- [ ] No console errors
- [ ] Responsive design works

---

### Mobile Responsiveness

- [ ] Test on mobile device (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1200px+ width)
- [ ] Use Chrome DevTools device emulation

**Check:**
- [ ] Navigation is accessible
- [ ] Buttons are touch-friendly (44px+ minimum)
- [ ] Text is readable
- [ ] Images scale properly
- [ ] Layout reflows correctly

---

### Performance Testing

Using Lighthouse in Chrome DevTools:
- [ ] First Contentful Paint < 3s
- [ ] Largest Contentful Paint < 4s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Performance Score > 80

---

## Step-by-Step Validation Process

### Before Final Deployment:

1. **Monday**: Run WAVE, fix accessibility issues
2. **Tuesday**: Run Nu Validator, fix HTML issues
3. **Wednesday**: Run Lighthouse, optimize performance
4. **Thursday**: Cross-browser testing
5. **Friday**: Mobile testing, final checks
6. **Saturday**: Deploy to w3.cs.jmu.edu

---

## Fixing Issues Found

### If Contrast Errors Found:

1. **Identify problematic element:**
   ```
   Click issue in WAVE → note element name
   ```

2. **Find in CSS:**
   ```css
   .button {
       color: /* text color */;
       background-color: /* background color */;
   }
   ```

3. **Check contrast:**
   - Go to WebAIM Contrast Checker
   - Enter both colors
   - If < 4.5:1, increase contrast

4. **Update CSS:**
   ```css
   .button {
       color: #FFFFFF; /* Lighter text or darker background */
       background-color: #660066; /* Darker color */
   }
   ```

5. **Retest in WAVE**

---

### If HTML Errors Found:

Common fixes:
- **Missing alt text:** Add `alt="description"` to images
- **Duplicate IDs:** Remove or rename duplicate IDs
- **Unclosed tags:** Add closing tag `</tag>`
- **Invalid attributes:** Check attribute spelling and value format

---

## Deployment Checklist

Before deploying to w3.cs.jmu.edu:

- [ ] Nu Validator: 0 errors on all HTML files
- [ ] CSS Validator: 0 errors on all CSS files
- [ ] WAVE: 0 errors, 0 contrast issues on all pages
- [ ] Lighthouse Accessibility: 90+
- [ ] All functionality working
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Error handling working
- [ ] All code committed to GitHub

---

## Resources

- **W3C Nu Validator:** https://validator.w3.org/
- **W3C CSS Validator:** https://jigsaw.w3.org/css-validator/
- **WAVE Extension:** https://wave.webaim.org/extension/
- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Axe DevTools:** https://www.deque.com/axe/devtools/
- **Chrome Lighthouse:** Chrome DevTools → Lighthouse tab
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

