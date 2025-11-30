import requests
import uuid

BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
HEADERS = {
    "Content-Type": "application/json"
}

# Credentials for testing - should be valid user with permissions
TEST_USER_EMAIL = "ops@example.com"
TEST_USER_PASSWORD = "password123"  # This must be a valid password in test environment


def get_auth_token():
    # This is a placeholder for login; adapt as necessary to the actual login API
    login_payload = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json=login_payload,
        headers=HEADERS,
        timeout=30
    )
    assert resp.status_code == 200, f"Login failed: {resp.status_code} {resp.text}"
    data = resp.json()
    token = data.get("access_token") or data.get("token")
    assert token, "No access token returned on login"
    return token


def test_manifest_finalization_and_scan_aggregation():
    token = get_auth_token()
    AUTH_HEADERS = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    manifest_id = None
    scanned_barcodes = [
        {"barcode": f"TEST-BARCODE-{uuid.uuid4()}", "package_info": "Sample Package 1"},
        {"barcode": f"TEST-BARCODE-{uuid.uuid4()}", "package_info": "Sample Package 2"}
    ]
    origin = "JFK"
    destination = "LAX"
    airline = "TestAir"

    try:
        # Step 1: Create a new manifest resource
        create_manifest_payload = {
            "origin": origin,
            "destination": destination,
            "airline": airline,
            "status": "open"
        }
        resp_create = requests.post(
            f"{BASE_URL}/api/manifests",
            json=create_manifest_payload,
            headers=AUTH_HEADERS,
            timeout=30
        )
        assert resp_create.status_code == 201, f"Manifest creation failed: {resp_create.status_code} {resp_create.text}"
        manifest = resp_create.json()
        assert "id" in manifest, "Created manifest response missing 'id'"
        manifest_id = manifest["id"]

        # Step 2: Add scanned barcodes to the manifest scanning session
        for scan in scanned_barcodes:
            scan_payload = {
                "manifestId": manifest_id,
                "barcode": scan["barcode"],
                "packageInfo": scan["package_info"]
            }
            resp_scan = requests.post(
                f"{BASE_URL}/api/scans",
                json=scan_payload,
                headers=AUTH_HEADERS,
                timeout=30
            )
            assert resp_scan.status_code == 201, f"Scan event creation failed for barcode {scan['barcode']}: {resp_scan.status_code} {resp_scan.text}"
            scan_resp_json = resp_scan.json()
            assert scan_resp_json.get("barcode") == scan["barcode"], "Barcode mismatch in scan event response"
            assert scan_resp_json.get("manifestId") == manifest_id, "Manifest ID mismatch in scan event response"

        # Step 3: Finalize the manifest to aggregate scans and update details
        finalize_payload = {
            "origin": origin,
            "destination": destination,
            "airline": airline
        }
        resp_finalize = requests.post(
            f"{BASE_URL}/api/manifests/{manifest_id}/finalize",
            json=finalize_payload,
            headers=AUTH_HEADERS,
            timeout=30
        )
        assert resp_finalize.status_code == 200, f"Manifest finalization failed: {resp_finalize.status_code} {resp_finalize.text}"
        finalized_manifest = resp_finalize.json()

        # Step 4: Validate that the manifest record is updated with aggregated scanned barcodes and details
        assert finalized_manifest.get("origin") == origin, "Manifest origin mismatch after finalization"
        assert finalized_manifest.get("destination") == destination, "Manifest destination mismatch after finalization"
        assert finalized_manifest.get("airline") == airline, "Manifest airline mismatch after finalization"

        aggregated_barcodes = finalized_manifest.get("scannedBarcodes") or finalized_manifest.get("barcodes") or []
        assert len(aggregated_barcodes) >= len(scanned_barcodes), "Aggregated barcodes count less than scanned"

        scanned_barcodes_set = {s["barcode"] for s in scanned_barcodes}
        # Handle case where aggregated_barcodes might be list of strings or objects with barcode fields
        if aggregated_barcodes and isinstance(aggregated_barcodes[0], dict) and "barcode" in aggregated_barcodes[0]:
            aggregated_barcodes_set = {b["barcode"] for b in aggregated_barcodes}
        else:
            aggregated_barcodes_set = set(aggregated_barcodes)

        assert scanned_barcodes_set.issubset(aggregated_barcodes_set), "Not all scanned barcodes aggregated in manifest"

    finally:
        if manifest_id:
            try:
                resp_scans = requests.get(
                    f"{BASE_URL}/api/scans?manifestId={manifest_id}",
                    headers=AUTH_HEADERS,
                    timeout=30,
                )
                if resp_scans.status_code == 200:
                    scans_list = resp_scans.json()
                    for scan_item in scans_list:
                        scan_id = scan_item.get("id")
                        if scan_id:
                            requests.delete(
                                f"{BASE_URL}/api/scans/{scan_id}",
                                headers=AUTH_HEADERS,
                                timeout=30,
                            )
            except Exception:
                pass

            try:
                requests.delete(
                    f"{BASE_URL}/api/manifests/{manifest_id}",
                    headers=AUTH_HEADERS,
                    timeout=30
                )
            except Exception:
                pass


test_manifest_finalization_and_scan_aggregation()
