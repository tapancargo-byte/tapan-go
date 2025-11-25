import requests
import json

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}


def test_whatsapp_integration_for_invoice_and_shipment_notifications():
    timeout = 30
    # Step 1: Create a sample invoice resource to send notification for
    invoice_payload = {
        "customerId": "test-customer-id",
        "amount": 150.75,
        "currency": "USD",
        "status": "pending",
        "description": "Test invoice for WhatsApp integration",
        "dueDate": "2025-12-31",
    }
    invoice_id = None
    shipment_id = None
    try:
        # Create Invoice
        resp_invoice_create = requests.post(
            f"{BASE_URL}/api/invoices",
            headers=HEADERS,
            data=json.dumps(invoice_payload),
            timeout=timeout,
        )
        assert resp_invoice_create.status_code == 201, f"Invoice creation failed: {resp_invoice_create.text}"
        invoice_data = resp_invoice_create.json()
        invoice_id = invoice_data.get("id")
        assert invoice_id is not None, "Invoice ID missing in creation response"

        # Step 2: Create a sample shipment resource for shipment notification
        shipment_payload = {
            "origin": "Warehouse A",
            "destination": "Customer Location",
            "status": "in_transit",
            "trackingNumber": "SHIP123456789",
            "carrier": "CarrierX",
            "estimatedDelivery": "2025-12-25",
            "description": "Test shipment for WhatsApp integration",
        }
        resp_shipment_create = requests.post(
            f"{BASE_URL}/api/shipments",
            headers=HEADERS,
            data=json.dumps(shipment_payload),
            timeout=timeout,
        )
        assert resp_shipment_create.status_code == 201, f"Shipment creation failed: {resp_shipment_create.text}"
        shipment_data = resp_shipment_create.json()
        shipment_id = shipment_data.get("id")
        assert shipment_id is not None, "Shipment ID missing in creation response"

        # Step 3: Request WhatsApp message generation for invoice notification
        whatsapp_invoice_payload = {
            "type": "invoice",
            "resourceId": invoice_id
        }
        resp_whatsapp_invoice = requests.post(
            f"{BASE_URL}/api/whatsapp/send",
            headers=HEADERS,
            data=json.dumps(whatsapp_invoice_payload),
            timeout=timeout,
        )
        assert resp_whatsapp_invoice.status_code == 200, f"Failed to send WhatsApp invoice notification: {resp_whatsapp_invoice.text}"
        invoice_msg_resp = resp_whatsapp_invoice.json()
        assert "prefilledMessage" in invoice_msg_resp, "Prefilled message missing in invoice WhatsApp response"
        assert "status" in invoice_msg_resp and invoice_msg_resp["status"] == "sent", "WhatsApp invoice notification not marked as sent"

        # Step 4: Request WhatsApp message generation for shipment notification
        whatsapp_shipment_payload = {
            "type": "shipment",
            "resourceId": shipment_id
        }
        resp_whatsapp_shipment = requests.post(
            f"{BASE_URL}/api/whatsapp/send",
            headers=HEADERS,
            data=json.dumps(whatsapp_shipment_payload),
            timeout=timeout,
        )
        assert resp_whatsapp_shipment.status_code == 200, f"Failed to send WhatsApp shipment notification: {resp_whatsapp_shipment.text}"
        shipment_msg_resp = resp_whatsapp_shipment.json()
        assert "prefilledMessage" in shipment_msg_resp, "Prefilled message missing in shipment WhatsApp response"
        assert "status" in shipment_msg_resp and shipment_msg_resp["status"] == "sent", "WhatsApp shipment notification not marked as sent"

    finally:
        # Cleanup: Delete created invoice and shipment if they exist
        if invoice_id:
            try:
                resp_del_invoice = requests.delete(
                    f"{BASE_URL}/api/invoices/{invoice_id}",
                    headers=HEADERS,
                    timeout=timeout,
                )
                assert resp_del_invoice.status_code in [200, 204], f"Failed to delete invoice {invoice_id}"
            except Exception:
                pass
        if shipment_id:
            try:
                resp_del_shipment = requests.delete(
                    f"{BASE_URL}/api/shipments/{shipment_id}",
                    headers=HEADERS,
                    timeout=timeout,
                )
                assert resp_del_shipment.status_code in [200, 204], f"Failed to delete shipment {shipment_id}"
            except Exception:
                pass


test_whatsapp_integration_for_invoice_and_shipment_notifications()