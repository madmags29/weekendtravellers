import os
import requests
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
print(f"API Key present: {'Yes' if PEXELS_API_KEY else 'No'}")

if not PEXELS_API_KEY:
    print("Error: PEXELS_API_KEY not found in environment variables.")
    exit(1)

headers = {"Authorization": PEXELS_API_KEY}
url = "https://api.pexels.com/v1/curated?per_page=1"

try:
    response = requests.get(url, headers=headers, timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Pexels API key is working.")
        print(f"Remaining Requests: {response.headers.get('X-Ratelimit-Remaining')}")
    elif response.status_code == 401:
        print("Error: Unauthorized. The API key is invalid.")
    else:
        print(f"Error: Unexpected status code {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception during request: {e}")
