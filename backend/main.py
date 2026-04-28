from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv
import uuid
import os
import uvicorn
import bcrypt
import time

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "wanderlust")
PORT = int(os.getenv("PORT", 8000))

app = FastAPI(title="WanderLust Travel API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MongoDB Setup ────────────────────────────────────────────────────────────

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ─── Helper ───────────────────────────────────────────────────────────────────

def fix_id(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ─── Seed Data ────────────────────────────────────────────────────────────────

DESTINATIONS = [
    {"id": "1", "name": "Goa", "country": "India", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "rating": 4.7, "reviews": 12840, "category": "Beach", "description": "Sun-kissed beaches, vibrant nightlife, and Portuguese heritage blend seamlessly in India's party capital.", "highlights": ["Baga Beach", "Fort Aguada", "Dudhsagar Falls", "Anjuna Flea Market"], "best_time": "Nov–Feb", "avg_budget": 15000},
    {"id": "2", "name": "Rajasthan", "country": "India", "image": "https://images.unsplash.com/photo-1477587458883-47145ed94b5f?w=800", "rating": 4.8, "reviews": 20150, "category": "Heritage", "description": "The Land of Kings dazzles with magnificent forts, opulent palaces, and the living culture of a royal era.", "highlights": ["Amber Fort", "Hawa Mahal", "Thar Desert Safari", "City Palace Udaipur"], "best_time": "Oct–Mar", "avg_budget": 20000},
    {"id": "3", "name": "Manali", "country": "India", "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "rating": 4.6, "reviews": 9870, "category": "Mountains", "description": "Nestled in the Himalayas, Manali offers breathtaking snow-capped peaks, adventure sports, and serene valleys.", "highlights": ["Rohtang Pass", "Solang Valley", "Old Manali", "Hadimba Temple"], "best_time": "Oct–Jun", "avg_budget": 18000},
    {"id": "4", "name": "Kerala Backwaters", "country": "India", "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "rating": 4.9, "reviews": 15600, "category": "Nature", "description": "God's Own Country — experience tranquil backwaters, lush tea estates, and Ayurvedic wellness retreats.", "highlights": ["Alleppey Houseboats", "Munnar Tea Gardens", "Varkala Beach", "Periyar Wildlife"], "best_time": "Sep–Mar", "avg_budget": 22000},
    {"id": "5", "name": "Agra", "country": "India", "image": "https://images.unsplash.com/photo-1548013146-72479768bada?w=800", "rating": 4.5, "reviews": 31200, "category": "Heritage", "description": "Home to the immortal Taj Mahal — the world's greatest monument to love and Mughal architectural genius.", "highlights": ["Taj Mahal", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh"], "best_time": "Nov–Mar", "avg_budget": 12000},
    {"id": "6", "name": "Andaman Islands", "country": "India", "image": "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800", "rating": 4.8, "reviews": 8420, "category": "Beach", "description": "Pristine coral reefs, crystal-clear waters, and white sand beaches make this archipelago a tropical paradise.", "highlights": ["Radhanagar Beach", "Cellular Jail", "Scuba Diving", "Neil Island"], "best_time": "Nov–May", "avg_budget": 35000},
]

HOTELS = [
    {"id": "h1", "destination_id": "1", "name": "Taj Exotica Resort & Spa", "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "rating": 4.9, "reviews": 2840, "price_per_night": 12500, "category": "Luxury", "amenities": ["Pool", "Spa", "Beach Access", "Fine Dining", "WiFi", "Gym"], "description": "Beachfront luxury resort with stunning Arabian Sea views and world-class amenities.", "location": "Benaulim Beach, South Goa"},
    {"id": "h2", "destination_id": "1", "name": "The Leela Goa", "image": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", "rating": 4.7, "reviews": 1920, "price_per_night": 8500, "category": "Luxury", "amenities": ["Pool", "Spa", "Beach Access", "WiFi", "Bar"], "description": "Elegant beachside retreat with lush gardens and Goan-inspired luxury.", "location": "Cavelossim Beach, Goa"},
    {"id": "h3", "destination_id": "1", "name": "La Maison Goa", "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", "rating": 4.4, "reviews": 740, "price_per_night": 3200, "category": "Boutique", "amenities": ["Pool", "WiFi", "Breakfast", "Garden"], "description": "Charming boutique hotel in a restored Portuguese mansion with character.", "location": "Panaji, North Goa"},
    {"id": "h4", "destination_id": "2", "name": "Umaid Bhawan Palace", "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800", "rating": 5.0, "reviews": 1540, "price_per_night": 45000, "category": "Heritage", "amenities": ["Pool", "Spa", "Fine Dining", "Museum", "WiFi", "Concierge"], "description": "Live like royalty in one of the world's largest private residences turned luxury hotel.", "location": "Jodhpur, Rajasthan"},
    {"id": "h5", "destination_id": "2", "name": "Rambagh Palace", "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", "rating": 4.9, "reviews": 2100, "price_per_night": 32000, "category": "Heritage", "amenities": ["Pool", "Spa", "Polo Ground", "Fine Dining", "WiFi"], "description": "Once the residence of the Maharaja of Jaipur, now a magnificent heritage hotel.", "location": "Jaipur, Rajasthan"},
    {"id": "h6", "destination_id": "3", "name": "Solang Valley Resort", "image": "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?w=800", "rating": 4.5, "reviews": 890, "price_per_night": 6500, "category": "Resort", "amenities": ["Mountain View", "Adventure Sports", "Bonfire", "WiFi", "Restaurant"], "description": "Breathtaking alpine resort with panoramic Himalayan views and adventure activities.", "location": "Solang Valley, Manali"},
    {"id": "h7", "destination_id": "4", "name": "Kumarakom Lake Resort", "image": "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800", "rating": 4.8, "reviews": 1650, "price_per_night": 18000, "category": "Luxury", "amenities": ["Lake Access", "Spa", "Ayurveda", "Pool", "Houseboat", "WiFi"], "description": "Luxury heritage resort on the banks of Vembanad Lake with traditional Kerala architecture.", "location": "Kumarakom, Kerala"},
    {"id": "h8", "destination_id": "5", "name": "ITC Mughal Agra", "image": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800", "rating": 4.7, "reviews": 3200, "price_per_night": 9500, "category": "Luxury", "amenities": ["Pool", "Spa", "Taj View", "Fine Dining", "WiFi", "Gym"], "description": "Iconic luxury hotel inspired by Mughal architecture with a stunning view of the Taj Mahal.", "location": "Agra Cantonment"},
]

PACKAGES = [
    {"id": "p1", "title": "Golden Triangle Explorer", "destinations": ["Delhi", "Agra", "Jaipur"], "duration": "6 Days / 5 Nights", "price": 28999, "image": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800", "rating": 4.8, "reviews": 4200, "includes": ["Flights", "Hotels", "Meals", "Guide", "Transport"], "highlights": ["Taj Mahal Sunrise", "Amber Fort", "Qutub Minar"]},
    {"id": "p2", "title": "Kerala Serenity", "destinations": ["Munnar", "Alleppey", "Kovalam"], "duration": "7 Days / 6 Nights", "price": 35999, "image": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", "rating": 4.9, "reviews": 3100, "includes": ["Flights", "Houseboat", "Resorts", "Ayurveda", "Meals"], "highlights": ["Backwater Cruise", "Tea Plantation", "Beach Sunset"]},
    {"id": "p3", "title": "Goa Sun & Sand", "destinations": ["North Goa", "South Goa"], "duration": "4 Days / 3 Nights", "price": 18999, "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", "rating": 4.6, "reviews": 5800, "includes": ["Flights", "Hotel", "Breakfast", "Water Sports"], "highlights": ["Beach Parties", "Water Sports", "Fort Tour"]},
    {"id": "p4", "title": "Himalayan Adventure", "destinations": ["Manali", "Rohtang", "Solang"], "duration": "5 Days / 4 Nights", "price": 22999, "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800", "rating": 4.7, "reviews": 2900, "includes": ["Transport", "Hotel", "Meals", "Adventure Sports", "Guide"], "highlights": ["Snow Activities", "Paragliding", "Camping"]},
]

# ─── Startup: Seed MongoDB if empty ──────────────────────────────────────────

@app.on_event("startup")
async def seed_database():
    if await db["destinations"].count_documents({}) == 0:
        await db["destinations"].insert_many(DESTINATIONS)
        print("✅ Destinations seeded")

    if await db["hotels"].count_documents({}) == 0:
        await db["hotels"].insert_many(HOTELS)
        print("✅ Hotels seeded")

    if await db["packages"].count_documents({}) == 0:
        await db["packages"].insert_many(PACKAGES)
        print("✅ Packages seeded")

# ─── Models ───────────────────────────────────────────────────────────────────

class HotelBooking(BaseModel):
    hotel_id: str
    guest_name: str
    guest_email: str
    guest_phone: str
    check_in: date
    check_out: date
    rooms: int = 1
    adults: int = 2
    children: int = 0
    special_requests: Optional[str] = None
    password: str                          

class PackageBooking(BaseModel):
    package_id: str
    traveler_name: str
    traveler_email: str
    traveler_phone: str
    travel_date: date
    adults: int = 2
    children: int = 0
    special_requests: Optional[str] = None
    password: str                         

class BookingQuery(BaseModel):           
    email: str
    password: str

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "message": "WanderLust Travel API is live 🌍",
        "instance_port": PORT,
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "instance_port": PORT,
        "timestamp": time.time()
    }

# ── Destinations ──────────────────────────────────────────────────────────────

@app.get("/destinations")
async def get_destinations(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category and category != "All":
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"country": {"$regex": search, "$options": "i"}}
        ]
    results = await db["destinations"].find(query).to_list(length=100)
    return [fix_id(d) for d in results]

@app.get("/destinations/{destination_id}")
async def get_destination(destination_id: str):
    dest = await db["destinations"].find_one({"id": destination_id})
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return fix_id(dest)

# ── Hotels ────────────────────────────────────────────────────────────────────

@app.get("/hotels")
async def get_hotels(destination_id: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if destination_id:
        query["destination_id"] = destination_id
    if category and category != "All":
        query["category"] = category
    results = await db["hotels"].find(query).to_list(length=100)
    return [fix_id(h) for h in results]

@app.get("/hotels/{hotel_id}")
async def get_hotel(hotel_id: str):
    hotel = await db["hotels"].find_one({"id": hotel_id})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return fix_id(hotel)

# ── Packages ──────────────────────────────────────────────────────────────────

@app.get("/packages")
async def get_packages():
    results = await db["packages"].find().to_list(length=100)
    return [fix_id(p) for p in results]

@app.get("/packages/{package_id}")
async def get_package(package_id: str):
    pkg = await db["packages"].find_one({"id": package_id})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    return fix_id(pkg)

# ── Bookings ──────────────────────────────────────────────────────────────────

@app.post("/bookings/hotel")
async def book_hotel(booking: HotelBooking):
    hotel = await db["hotels"].find_one({"id": booking.hotel_id})
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    nights = (booking.check_out - booking.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    # hash password before saving
    hashed = bcrypt.hashpw(booking.password.encode(), bcrypt.gensalt()).decode()

    total = hotel["price_per_night"] * nights * booking.rooms
    booking_record = {
        "id": f"BKH{str(uuid.uuid4())[:8].upper()}",
        "type": "hotel",
        "hotel": fix_id(hotel),
        "guest_name": booking.guest_name,
        "guest_email": booking.guest_email,
        "guest_phone": booking.guest_phone,
        "check_in": str(booking.check_in),
        "check_out": str(booking.check_out),
        "rooms": booking.rooms,
        "adults": booking.adults,
        "children": booking.children,
        "nights": nights,
        "total_amount": total,
        "special_requests": booking.special_requests,
        "password": hashed,               
        "status": "Confirmed",
        "booked_at": datetime.now().isoformat(),
    }
    await db["bookings"].insert_one(booking_record)
    fix_id(booking_record)
    booking_record.pop("password", None)   
    return {"success": True, "booking": booking_record}

@app.post("/bookings/package")
async def book_package(booking: PackageBooking):
    pkg = await db["packages"].find_one({"id": booking.package_id})
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    # hash password before saving
    hashed = bcrypt.hashpw(booking.password.encode(), bcrypt.gensalt()).decode()

    total = pkg["price"] * (booking.adults + booking.children * 0.5)
    booking_record = {
        "id": f"BKP{str(uuid.uuid4())[:8].upper()}",
        "type": "package",
        "package": fix_id(pkg),
        "traveler_name": booking.traveler_name,
        "traveler_email": booking.traveler_email,
        "traveler_phone": booking.traveler_phone,
        "travel_date": str(booking.travel_date),
        "adults": booking.adults,
        "children": booking.children,
        "special_requests": booking.special_requests,
        "total_amount": total,
        "password": hashed,               
        "status": "Confirmed",
        "booked_at": datetime.now().isoformat(),
    }
    await db["bookings"].insert_one(booking_record)
    fix_id(booking_record)
    booking_record.pop("password", None)   
    return {"success": True, "booking": booking_record}

@app.post("/bookings/view")                
async def get_bookings(query: BookingQuery):
    # find one booking first to verify password
    booking = await db["bookings"].find_one({
        "$or": [{"guest_email": query.email}, {"traveler_email": query.email}]
    })

    if not booking:
        raise HTTPException(status_code=404, detail="No bookings found for this email")

    # verify password against hashed value
    if not bcrypt.checkpw(query.password.encode(), booking["password"].encode()):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # fetch all bookings for this email
    results = await db["bookings"].find({
        "$or": [{"guest_email": query.email}, {"traveler_email": query.email}]
    }).to_list(length=100)

    # remove password field before returning to frontend
    for b in results:
        b.pop("password", None)
        fix_id(b)

    return results

# ── Search ────────────────────────────────────────────────────────────────────

@app.get("/search")
async def search(q: str = Query(..., min_length=1)):
    regex = {"$regex": q, "$options": "i"}
    destinations = await db["destinations"].find({"name": regex}).to_list(length=20)
    hotels = await db["hotels"].find({"name": regex}).to_list(length=20)
    packages = await db["packages"].find({"title": regex}).to_list(length=20)
    return {
        "destinations": [{"type": "destination", **fix_id(d)} for d in destinations],
        "hotels": [{"type": "hotel", **fix_id(h)} for h in hotels],
        "packages": [{"type": "package", **fix_id(p)} for p in packages],
    }

# ─── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)