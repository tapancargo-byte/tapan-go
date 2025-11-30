import requests

BASE_URL = "http://localhost:3000"
API_KEY = "sbp_319164fa6ae5e2f85df9b36646881e9219e37381"
HEADERS_AUTH = {"access-token": API_KEY}
HEADERS_NO_AUTH = {}
TIMEOUT = 30

def verify_authentication_and_role_based_access_control():
    """
    Test that API endpoints correctly restrict access to authenticated users and enforce
    role-based access control (RBAC) according to user roles.
    """
    endpoints = {
        "invoices": "/api/invoices",
        "customers": "/api/customers",
        "admin_settings": "/api/settings",  # Assuming admin-only
        "shipments": "/api/shipments"
    }
    
    # 1. Test unauthenticated access
    for name, endpoint in endpoints.items():
        url = BASE_URL + endpoint
        try:
            resp = requests.get(url, headers=HEADERS_NO_AUTH, timeout=TIMEOUT)
            if resp.status_code in (401, 403):
                # Expected unauthorized or forbidden
                pass
            elif resp.status_code == 200:
                # If server returns 200, verify response contains error or no sensitive data
                if not resp.content:
                    # Empty response content is treated as no access / empty data
                    continue
                try:
                    data = resp.json()
                except ValueError:
                    assert False, f"Response from {endpoint} is not valid JSON"
                # Expect error or empty data indicating no access
                if isinstance(data, dict):
                    assert ("error" in data or "message" in data), f"Unauthenticated access to {endpoint} returned 200 with no error or message in response"
                else:
                    # If response is list, expect empty or limited data
                    assert len(data) == 0, f"Unauthenticated access to {endpoint} returned 200 with data, expected empty list"
            else:
                assert False, f"Unauthenticated access to {endpoint} should be denied or empty, got {resp.status_code}"
        except requests.RequestException as e:
            raise AssertionError(f"Request exception for unauthenticated access to {endpoint}: {e}")
    
    # 2. Test authenticated access allowed for general endpoints user might have access to (invoices, customers, shipments)
    for name in ["invoices", "customers", "shipments"]:
        endpoint = endpoints[name]
        url = BASE_URL + endpoint
        try:
            resp = requests.get(url, headers=HEADERS_AUTH, timeout=TIMEOUT)
            assert resp.status_code == 200, f"Authenticated user should have access to {endpoint}, got {resp.status_code}"
            if not resp.content:
                assert False, f"Authenticated access to {endpoint} returned empty response"
            try:
                data = resp.json()
                assert isinstance(data, (dict, list)), f"Response from {endpoint} should be JSON object or array"
            except ValueError:
                raise AssertionError(f"Response from {endpoint} is not valid JSON")
        except requests.RequestException as e:
            raise AssertionError(f"Request exception for authenticated access to {endpoint}: {e}")

    # 3. Test access denied for admin endpoint (simulate that token is not admin)
    url = BASE_URL + endpoints["admin_settings"]
    try:
        resp = requests.get(url, headers=HEADERS_AUTH, timeout=TIMEOUT)
        assert resp.status_code in (401, 403), f"Non-admin access to {endpoints['admin_settings']} should be denied, got {resp.status_code}"
    except requests.RequestException as e:
        raise AssertionError(f"Request exception when accessing admin endpoint: {e}")

verify_authentication_and_role_based_access_control()