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
        # -> Resize viewport to tablet dimensions and verify UI responsiveness and visual integrity.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        await page.mouse.wheel(0, await page.evaluate('() => window.innerHeight'))
        

        frame = context.pages[-1]
        # Toggle theme button to check animation and style consistency
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/div[2]/div[4]/div[2]/header/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Resize viewport to mobile dimensions and verify UI responsiveness and visual integrity.
        await page.goto('http://localhost:3000/', timeout=10000)
        await asyncio.sleep(3)
        

        # -> Perform accessibility testing using keyboard navigation and screen reader compatibility tools to verify compliance with accessibility standards.
        frame = context.pages[-1]
        # Focus input field for keyboard navigation test
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/div[2]/div[4]/div[2]/main/section/div/div/div/div/form/input').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        # Click Track button to verify keyboard operability
        elem = frame.locator('xpath=html/body/div/div[2]/div[2]/div/div[2]/div[4]/div[2]/main/section/div/div/div/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=TAPAN').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ASSOCIATE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CORE OPERATIONS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DASHBOARD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=WAREHOUSE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SHIPMENTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=INVENTORY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=MANAGEMENT & BILLING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CUSTOMERS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=INVOICES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=RATES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=AIRCARGO MANIFESTO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=MANIFEST SCAN SESSION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BARCODE TRACKING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAPAN ASSOCIATE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=GLOBAL SEARCH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REPORTS & ANALYTICS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NETWORK ANALYTICS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=EXCEPTIONS & ALERTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NOTIFICATIONS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SUPPORT TICKETS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=OPS ACTIVITY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SETTINGS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ADMIN').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tapan Go Ops').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Operator').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cargo Operations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Network overview of revenue, shipments, and tickets').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REVENUE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TOTAL THIS YEAR').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ITEMS IN TRANSIT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ACTIVE SHIPMENTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CUSTOMER TICKETS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=OPEN SUPPORT TICKETS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ACTIVE WAREHOUSES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ONLINE FACILITIES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LOW STOCK SKUS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=BELOW MINIMUM STOCK').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Growth projections').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Next 90 days').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REVENUE GROWTH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=@NEXT_12_MONTHS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Projected 0.0% vs last year').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Current year ₹0.0M').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SHIPMENT VOLUME').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=10 index').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Projected 0.0% shipments growth').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Based on year-over-year shipment trend').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TICKET LOAD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=1 index').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=~1 active tickets projected in 90 days').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Resolution trend not available').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NETWORK CAPACITY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=@ROUTE_UTILIZATION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=15050 index').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Avg shipment weight 150.5 kg').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Higher average weight signals denser routes').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REVENUE GROWTH outlook').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=PREVIEW').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Growth KPIs').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tracking').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=[LAST 30 DAYS]').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SHIPMENTS GROWTH').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TICKET RESOLUTION').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=0%').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=[AT RISK]').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=REVENUE GROWTH insight').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SCENARIO PREVIEW').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=This panel will highlight trends behind 0% and the revenue growth metric as more live data is ingested into the dashboard.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=FUTURE: CLICK-THROUGH TO UNDERLYING INVOICES, SHIPMENTS AND SUPPORT TICKETS FROM THIS KPI.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NORTHEAST CARGO OPERATIONS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=15 Years Connecting').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Imphal & Delhi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=With Speed and Trust').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=98.4% on-time · last 90 days').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Direct corridor · Imphal · New Delhi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=The most experienced cargo partner for air & road shipments between Imphal and Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRACK SHIPMENT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ON-TIME DELIVERIES · LAST 90 DAYS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=98.4%').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Across the Imphal–Delhi corridor.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=27').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ACTIVE LOADS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=4').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=LANES MONITORED').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Enter a shipment reference or barcode to see live status. No login needed.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Track').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRUSTED BY OPERATIONS TEAMS AT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Imphal retail cluster').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Delhi consolidation partners').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Imphal–Delhi FMCG shippers').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Northeast e-commerce shippers').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SERVICES').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=How Tapan Associate moves freight between Imphal and New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SYS_V.2.0.4 · LIVE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Services for Imphal–Delhi lane').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Direct air and road departures between Imphal and New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Scheduled departures on the Imphal–Delhi corridor.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Pickup and delivery windows agreed up front.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Single point of contact from booking to delivery.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRACKING').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Live shipment status from pickup in Imphal to delivery in New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ON-TIME DELIVERIES · LAST 90 DAYS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=98.4%').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Based on confirmed departures and arrivals between Imphal and New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=RECENT TRACKING EVENTS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=· IMH → DEL line-haul departed · 04:12').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=· IMH → DEL line-haul arrived at Delhi hub · 09:45').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=· Exception ticket acknowledged by ops desk · Today, 11:15').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TRACKING LANES OVERVIEW').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IMPHAL · NEW DELHI').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Live lane focus').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Illustrative map').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NETWORK').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=The Imphal–Delhi line-haul and hub structure behind your shipments.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Imphal–Delhi network').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Hubs and fleet anchored in Imphal and New Delhi for predictable transits.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Dedicated Imphal–Delhi line-haul corridor.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Secure hubs with consistent departures.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Capacity tuned for regional demand.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=HUB').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DEL').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IMF').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IXB').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CCU').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=SUPPORT').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=When something goes wrong on the Imphal–Delhi lane, how Tapan Associate helps you recover quickly.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Support channels').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=for customers & partners').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Shipment delays').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Escalate when a load is running late or has stopped moving.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Delivery & POD').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Questions on delivery status, proof of delivery or reattempts.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Documents & billing').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Invoices, GST, e-way bills and supporting documentation.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Claims & damage').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Log an incident when freight is short, pilfered or damaged.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About Tapan Associate').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Cargo lanes, hubs and operations focused on keeping freight moving between Imphal and New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Northeast–Delhi specialist').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=15+ years moving air and surface cargo between Imphal and New Delhi.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Reliable network & schedules').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Line-haul and hub timings tuned for predictable transits even in peak season.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Air + surface combinations').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Balanced options for time-critical moves and cost-sensitive cargo, lane by lane.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Operations built for exceptions').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Escalation playbooks, incident logging and recovery flows keep freight moving when plans change.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Documents & compliance').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Support for GST, e-way bills and PODs so finance and compliance teams stay unblocked.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Live visibility for teams').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Simple public tracking at /track and internal dashboards for ops, customer and partner teams.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=OPS DNA · IMPHAL–DELHI LANE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=IMPHAL · NEW DELHI').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=YEARS IN LANE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=15+').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CORE HUBS').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Exception handling playbooks for missed departures.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Finance-ready documents: GST, e-way bills, PODs.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Live tracking at /track for customers and partners.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAPAN').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ASSOCIATE').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Powered by Arra-Core.').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Services').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Tracking').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Network').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Support').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=About').nth(1)).to_be_visible(timeout=30000)
        await expect(frame.locator('text=2025 Tapan Associate').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=FRIDAY').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=DECEMBER 5, 2025').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Collapse panel').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=12:41 AM').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=30°C / CLEAR').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=NEW DELHI, INDIA').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ASIA/KOLKATA').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=TAPAN GO').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=CARGO SERVICE').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=A seamless cargo service for Northeast and Delhi.').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    