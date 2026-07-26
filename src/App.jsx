import {
  AlertTriangle,
  Ban,
  BarChart3,
  Banknote,
  Camera,
  CheckCircle2,
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

      {session.user.role === "admin" ? (
        <AdminDashboard token={session.token} />
      ) : (
        <FarmerDashboard token={session.token} user={session.user} />
      )}
    </main>
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
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    const [analysisData, loanData, userData, statsData] = await Promise.all([
      apiRequest("/api/analyses", { token }),
      apiRequest("/api/loans", { token }),
      apiRequest("/api/admin/users", { token }),
      apiRequest("/api/admin/stats", { token })
    ]);
    setAnalyses(analysisData.analyses);
    setLoans(loanData.loans);
    setUsers(userData.users);
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
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
          <Users size={16} />
          Users
        </button>
        <button className={tab === "soil" ? "active" : ""} onClick={() => setTab("soil")}>
          <BarChart3 size={16} />
          Soil mix
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
            <div className="history-list">
              {analyses.length ? (
                analyses.map((analysis) => (
                  <AnalysisCard key={analysis.id} analysis={analysis} adminMode onStatusChange={updateStatus} />
                ))
              ) : (
                <div className="empty-state">
                  <ClipboardList size={34} />
                  <h3>No farmer reports</h3>
                </div>
              )}
            </div>
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

          {tab === "users" && (
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
          )}

          {tab === "soil" && (
            <div className="soil-mix-grid">
              {topSoils.length ? (
                topSoils.map(([soil, count]) => (
                  <div className="soil-mix-card" key={soil}>
                    <strong>{soil}</strong>
                    <span>{count} report{count === 1 ? "" : "s"}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <BarChart3 size={34} />
                  <h3>No soil data</h3>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
