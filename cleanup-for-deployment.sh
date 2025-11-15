#!/bin/bash

# Cleanup script for deployment
# Removes all unnecessary files for production deployment

echo "=========================================="
echo "Cleaning up project for deployment..."
echo "=========================================="
echo ""

# Remove all markdown documentation files
echo "Removing documentation files..."
rm -f *.md
rm -f .kiro/specs/*/*.md 2>/dev/null

# Remove all Python scripts
echo "Removing Python scripts..."
rm -f *.py

# Remove all test files
echo "Removing test files..."
rm -f test-*.html
rm -f dark-mode-simple-test.html
rm -f footer-preview.html

# Remove shell scripts (except this one)
echo "Removing shell scripts..."
rm -f deploy.sh
rm -f fix-navigation.sh

# Remove .kiro directory (development specs)
echo "Removing .kiro directory..."
rm -rf .kiro

# Remove git files if present
echo "Removing git files..."
rm -rf .git
rm -f .gitignore

# Remove editor config files
echo "Removing editor config files..."
rm -f .editorconfig
rm -f .vscode

# Create deployment info file
echo "Creating DEPLOYMENT_INFO.txt..."
cat > DEPLOYMENT_INFO.txt << 'EOF'
Markdown Viewer - Production Deployment
========================================

Deployment Date: $(date)
Version: 2.1.4

Files Included:
- HTML pages (index.html, blog pages, etc.)
- CSS files (css/*.css)
- JavaScript files (js/*.js)
- Assets (assets/*)
- Configuration files (.htaccess, robots.txt, sitemap.xml)

Deployment Instructions:
1. Upload all files to your web hosting root directory
2. Ensure .htaccess is uploaded (for URL rewriting)
3. Verify robots.txt and sitemap.xml are accessible
4. Test the site at your domain

Required Server Configuration:
- PHP: Not required (static site)
- Apache/Nginx: Yes (for .htaccess or equivalent)
- HTTPS: Recommended
- Gzip compression: Recommended

Post-Deployment Checklist:
□ Test homepage loads correctly
□ Test all navigation links
□ Test dark mode toggle
□ Test markdown viewer functionality
□ Test blog posts load correctly
□ Verify sitemap.xml is accessible
□ Submit sitemap to Google Search Console
□ Test on mobile devices

Support:
For issues, check the console for errors and verify all files uploaded correctly.
EOF

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "Files removed:"
echo "  ✓ All .md documentation files"
echo "  ✓ All .py Python scripts"
echo "  ✓ All test-*.html files"
echo "  ✓ .kiro/ directory"
echo "  ✓ Shell scripts"
echo "  ✓ Git files"
echo ""
echo "Production files ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Review remaining files with: ls -la"
echo "2. Upload to your web hosting"
echo "3. Test the deployed site"
echo ""
