import os
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize client (expects OPENAI_API_KEY in env)
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception:
    client = None

UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

def fetch_unsplash_image(query: str) -> str:
    """Fetch a relevant image from Unsplash or return None."""
    if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "your_unsplash_access_key_here":
        # print("Unsplash Key missing or default, skipping.")
        return None
    
    try:
        url = "https://api.unsplash.com/search/photos"
        params = {
            "query": query,
            "client_id": UNSPLASH_ACCESS_KEY,
            "per_page": 1,
            "orientation": "landscape"
        }
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data["results"]:
                return data["results"][0]["urls"]["regular"]
    except Exception as e:
        print(f"Error fetching Unsplash image: {e}")
    
    return None

class TripAI:
    def __init__(self):
        pass

    def generate_trips(self, query: str) -> dict:
        """
        Generates structured trip ideas based on a user query using an LLM.
        """
        if not client:
            print("No OpenAI API Key found, returning mock data.")
            return self._get_mock_data(query)

        prompt = f"""
        You are a travel expert AI specializing in India. The user is looking for a weekend trip within India or nearby.
        User Query: "{query}"

        Generate 3 distinct weekend trip ideas based on this query.
        Return ONLY valid JSON in the following format:
        {{
            "trips": [
                {{
                    "id": 1,
                    "title": "Catchy Title",
                    "location": "City, State",
                    "description": "2-3 sentence description of why this is perfect.",
                    "price": "₹Estimate",
                    "duration": "e.g. 2 Nights / 3 Days",
                    "rating": 4.5,
                    "attractions": ["Attraction 1", "Attraction 2", "Attraction 3"],
                    "image_query": "search term for image"
                }}
            ]
        }}
        """

        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are a helpful travel assistant."},
                          {"role": "user", "content": prompt}],
                max_tokens=800
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            
            # Enhance with Unsplash images
            for trip in data.get("trips", []):
                image_query = trip.get("image_query", trip["location"])
                trip["image_url"] = fetch_unsplash_image(image_query) or "/images/default_trip.png"
                
            return data
            
        except Exception as e:
            print(f"OpenAI Error: {e}")
            return self._get_mock_data(query)

    def _get_mock_data(self, query: str) -> dict:
        """Returns mock data with Unsplash integration."""
        
        # Define base mock data
        trips = [
            {
                "id": 1,
                "title": "River Rafting Adventure",
                "location": "Rishikesh, Uttarakhand",
                "description": f"Experience the thrill of white water rafting on the Ganges. Perfect for adventure seekers.",
                "price": "₹6,000",
                "duration": "1 Night / 2 Days",
                "rating": 4.8,
                "attractions": ["Laxman Jhula", "Triveni Ghat", "Beatles Ashram"],
                "image_query": "rafting rishikesh"
            },
            {
                "id": 2,
                "title": "Beachside Relaxation",
                "location": "Goa, India",
                "description": "Unwind at a luxury villa near the beach. Enjoy seafood and sunsets.",
                "price": "₹15,000",
                "duration": "2 Nights / 3 Days",
                "rating": 4.7,
                "attractions": ["Baga Beach", "Fort Aguada", "Dudhsagar Falls"],
                "image_query": "goa beach sunset"
            },
             {
                "id": 3,
                "title": "Mountain Retreat",
                "location": "Manali, Himachal Pradesh",
                "description": "Escape to the mountains for cool air and scenic views.",
                "price": "₹10,000",
                "duration": "3 Nights / 4 Days",
                "rating": 4.9,
                "attractions": ["Solang Valley", "Rohtang Pass", "Hidimba Devi Temple"],
                "image_query": "manali mountains"
            }
        ]
        
        # Enrich with real images if possible
        for trip in trips:
            # Try Unsplash
            unsplash_url = fetch_unsplash_image(trip["image_query"])
            
            # Fallback based on specific locations if Unsplash fails
            if not unsplash_url:
                if "rishikesh" in trip["image_query"].lower():
                    unsplash_url = "/images/trip_rishikesh.png" 
                elif "goa" in trip["image_query"].lower():
                    unsplash_url = "/images/trip_goa.png"
                else:
                    unsplash_url = "/images/bg_slide_1.png"
            
            trip["image_url"] = unsplash_url

        return {"trips": trips}

    def get_random_background_image(self, query: str = "nature,travel,india") -> dict:
        """Fetch a random background image from Unsplash with credits."""
        if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "your_unsplash_access_key_here":
            return None
        
        try:
            url = "https://api.unsplash.com/photos/random"
            params = {
                "query": query,
                "client_id": UNSPLASH_ACCESS_KEY,
                "orientation": "landscape"
            }
            response = requests.get(url, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                return {
                    "image_url": data["urls"]["regular"],
                    "photographer_name": data["user"]["name"],
                    "photographer_username": data["user"]["username"],
                    "unsplash_url": "https://unsplash.com/?utm_source=weekend_traveller&utm_medium=referral"
                }
        except Exception as e:
            print(f"Error fetching random background: {e}")
        
        return None
