import requests
import json

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "Content-Type": "application/json",
    "access-token": API_KEY
}
TIMEOUT = 30

def test_api_response_consistency_and_error_handling():
    endpoints = [
        # Common core API routes based on PRD "Supabase-backed Logistics APIs"
        # Covering barcodes, customers, invoices, manifests, finance, payments, scans, search, ops, whatsapp
        {"method": "GET", "path": "/api/barcodes"},
        {"method": "GET", "path": "/api/customers"},
        {"method": "GET", "path": "/api/invoices"},
        {"method": "GET", "path": "/api/manifests"},
        {"method": "GET", "path": "/api/finance"},
        {"method": "GET", "path": "/api/payments"},
        {"method": "GET", "path": "/api/scans"},
        {"method": "GET", "path": "/api/search"},
        {"method": "GET", "path": "/api/ops"},
        {"method": "GET", "path": "/api/whatsapp"},

        # To further test endpoints that might require resource creation for typing tests,
        # will create minimal resources as needed below, but first test GET for baseline.

        # POST create invoice (minimal payload simulated)
        {"method": "POST", "path": "/api/invoices", "payload": {
            "customerId": "test-customer-id",
            "items": [{"description": "Test Item", "quantity": 1, "price": 10.0}],
            "dueDate": "2025-12-31"
        }},

        # POST create barcode
        {"method": "POST", "path": "/api/barcodes", "payload": {
            "code": "TESTCODE1234",
            "description": "Test barcode"
        }},

        # POST create manifest
        {"method": "POST", "path": "/api/manifests", "payload": {
            "origin": "Warehouse A",
            "destination": "Warehouse B",
            "airline": "TestAir"
        }},

        # POST WhatsApp message (simulate send)
        {"method": "POST", "path": "/api/whatsapp/send", "payload": {
            "phone": "+1234567890",
            "message": "Test invoice notification"
        }},
    ]

    # Helper to make request and validate response
    def make_request(endpoint):
        method = endpoint["method"].upper()
        url = BASE_URL + endpoint["path"]
        payload = endpoint.get("payload")
        try:
            if method == "GET":
                resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
            elif method == "POST":
                resp = requests.post(url, headers=HEADERS, json=payload, timeout=TIMEOUT)
            elif method == "PUT":
                resp = requests.put(url, headers=HEADERS, json=payload, timeout=TIMEOUT)
            elif method == "DELETE":
                resp = requests.delete(url, headers=HEADERS, timeout=TIMEOUT)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            return resp
        except requests.exceptions.RequestException as e:
            assert False, f"Request to {url} failed with exception: {e}"

    def validate_response(resp, expect_success=True):
        # Some endpoints like /api/ops and /api/whatsapp GET might return empty or non-JSON responses
        # Skip JSON validation if content-type not JSON and successful for those endpoints
        allowed_non_json_paths = ["/api/ops", "/api/whatsapp", "/api/whatsapp/send"]
        request_path = resp.request.path_url.split('?')[0]  # Strip query string if any

        if any(request_path.startswith(p) for p in allowed_non_json_paths) and 200 <= resp.status_code < 300:
            # For these endpoints, if content-type does not start with JSON, skip JSON checks
            if not resp.headers.get("Content-Type", "").startswith("application/json"):
                return

        assert resp.headers.get("Content-Type", "").startswith("application/json"), "Response is not JSON"
        try:
            body = resp.json()
        except json.JSONDecodeError:
            assert False, "Response body is not valid JSON"
        if expect_success:
            assert 200 <= resp.status_code < 300, f"Expected success status code, got {resp.status_code}"
            # Basic check that body is a dict or list
            assert isinstance(body, (dict, list)), "Response JSON is not dict or list"
            # Check for typical keys for success responses
            # This varies by endpoint; we do generic sanity checks here
        else:
            # For errors, expect error fields and proper status codes
            assert resp.status_code >= 400, f"Expected error status code, got {resp.status_code}"
            # Typical error response shape: {"error": ..., "message": ..., "code": ...}
            assert isinstance(body, dict), "Error response JSON must be a dict"
            assert "error" in body or "message" in body, "Error response missing error or message field"

    # Run tests for each endpoint - normal success cases for GET, POST where applicable
    created_resources = {
        "invoices": [],
        "barcodes": [],
        "manifests": []
    }

    for endpoint in endpoints:
        resp = make_request(endpoint)
        if resp.status_code >= 400:
            # For POST success endpoints, this might mean some validation error because payload is dummy.
            # Accept this but ensure error response structure is consistent
            validate_response(resp, expect_success=False)
        else:
            validate_response(resp, expect_success=True)
            # Save created resource IDs if possible for cleanup
            if endpoint["method"] == "POST" and resp.status_code in (200,201):
                body = resp.json()
                # Attempt to find id field
                res_id = None
                if isinstance(body, dict):
                    for key in ("id", "_id", "invoiceId", "barcodeId", "manifestId"):
                        if key in body:
                            res_id = body[key]
                            break
                if res_id:
                    if endpoint["path"].startswith("/api/invoices"):
                        created_resources["invoices"].append(res_id)
                    elif endpoint["path"].startswith("/api/barcodes"):
                        created_resources["barcodes"].append(res_id)
                    elif endpoint["path"].startswith("/api/manifests"):
                        created_resources["manifests"].append(res_id)

    # Test error handling with invalid requests: invalid endpoint, missing auth, invalid payload
    # 1. Invalid endpoint
    resp_invalid = requests.get(BASE_URL + "/api/invalidendpoint", headers=HEADERS, timeout=TIMEOUT)
    assert resp_invalid.status_code == 404 or resp_invalid.status_code == 400, "Invalid endpoint did not return error"
    try:
        err_body = resp_invalid.json()
        assert isinstance(err_body, dict), "Invalid endpoint error response not JSON object"
    except json.JSONDecodeError:
        assert False, "Invalid endpoint error response not JSON"

    # 2. Missing authentication
    resp_no_auth = requests.get(BASE_URL + "/api/invoices", timeout=TIMEOUT)
    assert resp_no_auth.status_code in (401, 403), "Missing auth did not result in unauthorized/forbidden"
    try:
        err_body = resp_no_auth.json()
        assert "error" in err_body or "message" in err_body, "Missing auth error response missing error/message"
    except json.JSONDecodeError:
        assert False, "Missing auth error response not JSON"

    # 3. Invalid payload for POST invoice creation (e.g., missing required fields)
    resp_invalid_payload = requests.post(
        BASE_URL + "/api/invoices",
        headers=HEADERS,
        json={"invalidField": "invalidValue"},
        timeout=TIMEOUT
    )
    assert resp_invalid_payload.status_code >= 400, "Invalid payload did not cause error"
    try:
        err_body = resp_invalid_payload.json()
        assert "error" in err_body or "message" in err_body, "Invalid payload error response missing error/message"
    except json.JSONDecodeError:
        assert False, "Invalid payload error response not JSON"

    # Cleanup created resources
    def try_delete(path, res_id):
        try:
            del_resp = requests.delete(f"{BASE_URL}{path}/{res_id}", headers=HEADERS, timeout=TIMEOUT)
            # Accept 200,204 or 404 (already deleted)
            assert del_resp.status_code in (200,204,404), f"Failed to delete resource {res_id} at {path}"
        except requests.exceptions.RequestException:
            pass  # Ignore deletion errors for cleanup

    for invoice_id in created_resources["invoices"]:
        try_delete("/api/invoices", invoice_id)

    for barcode_id in created_resources["barcodes"]:
        try_delete("/api/barcodes", barcode_id)

    for manifest_id in created_resources["manifests"]:
        try_delete("/api/manifests", manifest_id)

test_api_response_consistency_and_error_handling()
