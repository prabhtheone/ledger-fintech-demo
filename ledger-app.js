import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Wallet,
  Send,
  PlusCircle,
  Receipt,
  Target,
  Bell,
  Store,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  X,
  Settings as SettingsIcon,
  TrendingUp,
  CreditCard,
  RefreshCcw,
  Coffee,
  ShoppingBag,
  Zap,
  Smartphone,
  Menu,
  Sparkles,
  ShieldAlert,
  Building2,
  LayoutDashboard,
  Trash2,
  Loader2,
  Landmark,
  BadgeCheck,
  Ban,
  QrCode,
  ChevronRight,
  Info
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
const STORAGE_KEY = "ledger-app-state-v1";
const APP_NAME = "Ledger";
const CATEGORY_META = {
  Income: { icon: TrendingUp, hex: "#34d399", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  "Add Money": { icon: PlusCircle, hex: "#2dd4bf", text: "text-teal-400", bg: "bg-teal-400/10" },
  Transfers: { icon: Send, hex: "#38bdf8", text: "text-sky-400", bg: "bg-sky-400/10" },
  Shopping: { icon: ShoppingBag, hex: "#fbbf24", text: "text-amber-400", bg: "bg-amber-400/10" },
  Food: { icon: Coffee, hex: "#fb923c", text: "text-orange-400", bg: "bg-orange-400/10" },
  Bills: { icon: Zap, hex: "#a78bfa", text: "text-violet-400", bg: "bg-violet-400/10" },
  "Merchant Sale": { icon: Store, hex: "#34d399", text: "text-emerald-400", bg: "bg-emerald-400/10" },
  Refund: { icon: RefreshCcw, hex: "#fb7185", text: "text-rose-400", bg: "bg-rose-400/10" },
  "Goal Contribution": { icon: Target, hex: "#fbbf24", text: "text-amber-400", bg: "bg-amber-400/10" },
  Other: { icon: CreditCard, hex: "#94a3b8", text: "text-slate-400", bg: "bg-slate-400/10" }
};
const EXPENSE_CATEGORIES = ["Food", "Shopping", "Bills", "Other"];
const CONTACTS = [
  { id: "c1", name: "Priya Sharma", phone: "+91 98765 43210" },
  { id: "c2", name: "Rahul Verma", phone: "+91 91234 56789" },
  { id: "c3", name: "Anita Desai", phone: "+91 99887 76655" },
  { id: "c4", name: "Karan Mehta", phone: "+91 90909 08080" }
];
const BILLERS = [
  { id: "b1", name: "Electricity Board", icon: Zap },
  { id: "b2", name: "Mobile Recharge", icon: Smartphone },
  { id: "b3", name: "Broadband", icon: Landmark },
  { id: "b4", name: "Credit Card Bill", icon: CreditCard }
];
const CUSTOMER_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "budgets", label: "Budgets", icon: Wallet },
  { id: "goals", label: "Goals", icon: Target },
  { id: "settings", label: "Settings", icon: SettingsIcon }
];
function formatINR(n) {
  return (Number(n) || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(ts) {
  return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
function daysAgoTs(n) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + Math.abs(n) % 7, 20, 0, 0);
  return d.getTime();
}
function startOfMonthTs() {
  const d = /* @__PURE__ */ new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function startOfTodayTs() {
  const d = /* @__PURE__ */ new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function seedTransactions() {
  const raw = [
    [32, "credit", "Income", "Employer Pvt Ltd", 65e3, "Monthly salary", false],
    [29, "debit", "Bills", "Electricity Board", 1850, "", false],
    [27, "debit", "Food", "Corner Caf\xE9", 640, "", false],
    [24, "debit", "Shopping", "Reliance Trends", 3200, "", false],
    [20, "debit", "Bills", "Mobile Recharge", 399, "", false],
    [18, "debit", "Transfers", "Priya Sharma", 5e3, "Rent share", false],
    [14, "credit", "Add Money", "HDFC Bank \u2022\u20221234", 1e4, "", false],
    [11, "debit", "Food", "Corner Caf\xE9", 1120, "", false],
    [9, "debit", "Shopping", "Amazon", 2450, "", false],
    [6, "credit", "Transfers", "Rahul Verma", 1500, "Settling up", false],
    [3, "debit", "Bills", "Broadband", 899, "", false],
    [1, "debit", "Shopping", "Croma Electronics", 18e3, "New laptop dock", true]
  ];
  return raw.map(([d, type, category, counterparty, amount, note, flagged]) => ({
    id: genId("txn"),
    type,
    category,
    counterparty,
    amount,
    note,
    timestamp: daysAgoTs(d),
    status: "success",
    flagged,
    flagReason: flagged ? "Large one-time purchase relative to balance" : null,
    reviewed: false
  }));
}
function defaultState() {
  return {
    onboarded: false,
    profile: {
      name: "",
      phone: "",
      email: "",
      kyc: "pending",
      monthlyIncome: 65e3,
      dailyLimit: 5e4,
      accountSuspended: false,
      notifyChannels: { sms: true, email: true, inApp: true }
    },
    wallet: { balance: 0, linkedBank: { name: "HDFC Bank \u2022\u20221234", balance: 25e4 } },
    transactions: [],
    budgets: [
      { id: genId("bud"), category: "Food", limit: 3e3 },
      { id: genId("bud"), category: "Shopping", limit: 8e3 },
      { id: genId("bud"), category: "Bills", limit: 4e3 }
    ],
    goals: [
      { id: genId("goal"), name: "Emergency Fund", target: 5e4, current: 12e3, deadline: daysAgoTs(-120) }
    ],
    notifications: [],
    merchant: { businessName: "", sales: [] },
    auditLog: []
  };
}
function applyTransaction(state, { type, category, counterparty, amount, note = "", flagged = false, flagReason = null, balanceDelta }) {
  const txn = {
    id: genId("txn"),
    type,
    category,
    counterparty,
    amount,
    note,
    timestamp: Date.now(),
    status: "success",
    flagged,
    flagReason,
    reviewed: false
  };
  return {
    ...state,
    wallet: { ...state.wallet, balance: state.wallet.balance + balanceDelta },
    transactions: [txn, ...state.transactions]
  };
}
function pushNotif(state, type, message) {
  return { ...state, notifications: [{ id: genId("notif"), type, message, timestamp: Date.now(), read: false }, ...state.notifications] };
}
function pushAudit(state, action) {
  return { ...state, auditLog: [{ id: genId("log"), action, timestamp: Date.now() }, ...state.auditLog] };
}
function monthSpend(transactions, category) {
  return transactions.filter((t) => t.type === "debit" && t.category === category && t.timestamp >= startOfMonthTs()).reduce((s, t) => s + t.amount, 0);
}
function todaysDebitTotal(transactions) {
  return transactions.filter((t) => t.type === "debit" && t.timestamp >= startOfTodayTs()).reduce((s, t) => s + t.amount, 0);
}
function isLargeTransfer(amount, balance) {
  return amount >= 2e4 || amount > balance * 0.5;
}
function maybeBudgetAlert(next, budgets, category) {
  const budget = budgets.find((b) => b.category === category);
  if (!budget) return next;
  const spent = monthSpend(next.transactions, category);
  if (spent >= budget.limit) return pushNotif(next, "alert", `You've gone over your ${category} budget (${formatINR(budget.limit)}) this month.`);
  if (spent >= budget.limit * 0.8) return pushNotif(next, "alert", `You've used 80% of your ${category} budget this month.`);
  return next;
}
function Money({ value, sign = false, size = "base", className = "" }) {
  const positive = value >= 0;
  const sizeClass = { sm: "text-sm", base: "text-base", lg: "text-xl", xl: "text-3xl", xxl: "text-4xl sm:text-5xl" }[size] || "text-base";
  return /* @__PURE__ */ React.createElement("span", { className: `ledger-num tabular-nums ${sizeClass} ${sign ? positive ? "text-emerald-400" : "text-rose-400" : ""} ${className}` }, sign ? positive ? "+" : "\u2212" : "", formatINR(Math.abs(value)));
}
function ProgressBar({ percent }) {
  const pct = Math.max(0, Math.min(100, percent));
  const toneClass = pct >= 100 ? "bg-rose-400" : pct >= 80 ? "bg-amber-400" : "bg-emerald-400";
  return /* @__PURE__ */ React.createElement("div", { className: "h-1.5 w-full rounded-full bg-slate-800 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: `h-full rounded-full ${toneClass} transition-all duration-500`, style: { width: `${pct}%` } }));
}
function Badge({ children, tone = "slate" }) {
  const map = {
    slate: "bg-slate-800 text-slate-300",
    emerald: "bg-emerald-400/10 text-emerald-400",
    amber: "bg-amber-400/10 text-amber-400",
    rose: "bg-rose-400/10 text-rose-400",
    sky: "bg-sky-400/10 text-sky-400"
  };
  return /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${map[tone]}` }, children);
}
function StatCard({ label, value, icon: Icon, tone = "slate" }) {
  const toneClass = { slate: "text-slate-300", emerald: "text-emerald-400", amber: "text-amber-400", rose: "text-rose-400" }[tone];
  return /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs uppercase tracking-wide text-slate-500" }, label), Icon && /* @__PURE__ */ React.createElement(Icon, { size: 16, className: "text-slate-600" })), /* @__PURE__ */ React.createElement("div", { className: `ledger-num text-2xl tabular-nums ${toneClass}` }, value));
}
function EmptyState({ icon: Icon, title, subtitle }) {
  return /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-800 rounded-lg" }, Icon && /* @__PURE__ */ React.createElement(Icon, { size: 28, className: "text-slate-700 mb-3" }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-300 font-medium" }, title), subtitle && /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm mt-1 max-w-xs" }, subtitle));
}
function Field({ label, children }) {
  return /* @__PURE__ */ React.createElement("label", { className: "block mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "block text-xs uppercase tracking-wide text-slate-500 mb-1.5" }, label), children);
}
const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/60";
function Btn({ children, onClick, tone = "primary", className = "", disabled, type = "button" }) {
  const toneClass = {
    primary: "bg-amber-400 hover:bg-amber-300 text-slate-950",
    ghost: "bg-slate-800 hover:bg-slate-700 text-slate-100",
    danger: "bg-rose-500/90 hover:bg-rose-500 text-white",
    outline: "border border-slate-700 hover:border-slate-500 text-slate-200"
  }[tone];
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type,
      onClick,
      disabled,
      className: `px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${toneClass} ${className}`
    },
    children
  );
}
function Modal({ title, onClose, children, footer, wide = false }) {
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4", onClick: onClose }, /* @__PURE__ */ React.createElement("div", { className: `w-full ${wide ? "sm:max-w-lg" : "sm:max-w-md"} bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl max-h-[92vh] overflow-y-auto`, onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-slate-900" }, /* @__PURE__ */ React.createElement("h3", { className: "font-serif-display text-lg text-slate-100" }, title), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-200 p-1 rounded" }, /* @__PURE__ */ React.createElement(X, { size: 18 }))), /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4" }, children), footer && /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-t border-slate-800 flex gap-2 justify-end" }, footer)));
}
function CategoryIcon({ category, size = 16 }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other;
  const Icon = meta.icon;
  return /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center justify-center rounded-full ${meta.bg}`, style: { width: size * 2, height: size * 2 } }, /* @__PURE__ */ React.createElement(Icon, { size, style: { color: meta.hex } }));
}
function LedgerApp() {
  const [appState, setAppState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [currentRole, setCurrentRole] = useState("customer");
  const [currentView, setCurrentView] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [obStep, setObStep] = useState(0);
  const [obForm, setObForm] = useState({ name: "", phone: "", email: "" });
  const [modal, setModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [confirmLarge, setConfirmLarge] = useState(null);
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
    return () => {
      mounted = false;
    };
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
    setAppState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next);
      return next;
    });
  }, [persist]);
  const closeModal = () => {
    setModal(null);
    setFormError("");
    setConfirmLarge(null);
  };
  const budgetsWithSpent = useMemo(() => {
    if (!appState) return [];
    return appState.budgets.map((b) => ({ ...b, spent: monthSpend(appState.transactions, b.category) }));
  }, [appState]);
  const last45 = useMemo(() => {
    if (!appState) return [];
    const cutoff = Date.now() - 45 * 24 * 60 * 60 * 1e3;
    return appState.transactions.filter((t) => t.timestamp >= cutoff);
  }, [appState]);
  const spendByCategory = useMemo(() => {
    const map = {};
    last45.filter((t) => t.type === "debit").forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([category, value]) => ({ category, value }));
  }, [last45]);
  const weeklyTrend = useMemo(() => {
    const buckets = {};
    last45.filter((t) => t.type === "debit").forEach((t) => {
      const wk = Math.floor((Date.now() - t.timestamp) / (7 * 24 * 60 * 60 * 1e3));
      buckets[wk] = (buckets[wk] || 0) + t.amount;
    });
    return Object.entries(buckets).sort((a, b) => Number(b[0]) - Number(a[0])).reverse().slice(-6).map(([wk, value]) => ({
      week: wk === "0" ? "This wk" : `${wk}w ago`,
      value
    }));
  }, [last45]);
  const recurringBills = useMemo(() => {
    if (!appState) return [];
    const map = {};
    appState.transactions.filter((t) => t.category === "Bills").forEach((t) => {
      if (!map[t.counterparty]) map[t.counterparty] = [];
      map[t.counterparty].push(t.amount);
    });
    return Object.entries(map).map(([name, amts]) => ({ name, avg: Math.round(amts.reduce((a, b) => a + b, 0) / amts.length) }));
  }, [appState]);
  const healthScore = useMemo(() => {
    if (!appState) return 50;
    const income = appState.profile.monthlyIncome || 1;
    const debits30 = last45.filter((t) => t.type === "debit" && t.timestamp >= Date.now() - 30 * 24 * 60 * 60 * 1e3).reduce((s, t) => s + t.amount, 0);
    const savingsRate = Math.max(0, Math.min(1, (income - debits30) / income));
    const goalProgress = appState.goals.length ? appState.goals.reduce((s, g) => s + Math.min(1, g.current / g.target), 0) / appState.goals.length : 0.5;
    const overBudget = budgetsWithSpent.filter((b) => b.spent > b.limit).length;
    const budgetHealth = Math.max(0, 1 - overBudget * 0.2);
    return Math.round((savingsRate * 0.5 + goalProgress * 0.25 + budgetHealth * 0.25) * 100);
  }, [appState, last45, budgetsWithSpent]);
  const healthLabel = healthScore >= 75 ? "Strong" : healthScore >= 50 ? "Steady" : healthScore >= 30 ? "Needs attention" : "At risk";
  const healthTone = healthScore >= 75 ? "emerald" : healthScore >= 50 ? "amber" : "rose";
  const unreadCount = appState ? appState.notifications.filter((n) => !n.read).length : 0;
  const flaggedPending = appState ? appState.transactions.filter((t) => t.flagged && !t.reviewed) : [];
  const flaggedCleared = appState ? appState.transactions.filter((t) => t.flagged && t.reviewed) : [];
  const completeOnboarding = () => {
    if (!obForm.name.trim() || !obForm.phone.trim() || !obForm.email.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    const seeded = seedTransactions();
    const balance = seeded.reduce((s, t) => s + (t.type === "credit" ? t.amount : -t.amount), 0);
    updateState((prev) => {
      let next = {
        ...prev,
        onboarded: true,
        profile: { ...prev.profile, name: obForm.name.trim(), phone: obForm.phone.trim(), email: obForm.email.trim(), kyc: "verified" },
        wallet: { ...prev.wallet, balance },
        transactions: seeded
      };
      next = pushNotif(next, "system", `Welcome to ${APP_NAME}, ${obForm.name.trim().split(" ")[0]}! Your account is verified and ready to use.`);
      next = pushAudit(next, "Account onboarded and KYC verified");
      return next;
    });
  };
  const guardActive = () => {
    if (appState.profile.accountSuspended) {
      setFormError("Your account is suspended. Contact support to resume transactions.");
      return false;
    }
    return true;
  };
  const handleAddMoney = (amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    if (amount > appState.wallet.linkedBank.balance) return setFormError("Amount exceeds your linked bank balance.");
    updateState((prev) => {
      let next = { ...prev, wallet: { ...prev.wallet, linkedBank: { ...prev.wallet.linkedBank, balance: prev.wallet.linkedBank.balance - amount } } };
      next = applyTransaction(next, { type: "credit", category: "Add Money", counterparty: prev.wallet.linkedBank.name, amount, balanceDelta: amount });
      next = pushNotif(next, "credit", `\u20B9${amount.toLocaleString("en-IN")} added to your wallet from ${prev.wallet.linkedBank.name}.`);
      next = pushAudit(next, `Added ${formatINR(amount)} from linked bank`);
      return next;
    });
    closeModal();
  };
  const executeSendMoney = (contact, amount, note, flagged) => {
    updateState((prev) => {
      let next = applyTransaction(prev, {
        type: "debit",
        category: "Transfers",
        counterparty: contact.name,
        amount,
        note,
        flagged,
        flagReason: flagged ? "Unusually large transfer relative to balance" : null,
        balanceDelta: -amount
      });
      next = pushNotif(next, "debit", `You sent \u20B9${amount.toLocaleString("en-IN")} to ${contact.name}.`);
      if (flagged) next = pushNotif(next, "alert", `Large transfer to ${contact.name} was flagged for review by our AI monitoring.`);
      next = pushAudit(next, `Sent ${formatINR(amount)} to ${contact.name}${flagged ? " (flagged)" : ""}`);
      return next;
    });
    closeModal();
  };
  const handleSendMoneySubmit = (contact, amountStr, note) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!contact) return setFormError("Choose a recipient.");
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    if (amount > appState.wallet.balance) return setFormError("Insufficient wallet balance.");
    if (todaysDebitTotal(appState.transactions) + amount > appState.profile.dailyLimit) return setFormError(`This would exceed your daily limit of ${formatINR(appState.profile.dailyLimit)}. Adjust it in Settings if needed.`);
    if (isLargeTransfer(amount, appState.wallet.balance)) {
      setConfirmLarge({ contact, amount, note });
      return;
    }
    executeSendMoney(contact, amount, note, false);
  };
  const handlePayBill = (biller, amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    if (amount > appState.wallet.balance) return setFormError("Insufficient wallet balance.");
    if (todaysDebitTotal(appState.transactions) + amount > appState.profile.dailyLimit) return setFormError(`This would exceed your daily limit of ${formatINR(appState.profile.dailyLimit)}.`);
    updateState((prev) => {
      let next = applyTransaction(prev, { type: "debit", category: "Bills", counterparty: biller.name, amount, balanceDelta: -amount });
      next = pushNotif(next, "debit", `Paid ${formatINR(amount)} to ${biller.name}.`);
      next = maybeBudgetAlert(next, prev.budgets, "Bills");
      next = pushAudit(next, `Paid bill: ${biller.name} \u2014 ${formatINR(amount)}`);
      return next;
    });
    closeModal();
  };
  const handleLogExpense = (category, counterparty, amountStr, note) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    if (amount > appState.wallet.balance) return setFormError("Insufficient wallet balance.");
    updateState((prev) => {
      let next = applyTransaction(prev, { type: "debit", category, counterparty: counterparty || category, amount, note, balanceDelta: -amount });
      next = pushNotif(next, "debit", `Logged ${formatINR(amount)} expense \u2014 ${category}.`);
      next = maybeBudgetAlert(next, prev.budgets, category);
      return next;
    });
    closeModal();
  };
  const handleRecategorize = (txnId, category) => {
    updateState((prev) => ({ ...prev, transactions: prev.transactions.map((t) => t.id === txnId ? { ...t, category } : t) }));
  };
  const handleCreateBudget = (category, limitStr) => {
    const limit = Number(limitStr);
    if (!limit || limit <= 0) return setFormError("Enter a valid monthly limit.");
    updateState((prev) => {
      const exists = prev.budgets.find((b) => b.category === category);
      const budgets = exists ? prev.budgets.map((b) => b.category === category ? { ...b, limit } : b) : [...prev.budgets, { id: genId("bud"), category, limit }];
      return { ...prev, budgets };
    });
    closeModal();
  };
  const handleDeleteBudget = (id) => updateState((prev) => ({ ...prev, budgets: prev.budgets.filter((b) => b.id !== id) }));
  const handleCreateGoal = (name, targetStr, deadline) => {
    const target = Number(targetStr);
    if (!name.trim()) return setFormError("Give your goal a name.");
    if (!target || target <= 0) return setFormError("Enter a valid target amount.");
    updateState((prev) => ({ ...prev, goals: [...prev.goals, { id: genId("goal"), name: name.trim(), target, current: 0, deadline: deadline ? new Date(deadline).getTime() : null }] }));
    closeModal();
  };
  const handleContributeGoal = (goal, amountStr) => {
    if (!guardActive()) return;
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    if (amount > appState.wallet.balance) return setFormError("Insufficient wallet balance.");
    updateState((prev) => {
      let next = applyTransaction(prev, { type: "debit", category: "Goal Contribution", counterparty: goal.name, amount, balanceDelta: -amount });
      next = { ...next, goals: next.goals.map((g) => g.id === goal.id ? { ...g, current: g.current + amount } : g) };
      const updated = next.goals.find((g) => g.id === goal.id);
      if (updated.current >= updated.target) next = pushNotif(next, "goal", `\u{1F389} You've reached your "${goal.name}" goal!`);
      else next = pushNotif(next, "goal", `Added ${formatINR(amount)} to "${goal.name}".`);
      return next;
    });
    closeModal();
  };
  const handleUpdateSettings = (patch) => updateState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  const handleMarkAllRead = () => updateState((prev) => ({ ...prev, notifications: prev.notifications.map((n) => ({ ...n, read: true })) }));
  const handleSetBusinessName = (name) => updateState((prev) => ({ ...prev, merchant: { ...prev.merchant, businessName: name } }));
  const handleMerchantCollect = (amountStr, customerName) => {
    const amount = Number(amountStr);
    if (!amount || amount <= 0) return setFormError("Enter a valid amount.");
    updateState((prev) => {
      const sale = { id: genId("sale"), customerName: customerName || "Customer", amount, timestamp: Date.now(), refunded: false };
      let next = { ...prev, merchant: { ...prev.merchant, sales: [sale, ...prev.merchant.sales] } };
      next = applyTransaction(next, { type: "credit", category: "Merchant Sale", counterparty: sale.customerName, amount, balanceDelta: amount });
      next = pushNotif(next, "credit", `Received ${formatINR(amount)} payment from ${sale.customerName}.`);
      next = pushAudit(next, `Merchant sale collected: ${formatINR(amount)} from ${sale.customerName}`);
      return next;
    });
    closeModal();
  };
  const handleRefundSale = (sale) => {
    updateState((prev) => {
      let next = { ...prev, merchant: { ...prev.merchant, sales: prev.merchant.sales.map((s) => s.id === sale.id ? { ...s, refunded: true } : s) } };
      next = applyTransaction(next, { type: "debit", category: "Refund", counterparty: sale.customerName, amount: sale.amount, balanceDelta: -sale.amount });
      next = pushNotif(next, "debit", `Refunded ${formatINR(sale.amount)} to ${sale.customerName}.`);
      next = pushAudit(next, `Refunded ${formatINR(sale.amount)} to ${sale.customerName}`);
      return next;
    });
  };
  const handleSuspendToggle = () => {
    updateState((prev) => {
      const suspended2 = !prev.profile.accountSuspended;
      let next = { ...prev, profile: { ...prev.profile, accountSuspended: suspended2 } };
      next = pushAudit(next, suspended2 ? "Admin suspended the account" : "Admin reinstated the account");
      next = pushNotif(next, "alert", suspended2 ? "Your account has been suspended by the admin team." : "Your account has been reinstated. You can transact again.");
      return next;
    });
  };
  const handleReviewFlag = (txnId) => {
    updateState((prev) => {
      let next = { ...prev, transactions: prev.transactions.map((t) => t.id === txnId ? { ...t, reviewed: true } : t) };
      next = pushAudit(next, `Admin cleared flagged transaction ${txnId}`);
      return next;
    });
  };
  const handleResetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
    }
    setAppState(defaultState());
    setCurrentRole("customer");
    setCurrentView("dashboard");
    closeModal();
  };
  if (loading || !appState) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-[600px] flex items-center justify-center bg-slate-950 text-slate-400" }, /* @__PURE__ */ React.createElement(FontStyles, null), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-3" }, /* @__PURE__ */ React.createElement(Loader2, { className: "animate-spin text-amber-400", size: 28 }), /* @__PURE__ */ React.createElement("span", { className: "text-sm" }, "Loading ", APP_NAME, "\u2026")));
  }
  if (!appState.onboarded) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-[700px] bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-8" }, /* @__PURE__ */ React.createElement(FontStyles, null), /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-8 justify-center" }, /* @__PURE__ */ React.createElement(Wallet, { className: "text-amber-400", size: 26 }), /* @__PURE__ */ React.createElement("span", { className: "font-serif-display text-2xl" }, APP_NAME)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-6" }, [0, 1, 2].map((i) => /* @__PURE__ */ React.createElement("div", { key: i, className: `h-1 flex-1 rounded-full ${i <= obStep ? "bg-amber-400" : "bg-slate-800"}` }))), obStep === 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "font-serif-display text-xl mb-1" }, "Create your account"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm mb-6" }, "Register with your mobile, email, or a social login."), /* @__PURE__ */ React.createElement(Field, { label: "Full name" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: obForm.name, onChange: (e) => setObForm({ ...obForm, name: e.target.value }), placeholder: "Aditi Rao" })), /* @__PURE__ */ React.createElement(Field, { label: "Mobile number" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: obForm.phone, onChange: (e) => setObForm({ ...obForm, phone: e.target.value }), placeholder: "+91 98765 43210" })), /* @__PURE__ */ React.createElement(Field, { label: "Email" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: obForm.email, onChange: (e) => setObForm({ ...obForm, email: e.target.value }), placeholder: "aditi@email.com" })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm mb-3" }, formError), /* @__PURE__ */ React.createElement(Btn, { className: "w-full", onClick: () => {
      if (!obForm.name.trim() || !obForm.phone.trim() || !obForm.email.trim()) return setFormError("Please fill in all fields.");
      setFormError("");
      setObStep(1);
    } }, "Continue"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-600 text-xs mt-4 text-center" }, "or continue with Google \xB7 Apple (demo)")), obStep === 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "font-serif-display text-xl mb-1" }, "Verify your number"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm mb-6" }, "We sent a 6-digit code to ", obForm.phone, "."), /* @__PURE__ */ React.createElement(Field, { label: "One-time passcode" }, /* @__PURE__ */ React.createElement("input", { className: `${inputClass} tracking-[0.3em] ledger-num`, defaultValue: "482913", readOnly: true })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-emerald-400 mb-6" }, /* @__PURE__ */ React.createElement(ShieldCheck, { size: 14 }), " Multi-factor authentication enabled"), /* @__PURE__ */ React.createElement(Btn, { className: "w-full", onClick: () => setObStep(2) }, "Verify & continue"), /* @__PURE__ */ React.createElement("button", { className: "text-slate-500 text-xs mt-3 mx-auto block hover:text-slate-300", onClick: () => setObStep(0) }, "Back")), obStep === 2 && /* @__PURE__ */ React.createElement(KycStep, { onDone: completeOnboarding, formError })), /* @__PURE__ */ React.createElement("p", { className: "text-slate-600 text-xs text-center mt-6" }, "Demo environment \u2014 money and identity data shown here are simulated, not connected to real banks or UPI rails.")));
  }
  const switchRole = (role) => {
    setCurrentRole(role);
    setMobileNavOpen(false);
    setCurrentView(role === "customer" ? "dashboard" : role);
  };
  const suspended = appState.profile.accountSuspended;
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-[760px] bg-slate-950 text-slate-100", style: { fontFamily: "'Inter', sans-serif" } }, /* @__PURE__ */ React.createElement(FontStyles, null), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col lg:flex-row" }, /* @__PURE__ */ React.createElement("aside", { className: "hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-slate-900 min-h-screen p-4" }, /* @__PURE__ */ React.createElement(SidebarContent, { currentRole, currentView, switchRole, setCurrentView })), /* @__PURE__ */ React.createElement("div", { className: "lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-900" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Wallet, { className: "text-amber-400", size: 20 }), /* @__PURE__ */ React.createElement("span", { className: "font-serif-display text-lg" }, APP_NAME)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(NotifBell, { unreadCount, onClick: () => setNotifOpen((o) => !o) }), /* @__PURE__ */ React.createElement("button", { onClick: () => setMobileNavOpen(true), className: "p-2 text-slate-400" }, /* @__PURE__ */ React.createElement(Menu, { size: 20 })))), mobileNavOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-40 bg-slate-950/95 p-4 lg:hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-end mb-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => setMobileNavOpen(false), className: "p-2 text-slate-400" }, /* @__PURE__ */ React.createElement(X, { size: 20 }))), /* @__PURE__ */ React.createElement(SidebarContent, { currentRole, currentView, switchRole, setCurrentView: (v) => {
    setCurrentView(v);
    setMobileNavOpen(false);
  } })), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 relative" }, /* @__PURE__ */ React.createElement("div", { className: "hidden lg:flex items-center justify-between px-8 py-5 border-b border-slate-900" }, /* @__PURE__ */ React.createElement("h1", { className: "font-serif-display text-xl capitalize" }, currentView === "dashboard" ? `Welcome back, ${appState.profile.name.split(" ")[0]}` : currentView.replace("-", " ")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 relative" }, saveError && /* @__PURE__ */ React.createElement("span", { className: "text-xs text-amber-400 flex items-center gap-1" }, /* @__PURE__ */ React.createElement(AlertTriangle, { size: 12 }), " Sync issue"), /* @__PURE__ */ React.createElement(NotifBell, { unreadCount, onClick: () => setNotifOpen((o) => !o) }))), notifOpen && /* @__PURE__ */ React.createElement(NotifPanel, { notifications: appState.notifications, onMarkAllRead: handleMarkAllRead, onClose: () => setNotifOpen(false) }), suspended && /* @__PURE__ */ React.createElement("div", { className: "bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-sm px-6 py-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Ban, { size: 16 }), " Your account is suspended by the admin team. Money movement is disabled until this is resolved."), /* @__PURE__ */ React.createElement("main", { className: "p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto" }, currentRole === "customer" && currentView === "dashboard" && /* @__PURE__ */ React.createElement(
    DashboardContent,
    {
      appState,
      budgetsWithSpent,
      healthScore,
      healthLabel,
      healthTone,
      openModal: setModal,
      setCurrentView
    }
  ), currentRole === "customer" && currentView === "transactions" && /* @__PURE__ */ React.createElement(TransactionsContent, { appState, onRecategorize: handleRecategorize }), currentRole === "customer" && currentView === "insights" && /* @__PURE__ */ React.createElement(InsightsContent, { healthScore, healthLabel, healthTone, spendByCategory, weeklyTrend, recurringBills }), currentRole === "customer" && currentView === "budgets" && /* @__PURE__ */ React.createElement(BudgetsContent, { budgetsWithSpent, openModal: setModal, onDelete: handleDeleteBudget }), currentRole === "customer" && currentView === "goals" && /* @__PURE__ */ React.createElement(GoalsContent, { goals: appState.goals, openModal: setModal, onContribute: (g) => {
    setModal({ id: "contributeGoal", goal: g });
  } }), currentRole === "customer" && currentView === "settings" && /* @__PURE__ */ React.createElement(SettingsContent, { appState, onUpdate: handleUpdateSettings, onReset: () => setModal("resetConfirm") }), currentRole === "merchant" && /* @__PURE__ */ React.createElement(MerchantContent, { appState, openModal: setModal, onSetBusinessName: handleSetBusinessName, onRefund: handleRefundSale }), currentRole === "admin" && /* @__PURE__ */ React.createElement(AdminContent, { appState, flaggedPending, flaggedCleared, onSuspendToggle: handleSuspendToggle, onReviewFlag: handleReviewFlag })))), modal === "addMoney" && /* @__PURE__ */ React.createElement(AddMoneyModal, { linkedBank: appState.wallet.linkedBank, formError, onClose: closeModal, onSubmit: handleAddMoney }), modal === "sendMoney" && !confirmLarge && /* @__PURE__ */ React.createElement(SendMoneyModal, { balance: appState.wallet.balance, formError, onClose: closeModal, onSubmit: handleSendMoneySubmit }), confirmLarge && /* @__PURE__ */ React.createElement(
    Modal,
    {
      title: "Confirm large transfer",
      onClose: closeModal,
      footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: closeModal }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { tone: "danger", onClick: () => executeSendMoney(confirmLarge.contact, confirmLarge.amount, confirmLarge.note, true) }, "Send anyway"))
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-3 bg-amber-400/10 border border-amber-400/30 rounded-md p-3 mb-4" }, /* @__PURE__ */ React.createElement(ShieldAlert, { className: "text-amber-400 shrink-0 mt-0.5", size: 18 }), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-amber-200" }, "This transfer of ", /* @__PURE__ */ React.createElement(Money, { value: confirmLarge.amount, className: "text-amber-300" }), " to ", confirmLarge.contact.name, " is unusually large for your typical activity. Our AI monitoring will flag it for review. Continue?"))
  ), modal === "payBill" && /* @__PURE__ */ React.createElement(PayBillModal, { balance: appState.wallet.balance, formError, onClose: closeModal, onSubmit: handlePayBill }), modal === "logExpense" && /* @__PURE__ */ React.createElement(LogExpenseModal, { balance: appState.wallet.balance, formError, onClose: closeModal, onSubmit: handleLogExpense }), modal === "newBudget" && /* @__PURE__ */ React.createElement(BudgetModal, { formError, existing: appState.budgets, onClose: closeModal, onSubmit: handleCreateBudget }), modal === "newGoal" && /* @__PURE__ */ React.createElement(GoalModal, { formError, onClose: closeModal, onSubmit: handleCreateGoal }), modal && modal.id === "contributeGoal" && /* @__PURE__ */ React.createElement(ContributeGoalModal, { goal: modal.goal, balance: appState.wallet.balance, formError, onClose: closeModal, onSubmit: handleContributeGoal }), modal === "merchantCollect" && /* @__PURE__ */ React.createElement(MerchantCollectModal, { businessName: appState.merchant.businessName || "My Business", formError, onClose: closeModal, onSubmit: handleMerchantCollect }), modal === "resetConfirm" && /* @__PURE__ */ React.createElement(Modal, { title: "Reset demo data?", onClose: closeModal, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: closeModal }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { tone: "danger", onClick: handleResetDemo }, "Reset everything")) }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400" }, "This clears your wallet, transactions, budgets, goals and notifications, and takes you back through onboarding. This can't be undone.")));
}
function FontStyles() {
  return /* @__PURE__ */ React.createElement("style", null, `
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      .font-serif-display { font-family: 'Fraunces', Georgia, serif; }
      .ledger-num { font-family: 'JetBrains Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }
    `);
}
function KycStep({ onDone, formError }) {
  const [status, setStatus] = useState("idle");
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", { className: "font-serif-display text-xl mb-1" }, "Verify your identity"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm mb-6" }, "Complete KYC to unlock wallets, payments, and financial insights."), /* @__PURE__ */ React.createElement("div", { className: "border border-dashed border-slate-800 rounded-lg p-6 text-center mb-6" }, status === "idle" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(BadgeCheck, { className: "mx-auto text-slate-600 mb-2", size: 28 }), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mb-4" }, "Upload a government ID and a selfie to verify your account."), /* @__PURE__ */ React.createElement(Btn, { tone: "outline", onClick: () => {
    setStatus("uploading");
    setTimeout(() => setStatus("verified"), 900);
  } }, "Simulate ID upload")), status === "uploading" && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-slate-400" }, /* @__PURE__ */ React.createElement(Loader2, { className: "animate-spin", size: 22 }), /* @__PURE__ */ React.createElement("span", { className: "text-sm" }, "Verifying documents\u2026")), status === "verified" && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center gap-2 text-emerald-400" }, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 26 }), /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium" }, "KYC verified"))), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm mb-3" }, formError), /* @__PURE__ */ React.createElement(Btn, { className: "w-full", disabled: status !== "verified", onClick: onDone }, "Enter ", APP_NAME));
}
function SidebarContent({ currentRole, currentView, switchRole, setCurrentView }) {
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-8 px-2" }, /* @__PURE__ */ React.createElement(Wallet, { className: "text-amber-400", size: 22 }), /* @__PURE__ */ React.createElement("span", { className: "font-serif-display text-xl" }, APP_NAME)), /* @__PURE__ */ React.createElement("div", { className: "flex bg-slate-900 border border-slate-800 rounded-lg p-1 mb-6" }, ["customer", "merchant", "admin"].map((r) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: r,
      onClick: () => switchRole(r),
      className: `flex-1 text-xs py-1.5 rounded-md capitalize font-medium transition-colors ${currentRole === r ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-slate-200"}`
    },
    r
  ))), currentRole === "customer" && /* @__PURE__ */ React.createElement("nav", { className: "flex flex-col gap-1" }, CUSTOMER_NAV.map((item) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: item.id,
      onClick: () => setCurrentView(item.id),
      className: `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${currentView === item.id ? "bg-slate-900 text-amber-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"}`
    },
    /* @__PURE__ */ React.createElement(item.icon, { size: 16 }),
    " ",
    item.label
  ))), currentRole === "merchant" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-slate-900 text-amber-400" }, /* @__PURE__ */ React.createElement(Building2, { size: 16 }), " Merchant Dashboard"), currentRole === "admin" && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 px-3 py-2 rounded-md text-sm bg-slate-900 text-amber-400" }, /* @__PURE__ */ React.createElement(ShieldAlert, { size: 16 }), " Admin Console"), /* @__PURE__ */ React.createElement("p", { className: "mt-auto pt-6 text-[11px] text-slate-600 leading-relaxed px-2" }, "Demo environment. Balances and transfers are simulated \u2014 not connected to real banks or UPI rails."));
}
function NotifBell({ unreadCount, onClick }) {
  return /* @__PURE__ */ React.createElement("button", { onClick, className: "relative p-2 text-slate-400 hover:text-slate-200" }, /* @__PURE__ */ React.createElement(Bell, { size: 18 }), unreadCount > 0 && /* @__PURE__ */ React.createElement("span", { className: "absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] leading-none rounded-full h-4 w-4 flex items-center justify-center" }, unreadCount));
}
function NotifPanel({ notifications, onMarkAllRead, onClose }) {
  return /* @__PURE__ */ React.createElement("div", { className: "absolute right-4 sm:right-8 top-16 z-30 w-[calc(100%-2rem)] sm:w-96 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl max-h-96 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("span", { className: "font-medium text-sm" }, "Notifications"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("button", { onClick: onMarkAllRead, className: "text-xs text-amber-400 hover:text-amber-300" }, "Mark all read"), /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "text-slate-500 hover:text-slate-300" }, /* @__PURE__ */ React.createElement(X, { size: 14 })))), notifications.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm p-4" }, "No notifications yet.") : notifications.slice(0, 25).map((n) => /* @__PURE__ */ React.createElement("div", { key: n.id, className: `px-4 py-3 border-b border-slate-800/60 text-sm ${n.read ? "text-slate-500" : "text-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2" }, n.type === "alert" ? /* @__PURE__ */ React.createElement(AlertTriangle, { size: 14, className: "text-amber-400 mt-0.5 shrink-0" }) : n.type === "credit" || n.type === "goal" ? /* @__PURE__ */ React.createElement(ArrowUpRight, { size: 14, className: "text-emerald-400 mt-0.5 shrink-0" }) : n.type === "debit" ? /* @__PURE__ */ React.createElement(ArrowDownLeft, { size: 14, className: "text-sky-400 mt-0.5 shrink-0" }) : /* @__PURE__ */ React.createElement(Bell, { size: 14, className: "text-slate-500 mt-0.5 shrink-0" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, n.message), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-0.5" }, formatDateTime(n.timestamp)))))));
}
function DashboardContent({ appState, budgetsWithSpent, healthScore, healthLabel, healthTone, openModal, setCurrentView }) {
  const recent = appState.transactions.slice(0, 5);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute -right-10 -top-10 w-48 h-48 rounded-full bg-amber-400/5" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 mb-2 text-slate-500 text-xs uppercase tracking-wide" }, /* @__PURE__ */ React.createElement(Wallet, { size: 14 }), " Wallet balance"), /* @__PURE__ */ React.createElement(Money, { value: appState.wallet.balance, size: "xxl", className: "text-slate-50 block" }), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mt-4 text-xs text-slate-500" }, /* @__PURE__ */ React.createElement(Badge, { tone: "emerald" }, /* @__PURE__ */ React.createElement(BadgeCheck, { size: 11 }), " KYC verified"), /* @__PURE__ */ React.createElement("span", null, "Linked: ", appState.wallet.linkedBank.name)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mt-6" }, /* @__PURE__ */ React.createElement(Btn, { onClick: () => openModal("addMoney") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(PlusCircle, { size: 15 }), " Add money")), /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: () => openModal("sendMoney") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Send, { size: 15 }), " Send money")), /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: () => openModal("payBill") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Zap, { size: 15 }), " Pay bill")), /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: () => openModal("logExpense") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(Receipt, { size: 15 }), " Log expense")))), /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement(StatCard, { label: "Financial health", value: `${healthScore}`, icon: Sparkles, tone: healthTone }), /* @__PURE__ */ React.createElement(StatCard, { label: "This month, in", value: formatINR(appState.transactions.filter((t) => t.type === "credit").slice(0, 20).reduce((s, t) => s + t.amount, 0)), icon: ArrowUpRight, tone: "emerald" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Linked bank balance", value: formatINR(appState.wallet.linkedBank.balance), icon: Landmark, tone: "slate" })), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("span", { className: "font-serif-display" }, "Recent activity"), /* @__PURE__ */ React.createElement("button", { onClick: () => setCurrentView("transactions"), className: "text-xs text-amber-400 flex items-center gap-0.5 hover:text-amber-300" }, "View all ", /* @__PURE__ */ React.createElement(ChevronRight, { size: 13 }))), recent.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-5" }, /* @__PURE__ */ React.createElement(EmptyState, { icon: Receipt, title: "No transactions yet", subtitle: "Add money or send a transfer to get started." })) : /* @__PURE__ */ React.createElement("div", null, recent.map((t) => /* @__PURE__ */ React.createElement(TxnRow, { key: t.id, t })))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-800" }, /* @__PURE__ */ React.createElement("span", { className: "font-serif-display" }, "Budgets this month"), /* @__PURE__ */ React.createElement("button", { onClick: () => setCurrentView("budgets"), className: "text-xs text-amber-400 flex items-center gap-0.5 hover:text-amber-300" }, "Manage ", /* @__PURE__ */ React.createElement(ChevronRight, { size: 13 }))), /* @__PURE__ */ React.createElement("div", { className: "p-5 space-y-4" }, budgetsWithSpent.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: Wallet, title: "No budgets set" }) : budgetsWithSpent.slice(0, 3).map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm mb-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: b.category, size: 11 }), " ", b.category), /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, /* @__PURE__ */ React.createElement(Money, { value: b.spent, size: "sm" }), " / ", /* @__PURE__ */ React.createElement(Money, { value: b.limit, size: "sm" }))), /* @__PURE__ */ React.createElement(ProgressBar, { percent: b.spent / b.limit * 100 })))))));
}
function TxnRow({ t, onClick }) {
  return /* @__PURE__ */ React.createElement("div", { onClick, className: `flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0 ${onClick ? "cursor-pointer hover:bg-slate-800/30" : ""}` }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: t.category }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-200 truncate" }, t.counterparty), t.flagged && /* @__PURE__ */ React.createElement(ShieldAlert, { size: 12, className: t.reviewed ? "text-slate-600" : "text-amber-400" })), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, t.category, " \xB7 ", formatDate(t.timestamp))), /* @__PURE__ */ React.createElement(Money, { value: t.amount, sign: true, className: "shrink-0", size: "sm" }));
}
function TransactionsContent({ appState, onRecategorize }) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = appState.transactions.filter((t) => {
    if (filter !== "all" && t.category !== filter) return false;
    if (query && !`${t.counterparty} ${t.note}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "relative flex-1 min-w-[180px]" }, /* @__PURE__ */ React.createElement("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search transactions\u2026", className: `${inputClass} pl-3` })), /* @__PURE__ */ React.createElement("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: `${inputClass} w-auto` }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "All categories"), Object.keys(CATEGORY_META).filter((c) => c !== "Other").map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, filtered.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-5" }, /* @__PURE__ */ React.createElement(EmptyState, { icon: Receipt, title: "No matching transactions" })) : filtered.map((t) => /* @__PURE__ */ React.createElement(TxnRow, { key: t.id, t, onClick: () => setSelected(t) }))), selected && /* @__PURE__ */ React.createElement(Modal, { title: "Transaction detail", onClose: () => setSelected(null) }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: selected.category, size: 18 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-slate-200" }, selected.counterparty), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, formatDateTime(selected.timestamp)))), /* @__PURE__ */ React.createElement(Money, { value: selected.amount, sign: true, size: "xl", className: "block mb-4" }), selected.note && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 mb-4" }, '"', selected.note, '"'), selected.flagged && /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 bg-amber-400/10 border border-amber-400/30 rounded-md p-3 mb-4 text-sm text-amber-200" }, /* @__PURE__ */ React.createElement(ShieldAlert, { size: 16, className: "shrink-0 mt-0.5" }), " Flagged by AI monitoring: ", selected.flagReason, ". ", selected.reviewed ? "Cleared by admin review." : "Pending admin review."), /* @__PURE__ */ React.createElement(Field, { label: "Recategorize" }, /* @__PURE__ */ React.createElement("select", { value: selected.category, className: inputClass, onChange: (e) => {
    onRecategorize(selected.id, e.target.value);
    setSelected({ ...selected, category: e.target.value });
  } }, Object.keys(CATEGORY_META).map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-800" }, /* @__PURE__ */ React.createElement("span", null, "Status: ", selected.status), /* @__PURE__ */ React.createElement("span", null, "ID: ", selected.id.slice(0, 14)))));
}
function InsightsContent({ healthScore, healthLabel, healthTone, spendByCategory, weeklyTrend, recurringBills }) {
  const toneClass = { emerald: "text-emerald-400", amber: "text-amber-400", rose: "text-rose-400" }[healthTone];
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-6 flex items-center gap-6 flex-wrap" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-xs uppercase tracking-wide text-slate-500 mb-1" }, "Financial health score"), /* @__PURE__ */ React.createElement("span", { className: `ledger-num text-4xl ${toneClass}` }, healthScore), /* @__PURE__ */ React.createElement("span", { className: "text-slate-600 text-sm" }, "/100")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-[200px]" }, /* @__PURE__ */ React.createElement(Badge, { tone: healthTone }, healthLabel), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mt-2" }, "Based on your savings rate, budget adherence, and goal progress over the last 30 days."))), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-2 gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-4" }, "Spend by category ", /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 font-sans" }, "(45 days)")), spendByCategory.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: Sparkles, title: "Not enough data yet" }) : /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: spendByCategory, dataKey: "value", nameKey: "category", innerRadius: 55, outerRadius: 85, paddingAngle: 2 }, spendByCategory.map((entry, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: (CATEGORY_META[entry.category] || CATEGORY_META.Other).hex, stroke: "#0f172a" }))), /* @__PURE__ */ React.createElement(Tooltip, { formatter: (v) => formatINR(v), contentStyle: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 } }))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center" }, spendByCategory.map((e) => /* @__PURE__ */ React.createElement("span", { key: e.category, className: "flex items-center gap-1.5 text-xs text-slate-400" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full", style: { background: (CATEGORY_META[e.category] || CATEGORY_META.Other).hex } }), " ", e.category)))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-4" }, "Weekly spend trend"), weeklyTrend.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: TrendingUp, title: "Not enough data yet" }) : /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: 220 }, /* @__PURE__ */ React.createElement(BarChart, { data: weeklyTrend }, /* @__PURE__ */ React.createElement(XAxis, { dataKey: "week", tick: { fill: "#64748b", fontSize: 11 }, axisLine: { stroke: "#334155" }, tickLine: false }), /* @__PURE__ */ React.createElement(YAxis, { tick: { fill: "#64748b", fontSize: 11 }, axisLine: false, tickLine: false, width: 36 }), /* @__PURE__ */ React.createElement(Tooltip, { formatter: (v) => formatINR(v), contentStyle: { background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }, cursor: { fill: "rgba(251,191,36,0.06)" } }), /* @__PURE__ */ React.createElement(Bar, { dataKey: "value", fill: "#fbbf24", radius: [4, 4, 0, 0] }))))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-1 flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Sparkles, { size: 16, className: "text-amber-400" }), " Smart recommendations"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-4" }, "Simple rule-based estimates from your activity \u2014 not a substitute for financial advice."), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, recurringBills.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 text-sm text-slate-300" }, /* @__PURE__ */ React.createElement(Info, { size: 14, className: "text-sky-400 mt-0.5 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Recurring bills detected: ", recurringBills.map((b) => `${b.name} (~${formatINR(b.avg)})`).join(", "), ". Expect these again next cycle.")), spendByCategory.sort((a, b) => b.value - a.value)[0] && /* @__PURE__ */ React.createElement("div", { className: "flex items-start gap-2 text-sm text-slate-300" }, /* @__PURE__ */ React.createElement(Info, { size: 14, className: "text-amber-400 mt-0.5 shrink-0" }), /* @__PURE__ */ React.createElement("span", null, "Your biggest spend area lately is ", /* @__PURE__ */ React.createElement("b", null, spendByCategory.sort((a, b) => b.value - a.value)[0].category), " \u2014 a good place to look for savings.")))));
}
function BudgetsContent({ budgetsWithSpent, openModal, onDelete }) {
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm" }, "Track spending against a monthly limit per category."), /* @__PURE__ */ React.createElement(Btn, { onClick: () => openModal("newBudget") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(PlusCircle, { size: 15 }), " New budget"))), budgetsWithSpent.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: Wallet, title: "No budgets yet", subtitle: "Create one to start tracking your spending." }) : /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-4" }, budgetsWithSpent.map((b) => {
    const pct = b.spent / b.limit * 100;
    return /* @__PURE__ */ React.createElement("div", { key: b.id, className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2 font-medium" }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: b.category, size: 13 }), " ", b.category), /* @__PURE__ */ React.createElement("button", { onClick: () => onDelete(b.id), className: "text-slate-600 hover:text-rose-400" }, /* @__PURE__ */ React.createElement(Trash2, { size: 14 }))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm mb-1.5 text-slate-400" }, /* @__PURE__ */ React.createElement(Money, { value: b.spent, size: "sm" }), /* @__PURE__ */ React.createElement(Money, { value: b.limit, size: "sm" })), /* @__PURE__ */ React.createElement(ProgressBar, { percent: pct }), /* @__PURE__ */ React.createElement("p", { className: `text-xs mt-2 ${pct >= 100 ? "text-rose-400" : pct >= 80 ? "text-amber-400" : "text-slate-500"}` }, pct >= 100 ? "Over budget this month" : `${Math.round(100 - pct)}% remaining this month`));
  })));
}
function GoalsContent({ goals, openModal, onContribute }) {
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm" }, "Set targets and chip away at them from your wallet."), /* @__PURE__ */ React.createElement(Btn, { onClick: () => openModal("newGoal") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(PlusCircle, { size: 15 }), " New goal"))), goals.length === 0 ? /* @__PURE__ */ React.createElement(EmptyState, { icon: Target, title: "No goals yet", subtitle: "Create a savings goal to see progress here." }) : /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 gap-4" }, goals.map((g) => {
    const pct = g.current / g.target * 100;
    return /* @__PURE__ */ React.createElement("div", { key: g.id, className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "font-medium flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Target, { size: 15, className: "text-amber-400" }), " ", g.name), pct >= 100 && /* @__PURE__ */ React.createElement(Badge, { tone: "emerald" }, "Complete")), g.deadline && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-3" }, "by ", formatDate(g.deadline)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm mb-1.5 text-slate-400" }, /* @__PURE__ */ React.createElement(Money, { value: g.current, size: "sm" }), /* @__PURE__ */ React.createElement(Money, { value: g.target, size: "sm" })), /* @__PURE__ */ React.createElement(ProgressBar, { percent: pct }), /* @__PURE__ */ React.createElement(Btn, { tone: "outline", className: "w-full mt-4", onClick: () => onContribute(g), disabled: pct >= 100 }, "Contribute"));
  })));
}
function SettingsContent({ appState, onUpdate, onReset }) {
  const [income, setIncome] = useState(appState.profile.monthlyIncome);
  const [limit, setLimit] = useState(appState.profile.dailyLimit);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6 max-w-lg" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-4" }, "Profile"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-200" }, appState.profile.name), /* @__PURE__ */ React.createElement(Badge, { tone: "emerald" }, /* @__PURE__ */ React.createElement(BadgeCheck, { size: 11 }), " KYC verified")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500" }, appState.profile.phone, " \xB7 ", appState.profile.email)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-4" }, "Limits & income"), /* @__PURE__ */ React.createElement(Field, { label: "Estimated monthly income" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: income, onChange: (e) => setIncome(e.target.value) }), /* @__PURE__ */ React.createElement(Btn, { tone: "outline", onClick: () => onUpdate({ monthlyIncome: Number(income) || 0 }) }, "Save"))), /* @__PURE__ */ React.createElement(Field, { label: "Daily transaction limit" }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: limit, onChange: (e) => setLimit(e.target.value) }), /* @__PURE__ */ React.createElement(Btn, { tone: "outline", onClick: () => onUpdate({ dailyLimit: Number(limit) || 0 }) }, "Save")))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-4" }, "Notification channels"), ["sms", "email", "inApp"].map((ch) => /* @__PURE__ */ React.createElement("div", { key: ch, className: "flex items-center justify-between py-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-sm text-slate-300 capitalize" }, ch === "inApp" ? "In-app" : ch.toUpperCase()), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onUpdate({ notifyChannels: { ...appState.profile.notifyChannels, [ch]: !appState.profile.notifyChannels[ch] } }),
      className: `w-10 h-5 rounded-full transition-colors relative ${appState.profile.notifyChannels[ch] ? "bg-amber-400" : "bg-slate-700"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: `absolute top-0.5 h-4 w-4 rounded-full bg-slate-950 transition-all ${appState.profile.notifyChannels[ch] ? "left-5" : "left-0.5"}` })
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-1" }, "Linked bank account"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400" }, appState.wallet.linkedBank.name, " \u2014 ", /* @__PURE__ */ React.createElement(Money, { value: appState.wallet.linkedBank.balance, size: "sm" }), " available")), /* @__PURE__ */ React.createElement("div", { className: "border border-rose-900/50 rounded-lg p-5" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-1 text-rose-300" }, "Danger zone"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-500 mb-3" }, "Clear all demo data and start over from onboarding."), /* @__PURE__ */ React.createElement(Btn, { tone: "danger", onClick: onReset }, "Reset demo data")));
}
function MerchantContent({ appState, openModal, onSetBusinessName, onRefund }) {
  const [nameDraft, setNameDraft] = useState(appState.merchant.businessName);
  const editingName = !appState.merchant.businessName;
  const sales = appState.merchant.sales;
  const activeSales = sales.filter((s) => !s.refunded);
  const totalSales = activeSales.reduce((s, x) => s + x.amount, 0);
  const monthSales = activeSales.filter((s) => s.timestamp >= startOfMonthTs()).reduce((s, x) => s + x.amount, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(Building2, { className: "text-amber-400", size: 20 }), editingName ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, placeholder: "Your business name", value: nameDraft, onChange: (e) => setNameDraft(e.target.value) }), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSetBusinessName(nameDraft.trim() || "My Business") }, "Save")) : /* @__PURE__ */ React.createElement("h2", { className: "font-serif-display text-xl" }, appState.merchant.businessName)), /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement(StatCard, { label: "Total sales", value: formatINR(totalSales), icon: TrendingUp, tone: "emerald" }), /* @__PURE__ */ React.createElement(StatCard, { label: "This month", value: formatINR(monthSales), icon: Wallet, tone: "slate" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Transactions", value: String(activeSales.length), icon: Receipt, tone: "slate" })), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between flex-wrap gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(QrCode, { className: "text-slate-600", size: 36 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-300" }, "Accept a payment"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Share a QR/payment link, or collect manually."))), /* @__PURE__ */ React.createElement(Btn, { onClick: () => openModal("merchantCollect") }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(PlusCircle, { size: 15 }), " Collect payment"))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-slate-800 font-serif-display" }, "Sales"), sales.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "p-5" }, /* @__PURE__ */ React.createElement(EmptyState, { icon: Receipt, title: "No sales yet", subtitle: "Collect a payment to see it here." })) : sales.map((s) => /* @__PURE__ */ React.createElement("div", { key: s.id, className: "flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0" }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: "Merchant Sale" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-200 truncate" }, s.customerName), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, formatDateTime(s.timestamp))), /* @__PURE__ */ React.createElement(Money, { value: s.amount, size: "sm", className: s.refunded ? "text-slate-600 line-through" : "text-emerald-400" }), s.refunded ? /* @__PURE__ */ React.createElement(Badge, { tone: "rose" }, "Refunded") : /* @__PURE__ */ React.createElement(Btn, { tone: "outline", onClick: () => onRefund(s) }, "Refund")))));
}
function AdminContent({ appState, flaggedPending, flaggedCleared, onSuspendToggle, onReviewFlag }) {
  const totalVolume = appState.transactions.reduce((s, t) => s + t.amount, 0);
  return /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement(StatCard, { label: "Total transactions", value: String(appState.transactions.length), icon: Receipt }), /* @__PURE__ */ React.createElement(StatCard, { label: "Total volume", value: formatINR(totalVolume), icon: TrendingUp, tone: "emerald" }), /* @__PURE__ */ React.createElement(StatCard, { label: "Wallet balance", value: formatINR(appState.wallet.balance), icon: Wallet }), /* @__PURE__ */ React.createElement(StatCard, { label: "Needs review", value: String(flaggedPending.length), icon: ShieldAlert, tone: flaggedPending.length ? "amber" : "slate" })), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-5 flex items-center justify-between flex-wrap gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "font-serif-display mb-1" }, "User account"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400" }, appState.profile.name, " \xB7 ", appState.profile.phone), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, appState.profile.accountSuspended ? /* @__PURE__ */ React.createElement(Badge, { tone: "rose" }, /* @__PURE__ */ React.createElement(Ban, { size: 11 }), " Suspended") : /* @__PURE__ */ React.createElement(Badge, { tone: "emerald" }, /* @__PURE__ */ React.createElement(CheckCircle2, { size: 11 }), " Active"))), /* @__PURE__ */ React.createElement(Btn, { tone: appState.profile.accountSuspended ? "primary" : "danger", onClick: onSuspendToggle }, appState.profile.accountSuspended ? "Reinstate account" : "Suspend account")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-slate-800 font-serif-display flex items-center gap-2" }, /* @__PURE__ */ React.createElement(ShieldAlert, { size: 16, className: "text-amber-400" }), " Flagged transactions \u2014 needs review"), flaggedPending.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm p-5" }, "Nothing pending review.") : flaggedPending.map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, className: "flex items-center gap-3 px-5 py-3 border-b border-slate-800/60 last:border-0" }, /* @__PURE__ */ React.createElement(CategoryIcon, { category: t.category }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-200" }, t.counterparty, " ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "\u2014 ", t.flagReason)), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, formatDateTime(t.timestamp))), /* @__PURE__ */ React.createElement(Money, { value: t.amount, size: "sm" }), /* @__PURE__ */ React.createElement(Btn, { tone: "outline", onClick: () => onReviewFlag(t.id) }, "Clear")))), flaggedCleared.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-slate-800 font-serif-display text-sm text-slate-400" }, "Cleared flags"), flaggedCleared.map((t) => /* @__PURE__ */ React.createElement(TxnRow, { key: t.id, t }))), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-900 border border-slate-800 rounded-lg" }, /* @__PURE__ */ React.createElement("div", { className: "px-5 py-4 border-b border-slate-800 font-serif-display" }, "Audit trail"), appState.auditLog.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "text-slate-500 text-sm p-5" }, "No admin activity yet.") : appState.auditLog.slice(0, 15).map((l) => /* @__PURE__ */ React.createElement("div", { key: l.id, className: "px-5 py-2.5 border-b border-slate-800/60 last:border-0 text-sm flex justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, l.action), /* @__PURE__ */ React.createElement("span", { className: "text-slate-600 text-xs" }, formatDateTime(l.timestamp))))));
}
function AddMoneyModal({ linkedBank, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: "Add money", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(amount) }, "Add money")) }, /* @__PURE__ */ React.createElement(Field, { label: `From ${linkedBank.name} (${formatINR(linkedBank.balance)} available)` }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, placeholder: "\u20B9 Amount", value: amount, onChange: (e) => setAmount(e.target.value), autoFocus: true })), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 flex-wrap" }, [500, 1e3, 5e3, 1e4].map((v) => /* @__PURE__ */ React.createElement("button", { key: v, onClick: () => setAmount(String(v)), className: "px-3 py-1 rounded-full text-xs bg-slate-800 text-slate-300 hover:bg-slate-700" }, "\u20B9", v.toLocaleString("en-IN")))), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm mt-3" }, formError));
}
function SendMoneyModal({ balance, formError, onClose, onSubmit }) {
  const [contactId, setContactId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const contact = CONTACTS.find((c) => c.id === contactId);
  return /* @__PURE__ */ React.createElement(Modal, { title: "Send money", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(contact, amount, note) }, "Send")) }, /* @__PURE__ */ React.createElement(Field, { label: "To" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, CONTACTS.map((c) => /* @__PURE__ */ React.createElement("button", { key: c.id, onClick: () => setContactId(c.id), className: `text-left px-3 py-2 rounded-md border text-sm ${contactId === c.id ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-slate-800 text-slate-300 hover:border-slate-600"}` }, /* @__PURE__ */ React.createElement("div", null, c.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500" }, c.phone))))), /* @__PURE__ */ React.createElement(Field, { label: `Amount (${formatINR(balance)} available)` }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "\u20B9 Amount" })), /* @__PURE__ */ React.createElement(Field, { label: "Note (optional)" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: note, onChange: (e) => setNote(e.target.value), placeholder: "What's this for?" })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function PayBillModal({ balance, formError, onClose, onSubmit }) {
  const [billerId, setBillerId] = useState("");
  const [amount, setAmount] = useState("");
  const biller = BILLERS.find((b) => b.id === billerId);
  return /* @__PURE__ */ React.createElement(Modal, { title: "Pay a bill", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(biller, amount) }, "Pay")) }, /* @__PURE__ */ React.createElement(Field, { label: "Biller" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, BILLERS.map((b) => /* @__PURE__ */ React.createElement("button", { key: b.id, onClick: () => setBillerId(b.id), className: `flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${billerId === b.id ? "border-amber-400 bg-amber-400/10 text-amber-300" : "border-slate-800 text-slate-300 hover:border-slate-600"}` }, /* @__PURE__ */ React.createElement(b.icon, { size: 14 }), " ", b.name)))), /* @__PURE__ */ React.createElement(Field, { label: `Amount (${formatINR(balance)} available)` }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "\u20B9 Amount" })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function LogExpenseModal({ balance, formError, onClose, onSubmit }) {
  const [category, setCategory] = useState("Food");
  const [counterparty, setCounterparty] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: "Log an expense", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(category, counterparty, amount, note) }, "Log expense")) }, /* @__PURE__ */ React.createElement(Field, { label: "Category" }, /* @__PURE__ */ React.createElement("select", { className: inputClass, value: category, onChange: (e) => setCategory(e.target.value) }, EXPENSE_CATEGORIES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c)))), /* @__PURE__ */ React.createElement(Field, { label: "Merchant / where it went" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: counterparty, onChange: (e) => setCounterparty(e.target.value), placeholder: "e.g. Corner Caf\xE9" })), /* @__PURE__ */ React.createElement(Field, { label: `Amount (${formatINR(balance)} available)` }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "\u20B9 Amount" })), /* @__PURE__ */ React.createElement(Field, { label: "Note (optional)" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: note, onChange: (e) => setNote(e.target.value) })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function BudgetModal({ formError, existing, onClose, onSubmit }) {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [limit, setLimit] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: "New budget", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(category, limit) }, "Save budget")) }, /* @__PURE__ */ React.createElement(Field, { label: "Category" }, /* @__PURE__ */ React.createElement("select", { className: inputClass, value: category, onChange: (e) => setCategory(e.target.value) }, ["Food", "Shopping", "Bills", "Transfers"].map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c, existing.find((b) => b.category === c) ? " (update existing)" : "")))), /* @__PURE__ */ React.createElement(Field, { label: "Monthly limit" }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: limit, onChange: (e) => setLimit(e.target.value), placeholder: "\u20B9 Amount" })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function GoalModal({ formError, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: "New goal", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(name, target, deadline) }, "Create goal")) }, /* @__PURE__ */ React.createElement(Field, { label: "Goal name" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Goa trip" })), /* @__PURE__ */ React.createElement(Field, { label: "Target amount" }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: target, onChange: (e) => setTarget(e.target.value), placeholder: "\u20B9 Amount" })), /* @__PURE__ */ React.createElement(Field, { label: "Target date (optional)" }, /* @__PURE__ */ React.createElement("input", { type: "date", className: inputClass, value: deadline, onChange: (e) => setDeadline(e.target.value) })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function ContributeGoalModal({ goal, balance, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: `Contribute to "${goal.name}"`, onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(goal, amount) }, "Contribute")) }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 mb-3" }, /* @__PURE__ */ React.createElement(Money, { value: goal.current, size: "sm" }), " of ", /* @__PURE__ */ React.createElement(Money, { value: goal.target, size: "sm" }), " saved so far."), /* @__PURE__ */ React.createElement(Field, { label: `Amount (${formatINR(balance)} available)` }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "\u20B9 Amount", autoFocus: true })), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm" }, formError));
}
function MerchantCollectModal({ businessName, formError, onClose, onSubmit }) {
  const [amount, setAmount] = useState("");
  const [customer, setCustomer] = useState("");
  return /* @__PURE__ */ React.createElement(Modal, { title: "Collect a payment", onClose, footer: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Btn, { tone: "ghost", onClick: onClose }, "Cancel"), /* @__PURE__ */ React.createElement(Btn, { onClick: () => onSubmit(amount, customer) }, "Collect payment")) }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-md p-4 mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-5 gap-0.5 shrink-0", "aria-hidden": "true" }, Array.from({ length: 25 }).map((_, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: `w-2.5 h-2.5 ${(i * 7 + i) % 3 === 0 ? "bg-slate-200" : "bg-slate-800"}` }))), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500" }, "Demo QR for ", /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, businessName), ". In production this would be a scannable UPI QR code.")), /* @__PURE__ */ React.createElement(Field, { label: "Customer name (optional)" }, /* @__PURE__ */ React.createElement("input", { className: inputClass, value: customer, onChange: (e) => setCustomer(e.target.value), placeholder: "Walk-in customer" })), /* @__PURE__ */ React.createElement(Field, { label: "Amount" }, /* @__PURE__ */ React.createElement("input", { type: "number", className: inputClass, value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "\u20B9 Amount", autoFocus: true })), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-600" }, "Use this to simulate a customer scanning the QR and paying."), formError && /* @__PURE__ */ React.createElement("p", { className: "text-rose-400 text-sm mt-2" }, formError));
}
export {
  LedgerApp as default
};
