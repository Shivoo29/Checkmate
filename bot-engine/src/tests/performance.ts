/**
 * Performance Testing Module
 * Tests page load speed, Core Web Vitals, resource optimization
 */

import { Page } from 'playwright';
import { Issue } from '../index';

export interface PerformanceTestResults {
  checks: {
    total: number;
    passed: number;
    failed: number;
  };
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    resourceCount: number;
    totalSize: number;
  };
  coreWebVitals: {
    lcp: number | null; // Largest Contentful Paint
    fid: number | null; // First Input Delay
    cls: number | null; // Cumulative Layout Shift
  };
  issues: Issue[];
  screenshots: string[];
}

export async function testPerformance(
  page: Page,
  url: string
): Promise<PerformanceTestResults> {
  const results: PerformanceTestResults = {
    checks: { total: 0, passed: 0, failed: 0 },
    metrics: {
      loadTime: 0,
      domContentLoaded: 0,
      firstPaint: 0,
      resourceCount: 0,
      totalSize: 0
    },
    coreWebVitals: {
      lcp: null,
      fid: null,
      cls: null
    },
    issues: [],
    screenshots: []
  };

  try {
    const startTime = Date.now();

    // Navigate and measure load time
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const loadTime = Date.now() - startTime;
    results.metrics.loadTime = loadTime;

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');

      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        resourceCount: performance.getEntriesByType('resource').length,
        transferSize: perfData.transferSize || 0
      };
    });

    results.metrics.domContentLoaded = performanceMetrics.domContentLoaded;
    results.metrics.firstPaint = performanceMetrics.firstPaint;
    results.metrics.resourceCount = performanceMetrics.resourceCount;
    results.metrics.totalSize = performanceMetrics.transferSize;

    // Test 1: Page load time
    results.checks.total++;
    const loadTimeAcceptable = loadTime < 3000; // < 3 seconds

    if (loadTimeAcceptable) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: loadTime > 5000 ? 'high' : 'medium',
        category: 'performance',
        title: 'Slow page load time',
        description: `Page took ${(loadTime / 1000).toFixed(2)}s to load (target: < 3s)`,
        url: page.url(),
        recommendation: 'Optimize images, minify CSS/JS, enable caching, use CDN'
      });
    }

    // Test 2: Resource count
    results.checks.total++;
    const resourceCountAcceptable = results.metrics.resourceCount < 50;

    if (resourceCountAcceptable) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'performance',
        title: 'Too many resources',
        description: `Page loads ${results.metrics.resourceCount} resources (target: < 50)`,
        url: page.url(),
        recommendation: 'Combine CSS/JS files, use sprites for images, lazy load non-critical resources'
      });
    }

    // Test 3: Check for unoptimized images
    const images = await page.evaluate(() => {
      const imgElements = Array.from(document.querySelectorAll('img'));
      return imgElements.map(img => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height
      }));
    });

    results.checks.total++;
    const oversizedImages = images.filter(img =>
      img.naturalWidth > img.displayWidth * 2 || img.naturalHeight > img.displayHeight * 2
    );

    if (oversizedImages.length === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'performance',
        title: 'Unoptimized images detected',
        description: `Found ${oversizedImages.length} images that are larger than needed`,
        url: page.url(),
        recommendation: 'Resize images to appropriate dimensions, use responsive images (srcset), compress images'
      });
    }

    // Test 4: Check for render-blocking resources
    results.checks.total++;
    const renderBlockingResources = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

      const blockingScripts = scripts.filter(script =>
        !script.hasAttribute('async') && !script.hasAttribute('defer')
      ).length;

      return {
        blockingScripts,
        stylesheets: styles.length
      };
    });

    if (renderBlockingResources.blockingScripts === 0) {
      results.checks.passed++;
    } else {
      results.checks.failed++;
      results.issues.push({
        severity: 'medium',
        category: 'performance',
        title: 'Render-blocking JavaScript',
        description: `Found ${renderBlockingResources.blockingScripts} blocking script(s)`,
        url: page.url(),
        recommendation: 'Add async or defer attributes to script tags, move non-critical scripts to bottom of page'
      });
    }

    // Get Core Web Vitals (simplified version)
    try {
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          // This is a simplified version; production would use web-vitals library
          const perfObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            resolve({
              lcp: lcp ? (lcp as any).renderTime || (lcp as any).loadTime : null
            });
          });

          try {
            perfObserver.observe({ type: 'largest-contentful-paint', buffered: true });
          } catch (e) {
            resolve({ lcp: null });
          }

          // Timeout after 3 seconds
          setTimeout(() => resolve({ lcp: null }), 3000);
        });
      });

      results.coreWebVitals.lcp = (webVitals as any).lcp;

      // Test LCP if available
      if (results.coreWebVitals.lcp !== null) {
        results.checks.total++;
        const lcpGood = results.coreWebVitals.lcp < 2500; // Good: < 2.5s

        if (lcpGood) {
          results.checks.passed++;
        } else {
          results.checks.failed++;
          results.issues.push({
            severity: results.coreWebVitals.lcp > 4000 ? 'high' : 'medium',
            category: 'performance',
            title: 'Poor Largest Contentful Paint (LCP)',
            description: `LCP: ${(results.coreWebVitals.lcp / 1000).toFixed(2)}s (target: < 2.5s)`,
            url: page.url(),
            recommendation: 'Optimize main content loading, preload critical resources, reduce server response time'
          });
        }
      }
    } catch (error) {
      // Web Vitals collection failed, not critical
    }

    // Take performance screenshot
    const screenshot = `screenshots/performance-${Date.now()}.png`;
    await page.screenshot({ path: screenshot, fullPage: true });
    results.screenshots.push(screenshot);

  } catch (error: any) {
    results.issues.push({
      severity: 'critical',
      category: 'performance',
      title: 'Performance testing failed',
      description: `Error: ${error.message}`,
      recommendation: 'Ensure the website is accessible for performance testing'
    });
  }

  return results;
}
