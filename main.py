from fastapi import FastAPI, Request, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from models import User, Order
from auth import create_access_token, get_current_user, verify_password, get_password_hash
import shutil
import os
from datetime import datetime
from db import engine, init_db

app = FastAPI(title="Uthao")
BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Initialize DB
init_db()


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, user=Depends(get_current_user)):
    return templates.TemplateResponse("dashboard.html", {"request": request, "user": user})


@app.post("/api/signup")
def signup(username: str = Form(...), email: str = Form(...), password: str = Form(...)):
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        if session.exec(statement).first():
            raise HTTPException(status_code=400, detail="Email already registered")
        user = User(username=username, email=email, hashed_password=get_password_hash(password))
        session.add(user)
        session.commit()
        session.refresh(user)
        token = create_access_token({"sub": user.email})
        u = user.dict()
        u.pop("hashed_password", None)
        return {"access_token": token, "token_type": "bearer", "user": u}


@app.post("/api/login")
def login(email: str = Form(...), password: str = Form(...)):
    with Session(engine) as session:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token = create_access_token({"sub": user.email})
        u = user.dict()
        u.pop("hashed_password", None)
        return {"access_token": token, "token_type": "bearer", "user": u}


@app.get("/api/profile")
def get_profile(user=Depends(get_current_user)):
    u = user.dict()
    u.pop("hashed_password", None)
    return u


@app.put("/api/profile")
def update_profile(username: str = Form(None), phone: str = Form(None), user=Depends(get_current_user)):
    with Session(engine) as session:
        db_user = session.get(User, user.id)
        if username:
            db_user.username = username
        if phone:
            db_user.phone = phone
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        u = db_user.dict()
        u.pop("hashed_password", None)
        return u


@app.post("/api/profile/avatar")
async def upload_avatar(file: UploadFile = File(...), user=Depends(get_current_user)):
    upload_dir = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{user.id}_{file.filename}"
    path = os.path.join(upload_dir, filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    with Session(engine) as session:
        db_user = session.get(User, user.id)
        db_user.avatar = f"/static/uploads/{filename}"
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
        return {"avatar": db_user.avatar}


@app.post("/api/orders")
def create_order(order: Order, user=Depends(get_current_user)):
    order.user_id = user.id
    order.created_at = datetime.utcnow()
    with Session(engine) as session:
        session.add(order)
        session.commit()
        session.refresh(order)
        return order


@app.get("/api/orders")
def list_orders(user=Depends(get_current_user)):
    with Session(engine) as session:
        stmt = select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc())
        return session.exec(stmt).all()
