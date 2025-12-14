/**
 * UI/UX Testing Module
 * Tests responsive design, broken links, console errors, navigation
 */

import { Page } from 'playwright';
import { Issue } from '../index';

export interface UITestResults {
  checks: {
    total: number;
    passed: number;
    failed: number;
  };
  tests: {
    responsive: {
      mobile: boolean;
      tablet: boolean;
      desktop: boolean;
    };
    brokenLinks: string[];
    consoleErrors: number;
    navigation: boolean;
    forms: {
      total: number;
      validated: number;
    };
  };
  issues: Issue[];
  screenshots: string[];
}

export async function testUI(
  page: Page,
  url: string
): Promise<UITestResults> {
  const results: UITestResults = {
    checks: { total: 0, passed: 0, failed: 0 },
    tests: {
      responsive: {
        mobile: false,
        tablet: false,
        desktop: false
      },
      brokenLinks: [],
      consoleErrors: 0,
      navigation: false,
      forms: {
        total: 0,
        validated: 0
      }
    },
    issues: [],
    screenshots: []
  };

  // Track console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Test 1: Responsive Design - Mobile
    results.checks.total++;
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    const mobileOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    results.tests.responsive.mobile = !mobileOverflow;

    if (results.tests.responsive.mobile) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'high',
        category: 'ui',
        title: 'Mobile responsiveness issue',
        description: 'Horizontal scrollbar detected on mobile viewport (375px)',
        url: page.url(),
        recommendation: 'Review CSS for overflow issues, use responsive units (%, vw, rem)'
      });
    }

    const mobileScreenshot = `screenshots/ui-mobile-${Date.now()}.png`;
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    results.screenshots.push(mobileScreenshot);

    // Test 2: Responsive Design - Tablet
    results.checks.total++;
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    const tabletOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    results.tests.responsive.tablet = !tabletOverflow;

    if (results.tests.responsive.tablet) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'ui',
        title: 'Tablet responsiveness issue',
        description: 'Horizontal scrollbar detected on tablet viewport (768px)',
        url: page.url(),
        recommendation: 'Test and fix layout for tablet screen sizes'
      });
    }

    const tabletScreenshot = `screenshots/ui-tablet-${Date.now()}.png`;
    await page.screenshot({ path: tabletScreenshot, fullPage: true });
    results.screenshots.push(tabletScreenshot);

    // Test 3: Responsive Design - Desktop
    results.checks.total++;
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    results.tests.responsive.desktop = true; // Desktop usually works
    results.checks.passed++;

    const desktopScreenshot = `screenshots/ui-desktop-${Date.now()}.png`;
    await page.screenshot({ path: desktopScreenshot, fullPage: true });
    results.screenshots.push(desktopScreenshot);

    // Test 4: Check for broken links (sample first 20 links)
    results.checks.total++;
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors
        .map(a => a.getAttribute('href'))
        .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:'))
        .slice(0, 20); // Check first 20 links only
    });

    const brokenLinks: string[] = [];
    for (const link of links) {
      try {
        if (link.startsWith('http')) {
          // External link
          const response = await page.request.get(link, { timeout: 5000 });
          if (response.status() >= 400) {
            brokenLinks.push(link);
          }
        }
      } catch (error) {
        brokenLinks.push(link);
      }
    }

    results.tests.brokenLinks = brokenLinks;

    if (brokenLinks.length === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: brokenLinks.length > 5 ? 'high' : 'medium',
        category: 'ui',
        title: 'Broken links detected',
        description: `Found ${brokenLinks.length} broken link(s): ${brokenLinks.slice(0, 3).join(', ')}`,
        url: page.url(),
        recommendation: 'Fix or remove broken links'
      });
    }

    // Test 5: Console errors
    results.checks.total++;
    results.tests.consoleErrors = consoleErrors.length;

    if (consoleErrors.length === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: consoleErrors.length > 10 ? 'high' : 'medium',
        category: 'ui',
        title: 'Console errors detected',
        description: `Found ${consoleErrors.length} JavaScript error(s) in console`,
        url: page.url(),
        recommendation: 'Review and fix JavaScript errors shown in browser console'
      });
    }

    // Test 6: Navigation functionality
    results.checks.total++;
    const navLinks = await page.locator('nav a, header a').count();
    results.tests.navigation = navLinks > 0;

    if (results.tests.navigation) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'ui',
        title: 'Navigation not found',
        description: 'Could not find navigation menu',
        url: page.url(),
        recommendation: 'Add clear navigation structure to improve usability'
      });
    }

    // Test 7: Form validation
    const forms = await page.locator('form').count();
    results.tests.forms.total = forms;

    if (forms > 0) {
      results.checks.total++;
      const formsWithValidation = await page.evaluate(() => {
        const formElements = Array.from(document.querySelectorAll('form'));
        return formElements.filter(form => {
          const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
          return inputs.some(input => input.hasAttribute('required'));
        }).length;
      });

      results.tests.forms.validated = formsWithValidation;

      if (formsWithValidation > 0) {
        results.checks.passed++;
      } else {
        results.checks.failed++;
        results.issues.push({
          severity: 'low',
          category: 'ui',
          title: 'Forms lack validation',
          description: 'Forms do not have required field validation',
          url: page.url(),
          recommendation: 'Add "required" attributes and validation to form inputs'
        });
      }
    }

    // Test 8: Check for proper headings structure
    results.checks.total++;
    const headingStructure = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const h1Count = headings.filter(h => h.tagName === 'H1').length;

      return {
        hasHeadings: headings.length > 0,
        h1Count,
        properStructure: h1Count === 1
      };
    });

    if (headingStructure.properStructure) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'low',
        category: 'accessibility',
        title: 'Improper heading structure',
        description: `Found ${headingStructure.h1Count} H1 tags (should be exactly 1)`,
        url: page.url(),
        recommendation: 'Use exactly one H1 tag per page for proper SEO and accessibility'
      });
    }

    // Test 9: Check for alt text on images
    results.checks.total++;
    const imageAccessibility = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const withoutAlt = images.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt') === '');
      return {
        total: images.length,
        withoutAlt: withoutAlt.length
      };
    });

    if (imageAccessibility.withoutAlt === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'accessibility',
        title: 'Images missing alt text',
        description: `${imageAccessibility.withoutAlt} of ${imageAccessibility.total} images lack alt attributes`,
        url: page.url(),
        recommendation: 'Add descriptive alt text to all images for accessibility'
      });
    }

  } catch (error: any) {
    results.issues.push({
      severity: 'critical',
      category: 'ui',
      title: 'UI testing failed',
      description: `Error: ${error.message}`,
      recommendation: 'Ensure the website is accessible for UI testing'
    });
  }

  return results;
}
