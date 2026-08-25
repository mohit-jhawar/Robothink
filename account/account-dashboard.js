/* ==========================================================================
   RoboThink Account — dashboard logic (kids, subscriptions, orders)
   ========================================================================== */
(() => {
  RoboAccount.requireAuth();

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
    document.getElementById('logout-btn').addEventListener('click', () => RoboAccount.logout());
    try {
      const me = await RoboAccount.apiFetch('/auth/me');
      document.getElementById('account-email').textContent = me.full_name ? `${me.full_name} · ${me.email}` : me.email;
    } catch {
      // apiFetch already redirects to login on auth failure
    }
  }

  /* ---------------- Kids ---------------- */
  let childrenCache = [];

  async function loadChildren() {
    try {
      const data = await RoboAccount.apiFetch('/portal/children');
      childrenCache = data.children || [];
      renderChildren(childrenCache);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderChildren(children) {
    const tbody = document.getElementById('children-tbody');
    const empty = document.getElementById('children-empty');
    tbody.innerHTML = children.map((c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.age ?? '—'}</td>
        <td>${escapeHtml(c.notes || '—')}</td>
        <td class="row-actions"><button class="danger" data-delete="${c.id}">Remove</button></td>
      </tr>
    `).join('');
    empty.style.display = children.length ? 'none' : 'block';

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this child from your account?')) return; // eslint-disable-line no-alert
        try {
          await RoboAccount.apiFetch(`/portal/children/${btn.dataset.delete}`, { method: 'DELETE' });
          loadChildren();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }

  function openChildForm() {
    document.getElementById('child-form-card').style.display = 'block';
  }

  function closeChildForm() {
    document.getElementById('child-form-card').style.display = 'none';
    document.getElementById('child-form').reset();
  }

  async function submitChildForm(e) {
    e.preventDefault();
    const payload = {
      name: document.getElementById('child-name').value.trim(),
      age: parseInt(document.getElementById('child-age').value, 10) || null,
      notes: document.getElementById('child-notes').value.trim() || null,
    };
    try {
      await RoboAccount.apiFetch('/portal/children', { method: 'POST', body: JSON.stringify(payload) });
      closeChildForm();
      loadChildren();
    } catch (err) {
      toast(err.message, true);
    }
  }

  /* ---------------- Subscriptions ---------------- */
  async function loadSubscriptions() {
    try {
      const data = await RoboAccount.apiFetch('/portal/subscriptions');
      renderSubscriptions(data.subscriptions || []);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderSubscriptions(subs) {
    const tbody = document.getElementById('subscriptions-tbody');
    const empty = document.getElementById('subscriptions-empty');
    tbody.innerHTML = subs.map((s) => `
      <tr>
        <td>${escapeHtml(s.pricing_plans?.name || 'Membership')}</td>
        <td>${escapeHtml(s.children?.name || '—')}</td>
        <td><span class="status-badge status-${s.status}">${s.cancel_at_period_end ? 'canceling' : escapeHtml(s.status)}</span></td>
        <td>${s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</td>
        <td class="row-actions">
          ${s.status === 'active' && !s.cancel_at_period_end ? `<button class="danger" data-cancel="${s.id}">Cancel</button>` : '—'}
        </td>
      </tr>
    `).join('');
    empty.style.display = subs.length ? 'none' : 'block';

    tbody.querySelectorAll('[data-cancel]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Cancel this subscription at the end of the current period?')) return; // eslint-disable-line no-alert
        try {
          await RoboAccount.apiFetch(`/portal/subscriptions/${btn.dataset.cancel}/cancel`, { method: 'POST' });
          loadSubscriptions();
        } catch (err) {
          toast(err.message, true);
        }
      });
    });
  }

  /* ---------------- Orders ---------------- */
  async function loadOrders() {
    try {
      const data = await RoboAccount.apiFetch('/portal/orders');
      renderOrders(data.orders || []);
    } catch (err) {
      toast(err.message, true);
    }
  }

  function renderOrders(orders) {
    const tbody = document.getElementById('orders-tbody');
    const empty = document.getElementById('orders-empty');
    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td>${new Date(o.created_at).toLocaleDateString()}</td>
        <td>${escapeHtml(o.pricing_plans?.name || '—')}</td>
        <td>${escapeHtml(o.children?.name || '—')}</td>
        <td>${RoboAccount.formatMoney(o.amount_cents)}</td>
        <td><span class="status-badge status-${o.status}">${escapeHtml(o.status)}</span></td>
      </tr>
    `).join('');
    empty.style.display = orders.length ? 'none' : 'block';
  }

  /* ---------------- Wiring ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initTopbar();
    loadChildren();
    loadSubscriptions();
    loadOrders();

    document.getElementById('child-add-btn').addEventListener('click', openChildForm);
    document.getElementById('child-cancel-btn').addEventListener('click', closeChildForm);
    document.getElementById('child-form').addEventListener('submit', submitChildForm);
  });
})();
