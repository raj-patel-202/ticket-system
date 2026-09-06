/**
 * Admin Portal & Organizer Dashboard Analytics JS
 */

// Search/Filter table helper
function filterTable(inputId, tableId) {
  const input = document.getElementById(inputId);
  const filter = input.value.toLowerCase();
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = table.getElementsByTagName('tr');
  for (let i = 1; i < rows.length; i++) {
    const rowText = rows[i].textContent.toLowerCase();
    if (rowText.indexOf(filter) > -1) {
      rows[i].style.display = '';
    } else {
      rows[i].style.display = 'none';
    }
  }
}

// Live Telemetry Refresh
async function refreshAdminMetrics() {
  try {
    const res = await fetch('/api/admin/analytics');
    if (res.ok) {
      const data = await res.json();
      const uptimeEl = document.getElementById('telemetry-uptime');
      if (uptimeEl) uptimeEl.textContent = data.server.uptime;

      const revEl = document.getElementById('metric-total-rev');
      if (revEl) revEl.textContent = `$${data.metrics.total_revenue.toLocaleString()}`;

      const tktEl = document.getElementById('metric-total-tickets');
      if (tktEl) tktEl.textContent = data.metrics.total_tickets_sold.toLocaleString();
    }
  } catch (e) {
    // Ignore silent background refresh failure
  }
}

// Start auto-refresh timer every 20 seconds on admin page
if (window.location.pathname.startsWith('/admin')) {
  setInterval(refreshAdminMetrics, 20000);
}
