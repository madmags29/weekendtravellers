from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchQuery(BaseModel):
    query: str
    location: Optional[str] = None

@app.get("/")
def read_root():
    return {"Hello": "Weekend Travellers"}

from ai_service import TripAI

ai_service = TripAI()

@app.post("/search")
def search_trips(search: SearchQuery):
    results = ai_service.generate_trips(search.query)
    return results



@app.get("/api/video/background")
def get_background_video(query: str = "timelapse,hyperlapse,nature motion,city lights"):
    """Get a random background video."""
    result = ai_service.get_random_background_video(query)
    if not result:
        # Fallback - return None or a specific error indicator, frontend handles fallback
        return {"video_url": None}
    return result

@app.get("/api/destinations/{slug}")
def get_destination(slug: str):
    """Get destination details by slug."""
    result = ai_service.get_destination_by_slug(slug)
    if not result:
        return {"error": "Destination not found"}
    return result

@app.get("/api/destinations/suggest")
def suggest_destinations(q: str):
    """Get autocomplete suggestions."""
    return ai_service.get_suggestions(q)
