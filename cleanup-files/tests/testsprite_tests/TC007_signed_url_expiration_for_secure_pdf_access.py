import requests
import time

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}"
}
TIMEOUT = 30

def test_signed_url_expiration_for_secure_pdf_access():
    # Step 1: Create a new invoice resource to generate signed URLs
    invoice_create_url = f"{BASE_URL}/api/invoices"
    invoice_payload = {
        # Minimal payload to create an invoice; adjust fields as per actual API schema
        "customer_id": "test-customer-id",
        "amount": 100.0,
        "due_date": "2025-12-31"
    }
    invoice_id = None
    try:
        create_resp = requests.post(invoice_create_url, json=invoice_payload, headers=HEADERS, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Invoice creation failed: {create_resp.text}"
        invoice_data = create_resp.json()
        invoice_id = invoice_data.get("id")
        assert invoice_id is not None, "Invoice ID not returned on creation"

        # Step 2: Request signed URL for invoice PDF
        signed_url_endpoint = f"{BASE_URL}/api/invoices/{invoice_id}/signed-url"
        signed_url_resp = requests.get(signed_url_endpoint, headers=HEADERS, timeout=TIMEOUT)
        assert signed_url_resp.status_code == 200, f"Failed to get signed URL: {signed_url_resp.text}"
        signed_url_data = signed_url_resp.json()
        signed_url = signed_url_data.get("signed_url")
        expires_in = signed_url_data.get("expires_in")  # assuming seconds till expiration
        assert signed_url is not None, "Signed URL not present in response"
        assert isinstance(expires_in, int) and expires_in > 0, "Invalid expires_in value"

        # Step 3: Access the signed URL immediately - should succeed
        immediate_resp = requests.get(signed_url, timeout=TIMEOUT)
        assert immediate_resp.status_code == 200, "Signed URL access failed immediately after generation"

        # Step 4: Wait until after expiration + margin, then access signed URL again - should fail
        wait_time = expires_in + 5
        time.sleep(wait_time)

        expired_resp = requests.get(signed_url, timeout=TIMEOUT)
        # Expecting 403 Forbidden or 401 Unauthorized or 404 Not Found depending on backend implementation
        assert expired_resp.status_code in [401, 403, 404], f"Signed URL still accessible after expiration, status code: {expired_resp.status_code}"

        # Step 5: Repeat steps for barcode PDF signed URL (assuming an API exists to get barcode PDF signed URL)
        # Create a barcode resource for test (minimal example)
        barcode_create_url = f"{BASE_URL}/api/barcodes"
        barcode_payload = {
            "code": "TESTCODE12345",
            "description": "Test barcode for signed URL expiration"
        }
        barcode_id = None
        barcode_resp = requests.post(barcode_create_url, json=barcode_payload, headers=HEADERS, timeout=TIMEOUT)
        assert barcode_resp.status_code == 201, f"Barcode creation failed: {barcode_resp.text}"
        barcode_data = barcode_resp.json()
        barcode_id = barcode_data.get("id")
        assert barcode_id is not None, "Barcode ID not returned on creation"

        try:
            signed_url_barcode_endpoint = f"{BASE_URL}/api/barcodes/{barcode_id}/signed-url"
            signed_url_barcode_resp = requests.get(signed_url_barcode_endpoint, headers=HEADERS, timeout=TIMEOUT)
            assert signed_url_barcode_resp.status_code == 200, f"Failed to get barcode signed URL: {signed_url_barcode_resp.text}"
            signed_url_barcode_data = signed_url_barcode_resp.json()
            barcode_signed_url = signed_url_barcode_data.get("signed_url")
            barcode_expires_in = signed_url_barcode_data.get("expires_in")
            assert barcode_signed_url is not None, "Barcode signed URL not present"
            assert isinstance(barcode_expires_in, int) and barcode_expires_in > 0, "Invalid barcode expires_in"

            # Access immediately - should succeed
            barcode_immediate_resp = requests.get(barcode_signed_url, timeout=TIMEOUT)
            assert barcode_immediate_resp.status_code == 200, "Barcode signed URL access failed immediately after generation"

            # Wait for expiration + margin and retry - should fail
            time.sleep(barcode_expires_in + 5)
            barcode_expired_resp = requests.get(barcode_signed_url, timeout=TIMEOUT)
            assert barcode_expired_resp.status_code in [401,403,404], f"Barcode signed URL still accessible after expiration, status code: {barcode_expired_resp.status_code}"

        finally:
            if barcode_id:
                delete_barcode_resp = requests.delete(f"{BASE_URL}/api/barcodes/{barcode_id}", headers=HEADERS, timeout=TIMEOUT)
                # Not asserting delete success, just cleanup

    finally:
        if invoice_id:
            delete_invoice_resp = requests.delete(f"{BASE_URL}/api/invoices/{invoice_id}", headers=HEADERS, timeout=TIMEOUT)
            # Not asserting delete success, just cleanup

test_signed_url_expiration_for_secure_pdf_access()
