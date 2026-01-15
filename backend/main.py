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
