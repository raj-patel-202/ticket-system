from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query
from models.schemas import EventCreate, EventPricingUpdate
from database.core import get_db_connection
from utils.pricing import calculate_dynamic_price
from utils.auth import require_organizer

router = APIRouter(prefix="/api/events", tags=["Events"])

def enrich_event_with_pricing(event: dict) -> dict:
    pricing = calculate_dynamic_price(
        base_price=event["price_per_ticket"],
        capacity=event["capacity"],
        sold_tickets=event["sold_tickets"],
        created_at=event["created_at"],
        event_time=event["time"],
        offer_percent=event.get("offer_percent", 0.0) or 0.0
    )
    enriched = dict(event)
    enriched.update(pricing)
    return enriched

@router.get("", include_in_schema=False)
@router.get("/")
def list_events(
    event_type: Optional[str] = Query(None, description="concert, theater, or sport"),
    search: Optional[str] = Query(None, description="search event name or venue")
):
    conn = get_db_connection()
    query = "SELECT * FROM events WHERE status = 'active'"
    params = []

    if event_type:
        query += " AND event_type = ?"
        params.append(event_type.lower())
    if search:
        query += " AND (event_name LIKE ? OR venue LIKE ?)"
        wildcard = f"%{search.strip()}%"
        params.extend([wildcard, wildcard])

    query += " ORDER BY time ASC"
    rows = conn.execute(query, params).fetchall()
    conn.close()

    events = [enrich_event_with_pricing(dict(r)) for r in rows]
    return events

@router.get("/{event_id}")
def get_event_detail(event_id: int):
    conn = get_db_connection()
    event = conn.execute("SELECT * FROM events WHERE event_id = ?", (event_id,)).fetchone()
    conn.close()

    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    return enrich_event_with_pricing(dict(event))

@router.get("/{event_id}/seats")
def get_event_seats(event_id: int):
    conn = get_db_connection()
    try:
        event = conn.execute("SELECT * FROM events WHERE event_id = ?", (event_id,)).fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Fetch taken seats
        sells = conn.execute("SELECT position_of_seat FROM sells WHERE event_id = ?", (event_id,)).fetchall()
        taken_seats = [s["position_of_seat"] for s in sells]
        enriched = enrich_event_with_pricing(dict(event))

        return {
            "event_id": event_id,
            "event_name": event["event_name"],
            "event_type": event["event_type"],
            "venue": event["venue"],
            "time": event["time"],
            "subtitle": event["subtitle"] or "",
            "capacity": event["capacity"],
            "sold_tickets": event["sold_tickets"],
            "available_seats": enriched["available_seats"],
            "current_price": enriched["current_price"],
            "surge_price": enriched.get("surge_price", enriched["current_price"]),
            "base_price": enriched["base_price"],
            "offer_percent": enriched.get("offer_percent", 0.0),
            "offer_discount": enriched.get("offer_discount", 0.0),
            "demand_trend": enriched["demand_trend"],
            "hike_percent": enriched["hike_percent"],
            "tier_name": enriched["tier_name"],
            "taken_seats": taken_seats
        }
    finally:
        conn.close()

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_event(
    event_data: EventCreate,
    current_user: dict = Depends(require_organizer)
):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc).isoformat()
    offer_pct = getattr(event_data, "offer_percent", 0.0) or 0.0

    cursor.execute("""
        INSERT INTO events (
            user_id, event_name, event_type, venue, time, capacity, sold_tickets,
            price_per_ticket, offer_percent, subtitle, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, 'active', ?)
    """, (
        current_user["u_id"],
        event_data.event_name.strip(),
        event_data.event_type.lower(),
        event_data.venue.strip(),
        event_data.time,
        event_data.capacity,
        event_data.price_per_ticket,
        offer_pct,
        event_data.subtitle or "",
        now
    ))
    event_id = cursor.lastrowid
    conn.commit()

    created = cursor.execute("SELECT * FROM events WHERE event_id = ?", (event_id,)).fetchone()
    conn.close()

    return enrich_event_with_pricing(dict(created))

@router.patch("/{event_id}/pricing")
def update_event_pricing(
    event_id: int,
    payload: EventPricingUpdate,
    current_user: dict = Depends(require_organizer)
):
    """
    Allows organizers to modify ticket base pricing and apply promotional offers (e.g. 10% off)
    at any time even after the event has been hosted.
    """
    conn = get_db_connection()
    try:
        event = conn.execute("SELECT * FROM events WHERE event_id = ?", (event_id,)).fetchone()
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")

        # Check ownership (unless administrator)
        if current_user["user_type"] != "admin" and event["user_id"] != current_user["u_id"]:
            raise HTTPException(
                status_code=403, 
                detail="You do not have permission to modify pricing for this event."
            )

        updates = []
        params = []
        if payload.price_per_ticket is not None:
            if payload.price_per_ticket <= 0:
                raise HTTPException(status_code=400, detail="Base price must be greater than 0.")
            updates.append("price_per_ticket = ?")
            params.append(round(payload.price_per_ticket, 2))

        if payload.offer_percent is not None:
            if payload.offer_percent < 0 or payload.offer_percent > 90:
                raise HTTPException(status_code=400, detail="Offer discount must be between 0% and 90%.")
            updates.append("offer_percent = ?")
            params.append(round(payload.offer_percent, 1))

        if not updates:
            raise HTTPException(status_code=400, detail="No pricing updates specified.")

        params.append(event_id)
        conn.execute(f"UPDATE events SET {', '.join(updates)} WHERE event_id = ?", params)
        conn.commit()

        updated = conn.execute("SELECT * FROM events WHERE event_id = ?", (event_id,)).fetchone()
        return enrich_event_with_pricing(dict(updated))
    finally:
        conn.close()
