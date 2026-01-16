
// e2e/auth/middleware.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Middleware Protection', () => {
  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/properties',
      '/leases',
      '/payments',
      '/settings',
      '/profile',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(/\/sign-in/)
      await expect(page.url()).toContain(`callbackUrl=${encodeURIComponent(route)}`)
    }
  })

  test('should redirect authenticated users from auth pages', async ({ page }) => {
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
    
    // Try to access auth pages
    await page.goto('/sign-in')
    await expect(page).toHaveURL('/dashboard')
    
    await page.goto('/sign-up')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should allow access to public routes', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/sign-in/)
  })
})