#!/usr/bin/env node

/**
 * Vectorize RAG Testing Suite
 * 
 * This script tests the vectorize RAG functionality to ensure it's working correctly
 * with the chat system and returns relevant documents.
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

// Test queries for different scenarios
const TEST_QUERIES = [
  {
    name: "Healthcare Query",
    query: "Find hospitals with emergency services",
    expectedKeywords: ["hospital", "emergency", "medical"]
  },
  {
    name: "Medical Facility Query", 
    query: "What are the best clinics for urgent care?",
    expectedKeywords: ["clinic", "urgent", "care"]
  },
  {
    name: "Allergy Treatment Query",
    query: "Weather related allergies and treatment options",
    expectedKeywords: ["allergy", "weather", "treatment"]
  },
  {
    name: "General Healthcare Query",
    query: "Healthcare facilities with good ratings",
    expectedKeywords: ["healthcare", "rating", "facility"]
  }
];

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBackendHealth() {
  log('\n🔍 Testing Backend Health...', 'cyan');
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      log(`✅ Backend is healthy: ${data.service} v${data.version}`, 'green');
      return true;
    } else {
      log(`❌ Backend health check failed: ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend connection failed: ${error.message}`, 'red');
    return false;
  }
}

async function testVectorizeRAG(query, expectedKeywords) {
  log(`\n📚 Testing Vectorize RAG with query: "${query}"`, 'blue');
  
  try {
    // Test the chat API which uses vectorize RAG
    const chatResponse = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: query }
        ]
      })
    });
    
    if (!chatResponse.ok) {
      throw new Error(`Chat API failed: ${chatResponse.status}`);
    }
    
    const chatData = await chatResponse.json();
    
    // Validate response structure
    if (!chatData.content) {
      throw new Error('No content in chat response');
    }
    
    log(`📝 Response content length: ${chatData.content.length} characters`, 'yellow');
    log(`🔗 Sources found: ${chatData.sources?.length || 0}`, 'yellow');
    
    // Test if sources are returned
    if (chatData.sources && chatData.sources.length > 0) {
      log('✅ RAG sources retrieved successfully', 'green');
      
      chatData.sources.forEach((source, index) => {
        log(`   Source ${index + 1}: ${source.title}`, 'cyan');
        log(`   Relevancy: ${source.relevancy?.toFixed(3) || 'N/A'}`, 'cyan');
        log(`   Similarity: ${source.similarity?.toFixed(3) || 'N/A'}`, 'cyan');
      });
      
      // Check if response contains expected keywords
      const responseText = chatData.content.toLowerCase();
      const foundKeywords = expectedKeywords.filter(keyword => 
        responseText.includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length > 0) {
        log(`✅ Response contains relevant keywords: ${foundKeywords.join(', ')}`, 'green');
      } else {
        log(`⚠️  Response may not be relevant (no expected keywords found)`, 'yellow');
      }
      
      return {
        success: true,
        sourcesCount: chatData.sources.length,
        responseLength: chatData.content.length,
        relevantKeywords: foundKeywords.length,
        response: chatData.content
      };
    } else {
      log('⚠️  No RAG sources found - may be using general knowledge only', 'yellow');
      return {
        success: false,
        sourcesCount: 0,
        responseLength: chatData.content.length,
        relevantKeywords: 0,
        response: chatData.content
      };
    }
    
  } catch (error) {
    log(`❌ Vectorize RAG test failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message
    };
  }
}

async function testHealthcareChat(query) {
  log(`\n🏥 Testing Healthcare Chat with query: "${query}"`, 'blue');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/healthcare-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'user', 
            content: query,
            location: {
              latitude: 34.0522,
              longitude: -118.2437,
              city: 'Los Angeles, CA',
              weather: {
                temperature: 72,
                condition: 'sunny',
                humidity: 65,
                windSpeed: 8,
                uvIndex: 6
              }
            }
          }
        ],
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(`Healthcare chat failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    log(`📝 Healthcare response length: ${data.message?.content?.length || 0} characters`, 'yellow');
    log(`🏥 Hospitals data: ${data.hospitals?.length || 0} hospitals`, 'yellow');
    log(`🛡️  Guardrail triggered: ${data.guardrail_triggered ? 'Yes' : 'No'}`, 'yellow');
    
    if (data.hospitals && data.hospitals.length > 0) {
      data.hospitals.forEach((hospital, index) => {
        log(`   Hospital ${index + 1}: ${hospital.name}`, 'cyan');
        log(`   Distance: ${hospital.distance || 'N/A'}`, 'cyan');
        log(`   Rating: ${hospital.rating || 'N/A'}`, 'cyan');
      });
    }
    
    return {
      success: true,
      responseLength: data.message?.content?.length || 0,
      hospitalsCount: data.hospitals?.length || 0,
      guardrailTriggered: data.guardrail_triggered
    };
    
  } catch (error) {
    log(`❌ Healthcare chat test failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message
    };
  }
}

async function testMultiAgentSystem() {
  log('\n🤖 Testing Multi-Agent System...', 'blue');
  
  try {
    const response = await fetch(`${BASE_URL}/api/multi-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          { 
            role: 'user', 
            content: 'Find me healthcare facilities using knowledge agent and location data'
          }
        ]
      })
    });
    
    if (response.ok) {
      log('✅ Multi-agent system is accessible', 'green');
      // Note: This is a streaming endpoint, so we just test accessibility
      return { success: true };
    } else {
      log(`⚠️  Multi-agent system returned: ${response.status}`, 'yellow');
      return { success: false, status: response.status };
    }
    
  } catch (error) {
    log(`❌ Multi-agent system test failed: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runComprehensiveTests() {
  log('🚀 Starting Vectorize RAG Testing Suite', 'magenta');
  log('===============================================', 'magenta');
  
  const results = {
    backendHealth: false,
    vectorizeTests: [],
    healthcareTests: [],
    multiAgentTest: false,
    timestamp: new Date().toISOString()
  };
  
  // Test backend health
  results.backendHealth = await testBackendHealth();
  
  // Test vectorize RAG with different queries
  for (const testCase of TEST_QUERIES) {
    log(`\n📋 Running test case: ${testCase.name}`, 'magenta');
    const result = await testVectorizeRAG(testCase.query, testCase.expectedKeywords);
    results.vectorizeTests.push({
      name: testCase.name,
      query: testCase.query,
      ...result
    });
    
    // Also test healthcare chat for medical queries
    if (testCase.name.includes('Healthcare') || testCase.name.includes('Medical')) {
      const healthcareResult = await testHealthcareChat(testCase.query);
      results.healthcareTests.push({
        name: testCase.name,
        query: testCase.query,
        ...healthcareResult
      });
    }
  }
  
  // Test multi-agent system
  const multiAgentResult = await testMultiAgentSystem();
  results.multiAgentTest = multiAgentResult.success;
  
  // Generate summary report
  log('\n📊 TEST SUMMARY REPORT', 'magenta');
  log('===============================================', 'magenta');
  
  log(`🏥 Backend Health: ${results.backendHealth ? '✅ PASS' : '❌ FAIL'}`, 
      results.backendHealth ? 'green' : 'red');
  
  const vectorizeSuccessCount = results.vectorizeTests.filter(t => t.success).length;
  log(`📚 Vectorize RAG Tests: ${vectorizeSuccessCount}/${results.vectorizeTests.length} PASSED`, 
      vectorizeSuccessCount === results.vectorizeTests.length ? 'green' : 'yellow');
  
  const healthcareSuccessCount = results.healthcareTests.filter(t => t.success).length;
  log(`🏥 Healthcare Chat Tests: ${healthcareSuccessCount}/${results.healthcareTests.length} PASSED`, 
      healthcareSuccessCount === results.healthcareTests.length ? 'green' : 'yellow');
  
  log(`🤖 Multi-Agent System: ${results.multiAgentTest ? '✅ ACCESSIBLE' : '❌ UNAVAILABLE'}`, 
      results.multiAgentTest ? 'green' : 'red');
  
  // Recommendations
  log('\n💡 RECOMMENDATIONS', 'cyan');
  if (!results.backendHealth) {
    log('   • Start the Python backend server on port 8000', 'yellow');
  }
  
  if (vectorizeSuccessCount === 0) {
    log('   • Check Vectorize API configuration and credentials', 'yellow');
    log('   • Verify VECTORIZE_PIPELINE_ACCESS_TOKEN is set', 'yellow');
  }
  
  if (vectorizeSuccessCount < results.vectorizeTests.length) {
    log('   • Some vectorize tests failed - check logs above for details', 'yellow');
  }
  
  log('\n🎯 For best results:', 'cyan');
  log('   • Ensure all environment variables are configured', 'cyan');
  log('   • Start both frontend (port 3000) and backend (port 8000)', 'cyan');
  log('   • Check network connectivity for external APIs', 'cyan');
  
  // Save results to file
  const fs = require('fs');
  const resultsFilename = `vectorize-test-results-${Date.now()}.json`;
  fs.writeFileSync(resultsFilename, JSON.stringify(results, null, 2));
  log(`\n💾 Detailed results saved to: ${resultsFilename}`, 'green');
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  runComprehensiveTests()
    .then(() => {
      log('\n✅ Testing completed!', 'green');
      process.exit(0);
    })
    .catch(error => {
      log(`\n❌ Testing failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { runComprehensiveTests, testVectorizeRAG, testHealthcareChat }; 