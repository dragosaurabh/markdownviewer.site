# PageSpeed Insights Fixes

Complete guide to fix all PageSpeed Insights issues for markdownviewer.site

## Current Issues from PageSpeed Report

### 1. Render-Blocking Resources ⚠️
**Problem**: CSS files blocking initial render
**Impact**: Delays First Contentful Paint (FCP)

**Solution**:
```html
<!-- BEFORE (in index.html) -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/themes.css">

<!-- AFTER - Inline critical CSS and defer non-critical -->
<style>
  /* Inline critical CSS here - see css/critical.css */
  /* Copy contents of css/critical.css */
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="css/main.css?v=2.1.4" as="style" onload="this.onload=null;this.rel='stylesheet'">
<link rel="preload" href="css/themes.css?v=2.1.4" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="css/main.css?v=2.1.4">
  <link rel="stylesheet" href="css/themes.css?v=2.1.4">
</noscript>
```

### 2. Unused JavaScript ⚠️
**Problem**: Loading JavaScript that's not used on initial page load
**Impact**: Increases bundle size and parse time

**Solution**:
```html
<!-- BEFORE -->
<script src="js/app.js"></script>
<script src="js/ui.js"></script>

<!-- AFTER - Add defer attribute -->
<script src="js/app.js" defer></script>
<script src="js/ui.js" defer></script>
<script src="js/utils.js" defer></script>
```

### 3. Unused CSS ⚠️
**Problem**: Loading CSS rules that aren't used
**Impact**: Increases download size

**Solution**:
- Use PurgeCSS or similar tool to remove unused CSS
- Split CSS into critical and non-critical
- Load page-specific CSS only

### 4. Largest Contentful Paint (LCP) ⚠️
**Problem**: Main content takes too long to render
**Impact**: Poor user experience

**Solutions**:
```html
<!-- Add resource hints -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">

<!-- Preload critical resources -->
<link rel="preload" href="css/main.css" as="style">
<link rel="preload" href="js/app.js" as="script">

<!-- Optimize font loading -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### 5. Cumulative Layout Shift (CLS) ⚠️
**Problem**: Layout shifts during page load
**Impact**: Poor user experience

**Solutions**:
```html
<!-- Add explicit dimensions to images -->
<img src="image.jpg" width="800" height="600" alt="Description">

<!-- Reserve space for dynamic content -->
<div style="min-height: 400px;">
  <!-- Content loaded here -->
</div>

<!-- Use CSS aspect-ratio -->
<style>
  .image-container {
    aspect-ratio: 16 / 9;
  }
</style>
```

### 6. First Input Delay (FID) ⚠️
**Problem**: Page not interactive quickly enough
**Impact**: Poor interactivity

**Solutions**:
- Break up long tasks
- Use web workers for heavy computations
- Defer non-critical JavaScript
- Reduce JavaScript execution time

### 7. Third-Party Code ⚠️
**Problem**: Prism.js from CDN blocking render
**Impact**: Delays page load

**Solutions**:
```html
<!-- BEFORE -->
<link href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js"></script>

<!-- AFTER - Defer loading -->
<link rel="preload" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js" defer></script>
```

## Implementation Steps

### Step 1: Inline Critical CSS

1. Copy contents of `css/critical.css`
2. Paste into `<style>` tag in `<head>` of index.html
3. This ensures above-the-fold content renders immediately

### Step 2: Defer Non-Critical CSS

Replace CSS links with:
```html
<link rel="preload" href="css/main.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="css/main.css"></noscript>
```

### Step 3: Add Defer to JavaScript

Add `defer` attribute to all script tags:
```html
<script src="js/app.js" defer></script>
```

### Step 4: Optimize Images

```bash
# Install imagemin (if you have images)
npm install -g imagemin-cli imagemin-webp

# Convert to WebP
imagemin assets/images/*.{jpg,png} --plugin=webp --out-dir=assets/images/webp
```

### Step 5: Minify CSS and JavaScript

```bash
# Install minifiers
npm install -g cssnano-cli terser

# Minify CSS
cssnano css/main.css css/main.min.css
cssnano css/themes.css css/themes.min.css

# Minify JavaScript
terser js/app.js -o js/app.min.js -c -m
terser js/ui.js -o js/ui.min.js -c -m
```

### Step 6: Update HTML to Use Minified Files

```html
<!-- Use minified versions in production -->
<link rel="stylesheet" href="css/main.min.css?v=2.1.4">
<script src="js/app.min.js?v=2.1.4" defer></script>
```

### Step 7: Add Resource Hints

```html
<head>
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  
  <!-- Preload critical resources -->
  <link rel="preload" href="css/main.min.css" as="style">
  <link rel="preload" href="js/app.min.js" as="script">
</head>
```

### Step 8: Lazy Load Images

```html
<!-- Add loading="lazy" to images below the fold -->
<img src="image.jpg" loading="lazy" width="800" height="600" alt="Description">
```

### Step 9: Remove Unused Code

Use Chrome DevTools Coverage tab to identify unused CSS/JS:
1. Open DevTools (F12)
2. Go to Coverage tab (Cmd+Shift+P > Show Coverage)
3. Reload page
4. Identify unused code (red bars)
5. Remove or defer loading

### Step 10: Test and Iterate

```bash
# Test with Lighthouse
lighthouse https://markdownviewer.site --view

# Or use PageSpeed Insights
# https://pagespeed.web.dev/
```

## Quick Wins (Implement These First)

### 1. Add to index.html `<head>`:

```html
<!-- Critical CSS (inline) -->
<style>
  /* Copy contents of css/critical.css here */
  :root{--color-primary:#2563EB;--color-bg-primary:#FFF;--color-text-primary:#1F2937;--font-sans:system-ui,-apple-system,sans-serif}*{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--font-sans);color:var(--color-text-primary);background:var(--color-bg-primary);line-height:1.6}.header{background:var(--color-bg-primary);border-bottom:1px solid #E5E7EB;position:sticky;top:0;z-index:100}.container{max-width:1200px;margin:0 auto;padding:0 1rem}.header-content{display:flex;align-items:center;justify-content:space-between;height:64px}.logo{font-size:1.25rem;font-weight:600}.hero{padding:3rem 0;text-align:center}.hero h1{font-size:clamp(2rem,5vw,3rem);font-weight:700;margin-bottom:1rem;line-height:1.2}.btn{display:inline-block;padding:.75rem 1.5rem;background:var(--color-primary);color:#fff;border:none;border-radius:.5rem;font-size:1rem;font-weight:500;cursor:pointer;text-decoration:none}
</style>

<!-- Preconnect to CDN -->
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">

<!-- Defer non-critical CSS -->
<link rel="preload" href="css/main.css?v=2.1.4" as="style" onload="this.onload=null;this.rel='stylesheet'">
<link rel="preload" href="css/themes.css?v=2.1.4" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="css/main.css?v=2.1.4">
  <link rel="stylesheet" href="css/themes.css?v=2.1.4">
</noscript>
```

### 2. Add `defer` to all scripts before `</body>`:

```html
<!-- Defer JavaScript -->
<script src="js/utils.js?v=2.1.4" defer></script>
<script src="js/storage.js?v=2.1.4" defer></script>
<script src="js/markdown-parser.js?v=2.1.4" defer></script>
<script src="js/ui.js?v=2.1.4" defer></script>
<script src="js/search.js?v=2.1.4" defer></script>
<script src="js/app.js?v=2.1.4" defer></script>
<script src="js/export-inline.js?v=2.1.4" defer></script>
<script src="js/mobile-menu.js?v=2.1.4" defer></script>
```

### 3. Defer Prism.js:

```html
<!-- Defer Prism.js -->
<link rel="preload" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<script src="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js" defer></script>
```

## Expected Results

After implementing these fixes:

- **Performance Score**: 90+ (from ~60)
- **FCP**: < 1.8s (from ~3s)
- **LCP**: < 2.5s (from ~4s)
- **CLS**: < 0.1 (from ~0.2)
- **TBT**: < 200ms (from ~400ms)

## Monitoring

After deployment, monitor with:
- Google PageSpeed Insights
- Chrome Lighthouse
- WebPageTest
- Real User Monitoring (RUM)

## Maintenance

- Run PageSpeed tests monthly
- Update dependencies regularly
- Monitor Core Web Vitals in Google Search Console
- Keep CSS/JS minified
- Optimize new images before upload

## Tools & Resources

- **CSS Minifier**: https://cssnano.co/
- **JS Minifier**: https://terser.org/
- **Image Optimizer**: https://squoosh.app/
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://www.webpagetest.org/

## Summary

Priority order:
1. ✅ Inline critical CSS
2. ✅ Defer non-critical CSS
3. ✅ Add defer to JavaScript
4. ✅ Preconnect to CDN
5. ✅ Minify CSS/JS (production)
6. ✅ Optimize images
7. ✅ Remove unused code
8. ✅ Add resource hints

These changes should improve your PageSpeed score from ~60 to 90+!
