# AuraPass — Core System Architecture & Project Documentation

A comprehensive overview of the AuraPass dynamic ticketing platform, detailing core architectural mechanisms, concurrency controls, pricing algorithms, telemetry diagnostics, technology choices, and key evaluation questions and answers.

---

## 📑 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [Core Mechanisms Explained](#core-mechanisms-explained)
   - [1. Seat Lockout & Concurrency Control (Two Simultaneous Bookings)](#1-seat-lockout--concurrency-control)
   - [2. Dynamic Pricing Calculation Engine](#2-dynamic-pricing-calculation-engine)
   - [3. System Analytics & Hardware Telemetry](#3-system-analytics--hardware-telemetry)
   - [4. Authentication & Role-Based Access Control (RBAC)](#4-authentication--role-based-access-control)
   - [5. Ticket Generation & Unique Serialization](#5-ticket-generation--unique-serialization)
   - [6. Multi-Venue Seating Topologies](#6-multi-venue-seating-topologies)
   - [7. Liquid Glassmorphic Interface & Background Theme](#7-liquid-glassmorphic-interface--background-theme)
4. [Critical Questions & Answers (Frequently Asked Questions)](#critical-questions--answers)

---

## Executive Summary

**AuraPass** is a full-stack event ticketing platform built around dynamic real-time seat selection, multi-tiered algorithmic demand pricing, role-based organizer workflows, and high-frequency administrative telemetry. The user interface features an Apple VisionOS-inspired liquid glassmorphism design with ambient lighting and event-type vector art that shimmers through translucent frosted surfaces.

---

## Technology Stack

### Backend
| Technology | Role | Justification |
| :--- | :--- | :--- |
| **Python 3.11+** | Application Runtime | Modern language features, clean syntax, type hinting, and rapid development capabilities. |
| **FastAPI** | High-Performance Web Framework | High-speed ASGI framework built on Starlette and Pydantic, offering native async handling, automatic JSON schema validation, and high throughput. |
| **Uvicorn** | ASGI Web Server | Lightning-fast asynchronous server implementation for production-ready request handling. |
| **SQLite 3 (WAL Mode)** | Relational Database | Zero-configuration, ACID-compliant database with full foreign key constraints and Write-Ahead Logging (WAL) for rapid concurrent read operations. |
| **Pydantic v2** | Data Validation & Schemas | Strict type enforcement and sanitization for API request payloads and responses. |
| **PyJWT** | Authentication Tokens | Industry-standard signed JWT payloads stored in secure, tamper-proof HTTP-only cookies. |
| **Bcrypt** | Password Hashing | One-way adaptive cryptographic hashing with individual salts to defend against rainbow table and brute-force attacks. |
| **psutil** | Hardware Diagnostics | Low-level OS telemetry integration for CPU, RAM, and process memory monitoring. |

### Frontend
| Technology | Role | Justification |
| :--- | :--- | :--- |
| **React 18** | Single Page Application UI | Declarative component state management, rapid DOM diffing, and seamless user experience without page reloads. |
| **React Router v6** | Client-Side Routing | Browser-based URL navigation, protected route guards, and history management. |
| **Vanilla CSS3** | Design System & Styling | Maximum layout flexibility, custom CSS property tokens, glassmorphism filters, specular bevel highlights, and hardware-accelerated micro-animations. |
| **SVG (Scalable Vector Graphics)** | Visual Doodles & Seating Maps | Crisp, resolution-independent rendering of stadium bowls, theater auditorium grids, and thematic event artwork. |
| **Babel Standalone** | In-Browser JSX Transpilation | Enables live component modularity without heavy node-based compilation pipelines. |

---

## Core Mechanisms Explained

### 1. Seat Lockout & Concurrency Control
> **The Problem**: What happens if two buyers (Buyer A and Buyer B) click **"Confirm Purchase"** on the exact same seat (e.g., `Row D · Seat 12`) at the exact same fraction of a second?

#### How the System Prevents Double-Booking
1. **Pre-Purchase Collision Query**:
   When a purchase request hits `/api/tickets/buy`, the server executes a query against the `sells` table:
   ```sql
   SELECT position_of_seat FROM sells 
   WHERE event_id = ? AND position_of_seat IN (?)
   ```
2. **ACID Transaction Boundary**:
   The entire booking operation (collision verification, seat registration, revenue recording, and event capacity decrement) executes inside a single database transaction.
3. **Write Lock & Serialization**:
   - SQLite manages write locks automatically. Whichever buyer's request acquires the lock first writes the purchase record with the chosen seat name into `sells`.
   - The second concurrent transaction, executing a fraction of a millisecond later, encounters the newly inserted seat record during its collision query.
4. **Immediate Rejection & User Notification**:
   - The second transaction detects the collision, immediately rolls back, and raises an **HTTP 409 Conflict** exception:
     > *"The following seat(s) were just taken: Row D · Seat 12. Please choose different seats."*
   - The user's screen displays an instant error alert, deselects the taken seat, and fetches the latest occupied seats list without crashing.
5. **Capacity Guarding**:
   In addition to individual seat locks, an overall inventory check ensures that `requested_tickets <= (capacity - sold_tickets)`. Even in non-assigned General Admission events, this stops total capacity from ever being oversold.

---

### 2. Dynamic Pricing Calculation Engine
> **The Goal**: Automatically adjust ticket prices based on real-world market principles: **scarcity (demand)** and **urgency (time remaining)**.

The dynamic pricing engine operates on a dual-factor algorithmic formula:

$$\text{Final Price} = \text{Base Price} \times \left(1 + \frac{\text{Hike Percentage}}{100}\right)$$

#### Factor A: Scarcity / Demand (Capacity Sold Ratio)
The percentage of tickets already purchased sets the foundation:
- **Base Tier (< 50% Sold)**:
  Standard original pricing (0% base hike).
- **Tier 1 Demand (50% to 89% Sold)**:
  Base hike of **+20%**. Reflects growing interest as half the venue fills up.
- **Tier 2 Peak Surge (90%+ Sold)**:
  Base hike of **+50%**. Triggers when seats become scarce.

#### Factor B: Time Urgency
The time urgency factor measures how much time has passed since the event was announced relative to how close it is to the event date:

$$\text{Urgency Factor} = 1.0 - \left(\frac{\text{Time Left}}{\text{Total Event Duration}}\right)$$

- If an event was just posted, Urgency is near `0.0`.
- As the event day approaches, Urgency scales toward `1.0`.

#### Combining Demand & Urgency
- In **Tier 1 (50%–89% sold)**: The system adds up to an extra **+15%** based on urgency:
  $$\text{Hike} = 20\% + (\text{Urgency} \times 15\%)$$  *(Total hike ranges from 20% to 35%)*
- In **Tier 2 (90%+ sold)**: The system adds up to an extra **+40%** based on urgency:
  $$\text{Hike} = 50\% + (\text{Urgency} \times 40\%)$$  *(Total hike ranges from 50% to 90%)*

#### Group Booking Incentive
To incentivize multi-ticket purchases, orders exceeding 2 tickets automatically receive a **5% discount on every additional ticket** beyond the first two:
- Ticket 1 & Ticket 2: Standard dynamic price.
- Ticket 3, 4, 5...: 5% off each extra ticket.

---

### 3. System Analytics & Hardware Telemetry
> **The Goal**: Provide real-time operational visibility into server health, database response latency, and platform revenue without needing external third-party monitoring agents.

The admin telemetry system aggregates live metrics across four dimensions:

1. **Database Responsiveness & Diagnostics**:
   - **Ping Latency (ms)**: Measured using microsecond-precision timers (`time.perf_counter()`) during an active database heartbeat ping.
   - **Database Footprint**: Real-time byte size measurement of the active SQLite database file.
   - **Live Table Densities**: Instantaneous count of registered users, active events, and completed ticket sales.
2. **CPU & Processor Utilization**:
   - Live CPU load percentage sampled through `psutil`.
   - Host processor model name and total logical CPU core count.
3. **Memory & RAM Consumption**:
   - Total host physical RAM vs. currently utilized memory percentage.
   - Specific resident set size (RSS) footprint of the active Python web process in megabytes.
4. **Disk Storage Headroom**:
   - Total disk storage, used space, free space in gigabytes, and storage utilization percentage via `shutil.disk_usage`.
5. **Business Intelligence (BI)**:
   - Platform-wide net revenue and total admission passes issued.
   - Breakdown of ticket sales and revenue distribution across Concerts, Theaters, and Sporting Matches.
   - Individual organizer performance rankings and detailed buyer transaction histories.

---

### 4. Authentication & Role-Based Access Control
> **The Goal**: Secure the platform while maintaining a friction-free experience across different user types.

1. **Security & Hashing**:
   - Passwords are never stored in plain text. They are hashed using **Bcrypt** with unique salts.
   - Maximum byte truncation protection ensures compatibility across password lengths.
2. **Session Handling via HTTP-Only Cookies**:
   - Authentication relies on signed JSON Web Tokens (JWT) containing the user ID, issue time, and expiration timestamp.
   - The token is transmitted exclusively inside an **HTTP-only, SameSite=Lax cookie**, protecting user sessions against Cross-Site Scripting (XSS) token theft.
3. **Three Distinct User Roles**:
   - **Buyer**: Can browse events, inspect live 3D seating charts, book tickets, and view digital barcode passes in *My Tickets*.
   - **Organizer**: Can access the *Organizer Dashboard*, monitor revenue velocity, and create new events with custom venue capacities, dates, and base prices.
   - **Admin**: Full platform oversight via the *Admin Portal*, including live hardware telemetry, user role directories, and organizer audits. Administrative accounts are protected and cannot be created via public registration; they are provisioned through a dedicated CLI tool ([create_admin.py](file:///d:/project_3d%20map/ticketing_platform/create_admin.py)).

---

### 5. Ticket Generation & Unique Serialization
When a purchase completes, each seat reservation is assigned an authentic, tamper-evident digital ticket pass:

1. **Format & Prefix**:
   Every ticket receives a unique alphanumeric code formatted by event category:
   - `CN-XXXXX` for **Concerts & Live Music**
   - `TH-XXXXX` for **Theater & Performing Arts**
   - `SP-XXXXX` for **Sporting Events**
2. **Uniqueness Enforcement**:
   - Ticket codes are validated against a database uniqueness constraint.
   - Collision-avoidance loops guarantee no two tickets ever share the same code.
3. **Digital Ticket Presentation**:
   - Displayed as a frosted glass ticket pass with realistic perforation notches, admission gate/door identifiers, event metadata, and a computer-readable barcode visual.

---

### 6. Multi-Venue Seating Topologies
Different events require fundamentally different seating layouts. The platform adapts dynamically based on the event category:

- **Concerts & Live Music**:
  - General Admission (GA) standing floor model.
  - Interactive ticket quantity selector with instant price recalculation.
- **Theater & Performing Arts**:
  - Raked cinema/theater auditorium grid.
  - Features curved stage projection, staggered row letters (`A`, `B`, `C`...), center aisles, and interactive individual seat selection.
- **Sporting Matches & Stadiums**:
  - Multi-tier stadium bowl amphitheater layout.
  - Scaled angled 3D chairs with perspective rotation, section identifiers, and real-time taken/selected status indicators.

---

### 7. Liquid Glassmorphic Interface & Background Theme
- **Apple VisionOS Aesthetic**: Surfaces feature translucent frosted glass styling (`backdrop-filter: blur(8px) saturate(180%)`), crisp white specular top-bevel highlights (`inset 0 1.5px 1.5px`), and subtle glare reflections.
- **Persistent Background Artwork**: Ambient glowing orbs (golden amber, stage violet, stadium cyan, soft rose) alongside vector doodles (electric guitars, headphones, vinyl records, theater comedy/tragedy masks, spotlights, trophies, basketballs) stay visible behind the frosted cards across every page.
- **Smooth Navigation**: Includes an unobtrusive, floating liquid glass **"Move to Top"** button that fades into view upon scrolling and glides back to the top of the window on click.

---

## Critical Questions & Answers

### Q1: How does the system handle database crashes or power loss during a purchase?
> **Answer**: Because SQLite operates in **WAL (Write-Ahead Logging)** mode with strict ACID compliance, all modifications during ticket checkout occur within an atomic transaction. If power fails or the process is killed midway through booking, uncommitted changes are automatically rolled back upon restart. A ticket is either completely registered with its sale record and capacity count updated, or nothing is written at all. Data is never left in a corrupt or half-written state.

### Q2: Why use HTTP-only cookies for JWT instead of LocalStorage?
> **Answer**: Storing authentication tokens in `localStorage` makes them accessible to JavaScript, leaving the platform vulnerable to token theft if any malicious third-party script or XSS vulnerability is introduced. HTTP-only cookies cannot be read or modified by client-side JavaScript, ensuring that even in the event of an XSS defect, session credentials remain protected.

### Q3: How does the platform scale if the number of simultaneous users increases significantly?
> **Answer**:
> - **Stateless Application Layer**: The FastAPI application uses stateless JWTs, meaning multiple server workers or container instances can run behind a load balancer (such as Nginx or AWS ALB) without needing sticky sessions.
> - **Database Separation**: For massive concurrent write throughput, SQLite can be transitioned to an external database like PostgreSQL with zero changes to business logic, since database operations follow clean relational schemas.
> - **Asset Optimization**: All static files (CSS, JS, SVG vector icons) are static assets that can be distributed globally through a Content Delivery Network (CDN) like Cloudflare.

### Q4: Can an Organizer view or edit another Organizer's events?
> **Answer**: No. Every event record contains a `user_id` foreign key pointing to the organizer who created it. Both the frontend dashboard and the backend API (`/api/organizer/dashboard`) strictly filter records by `user_id = current_user["u_id"]`. Organizers can only inspect and manage their own hosted events.

### Q5: How are administrator accounts created if registration is disabled on the web UI?
> **Answer**: To prevent unauthorized users from registering as administrators, the public registration endpoint explicitly rejects the `admin` role with an HTTP 403 Forbidden error. Administrators are provisioned securely via the command-line interface using [create_admin.py](file:///d:/project_3d%20map/ticketing_platform/create_admin.py), which can list existing admins, create new administrator credentials, or promote an existing account.

### Q6: What happens when an event reaches 100% capacity?
> **Answer**: When `sold_tickets == capacity`, the event status automatically flags as **Sold Out**. On the home page, the booking button changes to a disabled *"Sold Out"* state, the seat selection map locks against any further seat picks, and the backend `/api/tickets/buy` endpoint rejects any incoming orders with an HTTP 400 bad request.

### Q7: How does the frontend update dynamic prices when users are selecting seats?
> **Answer**: When the user opens the seat map, the frontend retrieves the current dynamic price, hike percentage, and demand tier directly from the server (`/api/events/{id}/seats`). As the user selects seats, the client recalculates subtotal pricing in real time, applies the 5% group discount on tickets beyond quantity 2, and displays an itemized receipt before confirmation.
