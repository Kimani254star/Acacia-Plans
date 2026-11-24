/* Acacia Plans: six-section menu (Plan Dashboard, Business Plans, Objectives & KPIs, Action Planning, Plan Progress, Plan Performance).
   Loaded after script.js. Keeps all Books keys; adds planObjectives, planGoals, planKpis, planKpiLogs, planActivities, planResponsibilities, planMilestones. */
(function (w) {
  'use strict';
  const E = escapeHtml, T = () => todayStr();
  const late = p => p.endDate && p.endDate < T() && p.status !== 'Completed';
  const ptype = p => p.planType || 'Annual';
  const emp = 'employees', ST = STATUS_PROG;
  const G = [
    ['Plan Dashboard', [['overview', 'Plans Overview'], ['active', 'Active Plans'], ['completed', 'Completed Plans'], ['overdue', 'Overdue Plans']]],
    ['Business Plans', [['create', 'Create Business Plan'], ['strategic', 'Strategic Plans'], ['annual', 'Annual Plans'], ['departmental', 'Departmental Plans']]],
    ['Objectives & KPIs', [['objectives', 'Strategic Objectives'], ['goals', 'Goals & Targets'], ['kpis', 'Key Performance Indicators'], ['kpitrack', 'KPI Tracking']]],
    ['Action Planning', [['actions', 'Action Plans'], ['activities', 'Activities'], ['responsibilities', 'Assign Responsibilities'], ['milestones', 'Milestones'], ['deadlines', 'Deadlines']]],
    ['Plan Progress', [['ownership', 'Ownership & Responsibility'], ['progress', 'Progress Updates'], ['reviews', 'Plan Reviews'], ['revisions', 'Plan Revisions'], ['expenses', 'Plan Expenses']]],
    ['Plan Performance', [['revenue', 'Plan Revenue'], ['planvsactual', 'Plan vs Actual'], ['finperf', 'Financial Performance'], ['objperf', 'Objectives Performance'], ['reports', 'Plan Reports']]]
  ];

  /* new data modules (company_state keys, per company like the Books ones) */
  [['objectives', 'planObjectives'], ['goals', 'planGoals'], ['kpis', 'planKpis'], ['kpilogs', 'planKpiLogs'], ['activities', 'planActivities'], ['responsibilities', 'planResponsibilities'], ['milestones', 'planMilestones']]
    .forEach(a => MODULES.push({ id: a[0], label: a[0], key: a[1], link: 'planTitle' }));
  FIELDS.plans.splice(1, 0, { k: 'planType', l: 'Plan type', t: 'select', o: ['Annual', 'Strategic', 'Departmental', 'Other'] });
  Object.assign(FIELDS, {
    objectives: [{ k: 'objective', l: 'Strategic objective', req: 1 }, { k: 'perspective', l: 'Perspective', t: 'select', o: ['Financial', 'Customer', 'Internal Process', 'Learning & Growth'] }, { k: 'owner', l: 'Owner', t: 'select', o: emp }, { k: 'dueDate', l: 'Due date', t: 'date' }, { k: 'status', l: 'Status', t: 'select', o: ST }, { k: 'description', l: 'Description', t: 'textarea' }],
    goals: [{ k: 'goal', l: 'Goal', req: 1 }, { k: 'targetValue', l: 'Target value', t: 'number' }, { k: 'unit', l: 'Unit (e.g. KES, %, units)' }, { k: 'deadline', l: 'Deadline', t: 'date' }, { k: 'priority', l: 'Priority', t: 'select', o: PRIORITY }, { k: 'status', l: 'Status', t: 'select', o: ST }],
    kpis: [{ k: 'kpi', l: 'KPI name', req: 1 }, { k: 'unit', l: 'Unit' }, { k: 'baseline', l: 'Baseline', t: 'number' }, { k: 'target', l: 'Target', t: 'number', req: 1 }, { k: 'direction', l: 'Direction', t: 'select', o: ['Higher is better', 'Lower is better'] }, { k: 'frequency', l: 'Frequency', t: 'select', o: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'] }, { k: 'owner', l: 'Owner', t: 'select', o: emp }],
    kpilogs: [{ k: 'kpi', l: 'KPI', t: 'select', o: 'kpis' }, { k: 'actual', l: 'Actual value', t: 'number', req: 1 }, { k: 'date', l: 'Date', t: 'date' }, { k: 'comment', l: 'Comment', t: 'textarea' }],
    activities: [{ k: 'activity', l: 'Activity', req: 1 }, { k: 'start', l: 'Start date', t: 'date' }, { k: 'end', l: 'End date', t: 'date' }, { k: 'responsible', l: 'Responsible', t: 'select', o: emp }, { k: 'amount', l: 'Budget (KES)', t: 'number' }, { k: 'status', l: 'Status', t: 'select', o: ST }, { k: 'notes', l: 'Notes', t: 'textarea' }],
    responsibilities: [{ k: 'task', l: 'Task / activity', req: 1 }, { k: 'responsible', l: 'Responsible (does the work)', t: 'select', o: emp }, { k: 'accountable', l: 'Accountable (signs off)', t: 'select', o: emp }, { k: 'supporting', l: 'Supporting team', t: 'multi', o: emp }, { k: 'due', l: 'Due date', t: 'date' }, { k: 'status', l: 'Status', t: 'select', o: ST }],
    milestones: [{ k: 'milestone', l: 'Milestone', req: 1 }, { k: 'due', l: 'Due date', t: 'date' }, { k: 'status', l: 'Status', t: 'select', o: ST }, { k: 'completedOn', l: 'Completed on', t: 'date' }, { k: 'notes', l: 'Notes', t: 'textarea' }]
  });
  Object.assign(COLS, {
    objectives: [['objective', 'Objective'], ['perspective', 'Perspective'], ['owner', 'Owner'], ['dueDate', 'Due'], ['status', 'Status']],
    goals: [['goal', 'Goal'], ['targetValue', 'Target'], ['unit', 'Unit'], ['deadline', 'Deadline'], ['priority', 'Priority'], ['status', 'Status']],
    kpis: [['kpi', 'KPI'], ['unit', 'Unit'], ['baseline', 'Baseline'], ['target', 'Target'], ['direction', 'Direction'], ['frequency', 'Frequency'], ['owner', 'Owner']],
    kpilogs: [['kpi', 'KPI'], ['actual', 'Actual'], ['date', 'Date'], ['comment', 'Comment']],
    activities: [['activity', 'Activity'], ['start', 'Start'], ['end', 'End'], ['responsible', 'Responsible'], ['amount', 'Budget'], ['status', 'Status']],
    responsibilities: [['task', 'Task'], ['responsible', 'Responsible'], ['accountable', 'Accountable'], ['supporting', 'Supporting'], ['due', 'Due'], ['status', 'Status']],
    milestones: [['milestone', 'Milestone'], ['due', 'Due'], ['status', 'Status'], ['completedOn', 'Completed on'], ['notes', 'Notes']]
  });

  /* helpers */
  const S = k => (store[k] || []).filter(Boolean), by = (k, f, t) => S(k).filter(r => r[f] === t);
  const sum = (a, f) => a.reduce((s, r) => s + (parseFloat(r[f]) || 0), 0);
  const prog = p => Math.max(0, Math.min(100, parseFloat(p.progress) || 0));
  const spent = t => sum(by('expenses', 'planTitle', t), 'amount'), budget = t => sum(by('activities', 'planTitle', t), 'amount');
  const planned = p => { const a = Date.parse(p.startDate), b = Date.parse(p.endDate); return a && b && b > a ? Math.max(0, Math.min(100, (Date.now() - a) / (b - a) * 100)) : null; };
  const kach = k => {
    const l = by('kpilogs', 'planTitle', k.planTitle).filter(r => r.kpi === k.kpi).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
    const t = parseFloat(k.target) || 0; if (!l || !t) return null;
    const a = parseFloat(l.actual) || 0; return Math.max(0, k.direction === 'Lower is better' ? (a ? t / a * 100 : 100) : a / t * 100);
  };
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  const pc = n => n == null ? '—' : Math.round(n) + '%', k0 = n => fmtKES(n);
  const done = (k, p) => { const a = by(k, 'planTitle', p); return [a.filter(r => r.status === 'Completed').length, a.length]; };
  const head = (t, s) => `<div class="mb-4"><h2 class="text-2xl font-bold text-slate-800">${E(t)}</h2><p class="text-sm text-slate-500">${E(s || '')}</p></div>`;
  const tbl = (hd, rows, right) => { right = right || []; return `<div class="bg-white rounded-xl border border-slate-200 overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>${hd.map((x, i) => `<th class="px-3 py-2 ${right.includes(i) ? 'text-right' : ''}">${E(x)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr class="border-t border-slate-100 hover:bg-slate-50 align-top">${r.map((c, i) => `<td class="px-3 py-2 ${right.includes(i) ? 'text-right' : ''}">${c}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${hd.length}" class="text-center text-slate-400 py-10">Nothing to show yet. Add plans and records in the other sections.</td></tr>`}</tbody></table></div></div>`; };
  const cards = a => `<div class="adx-wrap" style="margin-bottom:14px"><div class="adx-grid adx-g4">${a.map(x => ADX.kpi({ i: x[0], c: x[1], l: x[2], v: x[3] })).join('')}</div></div>`;
  const out = h => { view.innerHTML = h; };
  const plans = () => S('plans');

  /* derived views */
  function deadlines() {
    const rows = [], add = (d, ty, t, pl, st) => { if (d && st !== 'Completed') rows.push([d, ty, t || '', pl || '', st || 'Not Started']); };
    plans().forEach(p => add(p.endDate, 'Plan', p.title, p.title, p.status));
    S('actions').forEach(r => add(r.due, 'Action', r.item, r.title, r.status));
    S('milestones').forEach(r => add(r.due, 'Milestone', r.milestone, r.planTitle, r.status));
    S('activities').forEach(r => add(r.end, 'Activity', r.activity, r.planTitle, r.status));
    S('responsibilities').forEach(r => add(r.due, 'Responsibility', r.task, r.planTitle, r.status));
    S('objectives').forEach(r => add(r.dueDate, 'Objective', r.objective, r.planTitle, r.status));
    S('goals').forEach(r => add(r.deadline, 'Goal', r.goal, r.planTitle, r.status));
    rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    const d0 = Date.parse(T()), n = r => Math.round((Date.parse(r[0]) - d0) / 864e5);
    const od = rows.filter(r => n(r) < 0).length, wk = rows.filter(r => n(r) >= 0 && n(r) <= 7).length;
    out(head('Deadlines', 'Every open due date across plans, actions, milestones, activities, responsibilities, objectives and goals.') +
      cards([['clock', '', 'Open deadlines', rows.length], ['clock', 'p', 'Overdue', od], ['check', 'o', 'Due in 7 days', wk], ['file', 'b', 'Plans', plans().length]]) +
      tbl(['Date', 'Type', 'Item', 'Plan', 'Status', 'When'], rows.map(r => { const d = n(r); return [E(r[0]), E(r[1]), E(r[2]), E(r[3]), statusBadge(r[4]), d < 0 ? `<span class="text-red-600 font-semibold">Overdue by ${-d} day${d === -1 ? '' : 's'}</span>` : d === 0 ? 'Due today' : `Due in ${d} day${d === 1 ? '' : 's'}`]; })));
  }
  function planVsActual() {
    const ps = plans();
    out(head('Plan vs Actual', 'Targets, schedule and budget compared with what actually happened.') +
      tbl(['Plan', 'Revenue target', 'Revenue actual', 'Variance', 'Planned progress', 'Actual progress', 'Budget (activities)', 'Expenses actual', 'Budget variance'],
        ps.map(p => { const t = parseFloat(p.targetAmount) || 0, c = collected(p.title), b = budget(p.title), x = spent(p.title), pl = planned(p); return [`<b>${E(p.title)}</b>`, t ? k0(t) : '—', k0(c), t ? `<span class="${c >= t ? 'text-emerald-600' : 'text-red-600'}">${k0(c - t)}</span>` : '—', pc(pl), pc(prog(p)), b ? k0(b) : '—', k0(x), b ? `<span class="${x <= b ? 'text-emerald-600' : 'text-red-600'}">${k0(b - x)}</span>` : '—']; }), [1, 2, 3, 4, 5, 6, 7, 8]));
  }
  function finPerf() {
    const ps = plans(), R = sum(S('revenue'), 'amount'), X = sum(S('expenses'), 'amount');
    out(head('Financial Performance', 'Revenue, expenses and return for each plan.') +
      cards([['cash', '', 'Total revenue', ADX.short(R)], ['cash', 'b', 'Total expenses', ADX.short(X)], ['trend', 'o', 'Net result', ADX.short(R - X)], ['check', 'p', 'Margin', R ? pc((R - X) / R * 100) : '—']]) +
      tbl(['Plan', 'Revenue', 'Expenses', 'Net', 'Margin', 'Return on spend'], ps.map(p => { const c = collected(p.title), x = spent(p.title); return [`<b>${E(p.title)}</b>`, k0(c), k0(x), `<span class="${c - x >= 0 ? 'text-emerald-600' : 'text-red-600'}">${k0(c - x)}</span>`, c ? pc((c - x) / c * 100) : '—', x ? pc((c - x) / x * 100) : '—']; }), [1, 2, 3, 4, 5]));
  }
  function objPerf() {
    const ps = plans(), rows = ps.map(p => { const o = done('objectives', p.title), g = done('goals', p.title), k = avg(by('kpis', 'planTitle', p.title).map(kach).filter(x => x != null)); return { p, o, g, k }; });
    const tot = f => rows.reduce((s, r) => s + r[f][0], 0) / (rows.reduce((s, r) => s + r[f][1], 0) || 1) * 100;
    const ka = avg(rows.map(r => r.k).filter(x => x != null));
    out(head('Objectives Performance', 'How far objectives, goals and KPIs have been achieved.') +
      cards([['file', '', 'Objectives completed', pc(tot('o'))], ['check', 'b', 'Goals completed', pc(tot('g'))], ['trend', 'o', 'Average KPI achievement', pc(ka)], ['clock', 'p', 'Plans', ps.length]]) +
      tbl(['Plan', 'Objectives done', 'Goals done', 'KPI achievement', 'Overall progress'], rows.map(r => [`<b>${E(r.p.title)}</b>`, r.o[0] + ' / ' + r.o[1], r.g[0] + ' / ' + r.g[1], ADX.hb('', Math.min(100, r.k || 0), pc(r.k)), ADX.hb('', prog(r.p))]), []));
  }
  let repRows = [];
  const REPH = ['Plan', 'Type', 'Status', 'Progress', 'Owner', 'Start', 'End', 'Objectives done', 'KPI achievement', 'Open actions', 'Milestones done', 'Revenue', 'Expenses', 'Net'];
  function reports() {
    repRows = plans().map(p => { const t = p.title, o = done('objectives', t), m = done('milestones', t), k = avg(by('kpis', 'planTitle', t).map(kach).filter(x => x != null)), c = collected(t), x = spent(t); return [t, ptype(p), p.status || 'Not Started', prog(p) + '%', p.owner || '', p.startDate || '', p.endDate || '', o[0] + '/' + o[1], k == null ? '' : Math.round(k) + '%', by('actions', 'title', t).filter(r => r.status !== 'Completed').length, m[0] + '/' + m[1], c, x, c - x]; });
    out(head('Plan Reports', 'One summary line per plan. Print it or export it to CSV.') +
      `<div class="flex gap-2 mb-3"><button onclick="window.print()" class="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Print</button><button onclick="ACX_PLANS.csv()" class="px-4 py-2 text-sm bg-acacia-600 hover:bg-acacia-700 text-white rounded-lg font-semibold">Export CSV</button></div>` +
      tbl(REPH, repRows.map(r => r.map((c, i) => i === 2 ? statusBadge(c) : (i >= 11 ? k0(c) : E(c)))), [11, 12, 13]));
  }
  w.ACX_PLANS = { csv() { const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent([REPH, ...repRows].map(r => r.map(c => JSON.stringify(String(c))).join(',')).join('\n')); a.download = 'plan-report.csv'; a.click(); } };

  /* navigation map: every menu item -> a data module, a filtered plan list, or a derived view */
  const N = {
    overview: { mod: 'plans', dash: 1 }, active: { mod: 'plans', pf: p => p.status === 'In Progress' && !late(p) }, completed: { mod: 'plans', pf: p => p.status === 'Completed' }, overdue: { mod: 'plans', pf: late },
    create: { mod: 'plans' }, strategic: { mod: 'plans', type: 'Strategic', pf: p => ptype(p) === 'Strategic' }, annual: { mod: 'plans', type: 'Annual', pf: p => ptype(p) === 'Annual' }, departmental: { mod: 'plans', type: 'Departmental', pf: p => ptype(p) === 'Departmental' },
    objectives: { mod: 'objectives' }, goals: { mod: 'goals' }, kpis: { mod: 'kpis' }, kpitrack: { mod: 'kpilogs' },
    actions: { mod: 'actions' }, activities: { mod: 'activities' }, responsibilities: { mod: 'responsibilities' }, milestones: { mod: 'milestones' }, deadlines: { view: deadlines },
    ownership: { mod: 'ownership' }, progress: { mod: 'progress' }, expenses: { mod: 'expenses' },
    reviews: { mod: 'revisions', tag: 'Review', filt: r => r.action === 'Review',
      fields: [{ k: 'reviewType', l: 'Review type', t: 'select', o: ['Monthly', 'Quarterly', 'Mid-year', 'Annual', 'Ad hoc'] }, { k: 'rating', l: 'Rating', t: 'select', o: ['On track', 'Needs attention', 'Off track'] }, { k: 'reviewer', l: 'Reviewed by' }, { k: 'comment', l: 'Findings & decisions', t: 'textarea' }],
      cols: [['reviewType', 'Review'], ['rating', 'Rating'], ['reviewer', 'Reviewed by'], ['comment', 'Findings'], ['date', 'Date']] },
    revisions: { mod: 'revisions', filt: r => r.action !== 'Review' },
    revenue: { mod: 'revenue' }, planvsactual: { view: planVsActual }, finperf: { view: finPerf }, objperf: { view: objPerf }, reports: { view: reports }
  };
  G.forEach(g => g[1].forEach(i => { N[i[0]].id = i[0]; N[i[0]].label = i[1]; N[i[0]].group = g[0]; }));
  w.NI = () => N[active] || { mod: active, label: active };
  w.curMod = () => MODULES.find(x => x.id === w.NI().mod);
  w.ACX_NAV = G;

  /* menu: six sections, always fully shown (no arrows to click), then Settings (kept) */
  w.renderNav = function () {
    const btn = (id, l) => `<button onclick="go('${id}')" class="nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 ${id === active ? 'active' : ''}">${E(l)}</button>`;
    navList.innerHTML = G.map((g, n) => `<div class="text-[10px] font-bold uppercase text-slate-400 px-2 pt-4 pb-1">${n + 1}. ${E(g[0])}</div>${g[1].map(i => btn(i[0], i[1])).join('')}`).join('')
      + `<div class="text-[10px] font-bold uppercase text-slate-400 px-2 pt-4 pb-1">Settings</div>` + btn('appearance', '🎨 Appearance');
  };
  w.go = function (id) { active = id; editIdx = null; renderNav(); renderView(); if (N[id] && id === 'create') openForm(); };

  active = 'overview';
  boot();
})(window);
