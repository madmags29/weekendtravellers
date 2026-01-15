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
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

def fetch_pexels_media(query: str) -> dict:
    """Fetch relevant image and video from Pexels."""
    if not PEXELS_API_KEY or PEXELS_API_KEY == "your_pexels_api_key_here":
        return {"image_url": None, "video_url": None}

    headers = {"Authorization": PEXELS_API_KEY}
    media = {"image_url": None, "video_url": None}

    try:
        # Fetch Image
        url_img = "https://api.pexels.com/v1/search"
        params_img = {"query": query, "per_page": 1, "orientation": "landscape"}
        response_img = requests.get(url_img, headers=headers, params=params_img, timeout=5)
        
        if response_img.status_code == 200:
            data = response_img.json()
            if data.get("photos"):
                media["image_url"] = data["photos"][0]["src"]["landscape"]

        # Fetch Video
        url_vid = "https://api.pexels.com/videos/search"
        params_vid = {"query": query, "per_page": 1, "orientation": "landscape", "min_width": 1280}
        response_vid = requests.get(url_vid, headers=headers, params=params_vid, timeout=5)

        if response_vid.status_code == 200:
            data = response_vid.json()
            if data.get("videos"):
                # Get the best quality video file (usually the first one or high res)
                video_files = data["videos"][0]["video_files"]
                # Sort by quality/width to get a decent one, preferably 720p or 1080p
                video = next((v for v in video_files if v["quality"] == "hd" or v["width"] >= 1280), video_files[0])
                media["video_url"] = video["link"]

    except Exception as e:
        print(f"Error fetching Pexels media: {e}")

    return media

def fetch_unsplash_image(query: str) -> str:
    """Fetch a relevant image from Unsplash as fallback."""
    if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "your_unsplash_access_key_here":
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
            
            # Enhance with Pexels (primary) or Unsplash (fallback)
            for trip in data.get("trips", []):
                image_query = trip.get("image_query", trip["location"])
                
                # Try Pexels first
                pexels_media = fetch_pexels_media(image_query)
                trip["image_url"] = pexels_media.get("image_url")
                trip["video_url"] = pexels_media.get("video_url")

                # Fallback to Unsplash for image if Pexels failed
                if not trip["image_url"]:
                     trip["image_url"] = fetch_unsplash_image(image_query) or "/images/default_trip.png"
                
            return data
            
        except Exception as e:
            print(f"OpenAI Error: {e}")
            return self._get_mock_data(query)

    def _get_mock_data(self, query: str) -> dict:
        """Returns mock data with Pexels/Unsplash integration."""
        
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
        
        # Enrich with real images/videos
        for trip in trips:
            # Try Pexels
            pexels_media = fetch_pexels_media(trip["image_query"])
            trip["image_url"] = pexels_media.get("image_url")
            trip["video_url"] = pexels_media.get("video_url")
            
            # Fallback based on specific locations if Media fails
            if not trip["image_url"]:
                # Try Unsplash
                trip["image_url"] = fetch_unsplash_image(trip["image_query"])
                
                # Final Local Fallback
                if not trip["image_url"]:
                    if "rishikesh" in trip["image_query"].lower():
                        trip["image_url"] = "/images/trip_rishikesh.png" 
                    elif "goa" in trip["image_query"].lower():
                        trip["image_url"] = "/images/trip_goa.png"
                    else:
                        trip["image_url"] = "/images/bg_slide_1.png"

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

    def get_random_background_video(self, query: str = "timelapse,hyperlapse,city traffic,clouds moving") -> dict:
        """Fetch a random background video (timelapse) from Pexels."""
        if not PEXELS_API_KEY or PEXELS_API_KEY == "your_pexels_api_key_here":
            return None

        headers = {"Authorization": PEXELS_API_KEY}
        
        try:
            # Search for videos
            url = "https://api.pexels.com/videos/search"
            # We want landscape, decent quality. Pexels search results are usually good.
            params = {
                "query": query,
                "per_page": 5, # Fetch a few to randomize? Or just 1. Let's fetch 1 for speed.
                "orientation": "landscape",
                "min_width": 1280
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("videos"):
                    # Pick the first one
                    video_data = data["videos"][0]
                    video_files = video_data["video_files"]
                    
                    # Find best suitable file (HD, not 4k if possible to save bandwidth, but good quality)
                    # changing logic to prefer HD (1280x720 or 1920x1080)
                    video_file = next((v for v in video_files if v["width"] == 1920 or v["width"] == 1280), video_files[0])
                    
                    return {
                        "video_url": video_file["link"],
                        "photographer_name": video_data["user"]["name"],
                        "photographer_url": video_data["user"]["url"],
                        "duration": video_data["duration"]
                    }
        except Exception as e:
            print(f"Error fetching background video: {e}")
            
        return None
