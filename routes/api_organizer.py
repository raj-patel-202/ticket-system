from fastapi import APIRouter, Depends
from database.core import get_db_connection
from utils.auth import require_organizer

router = APIRouter(prefix="/api/organizer", tags=["Organizer"])

@router.get("/dashboard")
def get_organizer_dashboard(current_user: dict = Depends(require_organizer)):
    conn = get_db_connection()
    
    try:
        # 1. Fetch all events for this organizer
        events = conn.execute("""
            SELECT * FROM events WHERE user_id = ? ORDER BY created_at DESC
        """, (current_user["u_id"],)).fetchall()
        
        events_list = [dict(ev) for ev in events]
        total_events = len(events_list)
        
        total_capacity = sum(ev["capacity"] for ev in events_list)
        total_sold = sum(ev["sold_tickets"] for ev in events_list)
        
        occupancy_pct = (total_sold / total_capacity * 100) if total_capacity > 0 else 0
        
        # 2. Total Revenue
        revenue_row = conn.execute("""
            SELECT SUM(s.selling_price) as total_rev 
            FROM sells s 
            JOIN events e ON s.event_id = e.event_id 
            WHERE e.user_id = ?
        """, (current_user["u_id"],)).fetchone()
        
        total_revenue = round(revenue_row["total_rev"] or 0, 2)
        
        # 3. Recent Sales
        recent_sales_raw = conn.execute("""
            SELECT s.sell_id, s.selling_price, s.purchased_at as transaction_date, 
                   e.event_name, u.username as buyer_name
            FROM sells s
            JOIN events e ON s.event_id = e.event_id
            JOIN users u ON s.user_id = u.u_id
            WHERE e.user_id = ?
            ORDER BY s.purchased_at DESC
            LIMIT 5
        """, (current_user["u_id"],)).fetchall()
        
        recent_sales = [dict(sale) for sale in recent_sales_raw]
    finally:
        conn.close()
    
    return {
        "stats": {
            "total_events": total_events,
            "total_sold": total_sold,
            "occupancy_pct": round(occupancy_pct, 1),
            "total_revenue": total_revenue
        },
        "events": events_list,
        "recent_sales": recent_sales
    }
