#!/usr/bin/env node

// Test script to verify the likes system is working properly
// Usage: node scripts/test-likes-system.js [base-url]

const baseUrl = process.argv[2] || 'https://wakeupnpc.com'

async function testLikesSystem() {
  console.log(`Testing likes system on ${baseUrl}`)

  const testId = '/grifts/lgbt'
  const encodedId = encodeURIComponent(testId)

  try {
    // Test 1: Get current count
    console.log('\n1. Getting current count...')
    const debugRes = await fetch(`${baseUrl}/api/likes/debug?dev=1`)
    const debugData = await debugRes.json()
    const currentCount = debugData.counts[testId] || 0
    console.log(`Current count for ${testId}: ${currentCount}`)

    // Test 2: Increment the count
    console.log('\n2. Incrementing count...')
    const postRes = await fetch(`${baseUrl}/api/likes/${encodedId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: 1 }),
    })
    const postData = await postRes.json()
    console.log(`POST response:`, postData)

    // Test 3: Verify the increment worked
    console.log('\n3. Verifying increment...')
    const verifyRes = await fetch(`${baseUrl}/api/likes/debug?dev=1`)
    const verifyData = await verifyRes.json()
    const newCount = verifyData.counts[testId] || 0
    console.log(`New count for ${testId}: ${newCount}`)

    if (newCount > currentCount) {
      console.log('✅ SUCCESS: Count incremented properly!')
    } else {
      console.log('❌ FAILED: Count did not increment')
    }

    // Test 4: Check for duplicate keys
    console.log('\n4. Checking for duplicate keys...')
    const allKeys = Object.keys(verifyData.counts).filter(
      (key) => key.includes('lgbt') || key.includes('grifts')
    )
    console.log(
      'LGBT-related keys:',
      allKeys.filter((k) => k.includes('lgbt'))
    )

    if (allKeys.filter((k) => k.includes('lgbt')).length === 1) {
      console.log('✅ SUCCESS: No duplicate keys found!')
    } else {
      console.log(
        '⚠️  WARNING: Multiple LGBT keys found - normalization may need more time'
      )
    }
  } catch (error) {
    console.error('❌ ERROR:', error.message)
  }
}

testLikesSystem()
