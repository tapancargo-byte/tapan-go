import requests
import uuid

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}",
}

def test_barcode_scanner_input_and_scan_event_recording():
    """
    Validate that barcode scanning via camera and keyboard inputs successfully detects codes
    and records scan events linked to manifests.
    """

    # Helper function to create a manifest to link scan events to
    def create_manifest():
        manifest_data = {
            "origin": "Warehouse A",
            "destination": "Warehouse B",
            "airline": "AirTest",
            "flightNumber": f"AT-{uuid.uuid4().hex[:6]}",
            "departureDate": "2025-12-01T10:00:00Z"
        }
        response = requests.post(
            f"{BASE_URL}/api/manifests",
            headers=HEADERS,
            json=manifest_data,
            timeout=30
        )
        if response.status_code != 201:
            raise AssertionError(f"Failed to create manifest: {response.status_code} {response.text}")
        return response.json()

    # Helper function to delete manifest by id
    def delete_manifest(manifest_id):
        response = requests.delete(
            f"{BASE_URL}/api/manifests/{manifest_id}",
            headers=HEADERS,
            timeout=30
        )
        if response.status_code not in (200, 204):
            raise AssertionError(f"Failed to delete manifest {manifest_id}: {response.status_code} {response.text}")

    # Helper to simulate barcode scan input via API
    def record_scan_event(manifest_id, barcode_value, input_method):
        scan_event_data = {
            "manifestId": manifest_id,
            "barcode": barcode_value,
            "inputMethod": input_method  # "camera" or "keyboard"
        }
        response = requests.post(
            f"{BASE_URL}/api/scans",
            headers=HEADERS,
            json=scan_event_data,
            timeout=30
        )
        return response

    manifest = None
    try:
        # Step 1: Create a manifest to link scan events
        manifest = create_manifest()
        manifest_id = manifest.get("id")
        assert manifest_id, "Manifest creation did not return an id."

        # Step 2: Simulate barcode scan via camera input
        camera_barcode = f"CAM-{uuid.uuid4().hex[:8]}"
        response_camera = record_scan_event(manifest_id, camera_barcode, "camera")
        assert response_camera.status_code == 201, f"Camera scan event recording failed: {response_camera.text}"
        scan_event_camera = response_camera.json()
        assert scan_event_camera.get("manifestId") == manifest_id, "Camera scan event manifestId mismatch"
        assert scan_event_camera.get("barcode") == camera_barcode, "Camera scan event barcode mismatch"
        assert scan_event_camera.get("inputMethod") == "camera", "Camera scan event inputMethod mismatch"
        assert scan_event_camera.get("timestamp"), "Camera scan event missing timestamp"

        # Step 3: Simulate barcode scan via keyboard input
        keyboard_barcode = f"KEY-{uuid.uuid4().hex[:8]}"
        response_keyboard = record_scan_event(manifest_id, keyboard_barcode, "keyboard")
        assert response_keyboard.status_code == 201, f"Keyboard scan event recording failed: {response_keyboard.text}"
        scan_event_keyboard = response_keyboard.json()
        assert scan_event_keyboard.get("manifestId") == manifest_id, "Keyboard scan event manifestId mismatch"
        assert scan_event_keyboard.get("barcode") == keyboard_barcode, "Keyboard scan event barcode mismatch"
        assert scan_event_keyboard.get("inputMethod") == "keyboard", "Keyboard scan event inputMethod mismatch"
        assert scan_event_keyboard.get("timestamp"), "Keyboard scan event missing timestamp"

        # Step 4: Retrieve scan events linked to the manifest and verify both events are present
        response_get_scans = requests.get(
            f"{BASE_URL}/api/manifests/{manifest_id}/scans",
            headers=HEADERS,
            timeout=30
        )
        assert response_get_scans.status_code == 200, f"Failed to retrieve scan events: {response_get_scans.text}"
        scans = response_get_scans.json()
        assert isinstance(scans, list), "Scan events response is not a list"

        # Verify both barcodes are in the scan events linked to manifest
        barcodes_in_scans = {scan.get("barcode") for scan in scans}
        assert camera_barcode in barcodes_in_scans, "Camera barcode scan event not found in manifest scans"
        assert keyboard_barcode in barcodes_in_scans, "Keyboard barcode scan event not found in manifest scans"

    finally:
        # Cleanup manifest
        if manifest and manifest.get("id"):
            try:
                delete_manifest(manifest.get("id"))
            except Exception:
                pass

test_barcode_scanner_input_and_scan_event_recording()
