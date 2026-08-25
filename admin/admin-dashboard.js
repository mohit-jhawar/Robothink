/* ==========================================================================
   RoboThink Admin — dashboard logic (leads, pricing, schedule CRUD)
   ========================================================================== */
(() => {
  RoboAdmin.requireAuth();

  const TYPE_LABELS = {
    trial: 'Free Trial',
    inquiry: 'General Inquiry',
    school: 'School Partnership',
    fll_team_inquiry: 'FLL Team Registration',
    theme_workshop_inquiry: 'Theme Workshop Inquiry',
  };
  const STATUSES = ['new', 'contacted', 'enrolled', 'closed'];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function toast(message, isError = false) {
    alert((isError ? 'Error: ' : '') + message); // eslint-disable-line no-alert
  }

  /* ---------------- Topbar ---------------- */
  async function initTopbar() {
    document.getElementById('logout-btn').addEventListener('click', () => RoboAdmin.logout());
    try {
      const me = await RoboAdmin.apiFetch('/admin/me');
      document.getElementById('admin-email').textContent = me.email;
    } catch {
      // apiFetch already redirects to login on auth failure
    }
  }

  /* ---------------- Leads ---------------- */
  async function loadLeads() {
    const type = document.getElementById('leads-type-filter').value;
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    try {
      const data = await RoboAdmin.apiFetch(`/admin/leads${query}`);
      renderLeads(data.leads || []);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function detailsPreview(lead) {
    const parts = [];
    if (lead.message) parts.push(lead.message);
    Object.entries(lead.details || {}).forEach(([k, v]) => parts.push(`${k}: ${v}`));
    return escapeHtml(parts.join(' · ')) || '—';
  }

  function renderLeads(leads) {
    const tbody = document.getElementById('leads-tbody');
    const empty = document.getElementById('leads-empty');
    tbody.innerHTML = leads.map((l) => `
      <tr>
        <td>${new Date(l.created_at).toLocaleString()}</td>
        <td>${escapeHtml(TYPE_LABELS[l.type] || l.type)}</td>
        <td>${escapeHtml(l.name)}</td>
        <td>${escapeHtml(l.email)}<br><span style="color:var(--color-slate-light); font-size:0.82rem;">${escapeHtml(l.phone || '')}</span></td>
        <td>${escapeHtml(l.city || '—')}</td>
        <td class="details-cell">${detailsPreview(l)}</td>
        <td>
          <select class="status-select status-${l.status}" data-id="${l.id}">
            ${STATUSES.map((s) => `<option value="${s}" ${s === l.status ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </td>
      </tr>
    `).join('');
    empty.style.display = leads.length ? 'none' : 'block';

    tbody.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', async () => {
        const id = select.dataset.id;
        const status = select.value;
        select.className = `status-select status-${status}`;
        try {
          await RoboAdmin.apiFetch(`/admin/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
        } catch (err) {
          toast(err.message, true);
          loadLeads();
        }
      });
    });
  }

  /* ---------------- Pricing ---------------- */
  async function loadPricing() {
    try {
      const [membership, party] = await Promise.all([
        RoboAdmin.apiFetch('/pricing?category=membership'),
        RoboAdmin.apiFetch('/pricing?category=party'),
      ]);
      renderPricing([...(membership.plans || []), ...(party.plans || [])]);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderPricing(plans) {
    const tbody = document.getElementById('pricing-tbody');
    const empty = document.getElementById('pricing-empty');
    tbody.innerHTML = plans.map((p) => `
      <tr>
        <td style="text-transform:capitalize;">${escapeHtml(p.category)}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${RoboAdmin.formatMoney(p.price_cents)}/${escapeHtml(p.billing_period)}</td>
        <td>${p.featured ? '✅' : '—'}</td>
        <td>${p.sort_order}</td>
        <td class="row-actions">
          <button data-edit="${p.id}">Edit</button>
          <button class="danger" data-delete="${p.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    empty.style.display = plans.length ? 'none' : 'block';

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openPricingForm(plans.find((p) => p.id === btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this pricing plan?')) return; // eslint-disable-line no-alert
        try {
          await RoboAdmin.apiFetch(`/pricing/${btn.dataset.delete}`, { method: 'DELETE' });
          loadPricing();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }

  function openPricingForm(plan) {
    document.getElementById('pricing-form-card').style.display = 'block';
    document.getElementById('pricing-form-title').textContent = plan ? 'Edit Pricing Plan' : 'New Pricing Plan';
    document.getElementById('pricing-id').value = plan?.id || '';
    document.getElementById('pricing-category').value = plan?.category || 'membership';
    document.getElementById('pricing-name').value = plan?.name || '';
    document.getElementById('pricing-price').value = plan ? (plan.price_cents / 100).toFixed(2) : '';
    document.getElementById('pricing-period').value = plan?.billing_period || '';
    document.getElementById('pricing-note').value = plan?.price_note || '';
    document.getElementById('pricing-features').value = (plan?.features || []).join('\n');
    document.getElementById('pricing-cta-label').value = plan?.cta_label || 'Get Started';
    document.getElementById('pricing-cta-href').value = plan?.cta_href || 'contact.html';
    document.getElementById('pricing-sort').value = plan?.sort_order ?? 0;
    document.getElementById('pricing-featured').checked = !!plan?.featured;
  }

  function closePricingForm() {
    document.getElementById('pricing-form-card').style.display = 'none';
    document.getElementById('pricing-form').reset();
  }

  async function submitPricingForm(e) {
    e.preventDefault();
    const id = document.getElementById('pricing-id').value;
    const payload = {
      category: document.getElementById('pricing-category').value,
      name: document.getElementById('pricing-name').value.trim(),
      price_cents: Math.round(parseFloat(document.getElementById('pricing-price').value) * 100),
      billing_period: document.getElementById('pricing-period').value.trim(),
      price_note: document.getElementById('pricing-note').value.trim() || null,
      features: document.getElementById('pricing-features').value.split('\n').map((s) => s.trim()).filter(Boolean),
      cta_label: document.getElementById('pricing-cta-label').value.trim() || 'Get Started',
      cta_href: document.getElementById('pricing-cta-href').value.trim() || 'contact.html',
      sort_order: parseInt(document.getElementById('pricing-sort').value, 10) || 0,
      featured: document.getElementById('pricing-featured').checked,
    };
    try {
      if (id) {
        await RoboAdmin.apiFetch(`/pricing/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await RoboAdmin.apiFetch('/pricing', { method: 'POST', body: JSON.stringify(payload) });
      }
      closePricingForm();
      loadPricing();
    } catch (err) {
      toast(err.message, true);
    }
  }

  /* ---------------- Schedule ---------------- */
  async function loadSchedule() {
    try {
      const data = await RoboAdmin.apiFetch('/schedule');
      renderSchedule(data.locations || []);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderSchedule(locations) {
    const tbody = document.getElementById('schedule-tbody');
    const empty = document.getElementById('schedule-empty');
    tbody.innerHTML = locations.map((loc) => `
      <tr>
        <td class="city-cell">${escapeHtml(loc.city)}</td>
        <td>${escapeHtml(loc.venue)}</td>
        <td>${escapeHtml(loc.program)}</td>
        <td>${escapeHtml(loc.day_time)}</td>
        <td>${escapeHtml(loc.ages)}</td>
        <td>${loc.sort_order}</td>
        <td class="row-actions">
          <button data-edit="${loc.id}">Edit</button>
          <button class="danger" data-delete="${loc.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    empty.style.display = locations.length ? 'none' : 'block';

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openScheduleForm(locations.find((l) => l.id === btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this schedule entry?')) return; // eslint-disable-line no-alert
        try {
          await RoboAdmin.apiFetch(`/schedule/${btn.dataset.delete}`, { method: 'DELETE' });
          loadSchedule();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }

  function openScheduleForm(loc) {
    document.getElementById('schedule-form-card').style.display = 'block';
    document.getElementById('schedule-form-title').textContent = loc ? 'Edit Schedule Entry' : 'New Schedule Entry';
    document.getElementById('schedule-id').value = loc?.id || '';
    document.getElementById('schedule-city').value = loc?.city || '';
    document.getElementById('schedule-venue').value = loc?.venue || '';
    document.getElementById('schedule-program').value = loc?.program || '';
    document.getElementById('schedule-daytime').value = loc?.day_time || '';
    document.getElementById('schedule-ages').value = loc?.ages || '';
    document.getElementById('schedule-sort').value = loc?.sort_order ?? 0;
  }

  function closeScheduleForm() {
    document.getElementById('schedule-form-card').style.display = 'none';
    document.getElementById('schedule-form').reset();
  }

  async function submitScheduleForm(e) {
    e.preventDefault();
    const id = document.getElementById('schedule-id').value;
    const payload = {
      city: document.getElementById('schedule-city').value.trim(),
      venue: document.getElementById('schedule-venue').value.trim(),
      program: document.getElementById('schedule-program').value.trim(),
      day_time: document.getElementById('schedule-daytime').value.trim(),
      ages: document.getElementById('schedule-ages').value.trim(),
      sort_order: parseInt(document.getElementById('schedule-sort').value, 10) || 0,
    };
    try {
      if (id) {
        await RoboAdmin.apiFetch(`/schedule/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await RoboAdmin.apiFetch('/schedule', { method: 'POST', body: JSON.stringify(payload) });
      }
      closeScheduleForm();
      loadSchedule();
    } catch (err) {
      toast(err.message, true);
    }
  }

  /* ---------------- Wiring ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTopbar();
    loadLeads();
    loadPricing();
    loadSchedule();

    document.getElementById('leads-type-filter').addEventListener('change', loadLeads);

    document.getElementById('pricing-add-btn').addEventListener('click', () => openPricingForm(null));
    document.getElementById('pricing-cancel-btn').addEventListener('click', closePricingForm);
    document.getElementById('pricing-form').addEventListener('submit', submitPricingForm);

    document.getElementById('schedule-add-btn').addEventListener('click', () => openScheduleForm(null));
    document.getElementById('schedule-cancel-btn').addEventListener('click', closeScheduleForm);
    document.getElementById('schedule-form').addEventListener('submit', submitScheduleForm);
  });
})();
