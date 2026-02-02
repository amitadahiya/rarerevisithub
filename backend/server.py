from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============ MODELS ============

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None  # Men, Women, Unisex
    mood: Optional[str] = None  # Sensual, Fresh, Woody, Floral
    sizes: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    image_url: Optional[str] = None
    category: Optional[str] = None
    mood: Optional[str] = None
    sizes: List[str] = Field(default_factory=list)

class SocialPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str  # instagram, facebook, pinterest, twitter
    content: str
    caption: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    status: str = "draft"  # draft, scheduled, published
    product_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SocialPostCreate(BaseModel):
    platform: str
    content: str
    caption: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    product_id: Optional[str] = None

class ContentGenerateRequest(BaseModel):
    prompt: str
    platform: str = "instagram"
    tone: str = "elegant"  # elegant, playful, professional
    product_name: Optional[str] = None

class SocialAccount(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    platform: str
    is_connected: bool = False
    credentials: Optional[Dict] = None
    last_sync: Optional[datetime] = None

class AnalyticsData(BaseModel):
    total_posts: int
    total_engagement: int
    followers_growth: int
    top_platform: str


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Rare Revisit Automation Hub API"}

# Products endpoints
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_obj = Product(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(mood: Optional[str] = None, category: Optional[str] = None):
    query = {}
    if mood:
        query['mood'] = mood
    if category:
        query['category'] = category
    
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# Content generation endpoint
@api_router.post("/content/generate")
async def generate_content(request: ContentGenerateRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Create system message based on brand
        system_message = (
            "You are a luxury fragrance brand content creator for Rare Revisit. "
            "Create elegant, sophisticated captions that embody 'Luxury Revisited, Made Personal'. "
            f"Tone: {request.tone}. Keep it poetic yet authentic."
        )
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.prompt)
        response = await chat.send_message(user_message)
        
        return {
            "content": response,
            "platform": request.platform,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logging.error(f"Content generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Social posts endpoints
@api_router.post("/posts", response_model=SocialPost)
async def create_post(post: SocialPostCreate):
    post_obj = SocialPost(**post.model_dump())
    doc = post_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('scheduled_time'):
        doc['scheduled_time'] = doc['scheduled_time'].isoformat()
    await db.posts.insert_one(doc)
    return post_obj

@api_router.get("/posts", response_model=List[SocialPost])
async def get_posts(platform: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if platform:
        query['platform'] = platform
    if status:
        query['status'] = status
    
    posts = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for post in posts:
        if isinstance(post.get('created_at'), str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
        if post.get('scheduled_time') and isinstance(post['scheduled_time'], str):
            post['scheduled_time'] = datetime.fromisoformat(post['scheduled_time'])
    return posts

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

# Social accounts
@api_router.get("/social-accounts", response_model=List[SocialAccount])
async def get_social_accounts():
    accounts = await db.social_accounts.find({}, {"_id": 0}).to_list(100)
    if not accounts:
        # Initialize default accounts
        default_accounts = [
            {"id": str(uuid.uuid4()), "platform": "instagram", "is_connected": False},
            {"id": str(uuid.uuid4()), "platform": "facebook", "is_connected": False},
            {"id": str(uuid.uuid4()), "platform": "pinterest", "is_connected": False},
            {"id": str(uuid.uuid4()), "platform": "twitter", "is_connected": False}
        ]
        await db.social_accounts.insert_many(default_accounts)
        accounts = default_accounts
    return accounts

# Analytics
@api_router.get("/analytics", response_model=AnalyticsData)
async def get_analytics():
    # Mock data for now - will be real when APIs connected
    total_posts = await db.posts.count_documents({})
    return {
        "total_posts": total_posts,
        "total_engagement": 1247,  # Mock
        "followers_growth": 156,  # Mock
        "top_platform": "instagram"  # Mock
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()