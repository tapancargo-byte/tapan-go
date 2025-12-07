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
        # -> Input a sample shipment reference number and submit to verify shipment timeline and map rendering.
        frame = context.pages[-1]
        # Input a sample shipment reference number to track shipment
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/div[2]/div[4]/div[2]/main/section/div/div/div/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('TEST123456789')
        

        frame = context.pages[-1]
        # Click the Track button to submit shipment reference and load shipment details
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/div[2]/div[4]/div[2]/main/section/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=TAPAN').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ASSOCIATE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track your shipment').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Enter your shipment reference or barcode number to view the latest status and scan history.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=No shipment or barcode found for this reference').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Data is updated as your packages are scanned at different locations.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=If you think there is an issue with your shipment, please contact customer support.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tapan Go ops teams can access deeper telemetry in the internal dashboard.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    