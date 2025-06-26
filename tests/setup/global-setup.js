module.exports = async () => {
  // Set up global test environment
  console.log('Setting up global test environment...')
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_ENVIRONMENT = 'test'
  
  // Mock external services
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
  process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'
  process.env.FORMSPREE_FORM_ID = 'test_form_id'
  process.env.TIDIO_PUBLIC_KEY = 'test_tidio_key'
  process.env.GOOGLE_ANALYTICS_ID = 'test_ga_id'
  
  // Database setup (if needed)
  // await setupTestDatabase()
  
  // Mock server setup (if needed)
  // await startMockServer()
  
  console.log('Global test environment setup complete')
}