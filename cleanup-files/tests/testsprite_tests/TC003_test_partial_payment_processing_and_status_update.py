import requests
import uuid

BASE_URL = "http://localhost:3000"
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_partial_payment_processing_and_status_update():
    invoice_id = None
    try:
        # Step 1: Create a new invoice resource to ensure test isolation
        create_invoice_payload = {
            "customerId": str(uuid.uuid4()),
            "items": [
                {"description": "Test product", "quantity": 2, "unitPrice": 100.0}
            ],
            "taxRate": 0.1,
            "status": "pending",
            "totalAmount": 200.0,
            "paidAmount": 0.0
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/invoices",
            headers=HEADERS,
            json=create_invoice_payload,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Invoice creation failed: {create_resp.text}"
        invoice = create_resp.json()
        invoice_id = invoice.get("id")
        assert invoice_id is not None, "Created invoice ID is None"

        # Step 2: Make a partial payment on the created invoice
        partial_payment_payload = {
            "paymentAmount": 50.0  # Partial payment less than totalAmount=200.0
        }
        payment_resp = requests.post(
            f"{BASE_URL}/api/invoices/{invoice_id}/payments",
            headers=HEADERS,
            json=partial_payment_payload,
            timeout=TIMEOUT
        )
        assert payment_resp.status_code == 200, f"Partial payment failed: {payment_resp.text}"
        payment_result = payment_resp.json()

        # Validate payment response contains updated paidAmount and invoice status
        updated_paid_amount = payment_result.get("paidAmount")
        updated_status = payment_result.get("status")
        assert updated_paid_amount == 50.0, f"Expected paidAmount=50.0, got {updated_paid_amount}"
        assert updated_status in ["partial", "pending"], f"Unexpected status after partial payment: {updated_status}"

        # Step 3: Retrieve invoice to confirm status and paid amount updated
        get_invoice_resp = requests.get(
            f"{BASE_URL}/api/invoices/{invoice_id}",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert get_invoice_resp.status_code == 200, f"Failed to fetch invoice: {get_invoice_resp.text}"
        invoice_data = get_invoice_resp.json()
        assert invoice_data.get("paidAmount") == 50.0, "Invoice paidAmount did not update correctly"
        assert invoice_data.get("status") in ["partial", "pending"], "Invoice status not updated correctly"

        # Step 4: Check audit logs for the payment event
        audit_logs_resp = requests.get(
            f"{BASE_URL}/api/invoices/{invoice_id}/logs",
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert audit_logs_resp.status_code == 200, f"Failed to fetch audit logs: {audit_logs_resp.text}"
        logs = audit_logs_resp.json()
        # Verify an audit log exists for the partial payment
        payment_logs = [log for log in logs if log.get("event") == "partial_payment" and log.get("amount") == 50.0]
        assert len(payment_logs) > 0, "No audit log entry for partial payment found"

    finally:
        # Clean up: Delete the created invoice if it exists
        if invoice_id:
            try:
                del_resp = requests.delete(
                    f"{BASE_URL}/api/invoices/{invoice_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # It's okay if delete fails, but log if needed
            except Exception:
                pass


test_partial_payment_processing_and_status_update()
