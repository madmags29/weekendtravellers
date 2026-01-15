import os
import json
import requests
import random
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI Client (Graceful fallback)
client = None
if os.getenv("OPENAI_API_KEY"):
    try:
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    except Exception as e:
        print(f"Failed to init OpenAI: {e}")

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
                # Get the best quality video file
                video_files = data["videos"][0]["video_files"]
                # Prefer HD
                video = next((v for v in video_files if v["quality"] == "hd" or v["width"] >= 1280), video_files[0])
                media["video_url"] = video["link"]

    except Exception as e:
        print(f"Error fetching Pexels media: {e}")

    return media

class TripAI:
    def __init__(self):
        self.destinations = []
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(base_dir, "data", "destinations.json")
            with open(json_path, "r") as f:
                data = json.load(f)
                self.destinations = data.get("destinations", [])
            print(f"Loaded {len(self.destinations)} destinations from JSON.")
        except Exception as e:
            print(f"Error loading destinations.json: {e}")
            self.destinations = []

    def _match_with_openai(self, query: str) -> list:
        """Use OpenAI to semantically match destinations from the Excel list."""
        if not client or not self.destinations:
            return []
            
        # Create a condensed list for the prompt
        dest_summary = [f"{d['Destination']} ({d['Type']}, {d['State / UT']})" for d in self.destinations]
        
        prompt = f"""
        You are a smart travel assistant.
        User Query: "{query}"
        
        Available Destinations:
        {json.dumps(dest_summary)}
        
        Select the top 3-5 destinations from the list that semantically match the query.
        Return ONLY a JSON list of the exact destination names (e.g. "Goa"). 
        Example: ["Goa", "Manali"]
        """
        
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.3
            )
            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            
            matched_names = json.loads(content)
            matches = [d for d in self.destinations if d['Destination'] in matched_names]
            return matches
        except Exception as e:
            print(f"OpenAI semantic search error: {e}")
            return []

    def get_destination_by_slug(self, slug: str) -> dict:
        """Find a destination by slug."""
        dest = next((d for d in self.destinations if d.get("slug") == slug), None)
        if dest:
            # Enrich with Pexels
            query = dest.get("Destination", "") + " " + dest.get("Type", "travel")
            media = fetch_pexels_media(query)
            dest["image_url"] = media["image_url"]
            dest["video_url"] = media["video_url"]
        return dest

    def get_suggestions(self, query: str) -> list:
        """Get a list of destination names matching the query."""
        if not query:
            return []
        
        query_lower = query.lower()
        suggestions = []
        
        # Fast prefix/substring match
        for dest in self.destinations:
            name = dest.get("Destination", "")
            if query_lower in name.lower():
                suggestions.append(name)
        
        return suggestions[:5]

    def generate_trips(self, query: str) -> dict:
        """
        Search for trips within the loaded JSON data.
        """
        if not self.destinations:
            return {"trips": []}

        query_lower = query.lower()
        matches = []
        
        # 1. Keyword Search
        for dest in self.destinations:
            search_text = (
                f"{dest.get('Destination')} {dest.get('State / UT')} "
                f"{dest.get('Type')} {dest.get('Famous For')}"
            ).lower()
            if query_lower in search_text:
                matches.append(dest)
        
        # 2. Semantic Search (if few matches)
        if len(matches) < 2 and client:
            print("Using OpenAI for semantic search...")
            semantic_matches = self._match_with_openai(query)
            existing_ids = {m.get('id') for m in matches}
            for m in semantic_matches:
                if m.get('id') not in existing_ids:
                    matches.append(m)
        
        # 3. Fallback
        if not matches:
             matches = random.sample(self.destinations, min(3, len(self.destinations)))
        
        # Limit results
        results = matches[:6]
        
        # Transform & Enrich
        trips = []
        for dest in results:
            image_query = dest.get("Destination") + " " + dest.get("Type", "travel")
            media = fetch_pexels_media(image_query)
            
            trips.append({
                "id": dest.get("id"),
                "slug": dest.get("slug"),
                "title": dest.get("Destination"),
                "location": f"{dest.get('Destination')}, {dest.get('State / UT')}",
                "description": dest.get("Short Description", f"Explore {dest.get('Destination')}"),
                "price": "₹5,000 - ₹15,000", 
                "duration": f"{dest.get('Ideal Duration')} Days",
                "rating": 4.5,
                "attractions": [t.strip() for t in dest.get("Famous For", "").split(",")],
                "image_url": media["image_url"] or "/images/default_trip.png",
                "video_url": media["video_url"],
                "tags": [dest.get("Type"), dest.get("Best Time to Visit")]
            })

        return {"trips": trips}

    def get_random_background_image(self, query: str = "nature,travel,india") -> dict:
        return fetch_pexels_media(query).get("image_url")

    def get_random_background_video(self, query: str = "timelapse,hyperlapse,city traffic,clouds moving") -> dict:
        """Fetch a random background video (timelapse) from Pexels."""
        if not PEXELS_API_KEY or PEXELS_API_KEY == "your_pexels_api_key_here":
            return None

        headers = {"Authorization": PEXELS_API_KEY}
        try:
            url = "https://api.pexels.com/videos/search"
            params = {
                "query": query,
                "per_page": 5, 
                "orientation": "landscape",
                "min_width": 1280
            }
            response = requests.get(url, headers=headers, params=params, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get("videos"):
                    video_data = data["videos"][0]
                    video_files = video_data["video_files"]
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
