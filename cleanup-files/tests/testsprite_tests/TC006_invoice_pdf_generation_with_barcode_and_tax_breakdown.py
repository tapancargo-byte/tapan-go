import requests

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Accept": "application/json",
}

def test_invoice_pdf_generation_with_barcode_and_tax_breakdown():
    timeout = 30
    invoice_id = None
    try:
        # Step 1: Create a new invoice to test PDF generation.
        # Payload example includes barcode data and tax breakdown, matching expected schema.
        create_payload = {
            "customer_id": "test-customer-001",
            "items": [
                {
                    "description": "Test product 1",
                    "quantity": 2,
                    "unit_price": 50.00,
                    "barcode": "123456789012",
                    "taxes": [
                        {"type": "VAT", "rate": 0.1, "amount": 10.0},
                        {"type": "Service Tax", "rate": 0.05, "amount": 5.0}
                    ]
                }
            ],
            "tax_breakdown": {
                "VAT": 10.0,
                "Service Tax": 5.0
            },
            "total_amount": 110.00,
            "currency": "USD",
            "notes": "Invoice created for PDF generation test with barcode and tax breakdown."
        }
        create_response = requests.post(
            f"{BASE_URL}/api/invoices",
            headers=HEADERS,
            json=create_payload,
            timeout=timeout
        )
        assert create_response.status_code == 201, f"Invoice creation failed: {create_response.text}"
        invoice = create_response.json()
        invoice_id = invoice.get("id")
        assert invoice_id, "Invoice ID missing from creation response"

        # Step 2: Request PDF generation for the created invoice.
        pdf_response = requests.post(
            f"{BASE_URL}/api/invoices/{invoice_id}/generate-pdf",
            headers=HEADERS,
            timeout=timeout
        )
        # Expecting success status, content-type PDF, and content length > 0
        assert pdf_response.status_code == 200, f"PDF generation failed: {pdf_response.text}"
        content_type = pdf_response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type.lower(), f"Unexpected content-type: {content_type}"
        assert pdf_response.content and len(pdf_response.content) > 1000, "PDF content is empty or too small"

        # Step 3: Validate some text presence in PDF bytes (rudimentary check)
        # Since PDF binary, check for known literal strings in content bytes
        pdf_text_snippet = b"Barcode"
        assert pdf_text_snippet in pdf_response.content, "Barcode text not found in PDF content"

        tax_snippet = b"VAT"
        assert tax_snippet in pdf_response.content, "Tax breakdown info not found in PDF content"

    finally:
        # Cleanup: delete invoice after test if created
        if invoice_id:
            try:
                del_response = requests.delete(
                    f"{BASE_URL}/api/invoices/{invoice_id}",
                    headers=HEADERS,
                    timeout=timeout
                )
                # Accept 200 or 204 as success for deletion
                assert del_response.status_code in (200, 204), f"Invoice deletion failed: {del_response.text}"
            except Exception:
                pass

test_invoice_pdf_generation_with_barcode_and_tax_breakdown()