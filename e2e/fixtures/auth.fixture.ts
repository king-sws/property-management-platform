/* eslint-disable react-hooks/rules-of-hooks */

// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test'
import { SignUpWithCredentials } from '@/actions/action'

type AuthFixtures = {
  authenticatedUser: {
    email: string
    password: string
    name: string
    role: 'LANDLORD' | 'TENANT' | 'VENDOR'
  }
}

export const test = base.extend<AuthFixtures>({
  authenticatedUser: async ({ page }, use) => {
    const timestamp = Date.now()
    const user = {
      email: `test-${timestamp}@example.com`,
      password: 'TestPass123',
      name: 'Test User',
      role: 'TENANT' as const,
    }

    // Create user
    await SignUpWithCredentials(user.name, user.email, user.password, user.role)

    // Login
    await page.goto('/sign-in')
    await page.fill('input[type="email"]', user.email)
    await page.fill('input[type="password"]', user.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await use(user)

    // Cleanup can be added here if needed
  },
})
export { expect } from '@playwright/test'
