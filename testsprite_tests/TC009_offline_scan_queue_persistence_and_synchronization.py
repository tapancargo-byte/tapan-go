import requests
import time

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30

def offline_scan_queue_persistence_and_synchronization():
    scan_endpoint = f"{BASE_URL}/api/scans"
    get_sync_status_endpoint = f"{BASE_URL}/api/ops/sync-status"
    
    # Simulate offline scan event data
    offline_scan_data = {
        "barcode": "TESTBARCODE1234567890",
        "timestamp": int(time.time()),
        "location": "warehouse-A",
        "status": "pending"
    }

    try:
        # Step 1: Add scan event
        resp = requests.post(scan_endpoint, json=offline_scan_data, headers=HEADERS, timeout=TIMEOUT)
        assert resp.status_code in (200, 201), f"Expected status 200 or 201 on scan post, got {resp.status_code}"
        scan_id = resp.json().get("id")
        assert scan_id, "Scan response missing 'id'"

        # Step 2: Verify scan event exists
        scans_resp = requests.get(scan_endpoint, headers=HEADERS, timeout=TIMEOUT, params={"barcode": offline_scan_data["barcode"]})
        assert scans_resp.status_code == 200, "Failed to get scans on server"
        scans = scans_resp.json()
        assert any(scan.get("barcode") == offline_scan_data["barcode"] for scan in scans), "Scan event not found in server records"

        # Step 3: Optionally check sync status if available
        status_resp = requests.get(get_sync_status_endpoint, headers=HEADERS, timeout=TIMEOUT)
        if status_resp.status_code == 200:
            status_data = status_resp.json()
            assert isinstance(status_data.get("offlineQueueEmpty"), bool), "offlineQueueEmpty should be boolean in sync status"

    except requests.RequestException as e:
        assert False, f"HTTP request failed: {str(e)}"
    except AssertionError:
        raise
    except Exception as ex:
        assert False, f"Unexpected error occurred: {str(ex)}"

offline_scan_queue_persistence_and_synchronization()
