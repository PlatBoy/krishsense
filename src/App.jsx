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
  Globe,
  HandCoins,
  ChevronDown,
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
import { useEffect, useMemo, useRef, useState } from "react";
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

function assistantAnswerLines(answer) {
  return String(answer || "")
    .replace(/\r/g, "\n")
    .split(/\n+/)
    .flatMap((line) => line.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [line])
    .map((line) => line.trim().replace(/^[-*\d.]+\s*/, ""))
    .filter(Boolean);
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
        <LoginView
          onLogin={handleLogin}
          theme={theme}
          onThemeToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
        />
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
        </nav>
      </aside>
      
      {/* Viewport for the active section goes here */}
      <section className="dashboard-content">
         {/* Placeholder for the selected dashboard view (Analysis, Identify, etc.) */}
      </section>
    </div>
  );
}

// Ensure AdminDashboard is implemented if referenced above.
function AdminDashboard({ token }) {
   return <div>Admin View Placeholder</div>;
}

export default App;
