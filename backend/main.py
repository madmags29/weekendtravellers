from fastapi import FastAPI, Response
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

@app.get("/api/destinations/suggest")
def suggest_destinations(q: str):
    """Get autocomplete suggestions."""
    return ai_service.get_suggestions(q)

@app.get("/api/destinations/{slug}")
def get_destination(slug: str):
    """Get destination details by slug."""
    result = ai_service.get_destination_by_slug(slug)
    if not result:
        return {"error": "Destination not found"}
    if not result:
        return {"error": "Destination not found"}
    return result

class ItineraryRequest(BaseModel):
    destination: str
    query: str

@app.post("/api/generate-itinerary")
def generate_itinerary(req: ItineraryRequest):
    """Generate AI itinerary using Grok/OpenAI."""
    return ai_service.generate_itinerary(req.destination, req.query)

@app.post("/api/login")
def login(response: Response):
    """
    Sets a secure cookie as requested.
    Note: 'secure=True' requires HTTPS (except on localhost).
    """
    # Demo token - in a real app, generate a JWT here
    jwt_token = "demo_secure_token_12345"
    
    response.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        secure=True,       # As requested
        samesite="strict", # As requested
        max_age=7 * 24 * 60 * 60 # 7 days
    )
    return {"message": "Logged in successfully", "note": "Secure cookie set"}
