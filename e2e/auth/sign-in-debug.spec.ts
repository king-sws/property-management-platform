// e2e/auth/sign-in-debug.spec.ts
// Run this test to debug the password toggle issue
import { test, expect } from '@playwright/test'

test.describe('Debug Password Toggle', () => {
  test('inspect password field structure', async ({ page }) => {
    await page.goto('/sign-in')
    
    // Wait for page to load
    await page.waitForSelector('input[type="password"]')
    
    // Get the password input
    const passwordInput = page.locator('input#password').or(
      page.locator('input[type="password"]').first()
    )
    
    // Log the input element
    const inputHTML = await passwordInput.evaluate(el => el.outerHTML)
    console.log('Password Input HTML:', inputHTML)
    
    // Find parent container
    const container = passwordInput.locator('..')
    const containerHTML = await container.evaluate(el => el.outerHTML)
    console.log('Container HTML:', containerHTML)
    
    // Find all buttons near password input
    const buttons = await page.locator('button').all()
    console.log('Total buttons on page:', buttons.length)
    
    for (let i = 0; i < buttons.length; i++) {
      const btnText = await buttons[i].textContent()
      const btnHTML = await buttons[i].evaluate(el => el.outerHTML.substring(0, 100))
      console.log(`Button ${i}:`, { text: btnText, html: btnHTML })
    }
    
    // Try to find the toggle button by different methods
    console.log('\n=== Testing Different Selectors ===')
    
    // Method 1: By aria-label
    const byAriaLabel = page.locator('button[aria-label*="password"]')
    console.log('Found by aria-label:', await byAriaLabel.count())
    
    // Method 2: By data-testid
    const byTestId = page.locator('[data-testid="toggle-password"]')
    console.log('Found by data-testid:', await byTestId.count())
    
    // Method 3: By SVG (Eye icon)
    const bySVG = page.locator('button:has(svg)')
    console.log('Found buttons with SVG:', await bySVG.count())
    
    // Method 4: Within password container
    const withinContainer = container.locator('button')
    console.log('Found within container:', await withinContainer.count())
    
    // Take a screenshot
    await page.screenshot({ path: 'password-field-debug.png' })
  })
  
  test('test password toggle functionality', async ({ page }) => {
    await page.goto('/sign-in')
    
    const passwordInput = page.locator('input#password').or(
      page.locator('input[type="password"]').first()
    )
    
    // Get initial type
    const initialType = await passwordInput.getAttribute('type')
    console.log('Initial type:', initialType)
    
    // Try different button selectors
    const possibleSelectors = [
      'button[aria-label*="password"]',
      '[data-testid="toggle-password"]',
      'input#password ~ button',
      'div:has(input#password) button',
    ]
    
    for (const selector of possibleSelectors) {
      const button = page.locator(selector)
      const count = await button.count()
      
      if (count > 0) {
        console.log(`\nTrying selector: ${selector} (found ${count})`)
        
        try {
          await button.first().click({ timeout: 1000 })
          await page.waitForTimeout(200)
          
          const newType = await passwordInput.getAttribute('type')
          console.log('Type after click:', newType)
          
          if (newType !== initialType) {
            console.log('✅ SUCCESS! This selector works:', selector)
            return
          }
        } catch (error) {
          console.log('❌ Failed:', error.message)
        }
      }
    }
  })
})
