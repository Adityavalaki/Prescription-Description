// state/store.js — Medira global store + actions + time helpers.
// Direct port of the prototype's pub/sub store; exposes a `useReka()` hook
// that re-renders subscribers on any state change.

import React from 'react';
import { MED_COLORS } from '../theme/colors';

// client-side uuid (v4) so medicine ids line up with the DB's uuid columns
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0; const v = c === 'x' ? r : (r & 0x3) | 0x8; return v.toString(16);
  });
}
// "08:00:00" (Postgres time) -> "8:00 AM"
function sqlToAmpm(t) {
  if (!t) return null;
  const [H, M] = String(t).split(':');
  let h = +H; const ap = h >= 12 ? 'PM' : 'AM'; let h12 = h % 12; if (h12 === 0) h12 = 12;
  return `${h12}:${M} ${ap}`;
}

// ── time helpers ─────────────────────────────────────────────
export function toMins(s) {
  const m = String(s).match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = +m[1] % 12;
  if (/PM/i.test(m[3])) h += 12;
  return h * 60 + +m[2];
}
export function fromMins(x) {
  let h = Math.floor(x / 60) % 24;
  const mm = x % 60;
  const ap = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ap}`;
}
// live "current time" in minutes since midnight (real device clock)
export function nowMins() { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
export function plusMin(timeStr, n) { return fromMins(toMins(timeStr) + n); }
export function afterMealTimes(meals) {
  return [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).map((t) => plusMin(t, 30));
}

// ── doses are derived from a medicine's times ────────────────
// `startMins` = minute-of-day the course begins today (e.g. the scan time). Slots earlier
// than that are dropped — they aren't back-filled as already "taken"; the course counts
// only from then on. Remaining slots are 'upcoming' (future) or 'due' (now/overdue & still
// actionable). Nothing is auto-marked taken — adherence reflects only what the user does.
function makeDoses(med, startMins = 0) {
  const now = nowMins();
  return (med.times || [])
    .map((tm, i) => {
      const t = toMins(tm);
      return {
        id: `${med.id}-${i}-${Date.now()}-${Math.round(Math.random() * 1e4)}`,
        medId: med.id, med: med.name, strength: med.strength, time: tm, mins: t,
        note: med.instruction || '',
        status: t > now ? 'upcoming' : 'due',
        icon: med.instrIcon || med.icon || 'pill', color: med.color,
        _start: startMins,
      };
    })
    .filter((d) => d.mins >= startMins);
}

// ── initial state: empty. The user's data loads from the cloud on login
//    (services/cloudsync.js → actions.hydrate), and changes mirror back to the DB. ──
let state = {
  meds: [],
  doses: [],
  history: [],
  settings: {
    name: '', phone: '', age: '', gender: '', loggedIn: false,
    defaultTune: 'chime',
    meals: { breakfast: '8:00 AM', lunch: '1:00 PM', dinner: '7:30 PM' },
    sos: [
      { id: 'doc', kind: 'doctor', name: '', relation: '', phone: '', color: '#DC7A57', primary: true },
      { id: 'c2', kind: 'family', name: '', relation: '', phone: '', color: '#6E9B6B', primary: false },
      { id: 'c3', kind: 'family', name: '', relation: '', phone: '', color: '#5B7FB0', primary: false },
    ],
  },
};

// ── pub/sub ──────────────────────────────────────────────────
const listeners = new Set();
function emit() { listeners.forEach((l) => l()); }
function set(updater) {
  state = { ...state, ...(typeof updater === 'function' ? updater(state) : updater) };
  emit();
}

// ── actions ──────────────────────────────────────────────────
export const actions = {
  markTaken: (id) => set((s) => ({ doses: s.doses.map((d) => (d.id === id ? { ...d, status: 'taken' } : d)) })),
  skip: (id) => set((s) => ({ doses: s.doses.map((d) => (d.id === id ? { ...d, status: 'skipped' } : d)) })),
  undo: (id) => set((s) => ({ doses: s.doses.map((d) => (d.id === id ? { ...d, status: d.mins <= nowMins() ? 'due' : 'upcoming' } : d)) })),
  snooze: (id, min = 15) => set((s) => ({
    doses: s.doses.map((d) => (d.id === id ? { ...d, mins: d.mins + min, time: fromMins(d.mins + min), status: 'upcoming' } : d)).sort((a, b) => a.mins - b.mins),
  })),
  // called when the user taps Taken / Snooze on a reminder notification
  reminderAction: (action, data = {}) => set((s) => {
    if (action !== 'taken' && action !== 'snooze') return {};
    const idx = s.doses.findIndex((d) => d.medId === data.medId && (d.status === 'due' || d.status === 'upcoming'));
    if (idx < 0) return {};
    const doses = s.doses.slice();
    if (action === 'taken') doses[idx] = { ...doses[idx], status: 'taken' };
    else doses[idx] = { ...doses[idx], mins: doses[idx].mins + 10, time: fromMins(doses[idx].mins + 10), status: 'upcoming' };
    return { doses: doses.sort((a, b) => a.mins - b.mins) };
  }),
  requestRefill: (medId) => set((s) => ({ meds: s.meds.map((m) => (m.id === medId ? { ...m, left: m.left + 30 } : m)) })),
  setMedTune: (medId, tune) => set((s) => ({ meds: s.meds.map((m) => (m.id === medId ? { ...m, tune } : m)) })),
  toggleReminders: (medId, on) => set((s) => ({ meds: s.meds.map((m) => (m.id === medId ? { ...m, remindersOn: on } : m)) })),
  setMedTimes: (medId, times) => set((s) => ({
    meds: s.meds.map((m) => (m.id === medId ? { ...m, times } : m)),
    doses: [...s.doses.filter((d) => d.medId !== medId), ...makeDoses({ ...s.meds.find((m) => m.id === medId), times })].sort((a, b) => a.mins - b.mins),
  })),
  setDefaultTune: (tune) => set((s) => ({ settings: { ...s.settings, defaultTune: tune } })),
  setName: (name) => set((s) => ({ settings: { ...s.settings, name } })),
  setProfile: (partial) => set((s) => ({ settings: { ...s.settings, ...partial } })),
  setMeals: (meals) => set((s) => ({ settings: { ...s.settings, meals: { ...s.settings.meals, ...meals } } })),
  setSosContact: (id, partial) => set((s) => ({ settings: { ...s.settings, sos: s.settings.sos.map((c) => (c.id === id ? { ...c, ...partial } : c)) } })),
  setSosPrimary: (id) => set((s) => ({ settings: { ...s.settings, sos: s.settings.sos.map((c) => ({ ...c, primary: c.id === id })) } })),
  applyMealReminders: () => set((s) => {
    const t = afterMealTimes(s.settings.meals);
    const meds = s.meds.map((m) => {
      if (!/after\s*food/i.test(m.instruction || '')) return m;
      const times = t.slice(0, Math.max(1, (m.times || []).length || t.length));
      return { ...m, times, mealLinked: true };
    });
    const foodIds = meds.filter((m) => m.mealLinked).map((m) => m.id);
    const doses = [
      ...s.doses.filter((d) => !foodIds.includes(d.medId)),
      ...meds.filter((m) => m.mealLinked).flatMap((m) => makeDoses(m)),
    ].sort((a, b) => a.mins - b.mins);
    return { meds, doses };
  }),
  addMed: (med) => set((s) => {
    const id = uuid();
    const full = {
      id, form: 'Tablet', purpose: med.purpose || 'Added manually', courseDay: null, courseTotal: null,
      left: med.left || 30, color: med.color || MED_COLORS[s.meds.length % MED_COLORS.length], icon: 'pill',
      from: 'Manual entry', scanned: 'Today', adherence: 1, freqShort: '', duration: med.duration || 'Ongoing',
      instrIcon: med.instrIcon || 'pill', tune: med.tune || s.settings.defaultTune, remindersOn: true,
      schedule: `${(med.times || []).length}× daily`, ...med, id,
    };
    return { meds: [...s.meds, full], doses: [...s.doses, ...makeDoses(full)].sort((a, b) => a.mins - b.mins) };
  }),
  // replace the store from cloud data on login; rebuilds today's doses from the medicines
  hydrate: ({ meds, profile, sos }) => set((s) => {
    const next = { meds: meds || [], settings: { ...s.settings } };
    next.doses = (meds || []).flatMap((m) => makeDoses(m)).sort((a, b) => a.mins - b.mins);
    if (profile) {
      next.settings.name = profile.full_name || '';
      next.settings.phone = profile.phone || s.settings.phone;
      next.settings.defaultTune = profile.default_tune || 'chime';
      next.settings.meals = {
        breakfast: sqlToAmpm(profile.breakfast) || s.settings.meals.breakfast,
        lunch: sqlToAmpm(profile.lunch) || s.settings.meals.lunch,
        dinner: sqlToAmpm(profile.dinner) || s.settings.meals.dinner,
      };
    }
    if (sos && sos.length) next.settings.sos = sos;
    return next;
  }),
};

export function getState() { return state; }

// subscribe to any store change; returns an unsubscribe fn (used by cloud sync)
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

// React hook — subscribe to the store, returns [state, actions]
export function useReka() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const l = () => force((x) => x + 1);
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return [state, actions];
}
