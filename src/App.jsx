import {
  AlertTriangle,
  BarChart3,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Droplets,
  FlaskConical,
  Gauge,
  Image as ImageIcon,
  Leaf,
  Lock,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  Ruler,
  Search,
  ShieldCheck,
  Sprout,
  Upload,
  UserPlus,
  Users,
  Wheat
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const SESSION_KEY = "krishsense-session";
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

function App() {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(Boolean(session?.token));

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
        <LoginView onLogin={handleLogin} />
        <AppFooter />
      </>
    );
  }

  return (
    <>
      <Dashboard session={session} onLogout={handleLogout} />
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

function LoginView({ onLogin }) {
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

function Dashboard({ session, onLogout }) {
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
  const [loading, setLoading] = useState(true);

  async function loadAnalyses() {
    setLoading(true);
    const data = await apiRequest("/api/analyses", { token });
    setAnalyses(data.analyses);
    setLoading(false);
  }

  useEffect(() => {
    loadAnalyses().catch(() => setLoading(false));
  }, []);

  const latest = analyses[0];
  const pending = analyses.filter((analysis) => analysis.status === "pending").length;

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
        </nav>
      </aside>

      <section className="content-area">
        <div className="metric-row">
          <Metric icon={<FlaskConical size={19} />} label="Analyses" value={analyses.length} />
          <Metric icon={<Clock3 size={19} />} label="Pending review" value={pending} />
          <Metric icon={<Leaf size={19} />} label="Latest soil" value={latest?.result.soilType || "None"} />
        </div>

        {activeView === "analysis" && <SoilAnalysisForm token={token} onCreated={loadAnalyses} />}
        {activeView === "identify" && <SoilIdentifierUpload token={token} onCreated={loadAnalyses} />}
        {activeView === "history" && <AnalysisHistory analyses={analyses} loading={loading} />}
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

function AnalysisHistory({ analyses, loading }) {
  if (loading) return <div className="empty-state"><RefreshCw size={34} /><h3>Loading reports</h3></div>;
  if (!analyses.length) return <div className="empty-state"><ClipboardList size={34} /><h3>No reports yet</h3><p>Submit a field report to start history.</p></div>;

  return (
    <div className="history-list">
      {analyses.map((analysis) => (
        <AnalysisCard key={analysis.id} analysis={analysis} />
      ))}
    </div>
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

function AdminDashboard({ token }) {
  const [tab, setTab] = useState("reports");
  const [analyses, setAnalyses] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    const [analysisData, userData, statsData] = await Promise.all([
      apiRequest("/api/analyses", { token }),
      apiRequest("/api/admin/users", { token }),
      apiRequest("/api/admin/stats", { token })
    ]);
    setAnalyses(analysisData.analyses);
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
        </div>
      </section>

      <div className="segmented-control admin-tabs" role="tablist" aria-label="Admin views">
        <button className={tab === "reports" ? "active" : ""} onClick={() => setTab("reports")}>
          <ClipboardList size={16} />
          Reports
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

          {tab === "users" && (
            <div className="table-shell">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Farm</th>
                    <th>Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{titleCase(user.role)}</td>
                      <td>{user.farmName || "-"}</td>
                      <td>{user.analysisCount}</td>
                    </tr>
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
