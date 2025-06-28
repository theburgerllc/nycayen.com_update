#!/usr/bin/env node

/**
 * Test script for the unified cron job
 * Usage: node scripts/test-cron.js [--local]
 */

const { exec } = require('child_process');
const crypto = require('crypto');

// Configuration
const LOCAL_URL = 'http://localhost:3000';
const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-app.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET || 'test-secret-key-for-development';

async function testCronEndpoint() {
  const isLocal = process.argv.includes('--local');
  const baseUrl = isLocal ? LOCAL_URL : PRODUCTION_URL;
  const endpoint = `${baseUrl}/api/cron?manual=true`;

  console.log('🧪 Testing Cron Job Endpoint');
  console.log('================================');
  console.log(`📍 URL: ${endpoint}`);
  console.log(`🔑 Auth: Bearer ${CRON_SECRET.substring(0, 8)}...`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log('');

  try {
    console.log('🚀 Sending POST request to cron endpoint...');
    
    const startTime = Date.now();
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
        'User-Agent': 'cron-test-script/1.0'
      }
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Execution Time: ${executionTime}ms`);
    console.log('');

    // Get response headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (headers['x-execution-time']) {
      console.log(`📈 Server Execution Time: ${headers['x-execution-time']}ms`);
    }
    if (headers['x-tasks-total']) {
      console.log(`📋 Total Tasks: ${headers['x-tasks-total']}`);
      console.log(`✅ Successful Tasks: ${headers['x-tasks-success']}`);
      console.log(`❌ Failed Tasks: ${headers['x-tasks-failed']}`);
    }
    console.log('');

    // Parse response body
    const responseData = await response.json();
    
    if (response.ok || response.status === 207) {
      console.log('✅ Cron job executed successfully!');
      console.log('');
      console.log('📋 Task Results:');
      console.log('================');
      
      Object.entries(responseData.tasks || {}).forEach(([taskName, result]) => {
        const status = result.status === 'success' ? '✅' : '❌';
        console.log(`${status} ${taskName}: ${result.message}`);
        
        if (result.status === 'error') {
          console.log(`   Error: ${result.error}`);
        }
      });

      console.log('');
      console.log('📊 Summary:');
      console.log(`   Total Tasks: ${responseData.summary?.totalTasks || 0}`);
      console.log(`   Successful: ${responseData.summary?.successfulTasks || 0}`);
      console.log(`   Failed: ${responseData.summary?.failedTasks || 0}`);
      console.log(`   Execution Time: ${responseData.summary?.executionTime || executionTime}ms`);

      if (responseData.errors && responseData.errors.length > 0) {
        console.log('');
        console.log('❌ Errors:');
        responseData.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

    } else {
      console.log('❌ Cron job failed!');
      console.log('Error:', responseData.error || 'Unknown error');
    }

  } catch (error) {
    console.log('❌ Test failed with error:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Tips:');
      console.log('   - Make sure your Next.js app is running (npm run dev)');
      console.log('   - Check if the URL is correct');
      console.log('   - Verify the CRON_SECRET environment variable is set');
    }
  }

  console.log('');
  console.log('🏁 Test completed');
}

// Additional function to test cron schedule validation
function validateCronSchedule() {
  const schedule = '0 6 * * *';
  console.log('📅 Cron Schedule Validation');
  console.log('============================');
  console.log(`Schedule: "${schedule}"`);
  console.log('Interpretation: Runs daily at 06:00 UTC');
  console.log('');
  
  // Calculate next 5 run times
  const now = new Date();
  const times = [];
  
  for (let i = 0; i < 5; i++) {
    const nextRun = new Date(now);
    nextRun.setUTCDate(now.getUTCDate() + i);
    nextRun.setUTCHours(6, 0, 0, 0);
    
    // If today's run time has passed, start from tomorrow
    if (i === 0 && nextRun <= now) {
      nextRun.setUTCDate(now.getUTCDate() + 1);
    }
    
    times.push(nextRun.toISOString());
  }
  
  console.log('🕕 Next 5 scheduled runs:');
  times.forEach((time, index) => {
    console.log(`   ${index + 1}. ${time}`);
  });
  console.log('');
}

// Main execution
async function main() {
  console.log('🔄 Cron Job Testing Suite');
  console.log('=========================');
  console.log('');
  
  validateCronSchedule();
  await testCronEndpoint();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testCronEndpoint, validateCronSchedule };