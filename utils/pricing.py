from datetime import datetime, timezone
from typing import Dict, Any

def parse_iso_or_str(dt_val: Any) -> datetime:
    if isinstance(dt_val, datetime):
        if dt_val.tzinfo is None:
            return dt_val.replace(tzinfo=timezone.utc)
        return dt_val
    if isinstance(dt_val, str):
        # Clean potential spaces or formatted strings
        clean_str = dt_val.replace(" ", "T") if " " in dt_val and "T" not in dt_val else dt_val
        try:
            dt = datetime.fromisoformat(clean_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            # Fallback
            return datetime.now(timezone.utc)
    return datetime.now(timezone.utc)

def calculate_dynamic_price(
    base_price: float,
    capacity: int,
    sold_tickets: int,
    created_at: Any,
    event_time: Any,
    offer_percent: float = 0.0,
    now: Any = None
) -> Dict[str, Any]:
    """
    Dynamic pricing based on tickets sold, time left until the event, and organizer promotional offers.
    - Below 50% sold: Base Price (0% hike).
    - 50% to 89% sold: Milestone 1 hike (20% - 30% depending on time urgency).
    - 90%+ sold: Milestone 2 hike (50% - 90% depending on time urgency).
    - Organizer Offer: Applies promotional discount (e.g. 10% off) on top of dynamic surge price.
    Urgency = (time elapsed / total event duration) = (1 - time_left / total_time)
    """
    if now is None:
        now = datetime.now(timezone.utc)
    else:
        now = parse_iso_or_str(now)

    t_posted = parse_iso_or_str(created_at)
    t_event = parse_iso_or_str(event_time)

    # Calculate total duration and remaining duration
    total_seconds = max((t_event - t_posted).total_seconds(), 3600.0) # at least 1 hour
    remaining_seconds = max((t_event - now).total_seconds(), 0.0)

    # Time ratio remaining (from 1.0 when posted to 0.0 at event time)
    time_ratio_remaining = min(max(remaining_seconds / total_seconds, 0.0), 1.0)
    # Urgency increases as event nears: 0.0 (just posted) to 1.0 (event start)
    urgency_factor = 1.0 - time_ratio_remaining

    # Sales capacity ratio
    cap = max(capacity, 1)
    sold_ratio = min(max(sold_tickets / cap, 0.0), 1.0)

    hike_percent = 0.0
    tier_name = "Base Pricing"
    demand_trend = "steady"

    if sold_ratio >= 0.90:
        # Tier 2: 90% tickets sold
        # Base hike 50% + up to 40% additional hike depending on time elapsed / urgency
        hike_percent = 50.0 + (urgency_factor * 40.0)
        tier_name = "Tier 2 Surge (90%+ Sold)"
        demand_trend = "surge"
    elif sold_ratio >= 0.50:
        # Tier 1: 50% tickets sold
        # Base hike 20% + up to 15% additional hike depending on time elapsed / urgency
        hike_percent = 20.0 + (urgency_factor * 15.0)
        tier_name = "Tier 1 Demand (50%+ Sold)"
        demand_trend = "rising"
    else:
        hike_percent = 0.0
        tier_name = "Standard Price (<50% Sold)"
        demand_trend = "steady"

    multiplier = 1.0 + (hike_percent / 100.0)
    surge_price = round(base_price * multiplier, 2)

    # Apply Organizer Promotional Offer / Discount
    valid_offer = min(max(float(offer_percent or 0.0), 0.0), 90.0)
    if valid_offer > 0.0:
        offer_discount = round(surge_price * (valid_offer / 100.0), 2)
        current_price = max(round(surge_price - offer_discount, 2), 1.0)
    else:
        offer_discount = 0.0
        current_price = surge_price

    # Human-readable time left
    if remaining_seconds <= 0:
        time_left_str = "Event ended"
    elif remaining_seconds < 3600:
        mins = int(remaining_seconds // 60)
        time_left_str = f"{mins}m left"
    elif remaining_seconds < 86400:
        hours = int(remaining_seconds // 3600)
        time_left_str = f"{hours}h left"
    else:
        days = int(remaining_seconds // 86400)
        time_left_str = f"{days}d left"

    return {
        "base_price": round(base_price, 2),
        "surge_price": surge_price,
        "offer_percent": round(valid_offer, 1),
        "offer_discount": offer_discount,
        "current_price": current_price,
        "hike_percent": round(hike_percent, 1),
        "tier_name": tier_name,
        "demand_trend": demand_trend,
        "sold_ratio": round(sold_ratio * 100, 1),
        "urgency_factor": round(urgency_factor * 100, 1),
        "time_left_str": time_left_str,
        "available_seats": max(capacity - sold_tickets, 0)
    }
