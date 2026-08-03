import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import logo from "../assets/logo.jpeg";
import ThemeToggle from "../components/ThemeToggle";

const getLocalTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const NAV_ITEMS = [
  {
    key: "home",
    label: "Home",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    key: "teachers",
    label: "List Teachers",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    key: "coberturas",
    label: "Coberturas Creadas",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  }
];

const PERIODS = [
  { id: "1ra", label: "1ra hora", inicio: "07:00", fin: "07:55" },
  { id: "2da", label: "2da hora", inicio: "07:55", fin: "08:50" },
  { id: "3ra", label: "3ra hora", inicio: "08:50", fin: "09:45" },
  { id: "DP",  label: "D.P.",     inicio: "09:45", fin: "10:05" },
  { id: "4ta", label: "4ta hora", inicio: "10:05", fin: "11:00" },
  { id: "5ta", label: "5ta hora", inicio: "11:00", fin: "11:55" },
  { id: "Alm", label: "Almuerzo", inicio: "11:55", fin: "12:25" },
  { id: "6ta", label: "6ta hora", inicio: "12:25", fin: "13:20" },
  { id: "7ma", label: "7ma hora", inicio: "13:20", fin: "14:15" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const isClaseActual = (horaInicio, horaFin) => {
  try {
    const ahora = new Date();
    const [hI, mI] = horaInicio.split(":").map(Number);
    const [hF, mF] = horaFin.split(":").map(Number);
    const ini = new Date(ahora); ini.setHours(hI, mI, 0, 0);
    const fin = new Date(ahora); fin.setHours(hF, mF, 0, 0);
    return ahora >= ini && ahora <= fin;
  } catch { return false; }
};

const isClaseFutura = (horaInicio) => {
  try {
    const ahora = new Date();
    const [h, m] = horaInicio.split(":").map(Number);
    const ini = new Date(ahora); ini.setHours(h, m, 0, 0);
    return ahora < ini;
  } catch { return false; }
};

const getLocalTimeStr = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch { return ""; }
};

const getClaseEnPeriodo = (clases, period) =>
  clases?.find((c) => c.hora_inicio === period.inicio && c.hora_fin === period.fin) || null;

const isClaseConNovedadAprobada = (clase, novedadesHoy) => {
  if (!novedadesHoy?.length) return false;
  return novedadesHoy.some((nov) => {
    if (nov.id_tipo_novedad === 1) return true;
    try {
      const desc = typeof nov.descripcion === "string" ? JSON.parse(nov.descripcion) : nov.descripcion;
      return desc?.clases_afectadas?.some((ca) => ca.id_horario === clase.id_horario);
    } catch { return false; }
  });
};

const isClaseConPermiso = (clase, permisosHoy) => {
  if (!permisosHoy?.length) return false;
  return permisosHoy.some((perm) => {
    try {
      const desc = typeof perm.descripcion === "string" ? JSON.parse(perm.descripcion) : perm.descripcion;
      if (desc?.clases_afectadas?.length > 0) {
        return desc.clases_afectadas.some((ca) => ca.id_horario === clase.id_horario);
      }
      return true;
    } catch {
      return true;
    }
  });
};

const categorizeDocente = (d) => {
  if (!d.clases.length) return "libre";
  const estaPresente = ["PRESENTE", "TARDANZA", "FINALIZADO", "SALIDA_TEMPRANA"].includes(d.estado);
  if (estaPresente) return "presente";
  const todasFuturas = d.clases.every((c) => isClaseFutura(c.hora_inicio));
  return todasFuturas ? "pendiente" : "falta";
};

// ── SidebarItem ───────────────────────────────────────────────────────────────
function SidebarItem({ icon, label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "11px 16px", border: "none", borderRadius: 8, cursor: "pointer",
        background: active ? "rgba(255,255,255,0.15)" : hov ? "rgba(255,255,255,0.08)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.65)",
        fontFamily: "Hanken Grotesk, sans-serif", fontSize: 14,
        fontWeight: active ? 600 : 400, textAlign: "left",
      }}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        {icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
      </svg>
      {label}
    </button>
  );
}

// ── EstadoBadge ───────────────────────────────────────────────────────────────
function EstadoBadge({ estado }) {
  const map = {
    PRESENTE:        { label: "Presente",       bg: "#dcfce7", color: "#166534", dot: "#16a34a" },
    TARDANZA:        { label: "Tardanza",        bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    FINALIZADO:      { label: "Finalizado",      bg: "#e0f2fe", color: "#0369a1", dot: "#0ea5e9" },
    SALIDA_TEMPRANA: { label: "Salida Temprana", bg: "#f3e8ff", color: "#6b21a8", dot: "#9333ea" },
    NO_PRESENTE:     { label: "No Presente",     bg: "#fee2e2", color: "#991b1b", dot: "#dc2626" },
  };
  const s = map[estado] || { label: estado, bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

// ── TeacherCard ───────────────────────────────────────────────────────────────
function TeacherCard({ docente, categoria }) {
  const catStyle = {
    presente:  { border: "#16a34a", accent: "#dcfce7" },
    falta:     { border: "#dc2626", accent: "#fee2e2" },
    pendiente: { border: "#f59e0b", accent: "#fef9c3" },
    libre:     { border: "var(--card-border)", accent: "var(--card-subbg)" },
  }[categoria] || { border: "var(--card-border)", accent: "var(--card-subbg)" };

  return (
    <div style={{
      background: "var(--card-bg)", border: `1.5px solid ${catStyle.border}`,
      borderRadius: 12, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
            {docente.nombre} {docente.apellido}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Doc: {docente.documento || "—"}</div>
        </div>
        <EstadoBadge estado={docente.estado} />
      </div>

      {docente.clases.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {docente.clases.map((c, i) => {
            const activa = isClaseActual(c.hora_inicio, c.hora_fin);
            const isPed = c.nombre === "HORA PEDAGOGICA";
            return (
              <span key={i} style={{
                fontSize: 10, fontWeight: 700,
                background: activa ? (isPed ? "#f3e8ff" : "#dbeafe") : (isPed ? "#f3e8ff" : catStyle.accent),
                color: activa ? (isPed ? "#6b21a8" : "#1d4ed8") : (isPed ? "#6b21a8" : "var(--text-main)"),
                border: activa ? (isPed ? "1.5px solid #c084fc" : "1.5px solid #93c5fd") : (isPed ? "1.5px solid #c084fc" : "1px solid var(--card-border)"),
                padding: "2px 7px", borderRadius: 4,
              }}>
                {c.hora_inicio}–{c.hora_fin} · {isPed ? "Hora Pedagógica" : c.nombre} ({c.bloque})
              </span>
            );
          })}
        </div>
      ) : (
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>Sin clases hoy</span>
      )}

      {docente.hora_entrada && (
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Entrada: <strong>{getLocalTimeStr(docente.hora_entrada)}</strong>
          {docente.hora_salida && <> · Salida: <strong>{getLocalTimeStr(docente.hora_salida)}</strong></>}
        </div>
      )}
    </div>
  );
}

// ── TeacherGroup ──────────────────────────────────────────────────────────────
function TeacherGroup({ title, subtitle, color, icon, docentes, categoria, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 24 }}>
      <button onClick={() => setOpen((o) => !o)} style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%",
        background: "none", border: "none", cursor: "pointer",
        padding: "0 0 12px", borderBottom: "2px solid " + color,
        marginBottom: 14, textAlign: "left",
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: "50%", background: color,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0,
        }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>{title}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>
        </div>
        <span style={{
          minWidth: 26, height: 26, borderRadius: "50%", background: color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, color: "#fff", marginRight: 8,
        }}>{docentes.length}</span>
        <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        docentes.length === 0
          ? <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0 16px" }}>No hay docentes en esta categoría ahora mismo.</div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {docentes.map((d) => <TeacherCard key={d.id_usuario} docente={d} categoria={categoria} />)}
            </div>
      )}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────
export default function DashboardCoordinador() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]     = useState("home");
  const [usuario, setUsuario]         = useState(null);
  const [horariosGlobales, setHorariosGlobales] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searchTeachers, setSearchTeachers] = useState("");
  const [signOutHovered, setSignOutHovered] = useState(false);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

  // Estados para coberturas
  const [coberturas, setCoberturas] = useState([]);
  const [showModalCobertura, setShowModalCobertura] = useState(false);
  const [selectedClase, setSelectedClase] = useState(null); // { docente, clase, period, fecha }
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  const [loadingDisponibles, setLoadingDisponibles] = useState(false);
  const [selectedDocenteCobertura, setSelectedDocenteCobertura] = useState("");
  const [observacionCobertura, setObservacionCobertura] = useState("");
  const [guardandoCobertura, setGuardandoCobertura] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resUser, resGlobal, resCoberturas] = await Promise.all([
        axios.get("/auth/me").catch(() => null),
        axios.get("/horario/global/hoy"),
        axios.get("/coberturas").catch(() => ({ data: [] })),
      ]);
      if (resUser?.data) setUsuario(resUser.data);
      setHorariosGlobales(resGlobal.data || []);
      setCoberturas(resCoberturas?.data || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (docente, clase, period) => {
    setSelectedClase({ docente, clase, period, fecha: new Date() });
    setSelectedDocenteCobertura("");
    setObservacionCobertura("");
    setShowModalCobertura(true);
    
    setLoadingDisponibles(true);
    try {
      const hoyStr = getLocalTodayStr();
      const res = await axios.get(`/coberturas/disponibles?fecha=${hoyStr}&id_horario=${clase.id_horario}`);
      setDocentesDisponibles(res.data || []);
    } catch (err) {
      console.error("Error al obtener docentes disponibles:", err);
    } finally {
      setLoadingDisponibles(false);
    }
  };

  const handleGuardarCobertura = async () => {
    if (!selectedDocenteCobertura) {
      alert("Por favor selecciona un docente para la cobertura.");
      return;
    }
    
    setGuardandoCobertura(true);
    try {
      const hoyStr = getLocalTodayStr();
      await axios.post("/coberturas", {
        fecha: hoyStr,
        id_docente_ausente: selectedClase.docente.id_usuario,
        id_docente_cobertura: parseInt(selectedDocenteCobertura),
        id_horario: selectedClase.clase.id_horario,
        observacion: observacionCobertura
      });
      
      setShowModalCobertura(false);
      loadData();
    } catch (err) {
      console.error("Error al guardar cobertura:", err);
      alert(err.response?.data?.message || "Ocurrió un error al guardar la cobertura.");
    } finally {
      setGuardandoCobertura(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => { localStorage.removeItem("token"); navigate("/login"); };

  // ── Stats ──
  const todayStr = getLocalTodayStr();
  const docentesConClaseHoy    = horariosGlobales.filter((d) => d.clases.length > 0).length;
  const docentesRegistradosHoy = horariosGlobales.filter((d) =>
    d.clases.length > 0 && ["PRESENTE","TARDANZA","FINALIZADO","SALIDA_TEMPRANA"].includes(d.estado)
  ).length;
  const salonesCubiertos       = horariosGlobales.reduce((a, d) => a + d.clases.length, 0);
  const totalInasistenciasHoy  = horariosGlobales.filter((d) => d.estado === "NO_PRESENTE" && d.clases.length > 0).length;
  const totalTardanzasHoy      = horariosGlobales.filter((d) => d.estado === "TARDANZA").length;
  const totalSalidasTempranas  = horariosGlobales.filter((d) => d.estado === "SALIDA_TEMPRANA").length;
  
  // Coberturas asignadas para hoy
  const coberturasHoy = coberturas.filter((c) => c.fecha && c.fecha.split("T")[0] === todayStr);

  // Coberturas verdaderamente activas en el momento actual
  const coberturasActivasAhora = coberturasHoy.filter((c) => {
    if (c.horario?.hora_inicio && c.horario?.hora_fin) {
      return isClaseActual(c.horario.hora_inicio, c.horario.hora_fin);
    }
    for (const doc of horariosGlobales) {
      const claseMatch = doc.clases?.find((cl) => cl.id_horario === c.id_horario);
      if (claseMatch) {
        return isClaseActual(claseMatch.hora_inicio, claseMatch.hora_fin);
      }
    }
    return false;
  }).length;

  // ── Categorización ──
  const docentesFiltrados = horariosGlobales.filter((d) => {
    const q = searchTeachers.toLowerCase();
    return `${d.nombre} ${d.apellido}`.toLowerCase().includes(q) || (d.documento || "").toLowerCase().includes(q);
  });
  const presentes  = docentesFiltrados.filter((d) => categorizeDocente(d) === "presente");
  const faltan     = docentesFiltrados.filter((d) => categorizeDocente(d) === "falta");
  const pendientes = docentesFiltrados.filter((d) => categorizeDocente(d) === "pendiente");
  const libres     = docentesFiltrados.filter((d) => categorizeDocente(d) === "libre");

  // ── Vista Home ──
  const renderHome = () => (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Clases programadas hoy",  value: salonesCubiertos.toString().padStart(2,"0"),  sub: "Todas las horas académicas",       color: "#1F294D" },
          { label: "Docentes con clase hoy",   value: `${docentesRegistradosHoy.toString().padStart(2,"0")} / ${docentesConClaseHoy.toString().padStart(2,"0")}`, sub: "Registrados / Programados hoy", color: "#1A994D" },
          { label: "Coberturas activas ahora", value: coberturasActivasAhora.toString().padStart(2,"0"), sub: `Asignadas hoy: ${coberturasHoy.length.toString().padStart(2,"0")} | Inasistencias: ${totalInasistenciasHoy.toString().padStart(2,"0")}`, color: "#ea580c", info: true },
          { label: "Total Coberturas",         value: coberturas.length.toString().padStart(2,"0"), sub: "Total histórico de coberturas",   color: "#f97316", info: true },
          { label: "Tardanzas hoy",            value: totalTardanzasHoy.toString().padStart(2,"0"),  sub: "Docentes con llegada tarde",        color: "#c2410c", warning: totalTardanzasHoy > 0 },
          { label: "Salidas tempranas hoy",    value: totalSalidasTempranas.toString().padStart(2,"0"), sub: "Docentes retirados antes",       color: "#6b21a8", info: totalSalidasTempranas > 0 },
        ].map((c) => (
          <div key={c.label} style={{
            background: "var(--card-bg)",
            border: c.urgent ? "2.5px solid #ef4444" : c.warning ? "2.5px solid #f97316" : c.info ? "2.5px solid #ea580c" : "1px solid var(--card-border)",
            borderRadius: 12, padding: "18px 20px", position: "relative",
          }}>
            {c.urgent  && <span style={{ position:"absolute",top:12,right:12,background:"#dc2626",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20 }}>ALERTA</span>}
            {c.warning && <span style={{ position:"absolute",top:12,right:12,background:"#f97316",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20 }}>TARDE</span>}
            {c.info    && <span style={{ position:"absolute",top:12,right:12,background:"#ea580c",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20 }}>ACTIVA</span>}
            <p style={{ margin:0,fontSize:11,color:"var(--text-muted)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em" }}>{c.label}</p>
            <p style={{ margin:"6px 0 4px",fontSize:32,fontWeight:700,color:c.color,lineHeight:1 }}>{c.value}</p>
            <p style={{ margin:0,fontSize:12,color:c.urgent?"#b91c1c":c.warning?"#c2410c":c.info?"#ea580c":"var(--text-muted)",fontWeight:(c.urgent||c.warning||c.info)?600:400 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:12,overflow:"hidden",marginBottom:28 }}>
        <div style={{ padding:"16px 20px",borderBottom:"1px solid var(--card-border)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div>
            <h2 style={{ margin:0,fontSize:16,fontWeight:700,color:"var(--text-title)",fontFamily:"Hanken Grotesk, sans-serif" }}>Horario Global de Docentes (Hoy)</h2>
            <p style={{ margin:"2px 0 0",fontSize:12,color:"var(--text-muted)" }}>Docentes asignados hoy, sus horas y estado de asistencia en tiempo real. Haz clic en las celdas sin cobertura para asignar un reemplazo.</p>
          </div>
          <button onClick={loadData} style={{ display:"flex",alignItems:"center",gap:6,background:"var(--card-subbg)",border:"1px solid var(--card-border)",borderRadius:6,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:600,color:"var(--text-main)" }}>
            🔄 Actualizar
          </button>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:900 }}>
            <thead>
              <tr style={{ background:"var(--table-header-bg)" }}>
                <th style={{ padding:"10px 16px",textAlign:"left",fontWeight:700,color:"var(--text-muted)",fontSize:11,borderBottom:"1px solid var(--card-border)",textTransform:"uppercase" }}>Docente</th>
                {PERIODS.map((p) => (
                  <th key={p.id} style={{ padding:"10px 16px",textAlign:"center",fontWeight:700,color:"var(--text-muted)",fontSize:11,borderBottom:"1px solid var(--card-border)",textTransform:"uppercase" }}>
                    {p.id}<div style={{ fontSize:9,fontWeight:400,color:"var(--text-muted)",marginTop:2 }}>{p.inicio}</div>
                  </th>
                ))}
                <th style={{ padding:"10px 16px",textAlign:"center",fontWeight:700,color:"var(--text-muted)",fontSize:11,borderBottom:"1px solid var(--card-border)",textTransform:"uppercase" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={PERIODS.length+2} style={{ padding:"40px",textAlign:"center",color:"var(--text-muted)",fontStyle:"italic" }}>Cargando horarios...</td></tr>
              ) : horariosGlobales.length === 0 ? (
                <tr><td colSpan={PERIODS.length+2} style={{ padding:"40px",textAlign:"center",color:"var(--text-muted)",fontStyle:"italic" }}>No hay docentes registrados.</td></tr>
              ) : horariosGlobales.map((docente) => {
                const salStr = getLocalTimeStr(docente.hora_salida);
                return (
                  <tr key={docente.id_usuario} style={{ borderBottom:"1px solid var(--table-row-border)" }}>
                    <td style={{ padding:"12px 16px",fontWeight:700,color:"var(--text-main)" }}>{docente.nombre} {docente.apellido}</td>
                    {PERIODS.map((period) => {
                      const clase = getClaseEnPeriodo(docente.clases, period);
                      const isBreak = period.id === "DP" || period.id === "Alm";

                      // Buscar si ya tiene una cobertura creada hoy para este horario
                      const coberturaAsignada = clase && coberturas.find(c => {
                        const cobDateStr = c.fecha.split("T")[0];
                        return cobDateStr === todayStr && c.id_horario === clase.id_horario;
                      });

                      const isCob = clase && clase.nombre !== "HORA PEDAGOGICA" && !coberturaAsignada && (
                        docente.estado === "NO_PRESENTE" ||
                        (docente.estado === "SALIDA_TEMPRANA" && clase.hora_fin > salStr)
                      );
                      const tieneNovedad = clase && !coberturaAsignada && isClaseConNovedadAprobada(clase, docente.novedadesHoy);
                      const tienePermiso = clase && !coberturaAsignada && isClaseConPermiso(clase, docente.permisosHoy);
                      const isPed = clase && clase.nombre === "HORA PEDAGOGICA";

                      const bg     = coberturaAsignada ? "#ffedd5" : tienePermiso ? "#dcfce7" : tieneNovedad ? "#dbeafe" : isPed ? "#f3e8ff" : isCob ? "#fee2e2" : isBreak ? "#fef3c7" : clase ? "#e0f2fe" : "transparent";
                      const border = coberturaAsignada ? "2px solid #f97316" : tienePermiso ? "2px solid #16a34a" : tieneNovedad ? "2px solid #1d4ed8" : isPed ? "1px solid #c084fc" : isCob ? "2px solid #ef4444" : `1px solid ${isBreak?"#fbbf24":clase?"#38bdf8":"#f1f5f9"}`;
                      const color  = coberturaAsignada ? "#ea580c" : tienePermiso ? "#166534" : tieneNovedad ? "#1e40af" : isPed ? "#6b21a8" : isCob ? "#991b1b" : isBreak ? "#92400e" : "#0369a1";
                      const isClickable = !coberturaAsignada && !isPed && (isCob || tieneNovedad || tienePermiso);

                      // Animación: pulseOrange si tiene cobertura asignada (titila en naranja), pulseRed si falta cobertura (titila en rojo)
                      const animation = (isCob && !tieneNovedad && !tienePermiso && !isPed)
                        ? "pulseRed 1.8s infinite ease-in-out"
                        : (coberturaAsignada ? "pulseOrange 1.8s infinite ease-in-out" : "none");

                      const boxShadow = (isCob && !tieneNovedad && !tienePermiso && !isPed)
                        ? "0 0 14px rgba(239, 68, 68, 0.55)"
                        : (coberturaAsignada ? "0 0 14px rgba(249, 115, 22, 0.55)" : "none");

                      return (
                        <td key={period.id} style={{ padding:"10px 8px",textAlign:"center" }}>
                          {clase ? (
                            <div 
                              onClick={() => isClickable && handleCellClick(docente, clase, period)}
                              style={{ 
                                background:bg,border,color,padding:"4px 6px",borderRadius:6,fontWeight:800,fontSize:11,whiteSpace:"nowrap",display:"inline-block",
                                cursor: isClickable ? "pointer" : "default",
                                transition: "all 0.2s",
                                transform: "scale(1)",
                                animation,
                                boxShadow,
                              }} 
                              title={coberturaAsignada ? `Cubierto por ${coberturaAsignada.docente_cobertura?.nombre} ${coberturaAsignada.docente_cobertura?.apellido}` : `${clase.nombre} (${clase.bloque})`}
                              onMouseEnter={(e) => { if(isClickable) e.currentTarget.style.transform = "scale(1.06)"; }}
                              onMouseLeave={(e) => { if(isClickable) e.currentTarget.style.transform = "scale(1)"; }}
                            >
                              {clase.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : clase.nombre}
                              <div style={{ fontSize:9,opacity:0.8,fontWeight:600 }}>{clase.bloque}</div>
                              {isCob && !tieneNovedad && !tienePermiso && <div style={{ fontSize:8,background:"#dc2626",color:"#fff",borderRadius:3,padding:"1px 4px",marginTop:2,fontWeight:700 }}>SIN COBERTURA</div>}
                              {tieneNovedad && !tienePermiso && <div style={{ fontSize:8,background:"#1d4ed8",color:"#fff",borderRadius:3,padding:"1px 4px",marginTop:2,fontWeight:700 }}>NOVEDAD</div>}
                              {tienePermiso && <div style={{ fontSize:8,background:"#16a34a",color:"#fff",borderRadius:3,padding:"1px 4px",marginTop:2,fontWeight:700 }}>PERMISO</div>}
                              {coberturaAsignada && (
                                <div style={{ fontSize:8,background:"#ea580c",color:"#fff",borderRadius:3,padding:"1px 4px",marginTop:2,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:2 }}>
                                  <span>🟠 CUBIERTO:</span> {coberturaAsignada.docente_cobertura?.nombre?.substring(0, 1)}. {coberturaAsignada.docente_cobertura?.apellido}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div style={{ width:"100%",height:28,borderRadius:5,background:isBreak?"#fef3c7":"#f8fafc",border:isBreak?"1px dashed #fbbf24":"1px solid #f1f5f9",display:"inline-block" }} />
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding:"10px 16px",textAlign:"center" }}><EstadoBadge estado={docente.estado} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`
        @keyframes pulseRed{0%,100%{opacity:1;box-shadow:0 0 14px rgba(239,68,68,0.6)}50%{opacity:0.65;box-shadow:0 0 4px rgba(239,68,68,0.2)}}
        @keyframes pulseOrange{0%,100%{opacity:1;box-shadow:0 0 14px rgba(249,115,22,0.6)}50%{opacity:0.65;box-shadow:0 0 4px rgba(249,115,22,0.2)}}
      `}</style>
    </>
  );

  // ── Vista List Teachers ──
  const renderListTeachers = () => (
    <>
      <div style={{ background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:10 }}>
        <svg width="16" height="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input type="text" placeholder="Buscar docente por nombre o documento..."
          value={searchTeachers} onChange={(e) => setSearchTeachers(e.target.value)}
          style={{ flex:1,border:"none",outline:"none",fontSize:13,color:"var(--text-main)",background:"transparent",fontFamily:"Hanken Grotesk, sans-serif" }} />
        {searchTeachers && <button onClick={() => setSearchTeachers("")} style={{ background:"none",border:"none",cursor:"pointer",color:"#94a3b8",fontSize:16 }}>✕</button>}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:12,marginBottom:24 }}>
        {[
          { label:"Presentes",  count:presentes.length,  bg:"#dcfce7",color:"#166534",icon:"✅" },
          { label:"Faltan",     count:faltan.length,     bg:"#fee2e2",color:"#991b1b",icon:"❌" },
          { label:"Por llegar", count:pendientes.length, bg:"#fef9c3",color:"#92400e",icon:"⏳" },
          { label:"Sin clase",  count:libres.length,     bg:"#f1f5f9",color:"#475569",icon:"📅" },
        ].map((s) => (
          <div key={s.label} style={{ background:s.bg,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:22 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:24,fontWeight:700,color:s.color,lineHeight:1 }}>{s.count}</div>
              <div style={{ fontSize:11,color:s.color,fontWeight:600,marginTop:2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign:"center",padding:"48px 0",color:"#64748b",fontSize:14,fontStyle:"italic" }}>Cargando listado de docentes...</div>
      ) : (
        <>
          <TeacherGroup title="Docentes Presentes" subtitle="Ya registraron entrada y están en la institución" color="#16a34a" icon="✅" docentes={presentes} categoria="presente" defaultOpen={true} />
          <TeacherGroup title="Docentes que Faltan" subtitle="Tienen clase ahora o ya pasada, pero no han registrado entrada" color="#dc2626" icon="❌" docentes={faltan} categoria="falta" defaultOpen={true} />
          <TeacherGroup title="Deben Asistir — Aún No Les Toca" subtitle="Tienen clases hoy pero todas están en el futuro" color="#f59e0b" icon="⏳" docentes={pendientes} categoria="pendiente" defaultOpen={true} />
          <TeacherGroup title="Sin Clases Hoy" subtitle="No tienen clases programadas para el día de hoy" color="#94a3b8" icon="📅" docentes={libres} categoria="libre" defaultOpen={true} />
        </>
      )}
    </>
  );

  const renderCoberturas = () => (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Registro de Coberturas Creadas</h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Lista completa de coberturas asignadas y realizadas en la institución.</p>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
          <thead>
            <tr style={{ background: "var(--table-header-bg)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Fecha</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Docente Ausente</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Reemplazo (Cobertura)</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Clase / Bloque</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Horas</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {coberturas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                  No se han registrado coberturas aún.
                </td>
              </tr>
            ) : (
              coberturas.map((c) => (
                <tr key={c.id_cobertura} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-main)" }}>
                    {(() => {
                      const [year, month, day] = c.fecha.split("T")[0].split("-");
                      return `${day}/${month}/${year}`;
                    })()}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-main)" }}>
                    {c.docente_ausente ? `${c.docente_ausente.nombre} ${c.docente_ausente.apellido}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--text-title)" }}>
                    {c.docente_cobertura ? `${c.docente_cobertura.nombre} ${c.docente_cobertura.apellido}` : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-main)" }}>
                    <div style={{ fontWeight: 600 }}>{c.horario?.nombre}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Bloque: {c.horario?.bloque} ({c.horario?.hora_inicio} – {c.horario?.hora_fin})</div>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <span style={{ background: "#eff6ff", color: "#1e40af", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                      {c.horas} {c.horas === 1 ? "hora" : "horas"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-main)", fontStyle: c.observacion ? "normal" : "italic" }}>
                    {c.observacion || "Sin observaciones"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"var(--bg-main)",fontFamily:"Hanken Grotesk, sans-serif" }}>
      {isMobile && (
        <header style={{ background:"#112D55",padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",color:"#fff",position:"fixed",top:0,left:0,right:0,zIndex:99,boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
              <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontSize:14,fontWeight:700 }}>CHECKTIME</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <ThemeToggle compact />
            <button onClick={handleSignOut} style={{ background:"rgba(239,68,68,0.15)",border:"none",color:"#f87171",cursor:"pointer",fontSize:12,fontWeight:700,padding:"6px 12px",borderRadius:6 }}>Salir</button>
          </div>
        </header>
      )}

      {isMobile ? (
        <aside style={{ position:"fixed",bottom:0,left:0,right:0,height:62,background:"#112D55",zIndex:1000,display:"flex",justifyContent:"space-around",alignItems:"center",padding:"0 6px",borderTop:"1px solid rgba(255,255,255,0.1)" }}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <button key={item.key} onClick={() => setActiveNav(item.key)} style={{ background:"none",border:"none",color:active?"#fff":"rgba(255,255,255,0.5)",display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flex:1,padding:"6px 0",gap:3 }}>
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  {item.icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
                </svg>
                <span style={{ fontSize:9,fontWeight:active?700:500 }}>{item.label}</span>
              </button>
            );
          })}
        </aside>
      ) : (
        <aside style={{ width:220,flexShrink:0,background:"#112D55",display:"flex",flexDirection:"column",padding:"20px 12px",position:"sticky",top:0,height:"100vh" }}>
          <div style={{ padding:"8px 4px 24px",borderBottom:"1px solid rgba(255,255,255,0.12)",marginBottom:12 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
                <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color:"#fff",fontSize:15,fontWeight:700,lineHeight:1 }}>CHECKTIME</div>
                <div style={{ color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:2 }}>Coordinación</div>
              </div>
            </div>
          </div>
          <div style={{ display:"flex",flexDirection:"column",gap:2,flex:1 }}>
            {NAV_ITEMS.map((item) => (
              <SidebarItem key={item.key} icon={item.icon} label={item.label} active={activeNav===item.key} onClick={() => setActiveNav(item.key)} />
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.12)",paddingTop:16,display:"flex",flexDirection:"column",gap:8 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 4px",marginBottom:4 }}>
              <span style={{ fontSize:11,color:"rgba(255,255,255,0.7)",fontWeight:600 }}>Tema</span>
              <ThemeToggle compact />
            </div>
            {usuario && (
              <div style={{ padding:"8px 12px",background:"rgba(255,255,255,0.07)",borderRadius:8,marginBottom:4 }}>
                <div style={{ color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:700 }}>{usuario.nombre} {usuario.apellido}</div>
                <div style={{ color:"rgba(255,255,255,0.45)",fontSize:10,marginTop:2 }}>Coordinador</div>
              </div>
            )}
            <button onClick={handleSignOut} onMouseEnter={() => setSignOutHovered(true)} onMouseLeave={() => setSignOutHovered(false)}
              style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 16px",background:signOutHovered?"rgba(220,38,38,0.12)":"transparent",border:"none",borderRadius:8,color:signOutHovered?"#ff6b6b":"rgba(255,255,255,0.55)",fontSize:14,cursor:"pointer" }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </aside>
      )}

      <main style={{ flex:1,padding:isMobile?"78px 16px 84px":"28px 32px",maxWidth:isMobile?"100%":"calc(100vw - 220px)",overflowY:"auto",boxSizing:"border-box" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28 }}>
          <div>
            <h1 style={{ margin:0,fontSize:isMobile?22:26,fontWeight:700,color:"#091437",fontFamily:"Hanken Grotesk, sans-serif" }}>
              {activeNav === "home" ? "Gestión Académica" : activeNav === "teachers" ? "Listado de Docentes" : "Coberturas Creadas"}
            </h1>
            <p style={{ margin:"4px 0 0",fontSize:12,color:"#64748b" }}>
              Panel de Coordinación — {new Date().toLocaleDateString("es-CO",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>
          {activeNav==="home" && (
            <button onClick={loadData} style={{ display:"flex",alignItems:"center",gap:6,background:"#1F294D",border:"none",borderRadius:8,padding:"8px 14px",fontSize:12,cursor:"pointer",fontWeight:700,color:"#fff" }}>
              🔄 Actualizar
            </button>
          )}
        </div>
        {activeNav === "home" ? renderHome() : activeNav === "teachers" ? renderListTeachers() : renderCoberturas()}
        <p style={{ fontSize:12,color:"#94a3b8",textAlign:"center",marginTop:40 }}>
          Coordinador: {usuario?`${usuario.nombre} ${usuario.apellido}`:" "}
        </p>
      </main>

      {showModalCobertura && selectedClase && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(9, 20, 55, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: 16
        }}>
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, width: "100%", maxWidth: 480,
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ background: "#1F294D", padding: "20px 24px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif" }}>Asignar Cobertura</h3>
              <button onClick={() => setShowModalCobertura(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 20 }}>✕</button>
            </div>
            
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Clase Info */}
              <div style={{ background: "var(--card-subbg)", padding: "14px 16px", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Clase a Cubrir</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-title)", marginTop: 4 }}>{selectedClase.clase.nombre}</div>
                <div style={{ fontSize: 13, color: "var(--text-main)", marginTop: 2 }}>
                  Bloque: <strong>{selectedClase.clase.bloque}</strong> ({selectedClase.clase.hora_inicio} – {selectedClase.clase.hora_fin})
                </div>
                <div style={{ fontSize: 13, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>
                  Ausente: {selectedClase.docente.nombre} {selectedClase.docente.apellido}
                </div>
              </div>
              
              {/* Docente Selección */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                  Seleccionar Docente de Reemplazo
                </label>
                {loadingDisponibles ? (
                  <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "10px", textAlign: "center", fontStyle: "italic" }}>
                    Buscando profesores disponibles...
                  </div>
                ) : docentesDisponibles.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#ef4444", padding: "10px", textAlign: "center", background: "#fee2e2", borderRadius: 8, fontWeight: 600 }}>
                    ⚠️ No hay profesores disponibles en este bloque hoy.
                  </div>
                ) : (
                  <select
                    value={selectedDocenteCobertura}
                    onChange={(e) => setSelectedDocenteCobertura(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--card-border)",
                      outline: "none", fontSize: 14, fontFamily: "Hanken Grotesk, sans-serif", background: "var(--card-bg)", color: "var(--text-main)"
                    }}
                  >
                    <option value="">-- Seleccionar Profesor Disponible --</option>
                    {docentesDisponibles.map((doc) => (
                      <option key={doc.id_usuario} value={doc.id_usuario}>
                        {doc.nombre} {doc.apellido} ({doc.coberturasMes} {doc.coberturasMes === 1 ? "cob." : "cobs."} este mes)
                      </option>
                    ))}
                  </select>
                )}
                {docentesDisponibles.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                    * Listados en orden: menor cantidad de coberturas en el mes primero.
                  </div>
                )}
              </div>
              
              {/* Observación */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
                  Observaciones (Opcional)
                </label>
                <textarea
                  value={observacionCobertura}
                  onChange={(e) => setObservacionCobertura(e.target.value)}
                  placeholder="Instrucciones adicionales para la cobertura..."
                  rows="3"
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--card-border)",
                    outline: "none", fontSize: 14, fontFamily: "Hanken Grotesk, sans-serif", resize: "none",
                    boxSizing: "border-box", background: "var(--card-bg)", color: "var(--text-main)"
                  }}
                />
              </div>
            </div>
            
            <div style={{ background: "var(--card-subbg)", padding: "16px 24px", borderTop: "1px solid var(--card-border)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={() => setShowModalCobertura(false)}
                style={{
                  background: "var(--card-bg)", border: "1.5px solid var(--card-border)", borderRadius: 8, padding: "8px 16px",
                  fontSize: 13, fontWeight: 600, color: "var(--text-main)", cursor: "pointer"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarCobertura}
                disabled={guardandoCobertura || !selectedDocenteCobertura}
                style={{
                  background: (!selectedDocenteCobertura || guardandoCobertura) ? "#cbd5e1" : "#1F294D",
                  border: "none", borderRadius: 8, padding: "8px 16px",
                  fontSize: 13, fontWeight: 700, color: "#fff", cursor: (!selectedDocenteCobertura || guardandoCobertura) ? "not-allowed" : "pointer"
                }}
              >
                {guardandoCobertura ? "Guardando..." : "Asignar Cobertura"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
