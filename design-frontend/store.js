// Shared client-side data layer. No backend exists yet — this is the integration
// boundary a real API would replace. All data is real user input (localStorage),
// never fabricated. Insights/Evidence intentionally have no local generator:
// there is no analysis engine, so those modules always render their honest
// "not enough data yet" state until a backend is connected.
window.Store = (function () {
  const K = {
    session: 'afi_session', onboarding: 'afi_onboarding', expenses: 'afi_expenses',
    checkins: 'afi_checkins', events: 'afi_events', settings: 'afi_settings'
  };
  function read(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function write(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function daysAgoISO(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); }

  const DEFAULT_CATEGORIES = ['Food & Dining', 'Transport', 'Housing', 'Utilities', 'Health', 'Shopping', 'Entertainment', 'Education', 'Other'];
  const DEFAULT_TRACKING = { sleep: true, exercise: true, meals: true, stress: true, workMode: true };
  const EVENT_TYPES = ['New job', 'Travel', 'Vacation', 'Moving', 'Exam period', 'Major purchase', 'Family event', 'Other'];

  const Session = {
    get() { return read(K.session, null); },
    isAuthed() { return !!Session.get(); },
    signup(name, email) { const s = { name, email, createdAt: todayISO() }; write(K.session, s); return s; },
    login(email) {
      const existing = read(K.session, null);
      const s = {
        name: (existing && existing.email === email) ? existing.name : email.split('@')[0],
        email, createdAt: (existing && existing.email === email) ? existing.createdAt : todayISO()
      };
      write(K.session, s); return s;
    },
    updateName(name) { const s = Session.get(); if (!s) return; s.name = name; write(K.session, s); },
    logout() { localStorage.removeItem(K.session); }
  };

  const Onboarding = {
    get() { return read(K.onboarding, { completed: false }); },
    save(data) { const next = Object.assign({}, Onboarding.get(), data, { completed: true }); write(K.onboarding, next); return next; },
    isComplete() { return !!Onboarding.get().completed; }
  };

  const Settings = {
    get() { return Object.assign({ categories: DEFAULT_CATEGORIES.slice(), tracking: Object.assign({}, DEFAULT_TRACKING) }, read(K.settings, {})); },
    save(partial) { const next = Object.assign({}, Settings.get(), partial); write(K.settings, next); return next; }
  };

  const Expenses = {
    list() { return read(K.expenses, []).slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt); },
    get(id) { return Expenses.list().find(e => e.id === id) || null; },
    add(exp) { const list = read(K.expenses, []); const item = Object.assign({ id: uid(), createdAt: Date.now() }, exp); list.push(item); write(K.expenses, list); return item; },
    remove(id) { write(K.expenses, read(K.expenses, []).filter(e => e.id !== id)); }
  };

  const CheckIns = {
    all() { return read(K.checkins, {}); },
    get(date) { return read(K.checkins, {})[date] || null; },
    today() { return CheckIns.get(todayISO()); },
    save(date, data) { const all = read(K.checkins, {}); all[date] = Object.assign({ date }, all[date], data, { updatedAt: Date.now() }); write(K.checkins, all); return all[date]; },
    list() { return Object.values(read(K.checkins, {})).sort((a, b) => b.date.localeCompare(a.date)); }
  };

  const LifeEvents = {
    list() { return read(K.events, []).slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt); },
    get(id) { return LifeEvents.list().find(e => e.id === id) || null; },
    add(evt) { const list = read(K.events, []); const item = Object.assign({ id: uid(), createdAt: Date.now() }, evt); list.push(item); write(K.events, list); return item; },
    remove(id) { write(K.events, read(K.events, []).filter(e => e.id !== id)); }
  };

  const History = {
    all() {
      const items = [];
      Expenses.list().forEach(e => items.push({ type: 'expense', id: e.id, date: e.date, title: e.merchant || e.category, sub: e.category, amountPaise: e.amountPaise, createdAt: e.createdAt }));
      CheckIns.list().forEach(c => items.push({ type: 'checkin', id: c.date, date: c.date, title: 'Daily check-in', sub: CheckIns.summary(c), createdAt: c.updatedAt || 0 }));
      LifeEvents.list().forEach(e => items.push({ type: 'event', id: e.id, date: e.date, title: e.title, sub: e.eventType, createdAt: e.createdAt }));
      return items.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
    }
  };
  CheckIns.summary = function (c) {
    const parts = [];
    if (c.sleep != null) parts.push('Sleep ' + c.sleep + '/5');
    if (c.exercise === true) parts.push('Exercised');
    else if (c.exercise === false) parts.push('No exercise');
    if (c.meals != null) parts.push('Meals ' + c.meals + '/5');
    if (c.stress != null) parts.push('Stress ' + c.stress + '/5');
    if (c.workMode) parts.push(c.workMode);
    return parts.join(' · ') || 'Recorded, no items set';
  };

  const Stats = {
    overview() {
      const exp = Expenses.list(), chk = CheckIns.list(), evt = LifeEvents.list();
      const monthKey = todayISO().slice(0, 7);
      const monthExp = exp.filter(e => e.date.slice(0, 7) === monthKey);
      const days = new Set();
      exp.forEach(e => days.add(e.date)); chk.forEach(c => days.add(c.date)); evt.forEach(e => days.add(e.date));
      const dateList = Array.from(days).sort();
      return {
        monthSpendPaise: monthExp.reduce((s, e) => s + e.amountPaise, 0),
        monthExpenseCount: monthExp.length,
        totalExpenseCount: exp.length,
        checkinCount: chk.length,
        eventCount: evt.length,
        daysTracked: days.size,
        firstDate: dateList[0] || null,
        lastDate: dateList[dateList.length - 1] || null,
        hasAnyData: exp.length + chk.length + evt.length > 0
      };
    },
    // Thresholds the (future) analysis engine would require before it can validate
    // a pattern. Shown for transparency only — the frontend never computes insights.
    insightReadiness() {
      const o = Stats.overview();
      const need = { days: 21, records: 30 };
      const records = o.totalExpenseCount + o.checkinCount + o.eventCount;
      return { days: o.daysTracked, needDays: need.days, records, needRecords: need.records, ready: o.daysTracked >= need.days && records >= need.records };
    }
  };

  const Money = {
    toPaise(rupees) { return Math.round(parseFloat(rupees || 0) * 100); },
    format(paise, opts) {
      const rupees = (paise || 0) / 100;
      const decimals = opts && opts.decimals;
      return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 });
    }
  };

  const Fmt = {
    date(iso, style) {
      if (!iso) return '—';
      const d = new Date(iso + 'T00:00:00');
      if (style === 'long') return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      if (style === 'short') return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    relative(iso) {
      const diff = Math.round((new Date(todayISO()) - new Date(iso)) / 86400000);
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      if (diff < 7) return diff + ' days ago';
      return Fmt.date(iso, 'short');
    }
  };

  return {
    Session, Onboarding, Settings, Expenses, CheckIns, LifeEvents, History, Stats, Money, Fmt,
    uid, todayISO, daysAgoISO, DEFAULT_CATEGORIES, DEFAULT_TRACKING, EVENT_TYPES,
    requireAuth() { if (!Session.isAuthed()) { window.location.href = 'Login.dc.html'; return false; } return true; }
  };
})();
