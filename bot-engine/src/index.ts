/**
 * Checkmate Bot Testing Engine
 * Main orchestrator for automated testing
 */

import { chromium, firefox, webkit, Browser, Page } from 'playwright';
import { testAuthentication } from './tests/auth';
import { testPerformance } from './tests/performance';
import { testSecurity } from './tests/security';
import { testUI } from './tests/ui';

export interface TestConfig {
  targetUrl: string;
  browsers?: ('chromium' | 'firefox' | 'webkit')[];
  testTypes?: ('auth' | 'performance' | 'security' | 'ui' | 'all')[];
  credentials?: {
    username: string;
    password: string;
  };
  timeout?: number;
}

export interface TestResults {
  testId: string;
  targetUrl: string;
  timestamp: Date;
  duration: number;
  browser: string;
  results: {
    auth?: any;
    performance?: any;
    security?: any;
    ui?: any;
  };
  screenshots: string[];
  issues: Issue[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export interface Issue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  url?: string;
  screenshot?: string;
  recommendation?: string;
}

/**
 * Run all tests for a given configuration
 */
export async function runTests(config: TestConfig): Promise<TestResults> {
  const startTime = Date.now();
  const browsers = config.browsers || ['chromium'];
  const testTypes = config.testTypes || ['all'];

  const results: TestResults = {
    testId: `test_${Date.now()}`,
    targetUrl: config.targetUrl,
    timestamp: new Date(),
    duration: 0,
    browser: browsers[0],
    results: {},
    screenshots: [],
    issues: [],
    summary: {
      totalChecks: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Use first browser for testing (multi-browser support can be added later)
  const browserType = browsers[0];
  let browser: Browser;

  try {
    // Launch browser
    switch (browserType) {
      case 'firefox':
        browser = await firefox.launch({ headless: true });
        break;
      case 'webkit':
        browser = await webkit.launch({ headless: true });
        break;
      default:
        browser = await chromium.launch({ headless: true });
    }

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'CheckmateBot/1.0'
    });

    const page = await context.newPage();

    // Run tests based on configuration
    if (testTypes.includes('all') || testTypes.includes('auth')) {
      console.log('Running authentication tests...');
      results.results.auth = await testAuthentication(page, config.targetUrl, config.credentials);
      updateSummary(results, results.results.auth);
    }

    if (testTypes.includes('all') || testTypes.includes('performance')) {
      console.log('Running performance tests...');
      results.results.performance = await testPerformance(page, config.targetUrl);
      updateSummary(results, results.results.performance);
    }

    if (testTypes.includes('all') || testTypes.includes('security')) {
      console.log('Running security tests...');
      results.results.security = await testSecurity(page, config.targetUrl);
      updateSummary(results, results.results.security);
    }

    if (testTypes.includes('all') || testTypes.includes('ui')) {
      console.log('Running UI tests...');
      results.results.ui = await testUI(page, config.targetUrl);
      updateSummary(results, results.results.ui);
    }

    // Close browser
    await browser.close();

  } catch (error: any) {
    console.error('Test execution error:', error);
    results.issues.push({
      severity: 'critical',
      category: 'execution',
      title: 'Test execution failed',
      description: error.message,
      recommendation: 'Check target URL and test configuration'
    });
  }

  // Calculate duration
  results.duration = Math.round((Date.now() - startTime) / 1000);

  return results;
}

/**
 * Update test summary with results from individual tests
 */
function updateSummary(results: TestResults, testResult: any) {
  if (testResult && testResult.checks) {
    results.summary.totalChecks += testResult.checks.total || 0;
    results.summary.passed += testResult.checks.passed || 0;
    results.summary.failed += testResult.checks.failed || 0;
  }

  if (testResult && testResult.issues) {
    results.issues.push(...testResult.issues);
  }

  if (testResult && testResult.screenshots) {
    results.screenshots.push(...testResult.screenshots);
  }
}

/**
 * Entry point for running tests
 */
if (require.main === module) {
  const config: TestConfig = {
    targetUrl: process.env.TARGET_URL || 'https://example.com',
    browsers: ['chromium'],
    testTypes: ['all']
  };

  runTests(config)
    .then(results => {
      console.log('\n=== Test Results ===');
      console.log(`Duration: ${results.duration}s`);
      console.log(`Total Checks: ${results.summary.totalChecks}`);
      console.log(`Passed: ${results.summary.passed}`);
      console.log(`Failed: ${results.summary.failed}`);
      console.log(`Issues Found: ${results.issues.length}`);
      console.log('\nTest completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export default { runTests };
