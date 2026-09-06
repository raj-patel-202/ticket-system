/**
 * Interactive Seat Selection & Booking Engine
 * Handles Cinema Raked Grids, Stadium Bowl SVGs, and Concert General Admission
 */

const bookingState = {
  eventId: null,
  eventType: 'concert',
  unitPrice: 0.0,
  maxPick: 6,
  selected: new Set(),
  taken: new Set(),
  concertQty: 1
};

function initSeatBooking(config) {
  bookingState.eventId = config.eventId;
  bookingState.eventType = config.eventType;
  bookingState.unitPrice = config.unitPrice;
  bookingState.taken = new Set(config.takenSeats || []);

  if (config.eventType === 'theater') {
    renderCinemaAuditorium(config.capacity, bookingState.taken);
  } else if (config.eventType === 'sport') {
    renderStadiumBowl(config.capacity, bookingState.taken);
  } else {
    // Concert GA is initialized directly via stepper
    updatePriceDisplay();
  }
}

/* ================= CINEMA AUDITORIUM RENDERER ================= */
function buildCinemaLayout(totalSeats) {
  const maxRowWidth = 22;
  const minRowWidth = 8;
  let rows = 9;
  while (totalSeats / rows > maxRowWidth * 0.82 && rows < 16) rows++;

  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, rows);
  const weights = Array.from({ length: rows }, (_, i) => 0.75 + (i / (rows - 1)) * 0.85);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let seatsLeft = totalSeats;

  return weights.map((w, i) => {
    const isLast = i === rows - 1;
    let count = isLast ? seatsLeft : Math.round(totalSeats * (w / weightSum));
    count = Math.min(count, maxRowWidth);
    count = Math.max(minRowWidth, count);
    count = Math.min(count, seatsLeft - (rows - 1 - i) * minRowWidth);
    seatsLeft -= count;
    return { row: rowLetters[i], count };
  });
}

function renderCinemaAuditorium(totalSeats, takenSet) {
  const container = document.getElementById('seat-map-container');
  if (!container) return;

  const layout = buildCinemaLayout(totalSeats);
  const maxCount = Math.max(...layout.map(r => r.count));
  const containerWidth = container.clientWidth || 600;
  const gap = 5;
  const aisleAllowance = maxCount > 8 ? 16 : 0;
  let seatW = Math.floor((containerWidth - (maxCount * gap) - aisleAllowance - 40) / maxCount);
  seatW = Math.max(14, Math.min(26, seatW));

  let html = `
    <div class="screen">
      <div class="screen__arc"></div>
      <div class="screen__label">STAGE / SCREEN</div>
    </div>
    <div class="cinema-map" style="--seat-w:${seatW}px">
  `;

  layout.forEach(({ row, count }) => {
    const mid = Math.floor(count / 2);
    html += `<div class="cinema-row"><span class="cinema-row__label">${row}</span><div class="cinema-row__seats">`;
    for (let i = 1; i <= count; i++) {
      if (i === mid + 1 && count > 8) {
        html += `<span style="width:${seatW * 0.7}px; flex:none;"></span>`;
      }
      const seatId = `${row}${i}`;
      const isTaken = takenSet.has(seatId) || takenSet.has(`Row ${row} · Seat ${i}`);
      html += `
        <button 
          class="seat ${isTaken ? 'seat--taken' : ''}" 
          data-seat="${seatId}"
          ${isTaken ? 'disabled' : ''}
          onclick="toggleSeatClick('${seatId}')"
          title="Row ${row}, Seat ${i} ${isTaken ? '(Taken)' : '(Available)'}">
        </button>
      `;
    }
    html += `</div></div>`;
  });

  html += `</div>`;
  html += renderLegend(false);
  container.innerHTML = html;
}

/* ================= STADIUM CONCENTRIC BOWL ================= */
function renderStadiumBowl(totalSeats, takenSet) {
  const container = document.getElementById('seat-map-container');
  if (!container) return;

  const sectionCount = 6;
  const rowsPerSection = 5;
  const perSection = Math.round(totalSeats / sectionCount);
  const seatsPerRow = Math.max(6, Math.round(perSection / rowsPerSection));

  const W = 620, H = 430;
  const cx = W / 2, cy = H / 2 + 30;
  const fieldRx = 150, fieldRy = 75;
  const ringGap = 16;
  const innerR = 190;

  let svg = `<div class="stadium-map"><svg viewBox="0 0 ${W} ${H}">`;
  svg += `<ellipse class="field" cx="${cx}" cy="${cy}" rx="${fieldRx}" ry="${fieldRy}"></ellipse>`;
  svg += `<text class="field-label" x="${cx}" y="${cy + 4}" text-anchor="middle">ARENA / FIELD</text>`;

  const totalArc = 290;
  const startAngle = -90 - totalArc / 2;
  const sectionArc = totalArc / sectionCount;
  const sectionGapDeg = 3.2;

  for (let s = 0; s < sectionCount; s++) {
    const secStart = startAngle + s * sectionArc + sectionGapDeg / 2;
    const secEnd = startAngle + (s + 1) * sectionArc - sectionGapDeg / 2;
    const secSpan = secEnd - secStart;
    const sectionLetter = String.fromCharCode(65 + s);

    for (let r = 0; r < rowsPerSection; r++) {
      const radius = innerR + r * ringGap;
      for (let i = 0; i < seatsPerRow; i++) {
        const t = seatsPerRow === 1 ? 0.5 : i / (seatsPerRow - 1);
        const angle = secStart + t * secSpan;
        const rad = angle * Math.PI / 180;
        const x = cx + radius * Math.cos(rad);
        const y = cy + radius * 0.72 * Math.sin(rad);
        const seatId = `Sec ${sectionLetter} · Row ${r + 1} · Seat ${i + 1}`;
        const isTaken = takenSet.has(seatId) || takenSet.has(`${sectionLetter}-${r+1}-${i+1}`);

        svg += `
          <circle 
            class="seat-dot ${isTaken ? 'seat-dot--taken' : ''}" 
            data-seat="${seatId}"
            cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2"
            fill="${isTaken ? 'rgba(255,255,255,0.12)' : 'rgba(25, 135, 84, 0.45)'}"
            stroke="${isTaken ? 'none' : 'rgba(25, 135, 84, 0.75)'}" stroke-width="1"
            onclick="${isTaken ? '' : `toggleSeatClick('${seatId}')`}">
          </circle>
        `;
      }
    }

    const labelR = innerR + rowsPerSection * ringGap + 12;
    const midAngle = (secStart + secEnd) / 2;
    const midRad = midAngle * Math.PI / 180;
    const lx = cx + labelR * Math.cos(midRad);
    const ly = cy + labelR * 0.72 * Math.sin(midRad);
    svg += `<text class="section-label" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">SEC ${sectionLetter}</text>`;
  }

  svg += `</svg></div>`;
  svg += renderLegend(true);
  container.innerHTML = svg;
}

function renderLegend(isDot) {
  const dotClass = isDot ? ' legend__swatch--dot' : '';
  return `
    <div class="legend">
      <div class="legend__item"><span class="legend__swatch legend__swatch--avail${dotClass}"></span>Available</div>
      <div class="legend__item"><span class="legend__swatch legend__swatch--selected${dotClass}"></span>Selected</div>
      <div class="legend__item"><span class="legend__swatch legend__swatch--taken${dotClass}"></span>Occupied</div>
    </div>
  `;
}

/* ================= SEAT SELECTION INTERACTIONS ================= */
function toggleSeatClick(seatId) {
  if (bookingState.taken.has(seatId)) return;

  if (bookingState.selected.has(seatId)) {
    bookingState.selected.delete(seatId);
  } else {
    if (bookingState.selected.size >= bookingState.maxPick) {
      if (window.showToast) {
        showToast(`You can choose up to ${bookingState.maxPick} seats per purchase.`, 'info');
      }
      return;
    }
    bookingState.selected.add(seatId);
  }

  updateSelectionVisuals();
  updatePriceDisplay();
}

function updateSelectionVisuals() {
  // Update Cinema seats
  document.querySelectorAll('#seat-map-container .seat').forEach(el => {
    const id = el.dataset.seat;
    el.classList.toggle('seat--selected', bookingState.selected.has(id));
  });

  // Update Stadium dots
  document.querySelectorAll('#seat-map-container .seat-dot').forEach(el => {
    const id = el.dataset.seat;
    const isSel = bookingState.selected.has(id);
    el.setAttribute('r', isSel ? 6.0 : 4.2);
    if (isSel) {
      el.setAttribute('fill', '#10b981');
      el.setAttribute('stroke', '#ffffff');
    } else if (!bookingState.taken.has(id)) {
      el.setAttribute('fill', 'rgba(25, 135, 84, 0.45)');
      el.setAttribute('stroke', 'rgba(25, 135, 84, 0.75)');
    }
  });

  // Update seat display labels
  const labelEl = document.getElementById('selected-seats-label');
  const count = bookingState.selected.size;
  if (labelEl) {
    if (count === 0) {
      labelEl.textContent = 'None selected';
    } else {
      labelEl.textContent = Array.from(bookingState.selected).join(', ');
    }
  }

  const buyBtn = document.getElementById('buy-submit-btn');
  if (buyBtn && bookingState.eventType !== 'concert') {
    buyBtn.disabled = count === 0;
  }
}

function updatePriceDisplay() {
  let count = 1;
  if (bookingState.eventType === 'concert') {
    count = bookingState.concertQty;
  } else {
    count = bookingState.selected.size;
  }

  const total = (bookingState.unitPrice * (count || 0)).toFixed(2);
  const totalEl = document.getElementById('total-price-out');
  if (totalEl) {
    totalEl.textContent = `$${total}`;
  }

  const qtyEl = document.getElementById('seat-count-summary');
  if (qtyEl) {
    qtyEl.textContent = `${count} ticket${count === 1 ? '' : 's'}`;
  }
}

/* ================= CONCERT GA QUANTITY STEPPER ================= */
function changeConcertQty(delta) {
  bookingState.concertQty = Math.max(1, Math.min(8, bookingState.concertQty + delta));
  const el = document.getElementById('concert-qty-val');
  if (el) el.textContent = bookingState.concertQty;
  updatePriceDisplay();
}

/* ================= CHECKOUT & BOOKING ================= */
async function executePurchase() {
  const buyBtn = document.getElementById('buy-submit-btn');
  if (!buyBtn || buyBtn.disabled) return;

  let seats = [];
  if (bookingState.eventType === 'concert') {
    seats = Array.from({ length: bookingState.concertQty }, (_, i) => `GA · Tier Floor · Pass #${i + 1}`);
  } else {
    seats = Array.from(bookingState.selected);
  }

  if (seats.length === 0) {
    if (window.showToast) showToast('Please select at least one seat.', 'error');
    return;
  }

  buyBtn.classList.add('is-buying');
  buyBtn.disabled = true;

  try {
    const response = await fetch('/api/tickets/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: bookingState.eventId,
        seat_positions: seats
      })
    });

    const data = await response.json();

    if (response.ok) {
      buyBtn.classList.add('is-bought');
      const ticketCard = document.querySelector('.booking-ticket');
      if (ticketCard) ticketCard.classList.add('is-sold');

      if (window.showToast) showToast('Tickets reserved successfully! Generating pass...', 'success');

      setTimeout(() => {
        window.location.href = '/my-tickets';
      }, 1200);
    } else {
      buyBtn.classList.remove('is-buying');
      buyBtn.disabled = false;
      if (window.showToast) showToast(data.detail || 'Failed to complete ticket purchase.', 'error');
    }
  } catch (err) {
    buyBtn.classList.remove('is-buying');
    buyBtn.disabled = false;
    if (window.showToast) showToast('Network error while completing transaction.', 'error');
  }
}
