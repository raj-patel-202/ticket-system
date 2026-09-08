import random
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from models.schemas import TicketPurchaseRequest, TicketPurchaseResponse
from database.core import get_db_connection
from utils.pricing import calculate_dynamic_price
from utils.auth import get_current_user

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

def generate_ticket_code(event_type: str) -> str:
    prefix_map = {
        "concert": "CN",
        "theater": "TH",
        "sport": "SP"
    }
    prefix = prefix_map.get(event_type.lower(), "TK")
    rand_part = random.randint(10000, 99999)
    return f"{prefix}-{rand_part}"

@router.post("/buy", response_model=TicketPurchaseResponse)
def purchase_tickets(
    order: TicketPurchaseRequest,
    current_user: dict = Depends(get_current_user)
):
    conn = get_db_connection()
    cursor = conn.cursor()

    event = cursor.execute("SELECT * FROM events WHERE event_id = ?", (order.event_id,)).fetchone()
    if not event:
        conn.close()
        raise HTTPException(status_code=404, detail="Event does not exist.")

    if event["status"] != "active":
        conn.close()
        raise HTTPException(status_code=400, detail="Event is not currently open for bookings.")

    requested_count = len(order.seat_positions)
    available = event["capacity"] - event["sold_tickets"]
    if requested_count > available:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Only {available} tickets remaining. Cannot purchase {requested_count}."
        )

    # Check for seat collision (unless GA concert general admission)
    if event["event_type"] != "concert":
        placeholders = ",".join("?" for _ in order.seat_positions)
        collision = cursor.execute(
            f"SELECT position_of_seat FROM sells WHERE event_id = ? AND position_of_seat IN ({placeholders})",
            [order.event_id] + order.seat_positions
        ).fetchall()
        if collision:
            taken_names = [c["position_of_seat"] for c in collision]
            conn.close()
            raise HTTPException(
                status_code=409,
                detail=f"The following seat(s) were just taken: {', '.join(taken_names)}. Please choose different seats."
            )

    # Dynamic pricing at moment of purchase
    pricing = calculate_dynamic_price(
        base_price=event["price_per_ticket"],
        capacity=event["capacity"],
        sold_tickets=event["sold_tickets"],
        created_at=event["created_at"],
        event_time=event["time"]
    )
    unit_price = pricing["current_price"]
    # 5% discount on every extra ticket bought after 2 qty
    if requested_count <= 2:
        total_price = round(unit_price * requested_count, 2)
    else:
        regular_part = 2 * unit_price
        discounted_part = (requested_count - 2) * (unit_price * 0.95)
        total_price = round(regular_part + discounted_part, 2)

    now = datetime.now(timezone.utc).isoformat()

    generated_codes = []
    for idx, seat_pos in enumerate(order.seat_positions):
        # Apply 5% discount on extra tickets beyond 2
        ticket_selling_price = unit_price if idx < 2 else round(unit_price * 0.95, 2)
        code = generate_ticket_code(event["event_type"])
        # Ensure uniqueness
        while cursor.execute("SELECT 1 FROM sells WHERE ticket_code = ?", (code,)).fetchone():
            code = generate_ticket_code(event["event_type"])

        cursor.execute("""
            INSERT INTO sells (user_id, event_id, selling_price, position_of_seat, ticket_code, purchased_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (current_user["u_id"], order.event_id, ticket_selling_price, seat_pos, code, now))
        generated_codes.append(code)

    # Increment sold count
    cursor.execute("""
        UPDATE events SET sold_tickets = sold_tickets + ? WHERE event_id = ?
    """, (requested_count, order.event_id))

    conn.commit()
    conn.close()

    return TicketPurchaseResponse(
        success=True,
        message=f"Successfully purchased {requested_count} ticket(s)!",
        event_id=order.event_id,
        event_name=event["event_name"],
        ticket_codes=generated_codes,
        total_price=total_price,
        seats=order.seat_positions
    )

@router.get("/my-tickets")
def get_user_tickets(current_user: dict = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        rows = conn.execute("""
            SELECT 
                s.sell_id, s.selling_price, s.position_of_seat, s.ticket_code, s.purchased_at,
                e.event_id, e.event_name, e.event_type, e.venue, e.time, e.subtitle
            FROM sells s
            JOIN events e ON s.event_id = e.event_id
            WHERE s.user_id = ?
            ORDER BY s.purchased_at DESC
        """, (current_user["u_id"],)).fetchall()
    finally:
        conn.close()

    results = []
    for r in rows:
        item = dict(r)
        # Format gate / door admission info
        item["admit"] = "ADMIT ONE"
        if item["event_type"] == "concert":
            item["gate_label"] = "GATE"
            item["gate"] = "B"
        elif item["event_type"] == "theater":
            item["gate_label"] = "DOOR"
            item["gate"] = "3"
        else:
            item["gate_label"] = "GATE"
            item["gate"] = "C"
        results.append(item)

    return results
