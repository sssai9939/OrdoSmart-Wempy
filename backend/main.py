import sys
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Add backend directory to sys.path to allow imports from root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from helpers.order_models import OrderRequest, OrderItem, Customer, Totals
from order_processing import (
    get_next_order_id,
    build_order_docx_path,
    format_order_docx,
    print_file,
)
from enums.order_messages import ResponseMessages

# Project root (directory that contains index.html, css/, js/, images/, orders/)
ROOT = Path(__file__).resolve().parent.parent

app = FastAPI(title=ResponseMessages.RESTAURANT_TITLE.value)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Serve static directories ---
if (ROOT / "css").exists():
    app.mount("/css", StaticFiles(directory=str(ROOT / "css")), name="css")
if (ROOT / "js").exists():
    app.mount("/js", StaticFiles(directory=str(ROOT / "js")), name="js")
if (ROOT / "images").exists():
    app.mount("/images", StaticFiles(directory=str(ROOT / "images")), name="images")

# --- HTML pages ---
@app.get("/")
def serve_index():
    index = ROOT / "index.html"
    if not index.exists():
        return {"message": ResponseMessages.HTML_SERVER_SUCCESS.value}
    return FileResponse(str(index))

@app.get("/menu")
def serve_menu():
    return FileResponse(str(ROOT / "menu.html"))

@app.get("/cart")
def serve_cart():
    return FileResponse(str(ROOT / "cart.html"))

# --- API Endpoints ---
@app.post("/submit_order")
def submit_order(order: OrderRequest):
    try:
        order_id = get_next_order_id()
        docx_path = build_order_docx_path(order_id)

        format_order_docx(order, order_id, docx_path)
        print_file(docx_path)

        return {"success": True, "order_id": order_id, "file_path": str(docx_path)}
    except Exception as e:
        print(f"{ResponseMessages.PROCESSING_ORDER_FAILED.value} : {e}")
        raise HTTPException(status_code=500, detail=f"{ResponseMessages.PROCESSING_ORDER_FAILED.value} : {e}")

@app.get("/print_order/{order_id}")
def reprint_order(order_id: int):
    docx_path = build_order_docx_path(order_id)
    if not docx_path.exists():
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found.")
    try:
        print_file(docx_path)
        return {"success": True, "message": f"Order {order_id} sent to printer."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not print order {order_id}: {e}")