/**
 * Security Testing Module
 * Tests for HTTPS, security headers, common vulnerabilities
 */

import { Page } from 'playwright';
import { Issue } from '../index';

export interface SecurityTestResults {
  checks: {
    total: number;
    passed: number;
    failed: number;
  };
  tests: {
    httpsEnforced: boolean;
    securityHeaders: {
      hasXFrameOptions: boolean;
      hasXContentTypeOptions: boolean;
      hasStrictTransportSecurity: boolean;
      hasContentSecurityPolicy: boolean;
    };
    vulnerabilities: {
      mixedContent: boolean;
      insecureForms: boolean;
    };
  };
  issues: Issue[];
  screenshots: string[];
}

export async function testSecurity(
  page: Page,
  url: string
): Promise<SecurityTestResults> {
  const results: SecurityTestResults = {
    checks: { total: 0, passed: 0, failed: 0 },
    tests: {
      httpsEnforced: false,
      securityHeaders: {
        hasXFrameOptions: false,
        hasXContentTypeOptions: false,
        hasStrictTransportSecurity: false,
        hasContentSecurityPolicy: false
      },
      vulnerabilities: {
        mixedContent: false,
        insecureForms: false
      }
    },
    issues: [],
    screenshots: []
  };

  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    if (!response) {
      throw new Error('Failed to load page');
    }

    const headers = response.headers();
    const pageUrl = page.url();

    // Test 1: HTTPS enforcement
    results.checks.total++;
    results.tests.httpsEnforced = pageUrl.startsWith('https://');

    if (results.tests.httpsEnforced) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'critical',
        category: 'security',
        title: 'HTTPS not enforced',
        description: 'Website is not using HTTPS encryption',
        url: pageUrl,
        recommendation: 'Implement SSL/TLS certificate and enforce HTTPS for all pages'
      });
    }

    // Test 2: X-Frame-Options header
    results.checks.total++;
    results.tests.securityHeaders.hasXFrameOptions = !!headers['x-frame-options'];

    if (results.tests.securityHeaders.hasXFrameOptions) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'high',
        category: 'security',
        title: 'Missing X-Frame-Options header',
        description: 'Website is vulnerable to clickjacking attacks',
        url: pageUrl,
        recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN header'
      });
    }

    // Test 3: X-Content-Type-Options header
    results.checks.total++;
    results.tests.securityHeaders.hasXContentTypeOptions = !!headers['x-content-type-options'];

    if (results.tests.securityHeaders.hasXContentTypeOptions) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'security',
        title: 'Missing X-Content-Type-Options header',
        description: 'Browser MIME-sniffing is not prevented',
        url: pageUrl,
        recommendation: 'Add X-Content-Type-Options: nosniff header'
      });
    }

    // Test 4: Strict-Transport-Security header (HSTS)
    results.checks.total++;
    results.tests.securityHeaders.hasStrictTransportSecurity = !!headers['strict-transport-security'];

    if (results.tests.securityHeaders.hasStrictTransportSecurity) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: results.tests.httpsEnforced ? 'medium' : 'low',
        category: 'security',
        title: 'Missing HSTS header',
        description: 'HTTP Strict Transport Security not configured',
        url: pageUrl,
        recommendation: 'Add Strict-Transport-Security header to enforce HTTPS'
      });
    }

    // Test 5: Content-Security-Policy header
    results.checks.total++;
    results.tests.securityHeaders.hasContentSecurityPolicy = !!headers['content-security-policy'];

    if (results.tests.securityHeaders.hasContentSecurityPolicy) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'security',
        title: 'Missing Content-Security-Policy header',
        description: 'No CSP configured to prevent XSS attacks',
        url: pageUrl,
        recommendation: 'Implement Content-Security-Policy header to mitigate XSS risks'
      });
    }

    // Test 6: Check for mixed content (if HTTPS)
    if (results.tests.httpsEnforced) {
      results.checks.total++;
      const mixedContentResources = await page.evaluate(() => {
        const resources = [];
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const images = Array.from(document.querySelectorAll('img[src]'));
        const links = Array.from(document.querySelectorAll('link[href]'));

        [...scripts, ...images, ...links].forEach(el => {
          const src = el.getAttribute('src') || el.getAttribute('href');
          if (src && src.startsWith('http://')) {
            resources.push(src);
          }
        });

        return resources;
      });

      results.tests.vulnerabilities.mixedContent = mixedContentResources.length > 0;

      if (!results.tests.vulnerabilities.mixedContent) {
        results.checks.passed++;
      } else {
        results.checks.failed++;
        results.issues.push({
          severity: 'high',
          category: 'security',
          title: 'Mixed content detected',
          description: `Found ${mixedContentResources.length} insecure HTTP resources on HTTPS page`,
          url: pageUrl,
          recommendation: 'Update all resource URLs to use HTTPS'
        });
      }
    }

    // Test 7: Check for insecure forms
    results.checks.total++;
    const insecureForms = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      return forms.filter(form => {
        const action = form.getAttribute('action') || '';
        return action.startsWith('http://') || (!action && window.location.protocol === 'http:');
      }).length;
    });

    results.tests.vulnerabilities.insecureForms = insecureForms > 0;

    if (!results.tests.vulnerabilities.insecureForms) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'critical',
        category: 'security',
        title: 'Insecure form submissions',
        description: `Found ${insecureForms} form(s) submitting data over HTTP`,
        url: pageUrl,
        recommendation: 'Ensure all forms submit to HTTPS endpoints'
      });
    }

    // Test 8: Check for password fields on non-HTTPS
    if (!results.tests.httpsEnforced) {
      results.checks.total++;
      const passwordFields = await page.locator('input[type="password"]').count();

      if (passwordFields === 0) {
        results.checks.passed++;
      } else {
        results.checks.failed++;
        results.issues.push({
          severity: 'critical',
          category: 'security',
          title: 'Password fields on insecure connection',
          description: 'Password inputs present on non-HTTPS page',
          url: pageUrl,
          recommendation: 'CRITICAL: Immediately implement HTTPS for authentication pages'
        });
      }
    }

    // Test 9: Check for autocomplete on sensitive fields
    results.checks.total++;
    const unsafeAutocomplete = await page.evaluate(() => {
      const sensitiveFields = Array.from(document.querySelectorAll(
        'input[type="password"], input[name*="card"], input[name*="cvv"], input[name*="ssn"]'
      ));

      return sensitiveFields.filter(field =>
        field.getAttribute('autocomplete') === 'on' ||
        !field.hasAttribute('autocomplete')
      ).length;
    });

    if (unsafeAutocomplete === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'security',
        title: 'Autocomplete enabled on sensitive fields',
        description: `Found ${unsafeAutocomplete} sensitive field(s) with autocomplete enabled`,
        url: pageUrl,
        recommendation: 'Disable autocomplete on sensitive fields using autocomplete="off"'
      });
    }

    // Take security screenshot
    const screenshot = `screenshots/security-${Date.now()}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    results.screenshots.push(screenshot);

  } catch (error: any) {
    results.issues.push({
      severity: 'critical',
      category: 'security',
      title: 'Security testing failed',
      description: `Error: ${error.message}`,
      recommendation: 'Ensure the website is accessible for security testing'
    });
  }

  return results;
}
