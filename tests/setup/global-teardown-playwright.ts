import { FullConfig } from '@playwright/test'
import fs from 'fs/promises'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Playwright tests...')
  
  try {
    // Clean up test artifacts
    await cleanupTestArtifacts()
    
    // Generate test summary
    await generateTestSummary()
    
    // Clean up test data
    await cleanupTestData()
    
    console.log('✅ Global teardown completed successfully')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
  }
}

async function cleanupTestArtifacts() {
  const artifactDirs = [
    'test-results',
    'playwright-report',
    'coverage',
  ]
  
  // Don't clean up in CI to preserve artifacts
  if (process.env.CI) {
    console.log('🔄 Skipping cleanup in CI environment')
    return
  }
  
  for (const dir of artifactDirs) {
    try {
      const dirPath = path.join(process.cwd(), dir)
      await fs.access(dirPath)
      
      // Keep artifacts but clean up old ones (older than 7 days)
      const files = await fs.readdir(dirPath)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - 7)
      
      for (const file of files) {
        const filePath = path.join(dirPath, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await fs.rm(filePath, { recursive: true, force: true })
          console.log(`🗑️  Cleaned up old artifact: ${file}`)
        }
      }
    } catch (error) {
      // Directory doesn't exist or no permission, skip
    }
  }
}

async function generateTestSummary() {
  try {
    const reportPath = path.join(process.cwd(), 'playwright-report', 'results.json')
    
    try {
      await fs.access(reportPath)
      const reportData = await fs.readFile(reportPath, 'utf-8')
      const report = JSON.parse(reportData)
      
      const summary = {
        timestamp: new Date().toISOString(),
        stats: {
          total: report.stats?.total || 0,
          passed: report.stats?.passed || 0,
          failed: report.stats?.failed || 0,
          skipped: report.stats?.skipped || 0,
          flaky: report.stats?.flaky || 0,
        },
        duration: report.stats?.duration || 0,
        projects: report.suites?.map((suite: any) => ({
          name: suite.title,
          tests: suite.specs?.length || 0,
        })) || [],
      }
      
      const summaryPath = path.join(process.cwd(), 'playwright-report', 'summary.json')
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
      
      console.log('📊 Test Summary:')
      console.log(`   Total: ${summary.stats.total}`)
      console.log(`   Passed: ${summary.stats.passed}`)
      console.log(`   Failed: ${summary.stats.failed}`)
      console.log(`   Skipped: ${summary.stats.skipped}`)
      console.log(`   Duration: ${(summary.duration / 1000).toFixed(2)}s`)
      
    } catch (error) {
      console.log('📊 No test results found to summarize')
    }
  } catch (error) {
    console.warn('⚠️  Could not generate test summary:', error)
  }
}

async function cleanupTestData() {
  // Clean up any test-specific data
  // This could include database cleanup, file cleanup, etc.
  
  console.log('🧹 Cleaning up test data...')
  
  // Example: Clean up uploaded test files
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'test')
    await fs.rm(uploadsDir, { recursive: true, force: true })
  } catch (error) {
    // Directory doesn't exist, which is fine
  }
  
  // Example: Clean up test database records
  // In a real application, you might clean up test data here
  
  console.log('✅ Test data cleanup completed')
}

export default globalTeardown