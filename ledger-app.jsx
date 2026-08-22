import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet, Send, PlusCircle, Receipt, Target, Bell, Store, ShieldCheck,
  ArrowUpRight, ArrowDownLeft, AlertTriangle, CheckCircle2, X,
  Settings as SettingsIcon, TrendingUp, CreditCard, RefreshCcw,
  Coffee, ShoppingBag, Zap, Smartphone, Menu, Sparkles, ShieldAlert,
  Building2, LayoutDashboard, Trash2, Loader2, Landmark, BadgeCheck,
  Ban, QrCode, ChevronRight, Info,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';

const STORAGE_KEY = 'ledger-app-state-v1';
const APP_NAME = 'Ledger';

/* ---------------------------- constants ---------------------------- */

const CATEGORY_META = {
  Income:              { icon: TrendingUp,  hex: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'Add Money':         { icon: PlusCircle,  hex: '#2dd4bf', text: 'text-teal-400',    bg: 'bg-teal-400/10' },
  Transfers:           { icon: Send,        hex: '#38bdf8', text: 'text-sky-400',     bg: 'bg-sky-400/10' },
  Shopping:            { icon: ShoppingBag, hex: '#fbbf24', text: 'text-amber-400',   bg: 'bg-amber-400/10' },
  Food:                { icon: Coffee,      hex: '#fb923c', text: 'text-orange-400',  bg: 'bg-orange-400/10' },
  Bills:               { icon: Zap,         hex: '#a78bfa', text: 'text-violet-400',  bg: 'bg-violet-400/10' },
  'Merchant Sale':      { icon: Store,       hex: '#34d399', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  Refund:              { icon: RefreshCcw,  hex: '#fb7185', text: 'text-rose-400',    bg: 'bg-rose-400/10' },
  'Goal Contribution':  { icon: Target,      hex: '#fbbf24', text: 'text-amber-400',   bg: 'bg-amber-400/10' },
  Other:               { icon: CreditCard,  hex: '#94a3b8', text: 'text-slate-400',   bg: 'bg-slate-400/10' },
};
const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Bills', 'Other'];

const CONTACTS = [
  { id: 'c1', name: 'Priya Sharma', phone: '+91 98765 43210' },
  { id: 'c2', name: 'Rahul Verma', phone: '+91 91234 56789' },
  { id: 'c3', name: 'Anita Desai', phone: '+91 99887 76655' },
  { id: 'c4', name: 'Karan Mehta', phone: '+91 90909 08080' },
];

const BILLERS = [
  { id: 'b1', name: 'Electricity Board', icon: Zap },
  { id: 'b2', name: 'Mobile Recharge', icon: Smartphone },
  { id: 'b3', name: 'Broadband', icon: Landmark },
  { id: 'b4', name: 'Credit Card Bill', icon: CreditCard },
];

const CUSTOMER_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'budgets', label: 'Budgets', icon: Wallet },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

/* ---------------------------- helpers ---------------------------- */

function formatINR(n) {
  return (Number(n) || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatDateTime(ts) {
  return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
function daysAgoTs(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + (Math.abs(n) % 7), 20, 0, 0);
  return d.getTime();
}
function startOfMonthTs() {
  const d = new Date();
  d.setDate(1); d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfTodayTs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function seedTransactions() {
  const raw = [
    [32, 'credit', 'Income', 'Employer Pvt Ltd', 65000, 'Monthly salary', false],
    [29, 'debit', 'Bills', 'Electricity Board', 1850, '', false],
    [27, 'debit', 'Food', 'Corner Café', 640, '', false],
    [24, 'debit', 'Shopping', 'Reliance Trends', 3200, '', false],
    [20, 'debit', 'Bills', 'Mobile Recharge', 399, '', false],
    [18, 'debit', 'Transfers', 'Priya Sharma', 5000, 'Rent share', false],
    [14, 'credit', 'Add Money', 'HDFC Bank ••1234', 10000, '', false],
    [11, 'debit', 'Food', 'Corner Café', 1120, '', false],
    [9, 'debit', 'Shopping', 'Amazon', 2450, '', false],
    [6, 'credit', 'Transfers', 'Rahul Verma', 1500, 'Settling up', false],
    [3, 'debit', 'Bills', 'Broadband', 899, '', false],
    [1, 'debit', 'Shopping', 'Croma Electronics', 18000, 'New laptop dock', true],
  ];
  return raw.map(([d, type, category, counterparty, amount, note, flagged]) => ({
    id: genId('txn'), type, category, counterparty, amount, note,
    timestamp: daysAgoTs(d), status: 'success',
    flagged, flagReason: flagged ? 'Large one-time purchase relative to balance' : null,
    reviewed: false,
  }));
}

function defaultState() {
  return {
    onboarded: false,
    profile: {
      name: '', phone: '', email: '', kyc: 'pending',
      monthlyIncome: 65000, dailyLimit: 50000, accountSuspended: false,
      notifyChannels: { sms: true, email: true, inApp: true },
    },
    wallet: { balance: 0, linkedBank: { name: 'HDFC Bank ••1234', balance: 250000 } },
    transactions: [],
    budgets: [
      { id: genId('bud'), category: 'Food', limit: 3000 },
      { id: genId('bud'), category: 'Shopping', limit: 8000 },
      { id: genId('bud'), category: 'Bills', limit: 4000 },
    ],
    goals: [
      { id: genId('goal'), name: 'Emergency Fund', target: 50000, current: 12000, deadline: daysAgoTs(-120) },
    ],
    notifications: [],
    merchant: { businessName: '', sales: [] },
    auditLog: [],
  };
}

function applyTransaction(state, { type, category, counterparty, amount, note = '', flagged = false, flagReason = null, balanceDelta }) {
  const txn = {
    id: genId('txn'), type, category, counterparty, amount, note,
    timestamp: Date.now(), status: 'success', flagged, flagReason, reviewed: false,
  };
  return {
    ...state,
    wallet: { ...state.wallet, balance: state.wallet.balance + balanceDelta },
    transactions: [txn, ...state.transactions],
  };
}
function pushNotif(state, type, message) {
  return { ...state, notifications: [{ id: genId('notif'), type, message, timestamp: Date.now(), read: false }, ...state.notifications] };
}
function pushAudit(state, action) {
  return { ...state, auditLog: [{ id: genId('log'), action, timestamp: Date.now() }, ...state.auditLog] };
}
function monthSpend(transactions, category) {
  return transactions.filter(t => t.type === 'debit' && t.category === category && t.timestamp >= startOfMonthTs()).reduce((s, t) => s + t.amount, 0);
}
function todaysDebitTotal(transactions) {
  return transactions.filter(t => t.type === 'debit' && t.timestamp >= startOfTodayTs()).reduce((s, t) => s + t.amount, 0);
}
function isLargeTransfer(amount, balance) {
  return amount >= 20000 || amount > balance * 0.5;
}
function maybeBudgetAlert(next, budgets, category) {
  const budget = budgets.find(b => b.category === category);
  if (!budget) return next;
  const spent = monthSpend(next.transactions, category);
  if (spent >= budget.limit) return pushNotif(next, 'alert', `You've gone over your ${category} budget (${formatINR(budget.limit)}) this month.`);
  if (spent >= budget.limit * 0.8) return pushNotif(next, 'alert', `You've used 80% of your ${category} budget this month.`);
  return next;
}

/* ---------------------------- small UI atoms ---------------------------- */

function Money({ value, sign = false, size = 'base', className = '' }) {
  const positive = value >= 0;
  const sizeClass = { sm: 'text-sm', base: 'text-base', lg: 'text-xl', xl: 'text-3xl', xxl: 'text-4xl sm:text-5xl' }[size] || 'text-base';
  return (
    <span className={`ledger-num tabular-nums ${sizeClass} ${sign ? (positive ? 'text-emerald-400' : 'text-rose-400') : ''} ${className}`}>
      {sign ? (positive ? '+' : '\u2212') : ''}{formatINR(Math.abs(value))}
    </span>
  );
}

function ProgressBar({ percent }) {
  const pct = Math.max(0, Math.min(100, percent));
  const toneClass = pct >= 100 ? 'bg-rose-400' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
      <div className={`h-full rounded-full ${toneClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Badge({ children, tone = 'slate' }) {
  const map = {
    slate: 'bg-slate-800 text-slate-300', emerald: 'bg-emerald-400/10 text-emerald-400',
    amber: 'bg-amber-400/10 text-amber-400', rose: 'bg-rose-400/10 text-rose-400',
    sky: 'bg-sky-400/10 text-sky-400',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${map[tone]}`}>{children}</span>;
}

function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  const toneClass = { slate: 'text-slate-300', emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400' }[tone];
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
        {Icon && <Icon size={16} className="text-slate-600" />}
      </div>
      <div className={`ledger-num text-2xl tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-800 rounded-lg">
      {Icon && <Icon size={28} className="text-slate-700 mb-3" />}
      <p className="text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-slate-500 text-sm mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs uppercase tracking-wide text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60";

function Btn({ children, onClick, tone = 'primary', className = '', disabled, type = 'button' }) {
  const toneClass = {
    primary: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    ghost: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
    danger: 'bg-rose-500/90 hover:bg-rose-500 text-white',
    outline: 'border border-slate-700 hover:border-slate-500 text-slate-200',
  }[tone];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${toneClass} ${className}`}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, footer, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div className={`w-full ${wide ? 'sm:max-w-lg' : 'sm:max-w-md'} bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900">
          <h3 className="font-serif-display text-lg text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 p-1 rounded"><X size={18} /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-800 flex gap-2 justify-end">{footer}</div>}
      </div>
    </div>
  );
}

function CategoryIcon({ category, size = 16 }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center justify-center rounded-full ${meta.bg}`} style={{ width: size * 2, height: size * 2 }}>
      <Icon size={size} style={{ color: meta.hex }} />
    </span>
  );
}

/* ---------------------------- main app ---------------------------- */

export default function LedgerApp() {
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);

  const [currentRole, setCurrentRole] = useState('customer');
  const [currentView, setCurrentView] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [obStep, setObStep] = useState(0);
  const [obForm, setObForm] = useState({ name: '', phone: '', email: '' });

  const [modal, setModal] = useState(null); // string id of open modal
  const [formError, setFormError] = useState('');
  const [confirmLarge, setConfirmLarge] = useState(null); // pending send-money payload

  /* ---- load / persist ---- */
  useEffect(() => {
    let mounted = true;
    (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (mounted) setAppState(raw ? JSON.parse(raw) : defaultState());
      } catch (e) {
        if (mounted) setAppState(defaultState());
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const persist = useCallback((state) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  }, []);

  const updateState = useCallback((updater) => {
    setAppState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(next);
      return next;
    });
  }, [persist]);

  const closeModal = () => { setModal(null); setFormError(''); setConfirmLarge(null); };

  /* ---- derived data ---- */
  const budgetsWithSpent = useMemo(() => {
    if (!appState) return [];
    return appState.budgets.map(b => ({ ...b, spent: monthSpend(appState.transactions, b.category) }));
  }, [appState]);

  const last45 = useMemo(() => {
    if (!appState) return [];
    const cutoff = Date.now() - 45 * 24 * 60 * 60 * 1000;
    return appState.transactions.filter(t => t.timestamp >= cutoff);
  }, [appState]);

  const spendByCategory = useMemo(() => {
    const map = {};
    last45.filter(t => t.type === 'debit').forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([category, value]) => ({ category, value }));
  }, [last45]);

  const weeklyTrend = useMemo(() => {
    const buckets = {};
    last45.filter(t => t.type === 'debit').forEach(t => {
      const wk = Math.floor((Date.now() - t.timestamp) / (7 * 24 * 60 * 60 * 1000));
      buckets[wk] = (buckets[wk] || 0) + t.amount;
    });
    return Object.entries(buckets).sort((a, b) => Number(b[0]) - Number(a[0])).reverse().slice(-6).map(([wk, value]) => ({
      week: wk === '0' ? 'This wk' : `${wk}w ago`, value,
    }));
  }, [last45]);

  const recurringBills = useMemo(() => {
    if (!appState) return [];
    const map = {};
    appState.transactions.filter(t => t.category === 'Bills').forEach(t => {
      if (!map[t.counterparty]) map[t.counterparty] = [];
      map[t.counterparty].push(t.amount);
    });
    return Object.entries(map).map(([name, amts]) => ({ name, avg: Math.round(amts.reduce((a, b) => a + b, 0) / amts.length) }));
  }, [appState]);

  const healthScore = useMemo(() => {
    if (!appState) return 50;
    const income = appState.profile.monthlyIncome || 1;
    const debits30 = last45.filter(t => t.type === 'debit' && t.timestamp >= Date.now() - 30 * 24 * 60 * 60 * 1000).reduce((s, t) => s + t.amount, 0);
    const savingsRate = Math.max(0, Math.min(1, (income - debits30) / income));
    const goalProgress = appState.goals.length ? appState.goals.reduce((s, g) => s + Math.min(1, g.current / g.target), 0) / appState.goals.length : 0.5;
    const overBudget = budgetsWithSpent.filter(b => b.spent > b.limit).length;
    const budgetHealth = Math.max(0, 1 - overBudget * 0.2);
    return Math.round((savingsRate * 0.5 + goalProgress * 0.25 + budgetHealth * 0.25) * 100);
  }, [appState, last45, budgetsWithSpent]);
  const healthLabel = healthScore >= 75 ? 'Strong' : healthScore >= 50 ? 'Steady' : healthScore >= 30 ? 'Needs attention' : 'At risk';
  const healthTone = healthScore >= 75 ? 'emerald' : healthScore >= 50 ? 'amber' : 'rose';

  const unreadCount = appState ? appState.notifications.filter(n => !n.read).length : 0;
  const flaggedPending = appState ? appState.transactions.filter(t => t.flagged && !t.reviewed) : [];
  const flaggedCleared = appState ? appState.transactions.filter(t => t.flagged && t.reviewed) : [];

  /* ---- handlers ---- */
  const completeOnboarding = () => {
    if (!obForm.name.trim() || !obForm.phone.trim() || !obForm.email.trim()) { setFormError('Please fill in all fields.'); return; }
    const seeded = seedTransactions();
    const balance = seeded.reduce((s, t) => s + (t.type === 'credit' ? t.amount : -t.amount), 0);
    updateState(prev => {
      let next = {
        ...prev, onboarded: true,
        profile: { ...prev.profile, name: obForm.name.trim(), phone: obForm.phone.trim(), email: obForm.email.trim(), kyc: 'verified' },
        wallet: { ...prev.wallet, balance },
        transactions: seeded,
      };
      next = pushNotif(next, 'system', `Welcome to ${APP_NAME}, ${obForm.name.trim().split(' ')[0]}! Your account is verified and ready to use.`);
      next = pushAudit(next, 'Account onboarded and KYC verified');
      return next;
    });
  };

  const guardActive = () => {
    if (appState.profile.accountSuspended) { setFormError('Your account is suspended. Contact support to resume transactions.'); return false; }
    return true;
  };

  const handleAddMoney = (amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    if (amount > appState.wallet.linkedBank.balance) return setFormError('Amount exceeds your linked bank balance.');
    updateState(prev => {
      let next = { ...prev, wallet: { ...prev.wallet, linkedBank: { ...prev.wallet.linkedBank, balance: prev.wallet.linkedBank.balance - amount } } };
      next = applyTransaction(next, { type: 'credit', category: 'Add Money', counterparty: prev.wallet.linkedBank.name, amount, balanceDelta: amount });
      next = pushNotif(next, 'credit', `₹${amount.toLocaleString('en-IN')} added to your wallet from ${prev.wallet.linkedBank.name}.`);
      next = pushAudit(next, `Added ${formatINR(amount)} from linked bank`);
      return next;
    });
    closeModal();
  };

  const executeSendMoney = (contact, amount, note, flagged) => {
    updateState(prev => {
      let next = applyTransaction(prev, {
        type: 'debit', category: 'Transfers', counterparty: contact.name, amount, note,
        flagged, flagReason: flagged ? 'Unusually large transfer relative to balance' : null, balanceDelta: -amount,
      });
      next = pushNotif(next, 'debit', `You sent ₹${amount.toLocaleString('en-IN')} to ${contact.name}.`);
      if (flagged) next = pushNotif(next, 'alert', `Large transfer to ${contact.name} was flagged for review by our AI monitoring.`);
      next = pushAudit(next, `Sent ${formatINR(amount)} to ${contact.name}${flagged ? ' (flagged)' : ''}`);
      return next;
    });
    closeModal();
  };

  const handleSendMoneySubmit = (contact, amountStr, note) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!contact) return setFormError('Choose a recipient.');
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    if (amount > appState.wallet.balance) return setFormError('Insufficient wallet balance.');
    if (todaysDebitTotal(appState.transactions) + amount > appState.profile.dailyLimit) return setFormError(`This would exceed your daily limit of ${formatINR(appState.profile.dailyLimit)}. Adjust it in Settings if needed.`);
    if (isLargeTransfer(amount, appState.wallet.balance)) { setConfirmLarge({ contact, amount, note }); return; }
    executeSendMoney(contact, amount, note, false);
  };

  const handlePayBill = (biller, amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    if (amount > appState.wallet.balance) return setFormError('Insufficient wallet balance.');
    if (todaysDebitTotal(appState.transactions) + amount > appState.profile.dailyLimit) return setFormError(`This would exceed your daily limit of ${formatINR(appState.profile.dailyLimit)}.`);
    updateState(prev => {
      let next = applyTransaction(prev, { type: 'debit', category: 'Bills', counterparty: biller.name, amount, balanceDelta: -amount });
      next = pushNotif(next, 'debit', `Paid ${formatINR(amount)} to ${biller.name}.`);
      next = maybeBudgetAlert(next, prev.budgets, 'Bills');
      next = pushAudit(next, `Paid bill: ${biller.name} — ${formatINR(amount)}`);
      return next;
    });
    closeModal();
  };

  const handleLogExpense = (category, counterparty, amountStr, note) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    if (amount > appState.wallet.balance) return setFormError('Insufficient wallet balance.');
    updateState(prev => {
      let next = applyTransaction(prev, { type: 'debit', category, counterparty: counterparty || category, amount, note, balanceDelta: -amount });
      next = pushNotif(next, 'debit', `Logged ${formatINR(amount)} expense — ${category}.`);
      next = maybeBudgetAlert(next, prev.budgets, category);
      return next;
    });
    closeModal();
  };

  const handleRecategorize = (txnId, category) => {
    updateState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === txnId ? { ...t, category } : t) }));
  };

  const handleCreateBudget = (category, limitStr) => {
    const limit = Number(limitStr);
    if (!limit || limit <= 0) return setFormError('Enter a valid monthly limit.');
    updateState(prev => {
      const exists = prev.budgets.find(b => b.category === category);
      const budgets = exists ? prev.budgets.map(b => b.category === category ? { ...b, limit } : b) : [...prev.budgets, { id: genId('bud'), category, limit }];
      return { ...prev, budgets };
    });
    closeModal();
  };
  const handleDeleteBudget = (id) => updateState(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));

  const handleCreateGoal = (name, targetStr, deadline) => {
    const target = Number(targetStr);
    if (!name.trim()) return setFormError('Give your goal a name.');
    if (!target || target <= 0) return setFormError('Enter a valid target amount.');
    updateState(prev => ({ ...prev, goals: [...prev.goals, { id: genId('goal'), name: name.trim(), target, current: 0, deadline: deadline ? new Date(deadline).getTime() : null }] }));
    closeModal();
  };

  const handleContributeGoal = (goal, amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    if (amount > appState.wallet.balance) return setFormError('Insufficient wallet balance.');
    updateState(prev => {
      let next = applyTransaction(prev, { type: 'debit', category: 'Goal Contribution', counterparty: goal.name, amount, balanceDelta: -amount });
      next = { ...next, goals: next.goals.map(g => g.id === goal.id ? { ...g, current: g.current + amount } : g) };
      const updated = next.goals.find(g => g.id === goal.id);
      if (updated.current >= updated.target) next = pushNotif(next, 'goal', `🎉 You've reached your "${goal.name}" goal!`);
      else next = pushNotif(next, 'goal', `Added ${formatINR(amount)} to "${goal.name}".`);
      return next;
    });
    closeModal();
  };

  const handleUpdateSettings = (patch) => updateState(prev => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  const handleMarkAllRead = () => updateState(prev => ({ ...prev, notifications: prev.notifications.map(n => ({ ...n, read: true })) }));

  const handleSetBusinessName = (name) => updateState(prev => ({ ...prev, merchant: { ...prev.merchant, businessName: name } }));
  const handleMerchantCollect = (amountStr, customerName) => {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError('Enter a valid amount.');
    updateState(prev => {
      const sale = { id: genId('sale'), customerName: customerName || 'Customer', amount, timestamp: Date.now(), refunded: false };
      let next = { ...prev, merchant: { ...prev.merchant, sales: [sale, ...prev.merchant.sales] } };
      next = applyTransaction(next, { type: 'credit', category: 'Merchant Sale', counterparty: sale.customerName, amount, balanceDelta: amount });
      next = pushNotif(next, 'credit', `Received ${formatINR(amount)} payment from ${sale.customerName}.`);
      next = pushAudit(next, `Merchant sale collected: ${formatINR(amount)} from ${sale.customerName}`);
      return next;
    });
    closeModal();
  };
  const handleRefundSale = (sale) => {
    updateState(prev => {
      let next = { ...prev, merchant: { ...prev.merchant, sales: prev.merchant.sales.map(s => s.id === sale.id ? { ...s, refunded: true } : s) } };
      next = applyTransaction(next, { type: 'debit', category: 'Refund', counterparty: sale.customerName, amount: sale.amount, balanceDelta: -sale.amount });
      next = pushNotif(next, 'debit', `Refunded ${formatINR(sale.amount)} to ${sale.customerName}.`);
      next = pushAudit(next, `Refunded ${formatINR(sale.amount)} to ${sale.customerName}`);
      return next;
    });
  };

  const handleSuspendToggle = () => {
    updateState(prev => {
      const suspended = !prev.profile.accountSuspended;
      let next = { ...prev, profile: { ...prev.profile, accountSuspended: suspended } };
      next = pushAudit(next, suspended ? 'Admin suspended the account' : 'Admin reinstated the account');
      next = pushNotif(next, 'alert', suspended ? 'Your account has been suspended by the admin team.' : 'Your account has been reinstated. You can transact again.');
      return next;
    });
  };
  const handleReviewFlag = (txnId) => {
    updateState(prev => {
      let next = { ...prev, transactions: prev.transactions.map(t => t.id === txnId ? { ...t, reviewed: true } : t) };
      next = pushAudit(next, `Admin cleared flagged transaction ${txnId}`);
      return next;
    });
  };

  const handleResetDemo = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    setAppState(defaultState());
    setCurrentRole('customer'); setCurrentView('dashboard');
    closeModal();
  };

  /* ---------------------------- render: loading ---------------------------- */
  if (loading || !appState) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-slate-950 text-slate-400">
        <FontStyles />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-amber-400" size={28} />
          <span className="text-sm">Loading {APP_NAME}…</span>
        </div>
      </div>
    );
  }

  /* ---------------------------- render: onboarding ---------------------------- */
  if (!appState.onboarded) {
    return (
      <div className="min-h-[700px] bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8">
        <FontStyles />
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Wallet className="text-amber-400" size={26} />
            <span className="font-serif-display text-2xl">{APP_NAME}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              {[0, 1, 2].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= obStep ? 'bg-amber-400' : 'bg-slate-800'}`} />
              ))}
            </div>

            {obStep === 0 && (
              <>
                <h2 className="font-serif-display text-xl mb-1">Create your account</h2>
                <p className="text-slate-500 text-sm mb-6">Register with your mobile, email, or a social login.</p>
                <Field label="Full name"><input className={inputClass} value={obForm.name} onChange={e => setObForm({ ...obForm, name: e.target.value })} placeholder="Aditi Rao" /></Field>
                <Field label="Mobile number"><input className={inputClass} value={obForm.phone} onChange={e => setObForm({ ...obForm, phone: e.target.value })} placeholder="+91 98765 43210" /></Field>
                <Field label="Email"><input className={inputClass} value={obForm.email} onChange={e => setObForm({ ...obForm, email: e.target.value })} placeholder="aditi@email.com" /></Field>
                {formError && <p className="text-rose-400 text-sm mb-3">{formError}</p>}
                <Btn className="w-full" onClick={() => { if (!obForm.name.trim() || !obForm.phone.trim() || !obForm.email.trim()) return setFormError('Please fill in all fields.'); setFormError(''); setObStep(1); }}>Continue</Btn>
                <p className="text-slate-600 text-xs mt-4 text-center">or continue with Google · Apple (demo)</p>
              </>
            )}

            {obStep === 1 && (
              <>
                <h2 className="font-serif-display text-xl mb-1">Verify your number</h2>
                <p className="text-slate-500 text-sm mb-6">We sent a 6-digit code to {obForm.phone}.</p>
                <Field label="One-time passcode"><input className={`${inputClass} tracking-[0.3em] ledger-num`} defaultValue="482913" readOnly /></Field>
                <div className="flex items-center gap-2 text-xs text-emerald-400 mb-6"><ShieldCheck size={14} /> Multi-factor authentication enabled</div>
                <Btn className="w-full" onClick={() => setObStep(2)}>Verify &amp; continue</Btn>
                <button className="text-slate-500 text-xs mt-3 mx-auto block hover:text-slate-300" onClick={() => setObStep(0)}>Back</button>
              </>
            )}

            {obStep === 2 && <KycStep onDone={completeOnboarding} formError={formError} />}
          </div>
          <p className="text-slate-600 text-xs text-center mt-6">Demo environment — money and identity data shown here are simulated, not connected to real banks or UPI rails.</p>
        </div>
      </div>
    );
  }

  /* ---------------------------- role/view wiring ---------------------------- */
  const switchRole = (role) => {
    setCurrentRole(role); setMobileNavOpen(false);
    setCurrentView(role === 'customer' ? 'dashboard' : role);
  };

  const suspended = appState.profile.accountSuspended;

  /* ---------------------------- render: app shell ---------------------------- */
  return (
    <div className="min-h-[760px] bg-slate-950 text-slate-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <FontStyles />

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-slate-900 min-h-screen p-4">
          <SidebarContent currentRole={currentRole} currentView={currentView} switchRole={switchRole} setCurrentView={setCurrentView} />
        </aside>

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <Wallet className="text-amber-400" size={20} />
            <span className="font-serif-display text-lg">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-1">
            <NotifBell unreadCount={unreadCount} onClick={() => setNotifOpen(o => !o)} />
            <button onClick={() => setMobileNavOpen(true)} className="p-2 text-slate-400"><Menu size={20} /></button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/95 p-4 lg:hidden">
            <div className="flex justify-end mb-2"><button onClick={() => setMobileNavOpen(false)} className="p-2 text-slate-400"><X size={20} /></button></div>
            <SidebarContent currentRole={currentRole} currentView={currentView} switchRole={switchRole} setCurrentView={(v) => { setCurrentView(v); setMobileNavOpen(false); }} />
          </div>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0 relative">
          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-900">
            <h1 className="font-serif-display text-xl capitalize">{currentView === 'dashboard' ? `Welcome back, ${appState.profile.name.split(' ')[0]}` : currentView.replace('-', ' ')}</h1>
            <div className="flex items-center gap-4 relative">
              {saveError && <span className="text-xs text-amber-400 flex items-center gap-1"><AlertTriangle size={12} /> Sync issue</span>}
              <NotifBell unreadCount={unreadCount} onClick={() => setNotifOpen(o => !o)} />
            </div>
          </div>
          {notifOpen && <NotifPanel notifications={appState.notifications} onMarkAllRead={handleMarkAllRead} onClose={() => setNotifOpen(false)} />}

          {suspended && (
            <div className="bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-sm px-6 py-3 flex items-center gap-2">
              <Ban size={16} /> Your account is suspended by the admin team. Money movement is disabled until this is resolved.
            </div>
          )}

          <main className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            {currentRole === 'customer' && currentView === 'dashboard' && (
              <DashboardContent appState={appState} budgetsWithSpent={budgetsWithSpent} healthScore={healthScore} healthLabel={healthLabel} healthTone={healthTone}
                openModal={setModal} setCurrentView={setCurrentView} />
            )}
            {currentRole === 'customer' && currentView === 'transactions' && (
              <TransactionsContent appState={appState} onRecategorize={handleRecategorize} />
            )}
            {currentRole === 'customer' && currentView === 'insights' && (
              <InsightsContent healthScore={healthScore} healthLabel={healthLabel} healthTone={healthTone} spendByCategory={spendByCategory} weeklyTrend={weeklyTrend} recurringBills={recurringBills} />
            )}
            {currentRole === 'customer' && currentView === 'budgets' && (
              <BudgetsContent budgetsWithSpent={budgetsWithSpent} openModal={setModal} onDelete={handleDeleteBudget} />
            )}
            {currentRole === 'customer' && currentView === 'goals' && (
              <GoalsContent goals={appState.goals} openModal={setModal} onContribute={(g) => { setModal({ id: 'contributeGoal', goal: g }); }} />
            )}
            {currentRole === 'customer' && currentView === 'settings' && (
              <SettingsContent appState={appState} onUpdate={handleUpdateSettings} onReset={() => setModal('resetConfirm')} />
            )}
            {currentRole === 'merchant' && (
              <MerchantContent appState={appState} openModal={setModal} onSetBusinessName={handleSetBusinessName} onRefund={handleRefundSale} />
            )}
            {currentRole === 'admin' && (
              <AdminContent appState={appState} flaggedPending={flaggedPending} flaggedCleared={flaggedCleared} onSuspendToggle={handleSuspendToggle} onReviewFlag={handleReviewFlag} />
            )}
          </main>
        </div>
      </div>

      {/* ---- Modals ---- */}
      {modal === 'addMoney' && (
        <AddMoneyModal linkedBank={appState.wallet.linkedBank} formError={formError} onClose={closeModal} onSubmit={handleAddMoney} />
      )}
      {modal === 'sendMoney' && !confirmLarge && (
        <SendMoneyModal balance={appState.wallet.balance} formError={formError} onClose={closeModal} onSubmit={handleSendMoneySubmit} />
      )}
      {confirmLarge && (
        <Modal title="Confirm large transfer" onClose={closeModal}
          footer={<>
            <Btn tone="ghost" onClick={closeModal}>Cancel</Btn>
            <Btn tone="danger" onClick={() => executeSendMoney(confirmLarge.contact, confirmLarge.amount, confirmLarge.note, true)}>Send anyway</Btn>
          </>}>
          <div className="flex items-start gap-3 bg-amber-400/10 border border-amber-400/30 rounded-md p-3 mb-4">
            <ShieldAlert className="text-amber-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-200">This transfer of <Money value={confirmLarge.amount} className="text-amber-300" /> to {confirmLarge.contact.name} is unusually large for your typical activity. Our AI monitoring will flag it for review. Continue?</p>
          </div>
        </Modal>
      )}
      {modal === 'payBill' && (
        <PayBillModal balance={appState.wallet.balance} formError={formError} onClose={closeModal} onSubmit={handlePayBill} />
      )}
      {modal === 'logExpense' && (
        <LogExpenseModal balance={appState.wallet.balance} formError={formError} onClose={closeModal} onSubmit={handleLogExpense} />
      )}
      {modal === 'newBudget' && (
        <BudgetModal formError={formError} existing={appState.budgets} onClose={closeModal} onSubmit={handleCreateBudget} />
      )}
      {modal === 'newGoal' && (
        <GoalModal formError={formError} onClose={closeModal} onSubmit={handleCreateGoal} />
      )}
      {modal && modal.id === 'contributeGoal' && (
        <ContributeGoalModal goal={modal.goal} balance={appState.wallet.balance} formError={formError} onClose={closeModal} onSubmit={handleContributeGoal} />
      )}
      {modal === 'merchantCollect' && (
        <MerchantCollectModal businessName={appState.merchant.businessName || 'My Business'} formError={formError} onClose={closeModal} onSubmit={handleMerchantCollect} />
      )}
      {modal === 'resetConfirm' && (
        <Modal title="Reset demo data?" onClose={closeModal} footer={<>
          <Btn tone="ghost" onClick={closeModal}>Cancel</Btn>
          <Btn tone="danger" onClick={handleResetDemo}>Reset everything</Btn>
        </>}>
          <p className="text-sm text-slate-400">This clears your wallet, transactions, budgets, goals and notifications, and takes you back through onboarding. This can't be undone.</p>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------- fonts ---------------------------- */
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      .font-serif-display { font-family: 'Fraunces', Georgia, serif; }
      .ledger-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    `}</style>
  );
}

/* ---------------------------- KYC step ---------------------------- */
function KycStep({ onDone, formError }) {
  const [status, setStatus] = useState('idle'); // idle | uploading | verified
  return (
    <>
      <h2 className="font-serif-display text-xl mb-1">Verify your identity</h2>
      <p className="text-slate-500 text-sm mb-6">Complete KYC to unlock wallets, payments, and financial insights.</p>
      <div className="border border-dashed border-slate-800 rounded-lg p-6 text-center mb-6">
        {status === 'idle' && (
          <>
            <BadgeCheck className="mx-auto text-slate-600 mb-2" size={28} />
            <p className="text-slate-400 text-sm mb-4">Upload a government ID and a selfie to verify your account.</p>
            <Btn tone="outline" onClick={() => { setStatus('uploading'); setTimeout(() => setStatus('verified'), 900); }}>Simulate ID upload</Btn>
          </>
        )}
        {status === 'uploading' && (
          <div className="flex flex-col items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={22} /><span className="text-sm">Verifying documents…</span></div>
        )}
        {status === 'verified' && (
          <div className="flex flex-col items-center gap-2 text-emerald-400"><CheckCircle2 size={26} /><span className="text-sm font-medium">KYC verified</span></div>
        )}
      </div>
      {formError && <p className="text-rose-400 text-sm mb-3">{formError}</p>}
      <Btn className="w-full" disabled={status !== 'verified'} onClick={onDone}>Enter {APP_NAME}</Btn>
    </>
  );
}

/* ---------------------------- sidebar ---------------------------- */
function SidebarContent({ currentRole, currentView, switchRole, setCurrentView }) {
  return (
    <>
      <div className="flex items-center gap-2 mb-8 px-2">
        <Wallet className="text-amber-400" size={22} />
        <span className="font-serif-display text-xl">{APP_NAME}</span>
      </div>
      <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6">
        {['customer', 'merchant', 'admin'].map(r => (
          <button key={r} onClick={() => switchRole(r)}
            className={`flex-1 text-xs py-1.5 rounded-md capitalize font-medium transition-colors ${currentRole === r ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}>
            {r}
          </button>
        ))}
      </div>
      {currentRole === 'customer' && (
        <nav className="flex flex-col gap-1">
          {CUSTOMER_NAV.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${currentView === item.id ? 'bg-slate-900 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}`}>
              <item.icon size={16} /> {item.label}
            </button>
          ))}
        </nav>
      )}
      {currentRole === 'merchant' && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-slate-900 text-amber-400"><Building2 size={16} /> Merchant Dashboard</div>
      )}
      {currentRole === 'admin' && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-slate-900 text-amber-400"><ShieldAlert size={16} /> Admin Console</div>
      )}
      <p className="mt-auto pt-6 text-[11px] text-slate-600 leading-relaxed px-2">Demo environment. Balances and transfers are simulated — not connected to real banks or UPI rails.</p>
    </>
  );
}

function NotifBell({ unreadCount, onClick }) {
  return (
    <button onClick={onClick} className="relative p-2 text-slate-400 hover:text-slate-200">
      <Bell size={18} />
      {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center">{unreadCount}</span>}
    </button>
  );
}

function NotifPanel({ notifications, onMarkAllRead, onClose }) {
  return (
    <div className="absolute right-4 sm:right-8 top-16 z-30 w-[calc(100%-2rem)] sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="font-medium text-sm">Notifications</span>
        <div className="flex items-center gap-3">
          <button onClick={onMarkAllRead} className="text-xs text-amber-400 hover:text-amber-300">Mark all read</button>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X size={14} /></button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <p className="text-slate-500 text-sm p-4">No notifications yet.</p>
      ) : notifications.slice(0, 25).map(n => (
        <div key={n.id} className={`px-4 py-3 border-b border-slate-800/60 text-sm ${n.read ? 'text-slate-500' : 'text-slate-200'}`}>
          <div className="flex items-start gap-2">
            {n.type === 'alert' ? <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" /> : n.type === 'credit' || n.type === 'goal' ? <ArrowUpRight size={14} className="text-emerald-400 mt-0.5 shrink-0" /> : n.type === 'debit' ? <ArrowDownLeft size={14} className="text-sky-400 mt-0.5 shrink-0" /> : <Bell size={14} className="text-slate-500 mt-0.5 shrink-0" />}
            <div>
              <p>{n.message}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{formatDateTime(n.timestamp)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------- Dashboard ---------------------------- */
function DashboardContent({ appState, budgetsWithSpent, healthScore, healthLabel, healthTone, openModal, setCurrentView }) {
  const recent = appState.transactions.slice(0, 5);
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-400/5" />
        <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs uppercase tracking-wide"><Wallet size={14} /> Wallet balance</div>
        <Money value={appState.wallet.balance} size="xxl" className="text-slate-50 block" />
        <div className="flex items-center gap-3 mt-4 text-xs text-slate-500">
          <Badge tone="emerald"><BadgeCheck size={11} /> KYC verified</Badge>
          <span>Linked: {appState.wallet.linkedBank.name}</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-6">
          <Btn onClick={() => openModal('addMoney')}><span className="flex items-center gap-1.5"><PlusCircle size={15} /> Add money</span></Btn>
          <Btn tone="ghost" onClick={() => openModal('sendMoney')}><span className="flex items-center gap-1.5"><Send size={15} /> Send money</span></Btn>
          <Btn tone="ghost" onClick={() => openModal('payBill')}><span className="flex items-center gap-1.5"><Zap size={15} /> Pay bill</span></Btn>
          <Btn tone="ghost" onClick={() => openModal('logExpense')}><span className="flex items-center gap-1.5"><Receipt size={15} /> Log expense</span></Btn>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Financial health" value={`${healthScore}`} icon={Sparkles} tone={healthTone} />
        <StatCard label="This month, in" value={formatINR(appState.transactions.filter(t => t.type === 'credit').slice(0, 20).reduce((s, t) => s + t.amount, 0))} icon={ArrowUpRight} tone="emerald" />
        <StatCard label="Linked bank balance" value={formatINR(appState.wallet.linkedBank.balance)} icon={Landmark} tone="slate" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="font-serif-display">Recent activity</span>
            <button onClick={() => setCurrentView('transactions')} className="text-xs text-amber-400 flex items-center gap-0.5 hover:text-amber-300">View all <ChevronRight size={13} /></button>
          </div>
          {recent.length === 0 ? <div className="p-5"><EmptyState icon={Receipt} title="No transactions yet" subtitle="Add money or send a transfer to get started." /></div> : (
            <div>
              {recent.map(t => <TxnRow key={t.id} t={t} />)}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <span className="font-serif-display">Budgets this month</span>
            <button onClick={() => setCurrentView('budgets')} className="text-xs text-amber-400 flex items-center gap-0.5 hover:text-amber-300">Manage <ChevronRight size={13} /></button>
          </div>
          <div className="p-5 space-y-4">
            {budgetsWithSpent.length === 0 ? <EmptyState icon={Wallet} title="No budgets set" /> : budgetsWithSpent.slice(0, 3).map(b => (
              <div key={b.id}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5"><CategoryIcon category={b.category} size={11} /> {b.category}</span>
                  <span className="text-slate-400"><Money value={b.spent} size="sm" /> / <Money value={b.limit} size="sm" /></span>
                </div>
                <ProgressBar percent={(b.spent / b.limit) * 100} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TxnRow({ t, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0 ${onClick ? 'cursor-pointer hover:bg-slate-800/30' : ''}`}>
      <CategoryIcon category={t.category} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-slate-200 truncate">{t.counterparty}</p>
          {t.flagged && <ShieldAlert size={12} className={t.reviewed ? 'text-slate-600' : 'text-amber-400'} />}
        </div>
        <p className="text-xs text-slate-500">{t.category} · {formatDate(t.timestamp)}</p>
      </div>
      <Money value={t.amount} sign className="shrink-0" size="sm" />
    </div>
  );
}

/* ---------------------------- Transactions ---------------------------- */
function TransactionsContent({ appState, onRecategorize }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = appState.transactions.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (query && !(`${t.counterparty} ${t.note}`.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search transactions…" className={`${inputClass} pl-3`} />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className={`${inputClass} w-auto`}>
          <option value="all">All categories</option>
          {Object.keys(CATEGORY_META).filter(c => c !== 'Other').map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        {filtered.length === 0 ? <div className="p-5"><EmptyState icon={Receipt} title="No matching transactions" /></div> : filtered.map(t => <TxnRow key={t.id} t={t} onClick={() => setSelected(t)} />)}
      </div>
      {selected && (
        <Modal title="Transaction detail" onClose={() => setSelected(null)}>
          <div className="flex items-center gap-3 mb-4">
            <CategoryIcon category={selected.category} size={18} />
            <div>
              <p className="text-slate-200">{selected.counterparty}</p>
              <p className="text-xs text-slate-500">{formatDateTime(selected.timestamp)}</p>
            </div>
          </div>
          <Money value={selected.amount} sign size="xl" className="block mb-4" />
          {selected.note && <p className="text-sm text-slate-400 mb-4">"{selected.note}"</p>}
          {selected.flagged && (
            <div className="flex items-start gap-2 bg-amber-400/10 border border-amber-400/30 rounded-md p-3 mb-4 text-sm text-amber-200">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" /> Flagged by AI monitoring: {selected.flagReason}. {selected.reviewed ? 'Cleared by admin review.' : 'Pending admin review.'}
            </div>
          )}
          <Field label="Recategorize">
            <select value={selected.category} className={inputClass} onChange={e => { onRecategorize(selected.id, e.target.value); setSelected({ ...selected, category: e.target.value }); }}>
              {Object.keys(CATEGORY_META).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
            <span>Status: {selected.status}</span><span>ID: {selected.id.slice(0, 14)}</span>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------- Insights ---------------------------- */
function InsightsContent({ healthScore, healthLabel, healthTone, spendByCategory, weeklyTrend, recurringBills }) {
  const toneClass = { emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400' }[healthTone];
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Financial health score</p>
          <span className={`ledger-num text-4xl ${toneClass}`}>{healthScore}</span><span className="text-slate-600 text-sm">/100</span>
        </div>
        <div className="flex-1 min-w-[200px]">
          <Badge tone={healthTone}>{healthLabel}</Badge>
          <p className="text-sm text-slate-500 mt-2">Based on your savings rate, budget adherence, and goal progress over the last 30 days.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="font-serif-display mb-4">Spend by category <span className="text-xs text-slate-500 font-sans">(45 days)</span></p>
          {spendByCategory.length === 0 ? <EmptyState icon={Sparkles} title="Not enough data yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={spendByCategory} dataKey="value" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {spendByCategory.map((entry, i) => <Cell key={i} fill={(CATEGORY_META[entry.category] || CATEGORY_META.Other).hex} stroke="#0f172a" />)}
                </Pie>
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
            {spendByCategory.map(e => (
              <span key={e.category} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: (CATEGORY_META[e.category] || CATEGORY_META.Other).hex }} /> {e.category}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <p className="font-serif-display mb-4">Weekly spend trend</p>
          {weeklyTrend.length === 0 ? <EmptyState icon={TrendingUp} title="Not enough data yet" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyTrend}>
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} cursor={{ fill: 'rgba(251,191,36,0.06)' }} />
                <Bar dataKey="value" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="font-serif-display mb-1 flex items-center gap-2"><Sparkles size={16} className="text-amber-400" /> Smart recommendations</p>
        <p className="text-xs text-slate-500 mb-4">Simple rule-based estimates from your activity — not a substitute for financial advice.</p>
        <div className="space-y-3">
          {recurringBills.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Info size={14} className="text-sky-400 mt-0.5 shrink-0" />
              <span>Recurring bills detected: {recurringBills.map(b => `${b.name} (~${formatINR(b.avg)})`).join(', ')}. Expect these again next cycle.</span>
            </div>
          )}
          {spendByCategory.sort((a, b) => b.value - a.value)[0] && (
            <div className="flex items-start gap-2 text-sm text-slate-300">
              <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <span>Your biggest spend area lately is <b>{spendByCategory.sort((a, b) => b.value - a.value)[0].category}</b> — a good place to look for savings.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Budgets ---------------------------- */
function BudgetsContent({ budgetsWithSpent, openModal, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Track spending against a monthly limit per category.</p>
        <Btn onClick={() => openModal('newBudget')}><span className="flex items-center gap-1.5"><PlusCircle size={15} /> New budget</span></Btn>
      </div>
      {budgetsWithSpent.length === 0 ? <EmptyState icon={Wallet} title="No budgets yet" subtitle="Create one to start tracking your spending." /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {budgetsWithSpent.map(b => {
            const pct = (b.spent / b.limit) * 100;
            return (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="flex items-center gap-2 font-medium"><CategoryIcon category={b.category} size={13} /> {b.category}</span>
                  <button onClick={() => onDelete(b.id)} className="text-slate-600 hover:text-rose-400"><Trash2 size={14} /></button>
                </div>
                <div className="flex justify-between text-sm mb-1.5 text-slate-400">
                  <Money value={b.spent} size="sm" /><Money value={b.limit} size="sm" />
                </div>
                <ProgressBar percent={pct} />
                <p className={`text-xs mt-2 ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-slate-500'}`}>
                  {pct >= 100 ? 'Over budget this month' : `${Math.round(100 - pct)}% remaining this month`}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Goals ---------------------------- */
function GoalsContent({ goals, openModal, onContribute }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-slate-500 text-sm">Set targets and chip away at them from your wallet.</p>
        <Btn onClick={() => openModal('newGoal')}><span className="flex items-center gap-1.5"><PlusCircle size={15} /> New goal</span></Btn>
      </div>
      {goals.length === 0 ? <EmptyState icon={Target} title="No goals yet" subtitle="Create a savings goal to see progress here." /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map(g => {
            const pct = (g.current / g.target) * 100;
            return (
              <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium flex items-center gap-2"><Target size={15} className="text-amber-400" /> {g.name}</span>
                  {pct >= 100 && <Badge tone="emerald">Complete</Badge>}
                </div>
                {g.deadline && <p className="text-xs text-slate-500 mb-3">by {formatDate(g.deadline)}</p>}
                <div className="flex justify-between text-sm mb-1.5 text-slate-400">
                  <Money value={g.current} size="sm" /><Money value={g.target} size="sm" />
                </div>
                <ProgressBar percent={pct} />
                <Btn tone="outline" className="w-full mt-4" onClick={() => onContribute(g)} disabled={pct >= 100}>Contribute</Btn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------------------- Settings ---------------------------- */
function SettingsContent({ appState, onUpdate, onReset }) {
  const [income, setIncome] = useState(appState.profile.monthlyIncome);
  const [limit, setLimit] = useState(appState.profile.dailyLimit);
  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="font-serif-display mb-4">Profile</p>
        <div className="flex items-center gap-3 mb-1"><span className="text-slate-200">{appState.profile.name}</span><Badge tone="emerald"><BadgeCheck size={11} /> KYC verified</Badge></div>
        <p className="text-sm text-slate-500">{appState.profile.phone} · {appState.profile.email}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="font-serif-display mb-4">Limits &amp; income</p>
        <Field label="Estimated monthly income">
          <div className="flex gap-2">
            <input type="number" className={inputClass} value={income} onChange={e => setIncome(e.target.value)} />
            <Btn tone="outline" onClick={() => onUpdate({ monthlyIncome: Number(income) || 0 })}>Save</Btn>
          </div>
        </Field>
        <Field label="Daily transaction limit">
          <div className="flex gap-2">
            <input type="number" className={inputClass} value={limit} onChange={e => setLimit(e.target.value)} />
            <Btn tone="outline" onClick={() => onUpdate({ dailyLimit: Number(limit) || 0 })}>Save</Btn>
          </div>
        </Field>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="font-serif-display mb-4">Notification channels</p>
        {['sms', 'email', 'inApp'].map(ch => (
          <div key={ch} className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-300 capitalize">{ch === 'inApp' ? 'In-app' : ch.toUpperCase()}</span>
            <button onClick={() => onUpdate({ notifyChannels: { ...appState.profile.notifyChannels, [ch]: !appState.profile.notifyChannels[ch] } })}
              className={`w-10 h-5 rounded-full transition-colors relative ${appState.profile.notifyChannels[ch] ? 'bg-amber-400' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-slate-950 transition-all ${appState.profile.notifyChannels[ch] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="font-serif-display mb-1">Linked bank account</p>
        <p className="text-sm text-slate-400">{appState.wallet.linkedBank.name} — <Money value={appState.wallet.linkedBank.balance} size="sm" /> available</p>
      </div>

      <div className="border border-rose-900/50 rounded-lg p-5">
        <p className="font-serif-display mb-1 text-rose-300">Danger zone</p>
        <p className="text-sm text-slate-500 mb-3">Clear all demo data and start over from onboarding.</p>
        <Btn tone="danger" onClick={onReset}>Reset demo data</Btn>
      </div>
    </div>
  );
}

/* ---------------------------- Merchant ---------------------------- */
function MerchantContent({ appState, openModal, onSetBusinessName, onRefund }) {
  const [nameDraft, setNameDraft] = useState(appState.merchant.businessName);
  const editingName = !appState.merchant.businessName;
  const sales = appState.merchant.sales;
  const activeSales = sales.filter(s => !s.refunded);
  const totalSales = activeSales.reduce((s, x) => s + x.amount, 0);
  const monthSales = activeSales.filter(s => s.timestamp >= startOfMonthTs()).reduce((s, x) => s + x.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="text-amber-400" size={20} />
        {editingName ? (
          <div className="flex gap-2">
            <input className={inputClass} placeholder="Your business name" value={nameDraft} onChange={e => setNameDraft(e.target.value)} />
            <Btn onClick={() => onSetBusinessName(nameDraft.trim() || 'My Business')}>Save</Btn>
          </div>
        ) : (
          <h2 className="font-serif-display text-xl">{appState.merchant.businessName}</h2>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total sales" value={formatINR(totalSales)} icon={TrendingUp} tone="emerald" />
        <StatCard label="This month" value={formatINR(monthSales)} icon={Wallet} tone="slate" />
        <StatCard label="Transactions" value={String(activeSales.length)} icon={Receipt} tone="slate" />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <QrCode className="text-slate-600" size={36} />
          <div>
            <p className="text-sm text-slate-300">Accept a payment</p>
            <p className="text-xs text-slate-500">Share a QR/payment link, or collect manually.</p>
          </div>
        </div>
        <Btn onClick={() => openModal('merchantCollect')}><span className="flex items-center gap-1.5"><PlusCircle size={15} /> Collect payment</span></Btn>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        <div className="px-5 py-4 border-b border-slate-800 font-serif-display">Sales</div>
        {sales.length === 0 ? <div className="p-5"><EmptyState icon={Receipt} title="No sales yet" subtitle="Collect a payment to see it here." /></div> : sales.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0">
            <CategoryIcon category="Merchant Sale" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{s.customerName}</p>
              <p className="text-xs text-slate-500">{formatDateTime(s.timestamp)}</p>
            </div>
            <Money value={s.amount} size="sm" className={s.refunded ? 'text-slate-600 line-through' : 'text-emerald-400'} />
            {s.refunded ? <Badge tone="rose">Refunded</Badge> : <Btn tone="outline" onClick={() => onRefund(s)}>Refund</Btn>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Admin ---------------------------- */
function AdminContent({ appState, flaggedPending, flaggedCleared, onSuspendToggle, onReviewFlag }) {
  const totalVolume = appState.transactions.reduce((s, t) => s + t.amount, 0);
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        <StatCard label="Total transactions" value={String(appState.transactions.length)} icon={Receipt} />
        <StatCard label="Total volume" value={formatINR(totalVolume)} icon={TrendingUp} tone="emerald" />
        <StatCard label="Wallet balance" value={formatINR(appState.wallet.balance)} icon={Wallet} />
        <StatCard label="Needs review" value={String(flaggedPending.length)} icon={ShieldAlert} tone={flaggedPending.length ? 'amber' : 'slate'} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-serif-display mb-1">User account</p>
          <p className="text-sm text-slate-400">{appState.profile.name} · {appState.profile.phone}</p>
          <div className="mt-2">{appState.profile.accountSuspended ? <Badge tone="rose"><Ban size={11} /> Suspended</Badge> : <Badge tone="emerald"><CheckCircle2 size={11} /> Active</Badge>}</div>
        </div>
        <Btn tone={appState.profile.accountSuspended ? 'primary' : 'danger'} onClick={onSuspendToggle}>
          {appState.profile.accountSuspended ? 'Reinstate account' : 'Suspend account'}
        </Btn>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        <div className="px-5 py-4 border-b border-slate-800 font-serif-display flex items-center gap-2"><ShieldAlert size={16} className="text-amber-400" /> Flagged transactions — needs review</div>
        {flaggedPending.length === 0 ? <p className="text-slate-500 text-sm p-5">Nothing pending review.</p> : flaggedPending.map(t => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0">
            <CategoryIcon category={t.category} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200">{t.counterparty} <span className="text-slate-500">— {t.flagReason}</span></p>
              <p className="text-xs text-slate-500">{formatDateTime(t.timestamp)}</p>
            </div>
            <Money value={t.amount} size="sm" />
            <Btn tone="outline" onClick={() => onReviewFlag(t.id)}>Clear</Btn>
          </div>
        ))}
      </div>

      {flaggedCleared.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
          <div className="px-5 py-4 border-b border-slate-800 font-serif-display text-sm text-slate-400">Cleared flags</div>
          {flaggedCleared.map(t => <TxnRow key={t.id} t={t} />)}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-lg">
        <div className="px-5 py-4 border-b border-slate-800 font-serif-display">Audit trail</div>
        {appState.auditLog.length === 0 ? <p className="text-slate-500 text-sm p-5">No admin activity yet.</p> : appState.auditLog.slice(0, 15).map(l => (
          <div key={l.id} className="px-5 py-2.5 border-b border-slate-800/60 last:border-0 text-sm flex justify-between">
            <span className="text-slate-300">{l.action}</span><span className="text-slate-600 text-xs">{formatDateTime(l.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- Modals: money actions ---------------------------- */
function AddMoneyModal({ linkedBank, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  return (
    <Modal title="Add money" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(amount)}>Add money</Btn></>}>
      <Field label={`From ${linkedBank.name} (${formatINR(linkedBank.balance)} available)`}>
        <input type="number" className={inputClass} placeholder="₹ Amount" value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
      </Field>
      <div className="flex gap-2 flex-wrap">
        {[500, 1000, 5000, 10000].map(v => <button key={v} onClick={() => setAmount(String(v))} className="px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300 hover:bg-slate-700">₹{v.toLocaleString('en-IN')}</button>)}
      </div>
      {formError && <p className="text-rose-400 text-sm mt-3">{formError}</p>}
    </Modal>
  );
}

function SendMoneyModal({ balance, formError, onClose, onSubmit }) {
  const [contactId, setContactId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const contact = CONTACTS.find(c => c.id === contactId);
  return (
    <Modal title="Send money" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(contact, amount, note)}>Send</Btn></>}>
      <Field label="To">
        <div className="grid grid-cols-2 gap-2">
          {CONTACTS.map(c => (
            <button key={c.id} onClick={() => setContactId(c.id)} className={`text-left px-3 py-2 rounded-md border text-sm ${contactId === c.id ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-slate-800 text-slate-300 hover:border-slate-600'}`}>
              <div>{c.name}</div><div className="text-xs text-slate-500">{c.phone}</div>
            </button>
          ))}
        </div>
      </Field>
      <Field label={`Amount (${formatINR(balance)} available)`}><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" /></Field>
      <Field label="Note (optional)"><input className={inputClass} value={note} onChange={e => setNote(e.target.value)} placeholder="What's this for?" /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function PayBillModal({ balance, formError, onClose, onSubmit }) {
  const [billerId, setBillerId] = useState('');
  const [amount, setAmount] = useState('');
  const biller = BILLERS.find(b => b.id === billerId);
  return (
    <Modal title="Pay a bill" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(biller, amount)}>Pay</Btn></>}>
      <Field label="Biller">
        <div className="grid grid-cols-2 gap-2">
          {BILLERS.map(b => (
            <button key={b.id} onClick={() => setBillerId(b.id)} className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${billerId === b.id ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-slate-800 text-slate-300 hover:border-slate-600'}`}>
              <b.icon size={14} /> {b.name}
            </button>
          ))}
        </div>
      </Field>
      <Field label={`Amount (${formatINR(balance)} available)`}><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function LogExpenseModal({ balance, formError, onClose, onSubmit }) {
  const [category, setCategory] = useState('Food');
  const [counterparty, setCounterparty] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  return (
    <Modal title="Log an expense" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(category, counterparty, amount, note)}>Log expense</Btn></>}>
      <Field label="Category">
        <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Merchant / where it went"><input className={inputClass} value={counterparty} onChange={e => setCounterparty(e.target.value)} placeholder="e.g. Corner Café" /></Field>
      <Field label={`Amount (${formatINR(balance)} available)`}><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" /></Field>
      <Field label="Note (optional)"><input className={inputClass} value={note} onChange={e => setNote(e.target.value)} /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function BudgetModal({ formError, existing, onClose, onSubmit }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState('');
  return (
    <Modal title="New budget" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(category, limit)}>Save budget</Btn></>}>
      <Field label="Category">
        <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
          {['Food', 'Shopping', 'Bills', 'Transfers'].map(c => <option key={c} value={c}>{c}{existing.find(b => b.category === c) ? ' (update existing)' : ''}</option>)}
        </select>
      </Field>
      <Field label="Monthly limit"><input type="number" className={inputClass} value={limit} onChange={e => setLimit(e.target.value)} placeholder="₹ Amount" /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function GoalModal({ formError, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  return (
    <Modal title="New goal" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(name, target, deadline)}>Create goal</Btn></>}>
      <Field label="Goal name"><input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Goa trip" /></Field>
      <Field label="Target amount"><input type="number" className={inputClass} value={target} onChange={e => setTarget(e.target.value)} placeholder="₹ Amount" /></Field>
      <Field label="Target date (optional)"><input type="date" className={inputClass} value={deadline} onChange={e => setDeadline(e.target.value)} /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function ContributeGoalModal({ goal, balance, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  return (
    <Modal title={`Contribute to "${goal.name}"`} onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(goal, amount)}>Contribute</Btn></>}>
      <p className="text-sm text-slate-400 mb-3"><Money value={goal.current} size="sm" /> of <Money value={goal.target} size="sm" /> saved so far.</p>
      <Field label={`Amount (${formatINR(balance)} available)`}><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" autoFocus /></Field>
      {formError && <p className="text-rose-400 text-sm">{formError}</p>}
    </Modal>
  );
}

function MerchantCollectModal({ businessName, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState('');
  const [customer, setCustomer] = useState('');
  return (
    <Modal title="Collect a payment" onClose={onClose} footer={<><Btn tone="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={() => onSubmit(amount, customer)}>Collect payment</Btn></>}>
      <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-md p-4 mb-4">
        <div className="grid grid-cols-5 gap-0.5 shrink-0" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => <span key={i} className={`w-2.5 h-2.5 ${(i * 7 + i) % 3 === 0 ? 'bg-slate-200' : 'bg-slate-800'}`} />)}
        </div>
        <div className="text-xs text-slate-500">Demo QR for <span className="text-slate-300">{businessName}</span>. In production this would be a scannable UPI QR code.</div>
      </div>
      <Field label="Customer name (optional)"><input className={inputClass} value={customer} onChange={e => setCustomer(e.target.value)} placeholder="Walk-in customer" /></Field>
      <Field label="Amount"><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ Amount" autoFocus /></Field>
      <p className="text-xs text-slate-600">Use this to simulate a customer scanning the QR and paying.</p>
      {formError && <p className="text-rose-400 text-sm mt-2">{formError}</p>}
    </Modal>
  );
}
