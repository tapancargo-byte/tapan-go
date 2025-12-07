import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Locate and load various glassmorphic components such as versatile cards and animated cards on desktop.
        await page.mouse.wheel(0, 600)
        

        # -> Test interactive states such as hover, focus, and click on visible card components to check for animations and style changes.
        frame = context.pages[-1]
        # Click on 'Air Cargo' card to test interaction and animation.
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/div[4]/main/section[3]/div/div[2]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform hover and focus interactions on the 'Air Cargo', 'Road Transport', and 'End-to-End Service' cards to check for animations and style changes.
        frame = context.pages[-1]
        # Hover over 'Air Cargo' card to test hover animation and style changes.
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/div[4]/main/section[3]/div/div[2]/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform hover and focus interactions on 'Road Transport' and 'End-to-End Service' cards to check for animations and style changes.
        frame = context.pages[-1]
        # Hover over 'Road Transport' card to test hover animation and style changes.
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/div[4]/main/section[3]/div/div[2]/div[2]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Perform hover and focus interaction on 'End-to-End Service' card to check for animations and style changes.
        frame = context.pages[-1]
        # Hover over 'End-to-End Service' card to test hover animation and style changes.
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/div[4]/main/section[3]/div/div[2]/div[3]/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test click interaction on the 'Track Your Shipment' input and button to check for interactive states and animations.
        frame = context.pages[-1]
        # Focus on 'Tracking number' input to test focus state and interaction.
        elem = frame.locator('xpath=html/body/div/div[3]/div[2]/div/div[2]/div[4]/main/section[4]/div/div/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test the page on mobile viewport to check responsive layout and visual consistency of the current components.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to mobile dimensions to test responsive layout and visual consistency of glassmorphic or card components.
        await page.mouse.wheel(0, 300)
        

        # -> Resize viewport to mobile dimensions to test responsive layout and visual consistency of glassmorphic or card components.
        await page.mouse.wheel(0, 300)
        

        # -> Resize viewport to mobile dimensions and verify visual consistency and usability of card components.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Resize viewport to mobile dimensions and verify visual consistency and usability of card components.
        await page.mouse.wheel(0, 300)
        

        # -> Resize viewport to mobile dimensions and verify visual consistency and usability of card components.
        await page.mouse.wheel(0, 300)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Air Cargo').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Road Transport').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=End-to-End Service').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track Your Shipment').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Rapid air freight between Imphal and New Delhi, ideal for time-sensitive and perishable shipments with real-time tracking.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cost-effective overland cargo for bulk shipments and regular supply chain needs between New Delhi and Imphal.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Single-point coordination including pickup, documentation, customs, and last-mile delivery.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    