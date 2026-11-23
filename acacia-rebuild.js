/* acacia-rebuild.js - modern navigation, dashboard analytics, Reports, smart tables (search, filter, sort,
   pagination, CSV export) and the mobile menu. Loads after script.js and only wraps its render functions:
   sign-in, Supabase sync, company access and every save/delete path are untouched. */
(function (w) {
  'use strict';
  const A = w.ADX, E = escapeHtml;
  const fm = n => (parseFloat(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ICON = { plans: 'folder', ownership: 'users', progress: 'trend', expenses: 'cash', revisions: 'file', actions: 'check', revenue: 'cash', reports: 'grid', appearance: 'grid' };

  /* ---------- sidebar ---------- */
  w.renderNav = function () {
    let last = '';
    const h = t => `<div class="text-[10px] font-bold uppercase text-slate-400 px-2 pt-4 pb-1">${t}</div>`;
    const b = (id, l) => `<button onclick="go('${id}')" class="nav-btn w-full text-left px-3 py-2 rounded-lg ${id === active ? 'active' : ''}"><span class="acx-ni">${A.ic(ICON[id] || 'grid')}</span>${E(l)}</button>`;
    navList.innerHTML = MODULES.filter(m => !m.hidden).map(m => {
      let hd = ''; if (m.group && m.group !== last) { last = m.group; hd = h(E(m.group)); }
      return hd + b(m.id, m.label);
    }).join('') + h('Insights') + b('reports', 'Reports') + h('Settings') + b('appearance', 'Appearance');
  };

  /* ---------- dashboard analytics (added under the existing Plan Hub dashboard) ---------- */
  const mk = v => { const d = new Date(v); return isNaN(d) ? null : d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
  const sum = a => (a || []).reduce((s, x) => s + (x && parseFloat(x.amount) || 0), 0);
  function series(rows, ms) {
    const t = {}; (rows || []).forEach(r => { if (!r) return; const k = mk(r.invDate || r.date); if (k) t[k] = (t[k] || 0) + (parseFloat(r.amount) || 0); });
    return ms.map(m => ({ l: m.l, v: t[m.k] || 0 }));
  }
  function analytics() {
    const ms = A.months(6), rv = series(store.revenue, ms), ex = series(store.expenses, ms), ps = plansList().filter(Boolean);
    const tgt = ps.reduce((s, p) => s + (parseFloat(p.targetAmount) || 0), 0), got = sum(store.revenue), sp = sum(store.expenses);
    const pr = ['High', 'Medium', 'Low'].map((k, i) => ({ l: k, v: ps.filter(p => p.priority === k).length, c: [A.C.r, A.C.o, A.C.g][i] }));
    const dep = {}; ps.forEach(p => { const d = p.department || 'Unassigned'; dep[d] = (dep[d] || 0) + 1; });
    const dl = Object.entries(dep).sort((a, b) => b[1] - a[1]).slice(0, 5), mx = dl.length ? dl[0][1] : 1;
    return `<div class="adx-wrap" style="margin-bottom:6px"><div class="adx-grid adx-g4">` +
      A.kpi({ i: 'cash', l: 'Total target', v: 'KES ' + A.short(tgt) }) +
      A.kpi({ i: 'cash', c: 'b', l: 'Revenue collected', v: 'KES ' + A.short(got), d: A.delta(rv[5].v, rv[4].v, 'vs last month') }) +
      A.kpi({ i: 'file', c: 'o', l: 'Plan expenses', v: 'KES ' + A.short(sp) }) +
      A.kpi({ i: 'trend', c: 'p', l: 'Net position', v: 'KES ' + A.short(got - sp) }) +
      `</div><div class="adx-grid adx-g111">` +
      A.panel('Revenue by month', A.line(rv), { i: 'cash' }) +
      A.panel('Expenses by month', A.line(ex), { i: 'file' }) +
      A.panel('Priority and departments', A.donut(pr, String(ps.length), 'plans') + dl.map(([n, c]) => A.hb(n, c / mx * 100, c + ' plan' + (c === 1 ? '' : 's'))).join(''), { i: 'folder' }) +
      `</div></div>`;
  }
  const rp = w.renderPlans;
  w.renderPlans = function (m) {
    rp(m);
    const d = document.querySelector('#view .adx-wrap'); if (d) d.insertAdjacentHTML('afterend', analytics());
  };

  /* ---------- Reports (across all plans) ---------- */
  let repTab = 'plans';
  const REPS = [['plans', 'Plan summary'], ['revenue', 'Revenue'], ['expenses', 'Expenses'], ['actions', 'Action items'], ['team', 'Team workload']];
  w.setRep = t => { repTab = t; renderView(); };
  function rtable(cols, rows, num) {
    return `<div class="bg-white rounded-xl border border-slate-200 overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>${cols.map((c, i) => `<th class="px-3 py-2 ${num.includes(i) ? 'text-right' : ''}">${E(c)}</th>`).join('')}</tr></thead><tbody>` +
      (rows.length ? rows.map(r => `<tr class="border-t border-slate-100 hover:bg-slate-50">${r.map((c, i) => `<td class="px-3 py-2 ${num.includes(i) ? 'text-right' : ''}">${c}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${cols.length}" class="text-center text-slate-400 py-10">Nothing to report yet. Add plans and records in the other tabs.</td></tr>`) +
      `</tbody></table></div></div>`;
  }
  function renderReports() {
    const today = todayStr(), ps = plansList().filter(Boolean), rev = (store.revenue || []).filter(Boolean), ex = (store.expenses || []).filter(Boolean), ac = (store.actions || []).filter(Boolean);
    const spent = t => sum(ex.filter(r => r.planTitle === t));
    const T = {
      plans: () => rtable(['Plan', 'Department', 'Priority', 'Status', 'Progress', 'Target', 'Collected', 'Balance', 'Expenses', 'Net', 'Due'],
        ps.map(p => { const c = collected(p.title), t = parseFloat(p.targetAmount) || 0, s = spent(p.title); return [E(p.title), E(p.department || ''), E(p.priority || ''), statusBadge(p.status), (parseFloat(p.progress) || 0) + '%', fm(t), fm(c), fm(t - c), fm(s), fm(c - s), E(p.endDate || '')]; }), [4, 5, 6, 7, 8, 9]),
      revenue: () => rtable(['Date', 'Plan', 'Customer', 'Source', 'Invoice', 'Amount'],
        rev.map(r => [E(r.invDate || r.date || ''), E(r.planTitle || ''), E(r.customer || ''), r.source === 'invoice' ? 'Invoice' : 'Manual', E(r.invoiceNumber || ''), fm(r.amount)]), [5]),
      expenses: () => rtable(['Date', 'Plan', 'Description', 'Category', 'Amount'],
        ex.map(r => [E(r.date || ''), E(r.planTitle || ''), E(r.description || ''), E(r.category || ''), fm(r.amount)]), [4]),
      actions: () => rtable(['Action item', 'Plan', 'Person', 'Due', 'Priority', 'Status', 'Flag'],
        ac.map(a => [E(a.item || ''), E(a.title || ''), E(a.person || ''), E(a.due || ''), E(a.priority || ''), statusBadge(a.status), a.due && a.due < today && a.status !== 'Completed' ? '<span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">Overdue</span>' : '']), []),
      team: () => { const own = (store.ownership || []).filter(Boolean); return rtable(['Person', 'Plans owned', 'Plans in team', 'Open actions', 'Completed actions'],
        empNames().map(n => [E(n), ps.filter(p => p.owner === n).length, new Set(own.filter(o => o.owner === n || (o.team || []).includes(n)).map(o => o.planTitle)).size, ac.filter(a => a.person === n && a.status !== 'Completed').length, ac.filter(a => a.person === n && a.status === 'Completed').length]), [1, 2, 3, 4]); }
    };
    view.innerHTML = `<div class="mb-4"><h2 class="text-2xl font-bold text-slate-800">Reports</h2><p class="text-sm text-slate-500">Across all plans. Search, sort and export any report.</p></div>` +
      `<div class="acx-tabs">${REPS.map(([id, l]) => `<button type="button" class="${id === repTab ? 'on' : ''}" onclick="setRep('${id}')">${l}</button>`).join('')}</div>` + T[repTab]();
  }
  const rv0 = w.renderView;
  w.renderView = function () { if (active === 'reports') renderReports(); else rv0(); enhance(); };

  /* ---------- smart tables: works on every table in the view ---------- */
  const num = s => /^[\sA-Za-z%]*-?[\d.,]+%?\s*$/.test(s) ? parseFloat(s.replace(/,/g, '').replace(/[^\d.\-]/g, '')) : NaN;
  const dt = s => /\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}/.test(s) ? Date.parse(s) : NaN;
  function cmp(a, b) {
    const x = num(a), y = num(b); if (!isNaN(x) && !isNaN(y)) return x - y;
    const p = dt(a), q = dt(b); if (!isNaN(p) && !isNaN(q)) return p - q;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }
  function enhance() {
    document.querySelectorAll('#view table').forEach(t => {
      if (t.dataset.acx || !t.tHead || !t.tBodies[0]) return; t.dataset.acx = 1;
      const tb = t.tBodies[0], card = t.closest('.overflow-x-auto').parentElement, ths = [...t.tHead.rows[0].cells];
      const skip = ths.map(h => !h.textContent.trim() || /^actions$/i.test(h.textContent.trim()));
      const si = ths.findIndex(h => /^status$/i.test(h.textContent.trim()));
      const S = { q: '', st: '', col: -1, dir: 1, pg: 1, n: 10 }; let F = [];
      const bar = document.createElement('div'); bar.className = 'acx-tb';
      const sts = si > -1 ? [...new Set([...tb.rows].filter(r => r.cells.length > si).map(r => r.cells[si].textContent.trim()).filter(Boolean))] : [];
      bar.innerHTML = '<input type="search" placeholder="Search this table" aria-label="Search this table">' +
        (sts.length ? `<select aria-label="Filter by status"><option value="">All statuses</option>${sts.map(s => `<option>${E(s)}</option>`).join('')}</select>` : '') +
        '<button type="button">Export CSV</button>';
      const pg = document.createElement('div'); pg.className = 'acx-pg';
      pg.innerHTML = '<span></span><div><select aria-label="Rows per page"><option>10</option><option>25</option><option>50</option><option>100</option></select><button type="button">Previous</button><button type="button">Next</button></div>';
      card.insertBefore(bar, card.firstChild); card.appendChild(pg);
      const info = pg.firstChild, [sz, pv, nx] = pg.querySelectorAll('select,button');
      const rows = () => [...tb.rows].filter(r => r.cells.length > 1 || r.cells[0].colSpan < 2);
      function apply() {
        const all = rows(); all.forEach((r, i) => { if (r._o == null) r._o = i; });
        F = all.filter(r => (!S.q || r.textContent.toLowerCase().includes(S.q)) && (!S.st || (r.cells[si] || {}).textContent.trim() === S.st));
        F.sort(S.col > -1 ? (a, b) => cmp(a.cells[S.col].textContent.trim(), b.cells[S.col].textContent.trim()) * S.dir : (a, b) => a._o - b._o);
        const pages = Math.max(1, Math.ceil(F.length / S.n)); S.pg = Math.min(S.pg, pages); const from = (S.pg - 1) * S.n, vis = new Set(F.slice(from, from + S.n));
        all.forEach(r => { r.style.display = 'none'; }); F.forEach(r => { tb.appendChild(r); r.style.display = vis.has(r) ? '' : 'none'; });
        info.textContent = F.length ? `Showing ${from + 1} to ${Math.min(from + S.n, F.length)} of ${F.length}` : (all.length ? 'No rows match your search.' : '');
        pv.disabled = S.pg <= 1; nx.disabled = S.pg >= pages; pg.style.display = all.length ? '' : 'none';
        ths.forEach((h, i) => { if (!skip[i]) h.setAttribute('aria-sort', i === S.col ? (S.dir > 0 ? 'ascending' : 'descending') : 'none'); });
      }
      t._apply = apply;
      ths.forEach((h, i) => { if (skip[i]) return; h.dataset.s = 1; h.tabIndex = 0; const go_ = () => { S.dir = S.col === i ? -S.dir : 1; S.col = i; S.pg = 1; apply(); }; h.onclick = go_; h.onkeydown = e => { if (e.key === 'Enter') go_(); }; });
      const [q, sel, ex] = [bar.querySelector('input'), bar.querySelector('select'), bar.querySelector('button')];
      q.oninput = () => { S.q = q.value.trim().toLowerCase(); S.pg = 1; apply(); };
      if (sel) sel.onchange = () => { S.st = sel.value; S.pg = 1; apply(); };
      sz.onchange = () => { S.n = +sz.value; S.pg = 1; apply(); };
      pv.onclick = () => { S.pg--; apply(); }; nx.onclick = () => { S.pg++; apply(); };
      ex.onclick = () => {
        const idx = ths.map((_, i) => i).filter(i => !skip[i]), c = s => '"' + String(s).replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"';
        const csv = [idx.map(i => c(ths[i].textContent))].concat(F.map(r => idx.map(i => c(r.cells[i].textContent)))).map(l => l.join(',')).join('\r\n');
        const a = document.createElement('a'), h2 = (document.querySelector('#view h2') || {}).textContent || 'export';
        a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv' })); a.download = h2.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() + '.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      };
      apply();
    });
  }
  /* the old plan search re-draws the table body; re-apply the table's own search/sort/page after it */
  const fp = w.filterPlans;
  w.filterPlans = function () { fp(); const b = document.getElementById('plansBody'), t = b && b.closest('table'); if (t && t._apply) t._apply(); };

  /* ---------- mobile menu ---------- */
  const scrim = document.createElement('div'); scrim.id = 'acxScrim'; document.body.appendChild(scrim);
  w.acxDrawer = open => { const s = document.querySelector('aside.w-60'); if (!s) return; s.classList.toggle('acx-open', open); scrim.classList.toggle('on', open); };
  scrim.onclick = () => w.acxDrawer(false);
  const g0 = w.go; w.go = function (id) { g0(id); w.acxDrawer(false); };

  if (!document.getElementById('app').classList.contains('hidden')) { renderNav(); renderView(); }
})(window);
