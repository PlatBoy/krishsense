import {
  AlertTriangle,
  Ban,
  BarChart3,
  Banknote,
  Bell,
  Bot,
  Calculator,
  Camera,
  CheckCircle2,
  CloudSun,
  ClipboardList,
  Clock3,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  HandCoins,
  Image as ImageIcon,
  KeyRound,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Newspaper,
  RefreshCw,
  Ruler,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sprout,
  Sun,
  Target,
  Trash2,
  Tractor,
  TrendingUp,
  Upload,
  UserX,
  UserPlus,
  Wallet,
  Users,
  Wheat
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const SESSION_KEY = "krishsense-session";
const THEME_KEY = "krishsense-theme";
const fieldImage =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80";

const emptyAnalysisForm = {
  landArea: "",
  landUnit: "acre",
  landType: "irrigated",
  crop: "",
  location: "",
  soilColor: "brown",
  texture: "loam",
  drainage: "moderate",
  ph: "",
  notes: ""
};

const landTypes = [
  ["irrigated", "Irrigated"],
  ["dryland", "Dryland"],
  ["lowland", "Lowland"],
  ["hilly", "Hilly"],
  ["river_belt", "River belt"],
  ["plain", "Plain"]
];

const soilColors = [
  ["brown", "Brown"],
  ["dark", "Dark"],
  ["black", "Black"],
  ["reddish", "Reddish"],
  ["pale", "Pale"],
  ["grey", "Grey"]
];

const textures = [
  ["loam", "Loam"],
  ["sandy", "Sandy"],
  ["clay", "Clay"],
  ["silt", "Silt"]
];

const drainageOptions = [
  ["good", "Good"],
  ["moderate", "Moderate"],
  ["poor", "Poor"]
];

const newsItems = [
  {
    label: "Weather",
    title: "Check rain before irrigation",
    detail: "Use the weather tool before watering or spraying."
  },
  {
    label: "Mandi",
    title: "Wheat and paddy demo prices updated",
    detail: "Compare crop prices before planning storage or sales."
  },
  {
    label: "Scheme",
    title: "Loan approvals now credit wallet balance",
    detail: "Approved money can be used in the farmer market."
  },
  {
    label: "Advisory",
    title: "Download soil reports for records",
    detail: "Reports can be printed or saved as PDF from History."
  }
];

const mandiPrices = [
  { crop: "Wheat", market: "Delhi", price: 2425, unit: "quintal", trend: "+1.8%" },
  { crop: "Paddy", market: "Karnal", price: 2310, unit: "quintal", trend: "+0.7%" },
  { crop: "Maize", market: "Indore", price: 2180, unit: "quintal", trend: "-0.4%" },
  { crop: "Onion", market: "Nashik", price: 1850, unit: "quintal", trend: "+2.2%" },
  { crop: "Tomato", market: "Azadpur", price: 1650, unit: "quintal", trend: "-1.1%" },
  { crop: "Cotton", market: "Rajkot", price: 7020, unit: "quintal", trend: "+0.5%" }
];

const fertilizerRates = {
  wheat: { urea: 45, dap: 50, npk: 25 },
  paddy: { urea: 55, dap: 45, npk: 30 },
  maize: { urea: 50, dap: 35, npk: 35 },
  sugarcane: { urea: 75, dap: 55, npk: 55 },
  cotton: { urea: 40, dap: 35, npk: 45 },
  default: { urea: 35, dap: 30, npk: 25 }
};

const cropRecommendationMap = {
  Clay: ["Paddy", "Wheat", "Sugarcane", "Mustard"],
  Sandy: ["Groundnut", "Millet", "Watermelon", "Potato"],
  Loamy: ["Wheat", "Maize", "Vegetables", "Pulses"],
  Silty: ["Wheat", "Paddy", "Sugarcane", "Lentils"],
  Peaty: ["Vegetables", "Paddy", "Fodder crops", "Potato"],
  Chalky: ["Barley", "Mustard", "Gram", "Millet"],
  Laterite: ["Cashew", "Tea", "Coffee", "Groundnut"],
  Alluvial: ["Wheat", "Paddy", "Maize", "Sugarcane"],
  Unknown: ["Upload a soil photo", "Add crop and location", "Ask assistant"]
};

const loginClientSchema = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(1, "Password is required.")
});

const registerClientSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  farmName: z.string().optional(),
  phone: z.string().optional()
});

const fieldReportClientSchema = z.object({
  landArea: z.string().min(1, "Land area is required."),
  crop: z.string().trim().min(1, "Crop grown is required."),
  photo: z.instanceof(File, { message: "Upload a soil photo." })
});

const identifierClientSchema = z.object({
  photo: z.instanceof(File, { message: "Upload a soil photo to identify." })
});

const passwordClientSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the new password.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"]
  });

const adminPasswordClientSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters.")
});

const loanClientSchema = z.object({
  amount: z.coerce.number().min(1000, "Enter at least 1000."),
  purpose: z.string().trim().min(3, "Loan purpose is required."),
  tenureMonths: z.coerce.number().int().min(1, "Tenure is required.").max(120, "Maximum tenure is 120 months.")
});

const marketPurchaseClientSchema = z.object({
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(100, "Quantity is too high.")
});

const loanRepaymentClientSchema = z.object({
  loanId: z.string().min(1, "Select a loan."),
  amount: z.coerce.number().min(1, "Enter repayment amount."),
  bankName: z.string().trim().min(2, "Bank name is required."),
  accountName: z.string().trim().min(2, "Account holder name is required."),
  accountNumber: z.string().trim().regex(/^\d{6,18}$/, "Use 6 to 18 bank account digits."),
  ifsc: z.string().trim().min(4, "IFSC or bank code is required.")
});

function firstValidationMessage(result) {
  return result.success ? "" : result.error.issues[0]?.message || "Please check the form.";
}

async function apiRequest(path, { token, method = "GET", body, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  const options = { method, headers: requestHeaders };

  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  } catch {
    return "light";
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function csvValue(value) {
  const clean = String(value ?? "").replaceAll('"', '""');
  return `"${clean}"`;
}

function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function exportAnalysesCsv(analyses) {
  const header = ["Date", "Soil", "Confidence", "Health", "Risk", "Crop", "Land", "Status", "Summary"];
  const rows = analyses.map((analysis) => [
    formatDate(analysis.createdAt),
    analysis.result?.soilType,
    analysis.result?.confidence,
    analysis.result?.healthScore,
    analysis.result?.riskLevel,
    analysis.input?.crop,
    `${analysis.input?.landArea || ""} ${analysis.input?.landUnit || ""}`.trim(),
    titleCase(analysis.status),
    analysis.result?.summary
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
  downloadTextFile(`krishsense-reports-${Date.now()}.csv`, csv, "text/csv;charset=utf-8");
}

function exportUsersCsv(users) {
  const header = ["Name", "Email", "Role", "Status", "Farm", "Reports", "Loans", "Orders", "Wallet"];
  const rows = users.map((user) => [
    user.name,
    user.email,
    titleCase(user.role),
    user.isActive ? "Active" : "Banned",
    user.farmName || "",
    user.analysisCount || 0,
    user.loanCount || 0,
    user.orderCount || 0,
    user.walletBalance || 0
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
  downloadTextFile(`krishsense-users-${Date.now()}.csv`, csv, "text/csv;charset=utf-8");
}

function exportOrdersCsv(orders) {
  const header = ["Date", "Farmer", "Email", "Item", "Category", "Quantity", "Unit", "Unit Price", "Total", "Status"];
  const rows = orders.map((order) => [
    formatDate(order.createdAt),
    order.farmerName || "",
    order.farmerEmail || "",
    order.itemName,
    order.category,
    order.quantity,
    order.unit,
    order.unitPrice,
    order.totalPrice,
    titleCase(order.status)
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
  downloadTextFile(`krishsense-orders-${Date.now()}.csv`, csv, "text/csv;charset=utf-8");
}

function printAnalysisReport(analysis) {
  const rows = [
    ["Soil type", analysis.result?.soilType],
    ["Confidence", `${analysis.result?.confidence || 0}%`],
    ["Health score", analysis.result?.healthScore],
    ["Risk", analysis.result?.riskLevel],
    ["Crop", analysis.input?.crop || "Not set"],
    ["Location", analysis.input?.location || "Not set"],
    ["Land", `${analysis.input?.landArea || ""} ${analysis.input?.landUnit || ""}`.trim() || "Not set"],
    ["Status", titleCase(analysis.status)]
  ];
  const recommendations = (analysis.result?.recommendations || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const nutrients = (analysis.result?.nutrients || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const html = `<!doctype html>
<html>
  <head>
    <title>KrishiSense Soil Report</title>
    <style>
      body { font-family: Arial, sans-serif; color: #17231b; padding: 28px; line-height: 1.45; }
      h1 { margin: 0 0 4px; color: #21663a; }
      .muted { color: #667268; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      td { border: 1px solid #d9e2d8; padding: 10px; }
      td:first-child { font-weight: 700; width: 32%; background: #f6f9f4; }
      section { margin-top: 18px; }
      li { margin-bottom: 6px; }
    </style>
  </head>
  <body>
    <h1>KrishiSense Soil Report</h1>
    <p class="muted">${escapeHtml(formatDate(analysis.createdAt))}</p>
    ${analysis.photoUrl ? `<img src="${escapeHtml(analysis.photoUrl)}" alt="Soil" style="width:180px;height:130px;object-fit:cover;border-radius:8px" />` : ""}
    <table>${rows.map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(value ?? "Not available")}</td></tr>`).join("")}</table>
    <section><h2>Summary</h2><p>${escapeHtml(analysis.result?.summary || "No summary available.")}</p></section>
    <section><h2>Recommendations</h2><ul>${recommendations || "<li>No recommendations available.</li>"}</ul></section>
    <section><h2>Nutrients</h2><ul>${nutrients || "<li>No nutrient details available.</li>"}</ul></section>
    <section><h2>Irrigation</h2><p>${escapeHtml(analysis.result?.irrigation || "No irrigation note available.")}</p></section>
    <p class="muted">This report is guidance only. Confirm fertilizer and pH decisions with a lab soil test.</p>
  </body>
</html>`;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    downloadTextFile(`krishsense-report-${analysis.id}.html`, html, "text/html;charset=utf-8");
    return;
  }
  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  reportWindow.print();
}

function getCropRecommendations(analysis) {
  const aiCrops = analysis?.result?.bestCrops || [];
  if (aiCrops.length) return aiCrops.slice(0, 5);
  return cropRecommendationMap[analysis?.result?.soilType] || cropRecommendationMap.Unknown;
}

function getFertilizerPlan(crop, landArea) {
  const key = String(crop || "").toLowerCase().trim();
  const rates = fertilizerRates[key] || fertilizerRates.default;
  const area = Math.max(0, Number(landArea || 0));
  return {
    urea: Math.round(rates.urea * area),
    dap: Math.round(rates.dap * area),
    npk: Math.round(rates.npk * area)
  };
}

function calculateEmi(amount, annualRate, months) {
  const principal = Number(amount || 0);
  const rate = Number(annualRate || 0) / 12 / 100;
  const tenure = Math.max(1, Number(months || 1));
  if (!principal) return 0;
  if (!rate) return Math.round(principal / tenure);
  const multiplier = (principal * rate * (1 + rate) ** tenure) / ((1 + rate) ** tenure - 1);
  return Math.round(multiplier);
}

function topEntries(values, limit = 3) {
  const counts = new Map();
  values.filter(Boolean).forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function buildFarmerInsights(analyses, loans) {
  const latest = analyses[0];
  const healthScores = analyses.map((analysis) => Number(analysis.result?.healthScore)).filter(Number.isFinite);
  const averageHealth = healthScores.length
    ? Math.round(healthScores.reduce((total, score) => total + score, 0) / healthScores.length)
    : null;
  const soilMix = topEntries(analyses.map((analysis) => analysis.result?.soilType), 4);
  const cropCandidates = topEntries(analyses.flatMap((analysis) => analysis.result?.bestCrops || []), 4);
  const highRiskCount = analyses.filter((analysis) => analysis.result?.riskLevel === "High").length;
  const pendingLoans = loans.filter((loan) => loan.status === "pending").length;
  const approvedLoans = loans.filter((loan) => loan.status === "approved").length;
  const rejectedLoans = loans.filter((loan) => loan.status === "rejected").length;
  const actions = [];

  if (!analyses.length) actions.push("Start with one soil analysis to unlock field-specific guidance.");
  if (latest?.result?.alerts?.length) actions.push(...latest.result.alerts.slice(0, 2));
  if (latest?.result?.recommendations?.length) actions.push(...latest.result.recommendations.slice(0, 3));
  if (highRiskCount) actions.push(`${highRiskCount} report${highRiskCount === 1 ? "" : "s"} marked high risk need review.`);
  if (pendingLoans) actions.push(`${pendingLoans} loan request${pendingLoans === 1 ? "" : "s"} still awaiting admin decision.`);
  if (!actions.length) actions.push("Fields look stable based on saved reports.");

  return {
    averageHealth,
    dominantSoil: soilMix[0]?.[0] || "No data",
    suggestedCrop: cropCandidates[0]?.[0] || latest?.input?.crop || "No data",
    highRiskCount,
    pendingLoans,
    approvedLoans,
    rejectedLoans,
    soilMix,
    cropCandidates,
    actions: actions.slice(0, 5)
  };
}

function buildNotifications(analyses, loans, market) {
  const notifications = [];
  const latest = analyses[0];
  if (latest) {
    notifications.push({
      title: `${latest.result?.soilType || "Soil"} report saved`,
      detail: `${latest.result?.healthScore || 0} health score for ${latest.input?.crop || "your field"}.`
    });
  }
  loans
    .filter((loan) => loan.status !== "pending")
    .slice(0, 2)
    .forEach((loan) => {
      notifications.push({
        title: `Loan ${loan.status}`,
        detail: `${formatMoney(loan.amount)} for ${loan.purpose}.`
      });
    });
  (market.orders || []).slice(0, 2).forEach((order) => {
    notifications.push({
      title: "Market order confirmed",
      detail: `${order.quantity} x ${order.itemName} for ${formatMoney(order.totalPrice)}.`
    });
  });
  if (!notifications.length) {
    notifications.push({
      title: "Welcome to KrishiSense",
      detail: "Upload soil photos, apply for loans, and track farm tools here."
    });
  }
  return notifications.slice(0, 5);
}

const emptyMarketState = {
  account: { walletBalance: 0 },
  catalog: [],
  orders: [],
  loans: []
};

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [theme, setTheme] = useState(getInitialTheme);
  const [booting, setBooting] = useState(Boolean(session?.token));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!session?.token) {
      setBooting(false);
      return;
    }

    apiRequest("/api/auth/me", { token: session.token })
      .then(({ user }) => setSession((current) => ({ ...current, user })))
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
      })
      .finally(() => setBooting(false));
  }, []);

  function handleLogin(nextSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  if (booting) {
    return (
      <main className="loading-screen">
        <Sprout size={34} />
        <span>Opening KrishiSense</span>
      </main>
    );
  }

  if (!session) {
    return (
      <>
        <LoginView onLogin={handleLogin} theme={theme} onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <Dashboard
        session={session}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      <AppFooter />
    </>
  );
}

function AppFooter() {
  return (
    <footer className="site-footer">
      <span>Developed by Aksh Rawat</span>
      <span>{"<3"}</span>
    </footer>
  );
}

function ThemeSwitch({ theme, onToggle }) {
  const dark = theme === "dark";
  return (
    <button
      className="theme-switch"
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={onToggle}
      title={dark ? "Use light background" : "Use dark background"}
    >
      <span className="theme-switch-track">
        <span />
      </span>
      {dark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

function LoginView({ onLogin, theme, onThemeToggle }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    farmName: "",
    phone: ""
  });

  async function submitLogin(event, quickCredentials) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const credentials = quickCredentials || loginForm;
      const validation = loginClientSchema.safeParse(credentials);
      if (!validation.success) throw new Error(firstValidationMessage(validation));
      const nextSession = await apiRequest("/api/auth/login", {
        method: "POST",
        body: validation.data
      });
      onLogin(nextSession);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const validation = registerClientSchema.safeParse(registerForm);
      if (!validation.success) throw new Error(firstValidationMessage(validation));
      const nextSession = await apiRequest("/api/auth/register", {
        method: "POST",
        body: validation.data
      });
      onLogin(nextSession);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-visual" aria-label="Farm field">
        <img src={fieldImage} alt="Farm field at sunrise" />
        <div className="brand-lockup">
          <span className="brand-mark">
            <Sprout size={24} />
          </span>
          <div>
            <p>KrishiSense</p>
            <h1>Soil decisions for every field</h1>
          </div>
        </div>
        <div className="auth-metrics">
          <span>
            <FlaskConical size={18} />
            Photo analysis
          </span>
          <span>
            <ShieldCheck size={18} />
            Admin review
          </span>
          <span>
            <Leaf size={18} />
            Crop guidance
          </span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-actions">
          <ThemeSwitch theme={theme} onToggle={onThemeToggle} />
        </div>

        <div className="panel-heading">
          <span className="eyebrow">Secure access</span>
          <h2>{mode === "login" ? "Welcome back" : "Create farmer account"}</h2>
        </div>

        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            <Lock size={16} />
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            <UserPlus size={16} />
            Register
          </button>
        </div>

        {error && <p className="error-banner">{error}</p>}

        {mode === "login" ? (
          <form className="stack-form" onSubmit={submitLogin}>
            <label>
              Email
              <span className="input-shell">
                <Mail size={17} />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  required
                />
              </span>
            </label>
            <label>
              Password
              <span className="input-shell">
                <Lock size={17} />
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
              </span>
            </label>
            <button className="primary-button" disabled={busy}>
              <ShieldCheck size={18} />
              {busy ? "Signing in" : "Sign in"}
            </button>
          </form>
        ) : (
          <form className="stack-form" onSubmit={submitRegister}>
            <label>
              Name
              <input
                value={registerForm.name}
                onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                value={registerForm.password}
                onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                required
              />
            </label>
            <label>
              Farm name
              <input
                value={registerForm.farmName}
                onChange={(event) => setRegisterForm({ ...registerForm, farmName: event.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={registerForm.phone}
                onChange={(event) => setRegisterForm({ ...registerForm, phone: event.target.value })}
              />
            </label>
            <button className="primary-button" disabled={busy}>
              <UserPlus size={18} />
              {busy ? "Creating" : "Create account"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function Dashboard({ session, onLogout, theme, onThemeToggle }) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="app-brand">
          <span className="brand-mark">
            <Sprout size={23} />
          </span>
          <div>
            <strong>KrishiSense</strong>
            <span>{session.user.role === "admin" ? "Admin console" : session.user.farmName || "Farmer desk"}</span>
          </div>
        </div>
        <div className="topbar-actions">
          <ThemeSwitch theme={theme} onToggle={onThemeToggle} />
          <span className="user-pill">
            {session.user.role === "admin" ? <ShieldCheck size={16} /> : <Wheat size={16} />}
            {session.user.name}
          </span>
          <button className="icon-button" onClick={onLogout} title="Log out" aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <FloatingNewsBanner />

      {session.user.role === "admin" ? (
        <AdminDashboard token={session.token} />
      ) : (
        <FarmerDashboard token={session.token} user={session.user} />
      )}
    </main>
  );
}

function FloatingNewsBanner() {
  return (
    <aside className="floating-news" aria-label="Farm news and alerts">
      <div className="floating-news-label">
        <Newspaper size={17} />
        Updates
      </div>
      <div className="news-ticker-viewport">
        <div className="news-ticker">
          {[...newsItems, ...newsItems].map((item, index) => (
            <span key={`${item.title}-${index}`}>
              <strong>{item.label}</strong>
              {item.title}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

function FarmerDashboard({ token, user }) {
  const [activeView, setActiveView] = useState("analysis");
  const [analyses, setAnalyses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [market, setMarket] = useState(emptyMarketState);
  const [loading, setLoading] = useState(true);

  async function loadAnalyses() {
    setLoading(true);
    const data = await apiRequest("/api/analyses", { token });
    setAnalyses(data.analyses);
    setLoading(false);
  }

  async function loadLoans() {
    const data = await apiRequest("/api/loans", { token });
    setLoans(data.loans);
  }

  async function loadMarket() {
    const data = await apiRequest("/api/market", { token });
    setMarket(data);
  }

  useEffect(() => {
    Promise.all([loadAnalyses(), loadLoans(), loadMarket()]).catch(() => setLoading(false));
  }, []);

  const latest = analyses[0];
  const pending = analyses.filter((analysis) => analysis.status === "pending").length;
  const pendingLoans = loans.filter((loan) => loan.status === "pending").length;
  const insights = useMemo(() => buildFarmerInsights(analyses, loans), [analyses, loans]);
  const notifications = useMemo(() => buildNotifications(analyses, loans, market), [analyses, loans, market]);

  return (
    <div className="dashboard-grid">
      <aside className="side-panel">
        <div className="profile-block">
          <img src={fieldImage} alt="Farm rows" />
          <div>
            <span>{user.farmName || "Farm profile"}</span>
            <strong>{user.name}</strong>
          </div>
        </div>
        <nav className="side-nav" aria-label="Farmer dashboard">
          <button className={activeView === "analysis" ? "active" : ""} onClick={() => setActiveView("analysis")}>
            <Camera size={18} />
            Soil analysis
          </button>
          <button className={activeView === "identify" ? "active" : ""} onClick={() => setActiveView("identify")}>
            <Search size={18} />
            Soil identifier
          </button>
          <button className={activeView === "history" ? "active" : ""} onClick={() => setActiveView("history")}>
            <ClipboardList size={18} />
            History
          </button>
          <button className={activeView === "insights" ? "active" : ""} onClick={() => setActiveView("insights")}>
            <TrendingUp size={18} />
            Insights
          </button>
          <button className={activeView === "tools" ? "active" : ""} onClick={() => setActiveView("tools")}>
            <Calculator size={18} />
            Farm tools
          </button>
          <button className={activeView === "market" ? "active" : ""} onClick={() => setActiveView("market")}>
            <ShoppingCart size={18} />
            Market
          </button>
          <button className={activeView === "loans" ? "active" : ""} onClick={() => setActiveView("loans")}>
            <HandCoins size={18} />
            Loans
          </button>
          <button className={activeView === "account" ? "active" : ""} onClick={() => setActiveView("account")}>
            <KeyRound size={18} />
            Account
          </button>
        </nav>
      </aside>

      <section className="content-area">
        <div className="metric-row">
          <Metric icon={<FlaskConical size={19} />} label="Analyses" value={analyses.length} />
          <Metric icon={<Clock3 size={19} />} label="Pending review" value={pending} />
          <Metric icon={<Leaf size={19} />} label="Latest soil" value={latest?.result.soilType || "None"} />
          <Metric icon={<HandCoins size={19} />} label="Loan requests" value={pendingLoans ? `${pendingLoans} pending` : loans.length} />
          <Metric icon={<TrendingUp size={19} />} label="Avg health" value={insights.averageHealth ?? "None"} />
          <Metric icon={<Wallet size={19} />} label="Balance" value={formatMoney(market.account?.walletBalance || 0)} />
        </div>

        {activeView === "analysis" && <SoilAnalysisForm token={token} onCreated={loadAnalyses} />}
        {activeView === "identify" && <SoilIdentifierUpload token={token} onCreated={loadAnalyses} />}
        {activeView === "history" && <AnalysisHistory analyses={analyses} loading={loading} />}
        {activeView === "insights" && <FarmerInsightCenter insights={insights} analyses={analyses} />}
        {activeView === "tools" && <FarmerToolsPanel token={token} analyses={analyses} loans={loans} market={market} notifications={notifications} />}
        {activeView === "market" && <MarketPanel token={token} market={market} onChanged={() => Promise.all([loadMarket(), loadLoans()])} />}
        {activeView === "loans" && <FarmerLoanPanel token={token} loans={loans} onChanged={loadLoans} />}
        {activeView === "account" && <PasswordPanel token={token} />}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric-card">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SoilAnalysisForm({ token, onCreated }) {
  const [form, setForm] = useState(emptyAnalysisForm);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhoto(file) {
    setPhoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function submitAnalysis(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const validation = fieldReportClientSchema.safeParse({
        landArea: form.landArea,
        crop: form.crop,
        photo
      });
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("photo", photo);

      const data = await apiRequest("/api/analyses", {
        token,
        method: "POST",
        body
      });

      setResult(data.analysis.result);
      setForm(emptyAnalysisForm);
      setPhoto(null);
      setPreview("");
      await onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-surface">
      <section className="form-card">
        <div className="section-heading">
          <span className="eyebrow">New field report</span>
          <h2>Upload soil photo and crop details</h2>
        </div>
        {error && <p className="error-banner">{error}</p>}
        <form className="analysis-form" onSubmit={submitAnalysis}>
          <label className="upload-zone">
            <input type="file" accept="image/*" onChange={(event) => handlePhoto(event.target.files?.[0])} />
            {preview ? (
              <img src={preview} alt="Uploaded soil preview" />
            ) : (
              <span>
                <Upload size={24} />
                Soil photo
              </span>
            )}
          </label>

          <div className="form-grid">
            <label>
              Crop grown
              <span className="input-shell">
                <Wheat size={17} />
                <input value={form.crop} onChange={(event) => updateField("crop", event.target.value)} required />
              </span>
            </label>
            <label>
              Location
              <span className="input-shell">
                <MapPin size={17} />
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
              </span>
            </label>
            <label>
              Land area
              <span className="input-shell split-input">
                <Ruler size={17} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.landArea}
                  onChange={(event) => updateField("landArea", event.target.value)}
                  required
                />
                <select value={form.landUnit} onChange={(event) => updateField("landUnit", event.target.value)}>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="bigha">Bigha</option>
                </select>
              </span>
            </label>
            <SelectField label="Land type" value={form.landType} options={landTypes} onChange={(value) => updateField("landType", value)} />
            <SelectField label="Soil color" value={form.soilColor} options={soilColors} onChange={(value) => updateField("soilColor", value)} />
            <SelectField label="Texture" value={form.texture} options={textures} onChange={(value) => updateField("texture", value)} />
            <SelectField label="Drainage" value={form.drainage} options={drainageOptions} onChange={(value) => updateField("drainage", value)} />
            <label>
              pH
              <span className="input-shell">
                <Gauge size={17} />
                <input
                  type="number"
                  min="3"
                  max="10"
                  step="0.1"
                  value={form.ph}
                  onChange={(event) => updateField("ph", event.target.value)}
                />
              </span>
            </label>
          </div>

          <label>
            Field notes
            <textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={3} />
          </label>

          <button className="primary-button" disabled={busy}>
            <FlaskConical size={18} />
            {busy ? "Analyzing" : "Get analysis"}
          </button>
        </form>
      </section>

      <section className="result-column">
        {result ? (
          <ResultCard result={result} />
        ) : (
          <div className="empty-state">
            <ImageIcon size={36} />
            <h3>Analysis result</h3>
            <p>Saved reports appear in History after submission.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultCard({ result }) {
  return (
    <article className="result-card">
      <div className="soil-chip" style={{ "--soil-color": result.soilColor }}>
        <span />
        <div>
          <p>Identified soil</p>
          <h3>{result.soilType}</h3>
        </div>
      </div>

      <div className="score-grid">
        <div>
          <span>{result.confidence}%</span>
          <p>Confidence</p>
        </div>
        <div>
          <span>{result.healthScore}</span>
          <p>Soil health</p>
        </div>
        <div>
          <span>{result.riskLevel}</span>
          <p>Risk</p>
        </div>
      </div>

      <p className="summary-copy">{result.summary}</p>

      {result.alerts?.length > 0 && (
        <div className="alert-list">
          {result.alerts.map((alert) => (
            <p key={alert}>
              <AlertTriangle size={16} />
              {alert}
            </p>
          ))}
        </div>
      )}

      <div className="detail-list">
        <h4>Recommendations</h4>
        {result.recommendations.map((item) => (
          <p key={item}>
            <CheckCircle2 size={16} />
            {item}
          </p>
        ))}
      </div>

      <div className="detail-list">
        <h4>Likely nutrients</h4>
        {result.nutrients.map((item) => (
          <p key={item}>
            <Leaf size={16} />
            {item}
          </p>
        ))}
      </div>

      <div className="irrigation-note">
        <Droplets size={18} />
        <span>{result.irrigation}</span>
      </div>
      <p className="lab-note">{result.note}</p>
    </article>
  );
}

function SoilIdentifierUpload({ token, onCreated }) {
  const [form, setForm] = useState({
    landType: "unknown",
    location: "",
    crop: "",
    notes: ""
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handlePhoto(file) {
    setPhoto(file || null);
    setPreview(file ? URL.createObjectURL(file) : "");
    setResult(null);
  }

  async function identifySample(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const validation = identifierClientSchema.safeParse({ photo });
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      body.append("photo", photo);

      const data = await apiRequest("/api/analyses/identify-soil", {
        token,
        method: "POST",
        body
      });
      setResult(data.result);
      await onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="identifier-grid">
      <section className="form-card">
        <div className="section-heading">
          <span className="eyebrow">AI soil identifier</span>
          <h2>Upload a soil photo</h2>
        </div>
        {error && <p className="error-banner">{error}</p>}

        <form className="analysis-form" onSubmit={identifySample}>
          <label className="upload-zone">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handlePhoto(event.target.files?.[0])} />
            {preview ? (
              <img src={preview} alt="Uploaded soil sample preview" />
            ) : (
              <span>
                <Camera size={24} />
                Soil sample photo
              </span>
            )}
          </label>

          <div className="form-grid">
            <SelectField
              label="Land type"
              value={form.landType}
              options={[["unknown", "Unknown"], ...landTypes]}
              onChange={(value) => updateField("landType", value)}
            />
            <label>
              Location
              <span className="input-shell">
                <MapPin size={17} />
                <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
              </span>
            </label>
            <label>
              Crop nearby
              <span className="input-shell">
                <Wheat size={17} />
                <input value={form.crop} onChange={(event) => updateField("crop", event.target.value)} />
              </span>
            </label>
          </div>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
              placeholder="Optional: moisture, smell, stickiness, field condition"
            />
          </label>

          <button className="primary-button" disabled={busy}>
            <Search size={18} />
            {busy ? "Analyzing photo" : "Identify soil"}
          </button>
        </form>
      </section>

      <section>
        {result ? (
          <ResultCard result={result} />
        ) : (
          <div className="empty-state">
            <Search size={36} />
            <h3>Soil identity</h3>
            <p>Gemini will classify the uploaded photo and return a confidence score.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function FarmerInsightCenter({ insights, analyses }) {
  return (
    <div className="insight-layout">
      <section className="insight-hero">
        <div>
          <span className="eyebrow">Farm intelligence</span>
          <h2>Field health snapshot</h2>
        </div>
        <div className="insight-summary">
          <InsightTile icon={<TrendingUp size={18} />} label="Average health" value={insights.averageHealth ?? "No data"} />
          <InsightTile icon={<Leaf size={18} />} label="Dominant soil" value={insights.dominantSoil} />
          <InsightTile icon={<Wheat size={18} />} label="Crop candidate" value={insights.suggestedCrop} />
          <InsightTile icon={<AlertTriangle size={18} />} label="High risk" value={insights.highRiskCount} />
        </div>
      </section>

      <div className="insight-columns">
        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Action plan</span>
            <h2>Next moves</h2>
          </div>
          <div className="action-plan">
            {insights.actions.map((action) => (
              <p key={action}>
                <Target size={16} />
                {action}
              </p>
            ))}
          </div>
        </section>

        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Crop signals</span>
            <h2>Best matches</h2>
          </div>
          <SignalBars entries={insights.cropCandidates} emptyLabel={analyses.length ? "No crop candidates yet" : "No reports yet"} />
        </section>

        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Soil profile</span>
            <h2>Report mix</h2>
          </div>
          <SignalBars entries={insights.soilMix} emptyLabel={analyses.length ? "No soil mix yet" : "No reports yet"} />
        </section>

        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Loan status</span>
            <h2>Finance pulse</h2>
          </div>
          <div className="finance-pulse">
            <span><Clock3 size={16} /> {insights.pendingLoans} pending</span>
            <span><CheckCircle2 size={16} /> {insights.approvedLoans} approved</span>
            <span><UserX size={16} /> {insights.rejectedLoans} rejected</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function InsightTile({ icon, label, value }) {
  return (
    <div className="insight-tile">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function SignalBars({ entries, emptyLabel }) {
  if (!entries.length) return <p className="muted-note">{emptyLabel}</p>;
  const max = Math.max(...entries.map(([, count]) => count), 1);

  return (
    <div className="signal-bars">
      {entries.map(([label, count]) => (
        <div className="signal-row" key={label}>
          <div>
            <strong>{label}</strong>
            <span>{count}</span>
          </div>
          <span className="signal-track">
            <span style={{ width: `${Math.max(18, (count / max) * 100)}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

function FarmerToolsPanel({ token, analyses, loans, market, notifications }) {
  const latest = analyses[0];

  return (
    <div className="tools-layout">
      <section className="tools-hero">
        <div>
          <span className="eyebrow">Farm command center</span>
          <h2>Weather, prices, calculators, reports, and assistant</h2>
        </div>
        <div className="tools-hero-stats">
          <InsightTile icon={<Bell size={18} />} label="Notifications" value={notifications.length} />
          <InsightTile icon={<ShoppingCart size={18} />} label="Orders" value={market.orders?.length || 0} />
          <InsightTile icon={<HandCoins size={18} />} label="Approved loans" value={loans.filter((loan) => loan.status === "approved").length} />
        </div>
      </section>

      <div className="tools-grid">
        <WeatherTool latest={latest} />
        <MandiPricePanel />
        <FertilizerCalculator latest={latest} />
        <CropRecommendationPanel latest={latest} />
        <EmiCalculator />
        <NotificationPanel notifications={notifications} />
        <AiAssistantPanel token={token} latest={latest} />
      </div>
    </div>
  );
}

function WeatherTool({ latest }) {
  const [location, setLocation] = useState(latest?.input?.location || "Delhi");
  const [weather, setWeather] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadWeather(event) {
    event?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const place = encodeURIComponent(location.trim() || "Delhi");
      const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${place}&count=1&language=en&format=json`);
      const geoData = await geoResponse.json();
      const match = geoData.results?.[0];
      if (!match) throw new Error("Location not found.");

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=precipitation_probability_max&forecast_days=1`
      );
      const forecast = await forecastResponse.json();
      setWeather({
        name: `${match.name}${match.admin1 ? `, ${match.admin1}` : ""}`,
        temp: Math.round(forecast.current?.temperature_2m || 0),
        humidity: Math.round(forecast.current?.relative_humidity_2m || 0),
        rain: Math.round(forecast.daily?.precipitation_probability_max?.[0] || forecast.current?.precipitation || 0),
        wind: Math.round(forecast.current?.wind_speed_10m || 0)
      });
    } catch (err) {
      setError(err.message || "Weather lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadWeather();
  }, []);

  return (
    <section className="tool-card weather-card">
      <div className="tool-heading">
        <CloudSun size={22} />
        <div>
          <span className="eyebrow">Weather</span>
          <h3>Field forecast</h3>
        </div>
      </div>
      <form className="inline-tool-form" onSubmit={loadWeather}>
        <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Village or city" />
        <button className="small-button" disabled={busy}>
          <RefreshCw size={15} />
          {busy ? "Checking" : "Check"}
        </button>
      </form>
      {error && <p className="error-banner">{error}</p>}
      {weather && (
        <div className="weather-grid">
          <strong>{weather.name}</strong>
          <span>{weather.temp}°C</span>
          <p>{weather.humidity}% humidity</p>
          <p>{weather.rain}% rain chance</p>
          <p>{weather.wind} km/h wind</p>
        </div>
      )}
    </section>
  );
}

function MandiPricePanel() {
  return (
    <section className="tool-card">
      <div className="tool-heading">
        <TrendingUp size={22} />
        <div>
          <span className="eyebrow">Mandi prices</span>
          <h3>Crop price tracker</h3>
        </div>
      </div>
      <div className="mandi-list">
        {mandiPrices.map((item) => (
          <div className="mandi-row" key={`${item.crop}-${item.market}`}>
            <div>
              <strong>{item.crop}</strong>
              <span>{item.market}</span>
            </div>
            <div>
              <strong>{formatMoney(item.price)}</strong>
              <span>per {item.unit} · {item.trend}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="muted-note">Demo benchmark prices for presentation use.</p>
    </section>
  );
}

function FertilizerCalculator({ latest }) {
  const [crop, setCrop] = useState(latest?.input?.crop || "wheat");
  const [area, setArea] = useState(latest?.input?.landArea || "1");
  const plan = getFertilizerPlan(crop, area);

  return (
    <section className="tool-card">
      <div className="tool-heading">
        <FlaskConical size={22} />
        <div>
          <span className="eyebrow">Calculator</span>
          <h3>Fertilizer estimate</h3>
        </div>
      </div>
      <div className="mini-form-grid">
        <label>
          Crop
          <input value={crop} onChange={(event) => setCrop(event.target.value)} />
        </label>
        <label>
          Area acres
          <input type="number" min="0" step="0.1" value={area} onChange={(event) => setArea(event.target.value)} />
        </label>
      </div>
      <div className="calc-result-grid">
        <span><strong>{plan.urea} kg</strong> Urea</span>
        <span><strong>{plan.dap} kg</strong> DAP</span>
        <span><strong>{plan.npk} kg</strong> NPK</span>
      </div>
      <p className="muted-note">Indicative estimate only. Match final dose with local soil test.</p>
    </section>
  );
}

function CropRecommendationPanel({ latest }) {
  const crops = getCropRecommendations(latest);
  return (
    <section className="tool-card">
      <div className="tool-heading">
        <Wheat size={22} />
        <div>
          <span className="eyebrow">Crop recommendation</span>
          <h3>{latest?.result?.soilType || "No soil report yet"}</h3>
        </div>
      </div>
      <div className="recommendation-chips">
        {crops.map((crop) => (
          <span key={crop}>{crop}</span>
        ))}
      </div>
      <p className="muted-note">Based on latest soil report and built-in soil rules.</p>
    </section>
  );
}

function EmiCalculator() {
  const [amount, setAmount] = useState("50000");
  const [rate, setRate] = useState("8");
  const [months, setMonths] = useState("12");
  const emi = calculateEmi(amount, rate, months);

  return (
    <section className="tool-card">
      <div className="tool-heading">
        <Calculator size={22} />
        <div>
          <span className="eyebrow">Loan calculator</span>
          <h3>EMI estimate</h3>
        </div>
      </div>
      <div className="mini-form-grid">
        <label>
          Amount
          <input type="number" min="0" step="500" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </label>
        <label>
          Interest %
          <input type="number" min="0" step="0.1" value={rate} onChange={(event) => setRate(event.target.value)} />
        </label>
        <label>
          Months
          <input type="number" min="1" value={months} onChange={(event) => setMonths(event.target.value)} />
        </label>
      </div>
      <div className="emi-result">
        <span>Estimated monthly repayment</span>
        <strong>{formatMoney(emi)}</strong>
      </div>
    </section>
  );
}

function NotificationPanel({ notifications }) {
  return (
    <section className="tool-card">
      <div className="tool-heading">
        <Bell size={22} />
        <div>
          <span className="eyebrow">Notifications</span>
          <h3>Recent activity</h3>
        </div>
      </div>
      <div className="notification-list">
        {notifications.map((item) => (
          <p key={`${item.title}-${item.detail}`}>
            <CheckCircle2 size={16} />
            <span><strong>{item.title}</strong>{item.detail}</span>
          </p>
        ))}
      </div>
    </section>
  );
}

function AiAssistantPanel({ token, latest }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const quickQuestions = [
    "What should I do next for this soil?",
    "Which fertilizer is safe for my crop?",
    "How should I plan irrigation this week?"
  ];

  async function askAssistant(event) {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError("Ask a farming question with at least 3 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setAnswer("");
    try {
      const data = await apiRequest("/api/assistant/chat", {
        token,
        method: "POST",
        body: {
          question: trimmedQuestion,
          context: {
            soilType: latest?.result?.soilType || "",
            crop: latest?.input?.crop || "",
            location: latest?.input?.location || "",
            healthScore: latest?.result?.healthScore || ""
          }
        }
      });
      setAnswer(data.answer);
    } catch (err) {
      setError(err.message || "Assistant failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-card assistant-card">
      <div className="tool-heading">
        <Bot size={22} />
        <div>
          <span className="eyebrow">AI assistant</span>
          <h3>Ask a farming question</h3>
        </div>
      </div>
      <form className="assistant-form" onSubmit={askAssistant}>
        <textarea
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Example: Which fertilizer should I use for wheat in loamy soil?"
          required
        />
        <div className="assistant-quick-row">
          {quickQuestions.map((item) => (
            <button className="chip-button" type="button" key={item} onClick={() => setQuestion(item)}>
              {item}
            </button>
          ))}
        </div>
        <button className="primary-button" disabled={busy || question.trim().length < 3}>
          <Bot size={17} />
          {busy ? "Thinking" : "Ask assistant"}
        </button>
      </form>
      {error && <p className="error-banner">{error}</p>}
      {answer && (
        <div className="assistant-answer" aria-live="polite">
          {answer
            .split(/\n+/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, index) => (
              <p key={`${line}-${index}`}>{line.replace(/^[-*\d.]+\s*/, "")}</p>
            ))}
        </div>
      )}
    </section>
  );
}

function MarketPanel({ token, market, onChanged }) {
  const [quantities, setQuantities] = useState({});
  const [repayment, setRepayment] = useState({
    loanId: "",
    amount: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    ifsc: ""
  });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const groupedCatalog = useMemo(() => {
    return market.catalog.reduce((groups, item) => {
      groups[item.category] = groups[item.category] || [];
      groups[item.category].push(item);
      return groups;
    }, {});
  }, [market.catalog]);
  const repayableLoans = (market.loans || []).filter((loan) => Number(loan.remainingAmount || 0) > 0);

  function setQuantity(itemId, value) {
    setQuantities((current) => ({ ...current, [itemId]: value }));
  }

  function updateRepayment(field, value) {
    setRepayment((current) => ({ ...current, [field]: value }));
  }

  async function buyItem(item) {
    setBusy(`buy-${item.id}`);
    setError("");
    setMessage("");
    try {
      const quantity = quantities[item.id] || 1;
      const validation = marketPurchaseClientSchema.safeParse({ quantity });
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      await apiRequest("/api/market/orders", {
        token,
        method: "POST",
        body: { itemId: item.id, quantity: validation.data.quantity }
      });

      setQuantity(item.id, 1);
      setMessage(`${item.name} order confirmed.`);
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function repayLoan(event) {
    event.preventDefault();
    setBusy("repay");
    setError("");
    setMessage("");
    try {
      const validation = loanRepaymentClientSchema.safeParse(repayment);
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      await apiRequest("/api/market/repayments", {
        token,
        method: "POST",
        body: validation.data
      });

      setRepayment({
        loanId: "",
        amount: "",
        bankName: "",
        accountName: "",
        accountNumber: "",
        ifsc: ""
      });
      setMessage("Loan repayment recorded from bank account.");
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="market-layout">
      <section className="market-wallet">
        <div>
          <span className="eyebrow">Farmer account</span>
          <h2>{formatMoney(market.account?.walletBalance || 0)}</h2>
          <p>Approved loan money is added here. Market purchases reduce this balance.</p>
        </div>
        <Wallet size={42} />
      </section>

      {(error || message) && (
        <p className={error ? "error-banner" : "success-banner"}>{error || message}</p>
      )}

      <section className="market-catalog">
        {Object.entries(groupedCatalog).map(([category, items]) => (
          <div className="market-category" key={category}>
            <div className="section-heading compact-heading">
              <span className="eyebrow">{category}</span>
              <h2>{category === "Tractor" ? "Tractor and heavy equipment" : `Buy ${category.toLowerCase()}`}</h2>
            </div>
            <div className="product-grid">
              {items.map((item) => (
                <article className="product-card" key={item.id}>
                  <div className="product-art" style={{ "--product-tone": item.imageTone }}>
                    {item.category === "Tractor" ? <Tractor size={30} /> : item.category === "Fertiliser" ? <FlaskConical size={30} /> : <Wheat size={30} />}
                  </div>
                  <div className="product-copy">
                    <h3>{item.name}</h3>
                    <p>{item.unit}</p>
                    <strong>{formatMoney(item.price)}</strong>
                    <span>{item.sourceNote}</span>
                  </div>
                  <div className="product-actions">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={quantities[item.id] || 1}
                      onChange={(event) => setQuantity(item.id, event.target.value)}
                      aria-label={`${item.name} quantity`}
                    />
                    <button className="primary-button" disabled={busy === `buy-${item.id}`} onClick={() => buyItem(item)}>
                      <ShoppingCart size={17} />
                      Buy
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="market-bottom-grid">
        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Repayment</span>
            <h2>Pay loan from bank</h2>
          </div>
          <form className="stack-form" onSubmit={repayLoan}>
            <label>
              Approved loan
              <select value={repayment.loanId} onChange={(event) => updateRepayment("loanId", event.target.value)} required>
                <option value="">Select loan</option>
                {repayableLoans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {formatMoney(loan.remainingAmount)} remaining - {loan.purpose}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-grid">
              <label>
                Amount
                <span className="input-shell">
                  <Banknote size={17} />
                  <input
                    type="number"
                    min="1"
                    value={repayment.amount}
                    onChange={(event) => updateRepayment("amount", event.target.value)}
                    required
                  />
                </span>
              </label>
              <label>
                Bank name
                <input value={repayment.bankName} onChange={(event) => updateRepayment("bankName", event.target.value)} required />
              </label>
              <label>
                Account holder
                <input value={repayment.accountName} onChange={(event) => updateRepayment("accountName", event.target.value)} required />
              </label>
              <label>
                Account number
                <input
                  inputMode="numeric"
                  value={repayment.accountNumber}
                  onChange={(event) => updateRepayment("accountNumber", event.target.value)}
                  required
                />
              </label>
              <label>
                IFSC / bank code
                <input value={repayment.ifsc} onChange={(event) => updateRepayment("ifsc", event.target.value)} required />
              </label>
            </div>
            <button className="secondary-button" disabled={busy === "repay" || !repayableLoans.length}>
              <Banknote size={18} />
              {busy === "repay" ? "Recording" : "Repay loan"}
            </button>
          </form>
        </section>

        <section className="form-card">
          <div className="section-heading compact-heading">
            <span className="eyebrow">Orders</span>
            <h2>Purchase history</h2>
          </div>
          {market.orders?.length ? (
            <div className="order-list">
              {market.orders.map((order) => (
                <article className="order-row" key={order.id}>
                  <div>
                    <strong>{order.itemName}</strong>
                    <span>{order.quantity} x {order.unit}</span>
                  </div>
                  <div>
                    <strong>{formatMoney(order.totalPrice)}</strong>
                    <span>{titleCase(order.status)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="muted-note">No market orders yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function FarmerLoanPanel({ token, loans, onChanged }) {
  const [form, setForm] = useState({
    amount: "",
    purpose: "",
    crop: "",
    landArea: "",
    landUnit: "acre",
    tenureMonths: "12",
    farmerNote: ""
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitLoan(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const validation = loanClientSchema.safeParse(form);
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      await apiRequest("/api/loans", {
        token,
        method: "POST",
        body: form
      });

      setForm({
        amount: "",
        purpose: "",
        crop: "",
        landArea: "",
        landUnit: "acre",
        tenureMonths: "12",
        farmerNote: ""
      });
      setMessage("Loan application submitted for admin review.");
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="work-surface">
      <section className="form-card">
        <div className="section-heading">
          <span className="eyebrow">Loan support</span>
          <h2>Apply for a crop loan</h2>
        </div>
        {error && <p className="error-banner">{error}</p>}
        {message && <p className="success-banner">{message}</p>}

        <form className="analysis-form" onSubmit={submitLoan}>
          <div className="form-grid">
            <label>
              Amount
              <span className="input-shell">
                <HandCoins size={17} />
                <input
                  type="number"
                  min="1000"
                  step="500"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  required
                />
              </span>
            </label>
            <label>
              Tenure
              <span className="input-shell">
                <Clock3 size={17} />
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.tenureMonths}
                  onChange={(event) => updateField("tenureMonths", event.target.value)}
                  required
                />
              </span>
            </label>
            <label>
              Purpose
              <input
                value={form.purpose}
                onChange={(event) => updateField("purpose", event.target.value)}
                placeholder="Seeds, fertilizer, equipment"
                required
              />
            </label>
            <label>
              Crop
              <span className="input-shell">
                <Wheat size={17} />
                <input value={form.crop} onChange={(event) => updateField("crop", event.target.value)} />
              </span>
            </label>
            <label>
              Land area
              <span className="input-shell split-input">
                <Ruler size={17} />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.landArea}
                  onChange={(event) => updateField("landArea", event.target.value)}
                />
                <select value={form.landUnit} onChange={(event) => updateField("landUnit", event.target.value)}>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                  <option value="bigha">Bigha</option>
                </select>
              </span>
            </label>
          </div>

          <label>
            Farmer note
            <textarea
              value={form.farmerNote}
              onChange={(event) => updateField("farmerNote", event.target.value)}
              rows={3}
              placeholder="Optional repayment context or requested support"
            />
          </label>

          <button className="primary-button" disabled={busy}>
            <HandCoins size={18} />
            {busy ? "Submitting" : "Submit loan request"}
          </button>
        </form>
      </section>

      <LoanList loans={loans} />
    </div>
  );
}

function LoanList({ loans }) {
  if (!loans.length) {
    return (
      <div className="empty-state">
        <HandCoins size={36} />
        <h3>No loan requests</h3>
        <p>Submitted loan applications will appear here with admin decisions.</p>
      </div>
    );
  }

  return (
    <section className="loan-list" aria-label="Loan applications">
      {loans.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </section>
  );
}

function LoanCard({ loan, adminMode = false, onDecision }) {
  const [adminNote, setAdminNote] = useState(loan.adminNote || "");
  const [busy, setBusy] = useState(false);

  async function decide(status) {
    if (!onDecision) return;
    setBusy(true);
    try {
      await onDecision(loan.id, status, adminNote);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="loan-card">
      <div className="loan-card-header">
        <div>
          <span>{formatDate(loan.createdAt)}</span>
          <h3>{formatMoney(loan.amount)}</h3>
        </div>
        <span className={`status-badge ${loan.status}`}>{titleCase(loan.status)}</span>
      </div>

      <p>{loan.purpose}</p>
      <div className="analysis-tags">
        <span>{loan.tenureMonths} months</span>
        <span>{loan.crop || "Crop not set"}</span>
        <span>{loan.landArea ? `${loan.landArea} ${loan.landUnit}` : "Land not set"}</span>
        {adminMode && <span>{loan.farmerName}</span>}
      </div>

      {loan.farmerNote && <p className="loan-note">{loan.farmerNote}</p>}
      {loan.adminNote && <p className="loan-note admin-note">{loan.adminNote}</p>}

      {adminMode && (
        <div className="loan-actions">
          <textarea
            value={adminNote}
            onChange={(event) => setAdminNote(event.target.value)}
            rows={2}
            placeholder="Admin note"
          />
          <div className="action-row">
            <button className="secondary-button" disabled={busy} onClick={() => decide("approved")}>
              <CheckCircle2 size={16} />
              Approve
            </button>
            <button className="danger-button" disabled={busy} onClick={() => decide("rejected")}>
              <UserX size={16} />
              Reject
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function PasswordPanel({ token }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitPassword(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const validation = passwordClientSchema.safeParse(form);
      if (!validation.success) throw new Error(firstValidationMessage(validation));

      await apiRequest("/api/auth/password", {
        token,
        method: "PATCH",
        body: {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        }
      });

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password changed successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="form-card account-panel">
      <div className="section-heading">
        <span className="eyebrow">Account security</span>
        <h2>Change password</h2>
      </div>
      {error && <p className="error-banner">{error}</p>}
      {message && <p className="success-banner">{message}</p>}

      <form className="stack-form" onSubmit={submitPassword}>
        <label>
          Current password
          <span className="input-shell">
            <Lock size={17} />
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) => updateField("currentPassword", event.target.value)}
              required
            />
          </span>
        </label>
        <label>
          New password
          <span className="input-shell">
            <KeyRound size={17} />
            <input
              type="password"
              minLength={8}
              value={form.newPassword}
              onChange={(event) => updateField("newPassword", event.target.value)}
              required
            />
          </span>
        </label>
        <label>
          Confirm new password
          <span className="input-shell">
            <KeyRound size={17} />
            <input
              type="password"
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              required
            />
          </span>
        </label>
        <button className="primary-button" disabled={busy}>
          <KeyRound size={18} />
          {busy ? "Updating" : "Update password"}
        </button>
      </form>
    </section>
  );
}

function AnalysisHistory({ analyses, loading }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [soilFilter, setSoilFilter] = useState("all");
  const soilOptions = useMemo(
    () => [...new Set(analyses.map((analysis) => analysis.result?.soilType).filter(Boolean))].sort(),
    [analyses]
  );
  const filteredAnalyses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return analyses.filter((analysis) => {
      const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
      const matchesSoil = soilFilter === "all" || analysis.result?.soilType === soilFilter;
      const haystack = [
        analysis.result?.soilType,
        analysis.result?.summary,
        analysis.input?.crop,
        analysis.input?.location,
        analysis.result?.riskLevel
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesSoil && (!search || haystack.includes(search));
    });
  }, [analyses, query, statusFilter, soilFilter]);

  if (loading) return <div className="empty-state"><RefreshCw size={34} /><h3>Loading reports</h3></div>;
  if (!analyses.length) return <div className="empty-state"><ClipboardList size={34} /><h3>No reports yet</h3><p>Submit a field report to start history.</p></div>;

  return (
    <>
      <section className="history-toolbar">
        <label>
          Search
          <span className="input-shell">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Soil, crop, risk, location" />
          </span>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="follow_up">Follow up</option>
          </select>
        </label>
        <label>
          Soil
          <select value={soilFilter} onChange={(event) => setSoilFilter(event.target.value)}>
            <option value="all">All</option>
            {soilOptions.map((soil) => (
              <option key={soil} value={soil}>
                {soil}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button" disabled={!filteredAnalyses.length} onClick={() => exportAnalysesCsv(filteredAnalyses)}>
          <Download size={17} />
          Export CSV
        </button>
      </section>

      {filteredAnalyses.length ? (
        <div className="history-list">
          {filteredAnalyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={34} />
          <h3>No matching reports</h3>
        </div>
      )}
    </>
  );
}

function AnalysisCard({ analysis, adminMode = false, onStatusChange }) {
  return (
    <article className="analysis-card">
      {analysis.photoUrl ? <img src={analysis.photoUrl} alt="Submitted soil" /> : <div className="photo-placeholder"><ImageIcon size={24} /></div>}
      <div className="analysis-main">
        <div className="analysis-title">
          <div>
            <span>{formatDate(analysis.createdAt)}</span>
            <h3>{analysis.result.soilType}</h3>
          </div>
          <span className={`status-badge ${analysis.status}`}>{titleCase(analysis.status)}</span>
        </div>
        <p>{analysis.result.summary}</p>
        <div className="analysis-tags">
          <span>{analysis.input.crop || "Crop not set"}</span>
          <span>{analysis.input.landArea} {analysis.input.landUnit}</span>
          <span>{analysis.result.healthScore} health</span>
          {adminMode && <span>{analysis.farmerName}</span>}
        </div>
        <div className="analysis-actions">
          <button className="small-button" onClick={() => printAnalysisReport(analysis)}>
            <Download size={15} />
            Save PDF
          </button>
        </div>
        {adminMode && (
          <div className="admin-inline">
            <select value={analysis.status} onChange={(event) => onStatusChange(analysis.id, event.target.value)}>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="follow_up">Follow up</option>
            </select>
          </div>
        )}
      </div>
    </article>
  );
}

function AdminUserRow({ user, onStatusChange, onPasswordReset, onRemove }) {
  const [password, setPassword] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isFarmer = user.role === "farmer";

  async function runAction(action, task) {
    setBusyAction(action);
    setError("");
    setMessage("");
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyAction("");
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    const validation = adminPasswordClientSchema.safeParse({ password });
    if (!validation.success) {
      setError(firstValidationMessage(validation));
      return;
    }

    await runAction("password", async () => {
      await onPasswordReset(user.id, password);
      setPassword("");
      setMessage("Password reset");
    });
  }

  function handleRemove() {
    const confirmed = window.confirm(`Remove ${user.name}? Their reports and loan applications will also be removed.`);
    if (!confirmed) return;
    runAction("remove", () => onRemove(user.id));
  }

  return (
    <tr>
      <td>
        <strong>{user.name}</strong>
        {(message || error) && <span className={error ? "row-error" : "row-message"}>{error || message}</span>}
      </td>
      <td>{user.email}</td>
      <td>{titleCase(user.role)}</td>
      <td>
        <span className={`status-badge ${user.isActive ? "active-account" : "banned-account"}`}>
          {user.isActive ? "Active" : "Banned"}
        </span>
      </td>
      <td>{user.farmName || "-"}</td>
      <td>{user.analysisCount}</td>
      <td>{user.loanCount}</td>
      <td>{user.orderCount || 0}</td>
      <td>
        {isFarmer ? (
          <form className="password-reset-row" onSubmit={handlePasswordReset}>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="New password"
            />
            <button className="small-button" disabled={busyAction === "password"}>
              <KeyRound size={15} />
              Reset
            </button>
          </form>
        ) : (
          "-"
        )}
      </td>
      <td>
        {isFarmer ? (
          <div className="table-actions">
            <button
              className="small-button"
              disabled={Boolean(busyAction)}
              onClick={() => runAction("status", () => onStatusChange(user.id, !user.isActive))}
            >
              {user.isActive ? <Ban size={15} /> : <ShieldCheck size={15} />}
              {user.isActive ? "Ban" : "Unban"}
            </button>
            <button className="small-danger-button" disabled={Boolean(busyAction)} onClick={handleRemove}>
              <Trash2 size={15} />
              Remove
            </button>
          </div>
        ) : (
          "-"
        )}
      </td>
    </tr>
  );
}

function AdminDashboard({ token }) {
  const [tab, setTab] = useState("reports");
  const [analyses, setAnalyses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    const [analysisData, loanData, userData, orderData, statsData] = await Promise.all([
      apiRequest("/api/analyses", { token }),
      apiRequest("/api/loans", { token }),
      apiRequest("/api/admin/users", { token }),
      apiRequest("/api/admin/orders", { token }),
      apiRequest("/api/admin/stats", { token })
    ]);
    setAnalyses(analysisData.analyses);
    setLoans(loanData.loans);
    setUsers(userData.users);
    setOrders(orderData.orders);
    setStats(statsData.stats);
    setLoading(false);
  }

  useEffect(() => {
    loadAdminData().catch(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    const data = await apiRequest(`/api/admin/analyses/${id}/status`, {
      token,
      method: "PATCH",
      body: { status }
    });
    setAnalyses((current) => current.map((analysis) => (analysis.id === id ? data.analysis : analysis)));
    const statsData = await apiRequest("/api/admin/stats", { token });
    setStats(statsData.stats);
  }

  async function updateLoanStatus(id, status, adminNote) {
    const data = await apiRequest(`/api/admin/loans/${id}/status`, {
      token,
      method: "PATCH",
      body: { status, adminNote }
    });
    setLoans((current) => current.map((loan) => (loan.id === id ? data.loan : loan)));
    const statsData = await apiRequest("/api/admin/stats", { token });
    setStats(statsData.stats);
  }

  async function updateUserStatus(id, isActive) {
    const data = await apiRequest(`/api/admin/users/${id}/status`, {
      token,
      method: "PATCH",
      body: { isActive }
    });
    setUsers((current) => current.map((user) => (user.id === id ? data.user : user)));
  }

  async function updateOrderStatus(id, status) {
    const data = await apiRequest(`/api/admin/orders/${id}/status`, {
      token,
      method: "PATCH",
      body: { status }
    });
    setOrders((current) => current.map((order) => (order.id === id ? data.order : order)));
  }

  async function resetUserPassword(id, password) {
    await apiRequest(`/api/admin/users/${id}/password`, {
      token,
      method: "PATCH",
      body: { password }
    });
  }

  async function removeUser(id) {
    await apiRequest(`/api/admin/users/${id}`, {
      token,
      method: "DELETE"
    });
    setUsers((current) => current.filter((user) => user.id !== id));
    setAnalyses((current) => current.filter((analysis) => analysis.userId !== id));
    setLoans((current) => current.filter((loan) => loan.userId !== id));
    setOrders((current) => current.filter((order) => order.userId !== id));
    const statsData = await apiRequest("/api/admin/stats", { token });
    setStats(statsData.stats);
  }

  const topSoils = useMemo(() => {
    if (!stats?.soilCounts) return [];
    return Object.entries(stats.soilCounts).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  return (
    <div className="admin-layout">
      <section className="admin-hero">
        <div>
          <span className="eyebrow">Operations</span>
          <h1>Admin review dashboard</h1>
        </div>
        <div className="admin-metrics">
          <Metric icon={<Users size={19} />} label="Farmers" value={stats?.farmers ?? 0} />
          <Metric icon={<FlaskConical size={19} />} label="Reports" value={stats?.totalAnalyses ?? 0} />
          <Metric icon={<Clock3 size={19} />} label="Pending" value={stats?.pending ?? 0} />
          <Metric icon={<HandCoins size={19} />} label="Loan queue" value={stats?.pendingLoans ?? 0} />
          <Metric icon={<ShoppingCart size={19} />} label="Market orders" value={stats?.totalOrders ?? 0} />
        </div>
      </section>

      <div className="segmented-control admin-tabs" role="tablist" aria-label="Admin views">
        <button className={tab === "reports" ? "active" : ""} onClick={() => setTab("reports")}>
          <ClipboardList size={16} />
          Reports
        </button>
        <button className={tab === "loans" ? "active" : ""} onClick={() => setTab("loans")}>
          <HandCoins size={16} />
          Loans
        </button>
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
          <ShoppingCart size={16} />
          Orders
        </button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          <Users size={16} />
          Users
        </button>
        <button className={tab === "analytics" ? "active" : ""} onClick={() => setTab("analytics")}>
          <BarChart3 size={16} />
          Analytics
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <RefreshCw size={34} />
          <h3>Loading admin data</h3>
        </div>
      ) : (
        <>
          {tab === "reports" && (
            <AdminReportsPanel analyses={analyses} onStatusChange={updateStatus} />
          )}

          {tab === "loans" && (
            <div className="loan-list">
              {loans.length ? (
                loans.map((loan) => (
                  <LoanCard key={loan.id} loan={loan} adminMode onDecision={updateLoanStatus} />
                ))
              ) : (
                <div className="empty-state">
                  <HandCoins size={34} />
                  <h3>No loan applications</h3>
                </div>
              )}
            </div>
          )}

          {tab === "orders" && <AdminOrdersPanel orders={orders} onStatusChange={updateOrderStatus} />}

          {tab === "users" && (
            <>
              <section className="history-toolbar">
                <button className="secondary-button" disabled={!users.length} onClick={() => exportUsersCsv(users)}>
                  <Download size={17} />
                  Export users
                </button>
              </section>
              <div className="table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Farm</th>
                      <th>Reports</th>
                      <th>Loans</th>
                      <th>Orders</th>
                      <th>Password</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <AdminUserRow
                        key={user.id}
                        user={user}
                        onStatusChange={updateUserStatus}
                        onPasswordReset={resetUserPassword}
                        onRemove={removeUser}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "analytics" && <AdminAnalyticsPanel analyses={analyses} loans={loans} orders={orders} topSoils={topSoils} stats={stats} />}
        </>
      )}
    </div>
  );
}

function AdminReportsPanel({ analyses, onStatusChange }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const filteredAnalyses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return analyses.filter((analysis) => {
      const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
      const matchesRisk = riskFilter === "all" || analysis.result?.riskLevel === riskFilter;
      const haystack = [
        analysis.result?.soilType,
        analysis.result?.summary,
        analysis.input?.crop,
        analysis.input?.location,
        analysis.result?.riskLevel,
        analysis.farmerName,
        analysis.farmName
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesRisk && (!search || haystack.includes(search));
    });
  }, [analyses, query, statusFilter, riskFilter]);

  if (!analyses.length) {
    return (
      <div className="empty-state">
        <ClipboardList size={34} />
        <h3>No farmer reports</h3>
      </div>
    );
  }

  return (
    <div className="admin-stack">
      <section className="history-toolbar">
        <label>
          Search
          <span className="input-shell">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Farmer, soil, crop, location" />
          </span>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="follow_up">Follow up</option>
          </select>
        </label>
        <label>
          Risk
          <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <button className="secondary-button" disabled={!filteredAnalyses.length} onClick={() => exportAnalysesCsv(filteredAnalyses)}>
          <Download size={17} />
          Export reports
        </button>
      </section>
      {filteredAnalyses.length ? (
        <div className="history-list">
          {filteredAnalyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} adminMode onStatusChange={onStatusChange} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={34} />
          <h3>No matching reports</h3>
        </div>
      )}
    </div>
  );
}

function AdminOrdersPanel({ orders, onStatusChange }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categories = useMemo(() => [...new Set(orders.map((order) => order.category).filter(Boolean))].sort(), [orders]);
  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || order.category === categoryFilter;
      const haystack = [order.itemName, order.category, order.farmerName, order.farmName, order.farmerEmail, order.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && matchesCategory && (!search || haystack.includes(search));
    });
  }, [orders, query, statusFilter, categoryFilter]);
  const revenue = filteredOrders.reduce((total, order) => total + Number(order.totalPrice || 0), 0);
  const delivered = filteredOrders.filter((order) => order.status === "delivered").length;

  if (!orders.length) {
    return (
      <div className="empty-state">
        <ShoppingCart size={34} />
        <h3>No market orders</h3>
        <p>Farmer purchases will appear here for fulfilment tracking.</p>
      </div>
    );
  }

  return (
    <div className="admin-stack">
      <section className="metric-row">
        <Metric icon={<ShoppingCart size={19} />} label="Filtered orders" value={filteredOrders.length} />
        <Metric icon={<Wallet size={19} />} label="Order value" value={formatMoney(revenue)} />
        <Metric icon={<CheckCircle2 size={19} />} label="Delivered" value={delivered} />
      </section>
      <section className="history-toolbar">
        <label>
          Search
          <span className="input-shell">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Farmer, item, category" />
          </span>
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>
        <label>
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <button className="secondary-button" disabled={!filteredOrders.length} onClick={() => exportOrdersCsv(filteredOrders)}>
          <Download size={17} />
          Export orders
        </button>
      </section>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Farmer</th>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <strong>{order.farmerName || "Farmer"}</strong>
                  <span className="table-subtext">{order.farmerEmail || order.farmName || "-"}</span>
                </td>
                <td>{order.itemName}</td>
                <td>{order.category}</td>
                <td>{order.quantity} {order.unit}</td>
                <td>{formatMoney(order.totalPrice)}</td>
                <td><span className={`status-badge ${order.status}`}>{titleCase(order.status)}</span></td>
                <td>
                  <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)}>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!filteredOrders.length && (
        <div className="empty-state">
          <Search size={34} />
          <h3>No matching orders</h3>
        </div>
      )}
    </div>
  );
}

function AdminAnalyticsPanel({ analyses, loans, orders, topSoils, stats }) {
  const reportStatus = topEntries(analyses.map((analysis) => analysis.status), 4).map(([label, count]) => [titleCase(label), count]);
  const loanStatus = topEntries(loans.map((loan) => loan.status), 4).map(([label, count]) => [titleCase(label), count]);
  const orderStatus = topEntries(orders.map((order) => order.status), 4).map(([label, count]) => [titleCase(label), count]);
  const riskMix = topEntries(analyses.map((analysis) => analysis.result?.riskLevel), 4);
  const pendingWork = [
    ["Reports to review", analyses.filter((analysis) => analysis.status === "pending").length],
    ["Loan decisions", loans.filter((loan) => loan.status === "pending").length],
    ["Orders to deliver", orders.filter((order) => order.status !== "delivered").length]
  ];

  return (
    <div className="analytics-grid">
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Priority queue</span>
          <h2>Admin work left</h2>
        </div>
        <SignalBars entries={pendingWork} emptyLabel="Nothing pending" />
      </section>
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Soil distribution</span>
          <h2>Most common soils</h2>
        </div>
        <SignalBars entries={topSoils} emptyLabel="No soil data yet" />
      </section>
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Report workflow</span>
          <h2>Review status</h2>
        </div>
        <SignalBars entries={reportStatus} emptyLabel="No reports yet" />
      </section>
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Finance</span>
          <h2>Loan decisions</h2>
        </div>
        <SignalBars entries={loanStatus} emptyLabel="No loans yet" />
      </section>
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Market</span>
          <h2>Order fulfilment</h2>
        </div>
        <SignalBars entries={orderStatus} emptyLabel="No market orders yet" />
      </section>
      <section className="form-card">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Risk profile</span>
          <h2>Field risk</h2>
        </div>
        <SignalBars entries={riskMix} emptyLabel="No risk data yet" />
      </section>
      <section className="analytics-summary">
        <Metric icon={<Users size={19} />} label="Farmers" value={stats?.farmers ?? 0} />
        <Metric icon={<ShoppingCart size={19} />} label="Orders" value={stats?.totalOrders ?? 0} />
        <Metric icon={<CheckCircle2 size={19} />} label="Approved loans" value={stats?.approvedLoans ?? 0} />
      </section>
    </div>
  );
}

export default App;
