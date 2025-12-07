/**
 * Authentication Testing Module
 * Tests login, registration, password reset, and session management
 */

import { Page } from 'playwright';
import { Issue } from '../index';

export interface AuthTestResults {
  checks: {
    total: number;
    passed: number;
    failed: number;
  };
  tests: {
    loginFormExists: boolean;
    registrationFormExists: boolean;
    passwordResetExists: boolean;
    sessionPersistence: boolean;
    securePasswordHandling: boolean;
  };
  issues: Issue[];
  screenshots: string[];
}

export async function testAuthentication(
  page: Page,
  url: string,
  credentials?: { username: string; password: string }
): Promise<AuthTestResults> {
  const results: AuthTestResults = {
    checks: { total: 0, passed: 0, failed: 0 },
    tests: {
      loginFormExists: false,
      registrationFormExists: false,
      passwordResetExists: false,
      sessionPersistence: false,
      securePasswordHandling: false
    },
    issues: [],
    screenshots: []
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Test 1: Check for login form
    results.checks.total++;
    const loginForm = await page.locator('form[action*="login"], form#login-form, input[type="email"] + input[type="password"]').count();
    results.tests.loginFormExists = loginForm > 0;

    if (results.tests.loginFormExists) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'high',
        category: 'authentication',
        title: 'Login form not found',
        description: 'Could not locate a login form on the page',
        url: page.url(),
        recommendation: 'Ensure authentication functionality is implemented and accessible'
      });
    }

    // Test 2: Check for registration form/link
    results.checks.total++;
    const registrationLink = await page.locator('a[href*="register"], a[href*="signup"], button:has-text("Sign Up")').count();
    results.tests.registrationFormExists = registrationLink > 0;

    if (results.tests.registrationFormExists) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'authentication',
        title: 'Registration not found',
        description: 'Could not find registration/signup functionality',
        url: page.url(),
        recommendation: 'Add user registration capability'
      });
    }

    // Test 3: Check for password reset
    results.checks.total++;
    const passwordReset = await page.locator('a:has-text("Forgot"), a[href*="reset"], a[href*="forgot"]').count();
    results.tests.passwordResetExists = passwordReset > 0;

    if (results.tests.passwordResetExists) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'authentication',
        title: 'Password reset not found',
        description: 'No password reset/recovery option available',
        url: page.url(),
        recommendation: 'Implement password recovery functionality'
      });
    }

    // Test 4: Check password field security
    results.checks.total++;
    const passwordFields = await page.locator('input[type="password"]').count();
    results.tests.securePasswordHandling = passwordFields > 0;

    if (results.tests.securePasswordHandling) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'critical',
        category: 'security',
        title: 'Insecure password input',
        description: 'Password fields not using type="password"',
        url: page.url(),
        recommendation: 'Use proper password input types to hide password characters'
      });
    }

    // Test 5: Test actual login if credentials provided
    if (credentials && results.tests.loginFormExists) {
      results.checks.total++;
      try {
        // Try to fill login form
        await page.fill('input[type="email"], input[name="email"], input[name="username"]', credentials.username);
        await page.fill('input[type="password"]', credentials.password);

        // Screenshot before submission
        const screenshotPath = `screenshots/auth-login-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath });
        results.screenshots.push(screenshotPath);

        // Submit form
        await page.click('button[type="submit"], input[type="submit"]');
        await page.waitForTimeout(2000);

        // Check if login was successful (URL changed or dashboard visible)
        const currentUrl = page.url();
        const dashboardVisible = await page.locator('[data-testid="dashboard"], .dashboard, #dashboard').count() > 0;

        results.tests.sessionPersistence = currentUrl !== url || dashboardVisible;

        if (results.tests.sessionPersistence) {
          results.checks.passed++;
        } else {
          results.checks.failed++;
          results.issues.push({
            severity: 'high',
            category: 'authentication',
            title: 'Login may not be working',
            description: 'Login submission did not result in expected navigation',
            url: page.url(),
            recommendation: 'Verify login flow redirects to dashboard or home page'
          });
        }
      } catch (error: any) {
        results.checks.failed++;
        results.issues.push({
          severity: 'high',
          category: 'authentication',
          title: 'Login test failed',
          description: `Error during login test: ${error.message}`,
          url: page.url(),
          recommendation: 'Review login form selectors and flow'
        });
      }
    }

    // Take final screenshot
    const finalScreenshot = `screenshots/auth-final-${Date.now()}.png`;
    await page.screenshot({ path: finalScreenshot, fullPage: true });
    results.screenshots.push(finalScreenshot);

  } catch (error: any) {
    results.issues.push({
      severity: 'critical',
      category: 'authentication',
      title: 'Authentication testing failed',
      description: `Error: ${error.message}`,
      recommendation: 'Check if the website is accessible and has authentication features'
    });
  }

  return results;
}
