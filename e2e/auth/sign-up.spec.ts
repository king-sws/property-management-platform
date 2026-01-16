
// e2e/auth/sign-up.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sign-up')
  })

  test('should display sign up form with all elements', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Create your account')
    await expect(page.locator('text=I am a')).toBeVisible()
    await expect(page.locator('text=Tenant')).toBeVisible()
    await expect(page.locator('text=Landlord')).toBeVisible()
    await expect(page.locator('text=Vendor')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()
  })

  test('should default to TENANT role', async ({ page }) => {
    const tenantButton = page.locator('button:has-text("Tenant")')
    await expect(tenantButton).toHaveClass(/border-blue-600/)
  })

  test('should allow role selection', async ({ page }) => {
    await page.click('button:has-text("Landlord")')
    const landlordButton = page.locator('button:has-text("Landlord")')
    await expect(landlordButton).toHaveClass(/border-blue-600/)
    
    await page.click('button:has-text("Vendor")')
    const vendorButton = page.locator('button:has-text("Vendor")')
    await expect(vendorButton).toHaveClass(/border-blue-600/)
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Name must be at least 2 characters')).toBeVisible()
    await expect(page.locator('text=email')).toBeVisible()
  })

  test('should validate name length', async ({ page }) => {
    await page.fill('input[name="name"]', 'A')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=at least 2 characters')).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=valid email')).toBeVisible()
  })

  test('should show password strength requirements', async ({ page }) => {
    await page.fill('input[type="password"]', 'weak')
    
    await expect(page.locator('text=At least 8 characters')).toBeVisible()
    await expect(page.locator('text=One uppercase letter')).toBeVisible()
    await expect(page.locator('text=One lowercase letter')).toBeVisible()
    await expect(page.locator('text=One number')).toBeVisible()
  })

  test('should update password strength indicators', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]')
    
    await passwordInput.fill('a')
    await expect(page.locator('text=One lowercase letter').locator('..')).toContainText('✓')
    
    await passwordInput.fill('aA')
    await expect(page.locator('text=One uppercase letter').locator('..')).toContainText('✓')
    
    await passwordInput.fill('aA1')
    await expect(page.locator('text=One number').locator('..')).toContainText('✓')
    
    await passwordInput.fill('aA123456')
    await expect(page.locator('text=At least 8 characters').locator('..')).toContainText('✓')
  })

  test('should require terms acceptance', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=must accept the terms')).toBeVisible()
  })

  test('should show error for existing email', async ({ page }) => {
    const timestamp = Date.now()
    const email = `existing-${timestamp}@example.com`
    
    // Create user first
    await page.fill('input[name="name"]', 'First User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Try to sign up again with same email
    await page.goto('/sign-up')
    await page.fill('input[name="name"]', 'Second User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=already exists')).toBeVisible()
  })

  test('should successfully create TENANT account', async ({ page }) => {
    const timestamp = Date.now()
    const email = `tenant-${timestamp}@example.com`
    
    await page.click('button:has-text("Tenant")')
    await page.fill('input[name="name"]', 'Tenant User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Account created successfully')).toBeVisible()
  })

  test('should successfully create LANDLORD account with trial', async ({ page }) => {
    const timestamp = Date.now()
    const email = `landlord-${timestamp}@example.com`
    
    await page.click('button:has-text("Landlord")')
    await page.fill('input[name="name"]', 'Landlord User')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should successfully create VENDOR account', async ({ page }) => {
    const timestamp = Date.now()
    const email = `vendor-${timestamp}@example.com`
    
    await page.click('button:has-text("Vendor")')
    await page.fill('input[name="name"]', 'Vendor Business')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'TestPass123')
    await page.click('input[type="checkbox"]')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=Sign in')
    await expect(page).toHaveURL('/sign-in')
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input#password')
    // Find the eye icon button within the password field container
    const toggleButton = page.locator('input#password').locator('..').locator('button').last()
    
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    await toggleButton.click()
    await page.waitForTimeout(100)
    
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    await toggleButton.click()
    await page.waitForTimeout(100)
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
