import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS = {
    "access-token": API_KEY,
    "Content-Type": "application/json",
}


def validate_invoice_listing_with_pagination_and_filters():
    """
    Verify that the invoice listing API supports server-side pagination, sorting,
    status badges, and date range filtering accurately.
    """
    endpoint = f"{BASE_URL}/api/invoices"

    try:
        # 1. Test pagination: page=1, pageSize=5
        params_pag1 = {"page": 1, "pageSize": 5}
        resp_pag1 = requests.get(endpoint, headers=HEADERS, params=params_pag1, timeout=30)
        assert resp_pag1.status_code == 200, f"Status code: {resp_pag1.status_code}"
        assert resp_pag1.content, "Empty response content for page 1"
        try:
            data_pag1 = resp_pag1.json()
        except Exception as e:
            assert False, f"Invalid JSON in page 1 response: {e}"
        assert "invoices" in data_pag1 and isinstance(data_pag1["invoices"], list), "Missing 'invoices' list"
        assert len(data_pag1["invoices"]) <= 5, "Page size exceeded 5 invoices"
        assert "total" in data_pag1 and isinstance(data_pag1["total"], int), "'total' count missing or invalid"

        # 2. Test pagination page=2, should not have overlapping invoices with page=1
        params_pag2 = {"page": 2, "pageSize": 5}
        resp_pag2 = requests.get(endpoint, headers=HEADERS, params=params_pag2, timeout=30)
        assert resp_pag2.status_code == 200, f"Status code: {resp_pag2.status_code}"
        assert resp_pag2.content, "Empty response content for page 2"
        try:
            data_pag2 = resp_pag2.json()
        except Exception as e:
            assert False, f"Invalid JSON in page 2 response: {e}"
        ids_page1 = {inv["id"] for inv in data_pag1["invoices"]}
        ids_page2 = {inv["id"] for inv in data_pag2["invoices"]}
        assert ids_page1.isdisjoint(ids_page2), "Invoices in page 1 and page 2 overlapping"

        # 3. Test sorting by createdAt descending
        params_sort_desc = {"page": 1, "pageSize": 5, "sortBy": "createdAt", "sortOrder": "desc"}
        resp_sort_desc = requests.get(endpoint, headers=HEADERS, params=params_sort_desc, timeout=30)
        assert resp_sort_desc.status_code == 200, f"Status code: {resp_sort_desc.status_code}"
        assert resp_sort_desc.content, "Empty response content for sorting desc"
        try:
            invoices_desc = resp_sort_desc.json().get("invoices", [])
        except Exception as e:
            assert False, f"Invalid JSON in sorting desc response: {e}"
        dates_desc = [
            datetime.fromisoformat(inv["createdAt"].replace("Z", "+00:00")) for inv in invoices_desc if "createdAt" in inv
        ]
        assert all(dates_desc[i] >= dates_desc[i + 1] for i in range(len(dates_desc) - 1)), "Invoices not sorted descending by createdAt"

        # 4. Test sorting by createdAt ascending
        params_sort_asc = {"page": 1, "pageSize": 5, "sortBy": "createdAt", "sortOrder": "asc"}
        resp_sort_asc = requests.get(endpoint, headers=HEADERS, params=params_sort_asc, timeout=30)
        assert resp_sort_asc.status_code == 200, f"Status code: {resp_sort_asc.status_code}"
        assert resp_sort_asc.content, "Empty response content for sorting asc"
        try:
            invoices_asc = resp_sort_asc.json().get("invoices", [])
        except Exception as e:
            assert False, f"Invalid JSON in sorting asc response: {e}"
        dates_asc = [
            datetime.fromisoformat(inv["createdAt"].replace("Z", "+00:00")) for inv in invoices_asc if "createdAt" in inv
        ]
        assert all(dates_asc[i] <= dates_asc[i + 1] for i in range(len(dates_asc) - 1)), "Invoices not sorted ascending by createdAt"

        # 5. Test filtering by status badges, e.g. status=PAID
        params_status = {"page": 1, "pageSize": 10, "status": "PAID"}
        resp_status = requests.get(endpoint, headers=HEADERS, params=params_status, timeout=30)
        assert resp_status.status_code == 200, f"Status code: {resp_status.status_code}"
        assert resp_status.content, "Empty response content for status filter"
        try:
            invoices_status = resp_status.json().get("invoices", [])
        except Exception as e:
            assert False, f"Invalid JSON in status filter response: {e}"
        for inv in invoices_status:
            assert "status" in inv, "Invoice missing 'status' field"
            assert inv["status"] == "PAID", f"Invoice status mismatch: expected PAID but got {inv['status']}"

        # 6. Test filtering by a date range: from 30 days ago to today
        today = datetime.utcnow().date()
        date_from = (today - timedelta(days=30)).isoformat()
        date_to = today.isoformat()
        params_date_range = {"page": 1, "pageSize": 20, "createdFrom": date_from, "createdTo": date_to}
        resp_date_range = requests.get(endpoint, headers=HEADERS, params=params_date_range, timeout=30)
        assert resp_date_range.status_code == 200, f"Status code: {resp_date_range.status_code}"
        assert resp_date_range.content, "Empty response content for date range filter"
        try:
            invoices_date_range = resp_date_range.json().get("invoices", [])
        except Exception as e:
            assert False, f"Invalid JSON in date range filter response: {e}"
        for inv in invoices_date_range:
            assert "createdAt" in inv, "Invoice missing 'createdAt' field"
            inv_date = datetime.fromisoformat(inv["createdAt"].replace("Z", "+00:00")).date()
            assert date_from <= inv_date.isoformat() <= date_to, f"Invoice createdAt {inv_date} out of range {date_from} to {date_to}"

        # 7. Validate presence of status badges on invoices and correct values (expected: e.g. PAID, PENDING, OVERDUE)
        sample_invoices = invoices_date_range if invoices_date_range else data_pag1["invoices"]
        for inv in sample_invoices:
            assert "status" in inv, "Invoice missing status badge"
            assert inv["status"] in {"PAID", "PENDING", "OVERDUE", "CANCELLED"}, f"Unexpected invoice status badge: {inv['status']}"

    except (AssertionError, requests.RequestException, ValueError) as e:
        raise AssertionError(f"Test failed: {e}")


validate_invoice_listing_with_pagination_and_filters()
