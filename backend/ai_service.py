import os
import json
import requests
import random
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI Client
openai_api_key = os.getenv("OPENAI_API_KEY")
grok_api_key = os.getenv("GROK_API_KEY")

client = None
MODEL_NAME = None # Initialize MODEL_NAME

if openai_api_key:
    try:
        # Standard OpenAI
        client = OpenAI(api_key=openai_api_key)
        MODEL_NAME = "gpt-3.5-turbo" # Default model for OpenAI
        print("Using OpenAI API")
    except Exception as e:
        print(f"Failed to init OpenAI: {e}")
elif grok_api_key:
    try:
        # Fallback to Grok
        client = OpenAI(
            api_key=os.getenv("GROK_API_KEY"),
            base_url="https://api.x.ai/v1"
        )
        MODEL_NAME = "grok-2-latest"
        print("Using Grok API")
    except Exception as e:
        print(f"Failed to init Grok: {e}")

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
                model=MODEL_NAME,
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
            try:
                query = dest.get("Destination", "") + " " + dest.get("Type", "travel")
                media = fetch_pexels_media(query)
                dest["image_url"] = media["image_url"]
                dest["video_url"] = media["video_url"]
            except Exception as e:
                print(f"Error fetching media for {slug}: {e}")
                # Fallbacks or keep existing if any
                if "image_url" not in dest: dest["image_url"] = None
                if "video_url" not in dest: dest["video_url"] = None
        return dest

    def generate_itinerary(self, destination: str, query_context: str) -> dict:
        """
        Generate a 3-day itinerary using Grok/OpenAI.
        """
        if not client:
            return {"error": "AI Client not initialized"}

        prompt = f"""
        Act as a luxury travel planner.
        Create a 3-day itinerary for a trip to {destination}.
        User Query Context: "{query_context}"
        
        Style: "Leaving with..." poetic footer, highly detailed.
        
        Return STRICT JSON format ONLY:
        {{
            "header": "A warm, engaging header about {destination}",
            "days": [
                {{
                    "day": 1,
                    "title": "Theme of Day 1",
                    "activities": ["Activity 1", "Activity 2", "Dinner at..."]
                }},
                ... (Day 2, Day 3)
            ],
            "packing_list": ["Item 1", "Item 2", "Item 3", "Item 4"],
            "weather_note": "A brief note about expected weather",
            "waypoints": ["Stop 1", "Stop 2", "Stop 3", "Stop 4"]
        }}
        """

        try:
            model_name = "gpt-4o" if os.getenv("OPENAI_API_KEY") else "grok-2-latest"
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a helpful travel assistant that outputs strict JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"AI Generation Error: {e}")
            return {"error": str(e)}

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

    def _generate_itinerary(self, destination: str, state: str, type_of_trip: str, query: str, duration: str = "3 Days") -> dict:
        """Generate a custom itinerary using AI."""
        # Parse duration
        try:
            num_days = int(''.join(filter(str.isdigit, str(duration))))
            if num_days < 1: num_days = 2
            if num_days > 5: num_days = 5 # Cap at 5 to avoid token limits
        except:
            num_days = 2

        # Default fallback
        default_header = f"Here's a thoughtfully paced {num_days}-day itinerary for your trip to {destination}."
        if " to " in query.lower():
             default_header = f"Here's a thoughtfully paced {num_days}-day itinerary for your trip: {query.title()}."

        # Generate default days structure
        default_days = []
        for d in range(1, num_days + 1):
            default_days.append({
                "day_label": f"Day {d}",
                "title": f"Exploring {destination}",
                "subtitle": "Discovering local gems",
                "morning": ["Visit a popular landmark.", "Enjoy local breakfast."],
                "afternoon": ["Lunch at a verified spot.", "Visit a museum or park."],
                "evening": ["Sunset views.", "Dinner at a top-rated restaurant."]
            })

        default_itinerary = {
            "header": default_header,
            "days": default_days,
            "footer": "Ready to finalize this? I can adjust the pace, upgrade your stay, or secure your dinner reservations for you.",
            "waypoints": ["City Center", "Local Market"]
        }

        if not client:
            return default_itinerary
        
        prompt = f"""
        Act as a **Luxury Travel Concierge** planning a trip to {destination}, {state} (Type: {type_of_trip}).
        User's Search Query: "{query}" (Context: {query}).
        Duration: {num_days} Days.
        
        **Style & Tone**:
        - Curated, exclusive, and "in-the-know".
        - "Thoughtfully paced" and "Verified".
        - Include **specific details**: Signature dishes at restaurants, best photo spots, entry fees (approx), and exact travel times.
        
        Return strictly valid JSON with this structure:
        {{
            "header": "A warm, professional opening. E.g., 'I’ve curated a bespoke {num_days}-day itinerary for your journey from [Origin] to {destination}...' ",
            "days": [
                {{
                    "day_label": "Day 1",
                    "title": "A captivating title",
                    "subtitle": "Brief vibe summary.",
                    "morning": ["Time - Activity: Detail", "Lunch tip"],
                    "afternoon": ["Activity 1", "Activity 2"],
                    "evening": ["Sunset spot", "Dinner tip"]
                }},
                ... (Repeat for ALL {num_days} days)
            ],
            "footer": "Concierge closing.",
            "waypoints": ["List of 3-4 specific real locations"]
        }}
        
        IMPORTANT: Generate detailed plans for ALL {num_days} DAYS. Use REAL businesses.
        Do not include markdown formatting. Just the pure JSON string.
        """
        
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500, # Increased for longer plans
                temperature=0.7
            )
            content = response.choices[0].message.content.strip()
            # Clean up potential markdown
            if content.startswith("```json"):
                content = content.replace("```json", "").replace("```", "")
            if content.startswith("```"):
                content = content.replace("```", "")
            
            return json.loads(content)
        except Exception as e:
            print(f"Error generating AI itinerary: {e}")
            return default_itinerary

    def generate_trips(self, query: str) -> dict:
        """
        Search for trips within the loaded JSON data.
        """
        if not self.destinations:
            return {"trips": []}

        query_lower = query.lower()
        matches = []
        
        # 1. Smarter Keyword Search
        tokens = query_lower.split()
        stopwords = {"trip", "travel", "days", "day", "night", "nights", "to", "in", "for", "a", "an", "the", "near", "weekend", "holiday", "vacation"}
        filtered_tokens = [t for t in tokens if t not in stopwords and len(t) > 2]

        for dest in self.destinations:
            dest_name = dest.get('Destination', '').lower()
            dest_state = dest.get('State / UT', '').lower()
            
            # Priority 1: Exact Destination Name in Query (e.g. "Jaipur" in "Jaipur trip")
            if dest_name and dest_name in query_lower:
                matches.append(dest)
                continue

            # Priority 2: Destination Name contains a significant token (fuzzy) working? 
            # Risk: "Goa" matches "Goat"? No, token matching is safer.
            # Let's check if any filtered token is the destination name
            if any(token == dest_name for token in filtered_tokens):
                matches.append(dest)
                continue
                
            # Priority 3: Search text (fallback)
            search_text = (
                f"{dest.get('Destination')} {dest.get('State / UT')} "
                f"{dest.get('Type')} {dest.get('Famous For')}"
            ).lower()
            
            # Check if all significant tokens vary? No, let's keep it simple.
            # If the user asks "Beaches in India", we want matching tags.
            if any(token in search_text for token in filtered_tokens):
                # Only add if not already added? 
                # matches.append(dest) - this might be too broad (returns many).
                # better to rely on priority 1 & 2 for explicit cities.
                pass

        # If no explicit city matches found, try broader tag/description search
        if not matches:
             for dest in self.destinations:
                search_text = (
                    f"{dest.get('Destination')} {dest.get('State / UT')} "
                    f"{dest.get('Type')} {dest.get('Famous For')}"
                ).lower()
                
                # Require at least one matching token
                if any(t in search_text for t in filtered_tokens):
                     matches.append(dest)

        # 2. Semantic Search (Disabled/Optional)
        if len(matches) < 1 and client:
             # ... existing semantic search logic ...
             pass
        
        # 3. Fallback (Random) ONLY if absolutely nothing found
        if not matches:
             matches = random.sample(self.destinations, min(3, len(self.destinations)))
        
        # Limit results
        results = matches[:6]
        
        # Transform & Enrich
        trips = []
        for i, dest in enumerate(results):
            image_query = dest.get("Destination") + " " + dest.get("Type", "travel")
            media = fetch_pexels_media(image_query)
            
            # Generate detailed itinerary ONLY for the top result (to save latency/tokens)
            itinerary = None
            if i == 0:
                itinerary = self._generate_itinerary(
                    dest.get("Destination"), 
                    dest.get("State / UT"), 
                    dest.get("Type", "Travel"),
                    query, # Pass the original query
                    str(dest.get("Ideal Duration", "3 Days")) # Pass duration
                )

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
                "tags": [dest.get("Type"), dest.get("Best Time to Visit")],
                "itinerary": itinerary # Add existing or None
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
                print(f"Pexels Video Search: Found {len(data.get('videos', []))} videos for query '{query}'")
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
        
        print("No videos found or error in processing Pexels response.")
        return None

    def get_suggestions(self, query: str) -> list:
        """Get autocomplete suggestions for destinations."""
        if not query or not self.destinations:
            return []
        
        query = query.lower()
        suggestions = []
        
        seen = set()
        for dest in self.destinations:
            name = dest.get("Destination")
            if name and query in name.lower() and name not in seen:
                suggestions.append(name)
                seen.add(name)
                
            if len(suggestions) >= 10:
                break
                
        return suggestions
