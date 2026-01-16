
// e2e/auth/sign-in.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-in')
  })

  test('should display sign in form with all elements', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Welcome back')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in')
    await expect(page.locator('text=Forgot password?')).toBeVisible()
    await expect(page.locator('text=Sign up for free')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=email')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=valid email')).toBeVisible()
  })

  test('should show error for non-existent user', async ({ page }) => {
    await page.fill('input[type="email"]', 'nonexistent@example.com')
    await page.fill('input[type="password"]', 'WrongPass123')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input#password')
    // Find the toggle button next to password input
    const toggleButton = page.locator('input#password + button').or(
      page.locator('input#password ~ button').first()
    )
    
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await toggleButton.click()
    await page.waitForTimeout(100) // Small wait for state update
    
    // Check if type changed
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Toggle back
    await toggleButton.click()
    await page.waitForTimeout(100)
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should successfully sign in with valid credentials', async ({ page }) => {
    // Create a test user first
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`
    const password = 'TestPass123'
    
    // Navigate to sign up to create user
    await page.goto('/sign-up')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Sign out
    await page.goto('/sign-in')
    
    // Sign in
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.click('text=Forgot password?')
    await expect(page).toHaveURL('/forgot-password')
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.click('text=Sign up for free')
    await expect(page).toHaveURL('/sign-up')
  })

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    // Create and login user
    const timestamp = Date.now()
    const email = `test-${timestamp}@example.com`
    
    await page.goto('/sign-up')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Try to access sign-in page
    await page.goto('/sign-in')
    await expect(page).toHaveURL('/dashboard')
  })
})
