/**
 * @file DashboardProfesor.jsx
 * @description Panel interactivo para el rol del Docente (Profesor).
 * Permite visualizar el horario de clases, registrar la asistencia diaria (entrada/salida), gestionar solicitudes de permisos, reportar novedades e incidencias (como ausencias totales o tardanzas) y ver las coberturas (reemplazos) asignadas.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import logo from "../assets/logo.jpeg";
import ThemeToggle from "../components/ThemeToggle";
import ConfigurationPanel from "../components/ConfigurationPanel";
import usePageTitle from "../hooks/usePageTitle";


const DIAS_ORDEN = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];
const DIAS_LABEL = { LUNES: "Lun", MARTES: "Mar", MIERCOLES: "Mié", JUEVES: "Jue", VIERNES: "Vie", SABADO: "Sáb", DOMINGO: "Dom" };
const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "horario", label: "Mi Horario", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "asistencia", label: "Asistencia", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 00-2-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "permisos", label: "Permisos", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "novedades", label: "Novedades", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
  { key: "coberturas", label: "Coberturas", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "configuration", label: "Configuración", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" }
];

const normalizar = (str) =>
  (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

const getUploadUrl = (archivo) => {
  const backendUrl = axios.defaults.baseURL ? axios.defaults.baseURL.replace("/api", "") : "http://localhost:3000";
  return `${backendUrl}/uploads/${archivo}`;
};

function SidebarItem({ icon, label, active, onClick, danger }) {
  const [hovered, setHovered] = useState(false);
  const isDanger = !!danger;
  const background = active ? "rgba(255,255,255,0.15)" : (hovered ? (isDanger ? "rgba(220,38,38,0.12)" : "rgba(255,255,255,0.08)") : "transparent");
  const color = active ? "#fff" : (isDanger && hovered ? "#ff6b6b" : "rgba(255,255,255,0.6)");
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 11, width: "100%",
        padding: "10px 14px", border: "none", borderRadius: 8, cursor: "pointer",
        background,
        color,
        fontFamily: "Hanken Grotesk, sans-serif",
        fontSize: 13.5, fontWeight: active ? 600 : 400,
        textAlign: "left", transition: "all 0.15s",
      }}
    >
      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        {icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
      </svg>
      {label}
      {active && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#1A994D" }} />}
    </button>
  );
}

function StatusBadge({ estado }) {
  const config = {
    PRESENTE:        { label: "Presente",          bg: "#dcfce7", color: "#166534" },
    FINALIZADO:      { label: "Salida Registrada", bg: "#dbeafe", color: "#1e40af" },
    TARDANZA:        { label: "Entrada Tarde",     bg: "#ffedd5", color: "#c2410c" },
    SALIDA_TEMPRANA: { label: "Salida Temprana",   bg: "#f3e8ff", color: "#6b21a8" },
    NO_PRESENTE:     { label: "No Presente",        bg: "#fee2e2", color: "#991b1b" },
  };
  const c = config[estado] || config.NO_PRESENTE;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "4px 14px", borderRadius: 20,
      fontWeight: 700, fontSize: 13,
      fontFamily: "Hanken Grotesk, sans-serif",
    }}>{c.label}</span>
  );
}

const getLocalDateStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function HorarioSemanaCalendario({ horarios, suspensiones, coberturas }) {
  const normalizar = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const getFechaParaDiaSemana = (diaSemanaStr) => {
    const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
    const hoy = new Date();
    const hoyIndex = hoy.getDay();
    
    const mapDias = {
      "LUNES": 1,
      "MARTES": 2,
      "MIERCOLES": 3,
      "JUEVES": 4,
      "VIERNES": 5,
      "SABADO": 6,
      "DOMINGO": 0
    };
    
    const targetIndex = mapDias[normalizar(diaSemanaStr)];
    if (targetIndex === undefined) return null;
    
    let diff = targetIndex - hoyIndex;
    const targetDate = new Date(hoy);
    targetDate.setDate(hoy.getDate() + diff);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  };

  const getSuspensionParaDiaSemana = (diaSemanaStr) => {
    const date = getFechaParaDiaSemana(diaSemanaStr);
    if (!date || !suspensiones) return null;
    
    const dateTime = date.getTime();
    return suspensiones.find(s => {
      const start = new Date(s.fecha_inicio);
      start.setHours(0,0,0,0);
      const end = new Date(s.fecha_fin);
      end.setHours(23,59,59,999);
      return dateTime >= start.getTime() && dateTime <= end.getTime();
    });
  };

  // Coberturas asignadas cuya fecha real cae en el día de esta columna
  const getCoberturasParaDiaSemana = (diaSemanaStr) => {
    const date = getFechaParaDiaSemana(diaSemanaStr);
    if (!date || !coberturas || !coberturas.length) return [];
    const dateStr = getLocalDateStr(date);
    return coberturas.filter(c => c.fecha.split("T")[0] === dateStr);
  };

  const agrupado = DIAS_ORDEN.reduce((acc, dia) => {
    const clasesPropias = horarios
      .filter(h => normalizar(h.dia_semana) === dia)
      .map(h => ({ ...h, isCobertura: false }));

    const clasesCobertura = getCoberturasParaDiaSemana(dia).map(c => ({
      id_horario: `cob-${c.id_cobertura}`,
      nombre: c.horario.nombre,
      hora_inicio: c.horario.hora_inicio,
      hora_fin: c.horario.hora_fin,
      bloque: c.horario.bloque,
      isCobertura: true,
      docente_ausente: c.docente_ausente,
    }));

    const clases = [...clasesPropias, ...clasesCobertura].sort((a, b) =>
      (a.hora_inicio || "").localeCompare(b.hora_inicio || "")
    );

    if (clases.length) acc[dia] = clases;
    return acc;
  }, {});

  const diaActual = ["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"][new Date().getDay()];

  if (!Object.keys(agrupado).length) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>
        No hay horarios asignados para esta semana.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "thin" }}>
      {Object.entries(agrupado).map(([dia, clases]) => {
        const esHoy = normalizar(dia) === normalizar(diaActual);
        const suspension = getSuspensionParaDiaSemana(dia);
        
        return (
          <div key={dia} style={{
            flex: "0 0 170px",
            border: suspension 
              ? "2px solid #db2777" 
              : (esHoy ? "2px solid #1F294D" : "1px solid var(--card-border)"),
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: esHoy ? "0 4px 16px rgba(31,41,77,0.12)" : "none",
          }}>
            <div style={{
              background: suspension
                ? "#fce7f3"
                : (esHoy ? "#1F294D" : "var(--card-subbg)"),
              padding: "8px 12px",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                color: suspension 
                  ? "#9d174d" 
                  : (esHoy ? "#fff" : "var(--text-muted)"),
                textTransform: "uppercase",
              }}>{DIAS_LABEL[dia] || dia}</div>
              
              {suspension && (
                <div style={{ fontSize: 9, color: "#be185d", fontWeight: 800, marginTop: 2 }}>
                  {suspension.tipo === "PARO" ? "🚫 PARO" : "🏖️ VACACIONES"}
                </div>
              )}
              {esHoy && !suspension && (
                <div style={{ fontSize: 10, color: "#6dd88a", fontWeight: 700, marginTop: 2 }}>HOY</div>
              )}
            </div>
            <div style={{ padding: "8px 6px", display: "flex", flexDirection: "column", gap: 6, background: "var(--card-bg)" }}>
              {clases.map((c) => (
                <div key={c.id_horario} style={{
                  background: suspension 
                    ? "#fdf2f8" 
                    : (c.isCobertura ? "#382312" : (c.nombre === "HORA PEDAGOGICA" ? "#f3e8ff" : (esHoy ? "var(--card-subbg)" : "var(--bg-main)"))),
                  border: `${c.isCobertura && !suspension ? "2px" : "1px"} solid ${suspension 
                    ? "#fbcfe8" 
                    : (c.isCobertura ? "#f97316" : (c.nombre === "HORA PEDAGOGICA" ? "#c084fc" : (esHoy ? "#c7d7f9" : "var(--card-border)")))}`,
                  borderRadius: 7, padding: "7px 9px",
                  animation: (c.isCobertura && !suspension) ? "pulseOrange 1.8s infinite ease-in-out" : "none",
                  boxShadow: (c.isCobertura && !suspension) ? "0 0 12px rgba(249, 115, 22, 0.45)" : "none",
                }}>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 700, 
                    color: suspension ? "#9d174d" : (c.isCobertura ? "#f97316" : (c.nombre === "HORA PEDAGOGICA" ? "#6b21a8" : "var(--text-title)")), 
                    lineHeight: 1.3 
                  }}>{c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre}</div>
                  <div style={{ 
                    fontSize: 11, 
                    color: suspension ? "#c2185b" : (c.isCobertura ? "#ea580c" : "var(--text-muted)"), 
                    marginTop: 3 
                  }}>{c.hora_inicio} – {c.hora_fin}</div>
                  <div style={{
                    marginTop: 5, display: "inline-block",
                    background: suspension ? "#db2777" : (c.isCobertura ? "#f97316" : "#1F294D"), 
                    color: "#fff",
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  }}>{c.bloque}</div>
                  {c.isCobertura && !suspension && (
                    <div style={{
                      marginTop: 5, fontSize: 9, fontWeight: 800, color: "#c2410c",
                      letterSpacing: "0.03em",
                    }}>
                      🟠 COBERTURA {c.docente_ausente ? `– Cubriendo a ${c.docente_ausente.nombre} ${c.docente_ausente.apellido}` : ""}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardProfesor() {

  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const navLabel = NAV_ITEMS.find((n) => n.key === activeNav)?.label || "Docente";
  usePageTitle(navLabel);
  const [estado, setEstado] = useState("NO_PRESENTE");
  const [loading, setLoading] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [horariosHoy, setHorariosHoy] = useState([]);
  const [coberturasDocente, setCoberturasDocente] = useState([]);
  const [horasNoAsistidas, setHorasNoAsistidas] = useState(0);
  const [notification, setNotification] = useState({ show: false, message: "", type: "error" });

  // Estados para reporte de novedades
  const [novedades, setNovedades] = useState([]);
  const [novedadHoy, setNovedadHoy] = useState(null);
  const [showModalNovedad, setShowModalNovedad] = useState(false);
  const [novedadOPermiso, setNovedadOPermiso] = useState(""); // "" | "NOVEDAD" | "PERMISO"
  const [tipoNovedad, setTipoNovedad] = useState("");
  const [clasesAfectadas, setClasesAfectadas] = useState([]);
  const [gruposAfectados, setGruposAfectados] = useState("");
  const [causa, setCausa] = useState("");
  const [descripcionBreve, setDescripcionBreve] = useState("");
  const [archivoSoporte, setArchivoSoporte] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados para permisos
  const [permisos, setPermisos] = useState([]);
  const [tiposPermiso, setTiposPermiso] = useState([]);
  const [tipoPermiso, setTipoPermiso] = useState("");
  const [fechaInicioPermiso, setFechaInicioPermiso] = useState("");
  const [fechaFinPermiso, setFechaFinPermiso] = useState("");
  const [motivoPermiso, setMotivoPermiso] = useState("");
  const [descripcionPermiso, setDescripcionPermiso] = useState("");
  const [clasesAfectadasPermiso, setClasesAfectadasPermiso] = useState([]);
  const [archivoSoportePermiso, setArchivoSoportePermiso] = useState(null);
  
  // Estados para suspensiones/vacaciones
  const [suspensiones, setSuspensiones] = useState([]);
  const [suspensionHoy, setSuspensionHoy] = useState(null);
  
  // Estados para asistencia mensual (Calendario y Reporte)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [asistenciasMes, setAsistenciasMes] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // Detección de celular para responsividad
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const triggerNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((p) => ({ ...p, show: false })), 4000);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem("usuario");
      if (!stored) { navigate("/login"); return; }
      const parsed = JSON.parse(stored);
      setUsuario(parsed);
      const id = parsed.id_usuario || parsed.id;
      obtenerEstado(id);
      obtenerHorario(id);
      obtenerNovedades(id);
      obtenerNovedadHoy(id);
      obtenerPermisos(id);
      obtenerTiposPermiso();
      obtenerSuspensiones();
      obtenerCoberturas(id);
      obtenerHorasNoAsistidas(id, parsed.fecha_creacion);
    } catch { navigate("/login"); }
  }, [navigate]);

  useEffect(() => {
    const id = usuario?.id_usuario || usuario?.id;
    if (id && selectedMonth) {
      obtenerAsistenciasMes(id, selectedMonth);
    }
  }, [usuario, selectedMonth]);


  const obtenerEstado = async (id_usuario) => {
    try {
      const res = await axios.get(`/asistencia/estado/${id_usuario}`);
      setEstado(res.data.estado);
    } catch (e) {
      console.error(e);
    }
  };

  const obtenerSuspensiones = async () => {
    try {
      const res = await axios.get("/suspension");
      const list = res.data || [];
      setSuspensiones(list);
      
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const hoyTime = hoy.getTime();
      
      const found = list.find(s => {
        const start = new Date(s.fecha_inicio);
        start.setHours(0,0,0,0);
        const end = new Date(s.fecha_fin);
        end.setHours(23,59,59,999);
        return hoyTime >= start.getTime() && hoyTime <= end.getTime();
      });
      
      if (found) {
        setSuspensionHoy(found);
      } else {
        setSuspensionHoy(null);
      }
    } catch (e) {
      console.error("Error al obtener suspensiones:", e);
    }
  };


  const obtenerHorario = async (id_usuario) => {
    try {
      const res = await axios.get(`/horario/${id_usuario}`);
      setHorarios(res.data);
      const dias = ["DOMINGO","LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO"];
      const hoy = dias[new Date().getDay()];
      setHorariosHoy(res.data.filter(c => normalizar(c.dia_semana) === normalizar(hoy)));
    } catch (e) {
      console.error(e);
    }
  };

  const obtenerNovedades = async (id_usuario) => {
    try {
      const res = await axios.get(`/novedades/usuario/${id_usuario}`);
      setNovedades(res.data);
    } catch (e) {
      console.error("Error al obtener novedades:", e);
    }
  };

  const obtenerNovedadHoy = async (id_usuario) => {
    try {
      const res = await axios.get(`/novedades/hoy/${id_usuario}`);
      setNovedadHoy(res.data);
    } catch (e) {
      console.error("Error al obtener novedad de hoy:", e);
    }
  };

  const obtenerPermisos = async (id_usuario) => {
    try {
      const res = await axios.get(`/permisos/usuario/${id_usuario}`);
      setPermisos(res.data);
    } catch (e) {
      console.error("Error al obtener permisos:", e);
    }
  };

  const obtenerCoberturas = async (id_usuario) => {
    try {
      const res = await axios.get(`/coberturas/usuario/${id_usuario}`);
      setCoberturasDocente(res.data || []);
    } catch (e) {
      console.error("Error al obtener coberturas de docente:", e);
    }
  };

  const obtenerHorasNoAsistidas = async (id_usuario, fecha_creacion) => {
    try {
      const start = fecha_creacion ? fecha_creacion.split("T")[0] : new Date().toISOString().split("T")[0];
      const end = new Date().toISOString().split("T")[0];
      
      const res = await axios.get("/asistencia/reporte", {
        params: {
          id_usuario,
          fecha_inicio: start,
          fecha_fin: end
        }
      });
      
      const noAsistidas = (res.data || [])
        .filter(r => r.estado === "NO_PRESENTE")
        .reduce((sum, r) => sum + (r.horas_perdidas || 0), 0);
        
      setHorasNoAsistidas(noAsistidas);
    } catch (e) {
      console.error("Error al obtener horas no asistidas:", e);
    }
  };

  const obtenerAsistenciasMes = async (id_usuario, mesStr) => {
    try {
      setLoadingAsistencias(true);
      const res = await axios.get("/asistencia/reporte", {
        params: {
          id_usuario,
          mes: mesStr
        }
      });
      setAsistenciasMes(res.data || []);
    } catch (e) {
      console.error("Error al obtener asistencia mensual:", e);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prev = new Date(year, month - 2, 1);
    const y = prev.getFullYear();
    const m = String(prev.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const next = new Date(year, month, 1);
    const hoy = new Date();
    if (next > new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1)) return;
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, "0");
    setSelectedMonth(`${y}-${m}`);
  };

  const parseLocalDateString = (dateVal) => {
    if (!dateVal) return null;
    const str = typeof dateVal === "string" ? dateVal.split("T")[0] : dateVal;
    const parts = str.split("-");
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    return new Date(dateVal);
  };

  const getFechaLabelAsistencia = (dateVal) => {
    const d = parseLocalDateString(dateVal);
    if (!d) return "—";
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${dias[d.getDay()]}, ${d.getDate()} de ${meses[d.getMonth()]}`;
  };

  const obtenerTiposPermiso = async () => {
    try {
      const res = await axios.get("/permisos/tipos");
      setTiposPermiso(res.data);
    } catch (e) {
      console.error("Error al obtener tipos de permiso:", e);
    }
  };

  const registrarNovedad = async (e) => {
    e.preventDefault();
    if (!tipoNovedad) { triggerNotification("Por favor selecciona un tipo de novedad."); return; }
    if (!causa) { triggerNotification("Por favor selecciona una causa."); return; }
    if (!descripcionBreve) { triggerNotification("Por favor escribe una descripción breve."); return; }

    const id = usuario?.id_usuario || usuario?.id;
    if (!id) return;

    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append("id_usuario", id);
      formData.append("id_tipo_novedad", tipoNovedad);
      formData.append("causa", causa);
      formData.append("descripcion_breve", descripcionBreve);
      
      const clasesSeleccionadas = horariosHoy.filter(h => clasesAfectadas.includes(h.id_horario));
      formData.append("clases_afectadas", JSON.stringify(clasesSeleccionadas));

      if (archivoSoporte) {
        formData.append("soporte", archivoSoporte);
      }

      await axios.post("/novedades", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      triggerNotification("Novedad registrada exitosamente.", "success");
      setShowModalNovedad(false);
      setNovedadOPermiso("");
      
      setTipoNovedad("");
      setClasesAfectadas([]);
      setGruposAfectados("");
      setCausa("");
      setDescripcionBreve("");
      setArchivoSoporte(null);

      await obtenerNovedades(id);
      await obtenerNovedadHoy(id);
      await obtenerEstado(id);
      await obtenerAsistenciasMes(id, selectedMonth);
    } catch (err) {
      console.error(err);
      triggerNotification(err.response?.data?.message || "Error al registrar novedad.");
    } finally {
      setModalLoading(false);
    }
  };

  const registrarPermiso = async (e) => {
    e.preventDefault();
    if (!tipoPermiso) { triggerNotification("Por favor selecciona un tipo de permiso."); return; }
    if (!fechaInicioPermiso) { triggerNotification("Por favor selecciona la fecha de inicio."); return; }
    if (!fechaFinPermiso) { triggerNotification("Por favor selecciona la fecha de fin."); return; }
    if (!motivoPermiso) { triggerNotification("Por favor describe el motivo del permiso."); return; }
    if (!descripcionPermiso) { triggerNotification("Por favor escribe una descripción breve."); return; }

    if (new Date(fechaInicioPermiso) > new Date(fechaFinPermiso)) {
      triggerNotification("La fecha de inicio no puede ser posterior a la fecha de fin.");
      return;
    }

    const id = usuario?.id_usuario || usuario?.id;
    if (!id) return;

    try {
      setModalLoading(true);
      const formData = new FormData();
      formData.append("id_usuario", id);
      formData.append("id_tipo_permiso", tipoPermiso);
      formData.append("fecha_inicio", fechaInicioPermiso);
      formData.append("fecha_fin", fechaFinPermiso);
      formData.append("causa", motivoPermiso);
      formData.append("descripcion_breve", descripcionPermiso);

      const esMismoDia = fechaInicioPermiso === fechaFinPermiso;
      if (esMismoDia && clasesAfectadasPermiso.length > 0) {
        const classesDetails = horarios.filter(h => clasesAfectadasPermiso.includes(h.id_horario));
        formData.append("clases_afectadas", JSON.stringify(classesDetails));
      } else {
        formData.append("clases_afectadas", JSON.stringify([]));
      }

      if (archivoSoportePermiso) {
        formData.append("soporte", archivoSoportePermiso);
      }

      await axios.post("/permisos", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      triggerNotification("Permiso solicitado exitosamente.", "success");
      setShowModalNovedad(false);
      setNovedadOPermiso("");

      setTipoPermiso("");
      setFechaInicioPermiso("");
      setFechaFinPermiso("");
      setMotivoPermiso("");
      setDescripcionPermiso("");
      setClasesAfectadasPermiso([]);
      setArchivoSoportePermiso(null);

      await obtenerPermisos(id);
      await obtenerEstado(id);
      await obtenerAsistenciasMes(id, selectedMonth);
    } catch (err) {
      console.error(err);
      triggerNotification(err.response?.data?.message || "Error al solicitar el permiso.");
    } finally {
      setModalLoading(false);
    }
  };

  const registrarEntrada = async () => {
    const id = usuario?.id_usuario || usuario?.id;
    if (!id) { navigate("/login"); return; }
    try {
      setLoading(true);
      await axios.post("/asistencia/entrada", { id_usuario: id });
      await obtenerEstado(id);
      await obtenerHorasNoAsistidas(id, usuario?.fecha_creacion);
      await obtenerAsistenciasMes(id, selectedMonth);
      triggerNotification("Entrada registrada correctamente.", "success");
    } catch (e) {
      triggerNotification(e.response?.data?.message || "Error al registrar entrada.", "error");
    } finally { setLoading(false); }
  };

  const registrarSalida = async () => {
    const id = usuario?.id_usuario || usuario?.id;
    if (!id) { navigate("/login"); return; }

    // Validación de salida anticipada
    if (horariosHoy.length > 0) {
      let maxHora = "";
      horariosHoy.forEach(c => {
        if (!maxHora || c.hora_fin > maxHora) {
          maxHora = c.hora_fin;
        }
      });

      if (maxHora) {
        const [hora, min] = maxHora.split(":").map(Number);
        const horaFinPlaneada = new Date();
        horaFinPlaneada.setHours(hora, min, 0, 0);

        const ahora = new Date();
        if (ahora < horaFinPlaneada) {
          const tieneNovedadAprobada = novedadHoy && novedadHoy.estado === "APROBADO";
          
          const permisoAprobadoHoy = permisos.find(p => {
            if (p.estado !== "APROBADO") return false;
            const start = new Date(p.fecha_inicio);
            const end = new Date(p.fecha_fin);
            const today = new Date();
            const startStr = start.toISOString().split("T")[0];
            const endStr = end.toISOString().split("T")[0];
            const todayStr = today.toISOString().split("T")[0];
            return todayStr >= startStr && todayStr <= endStr;
          });

          if (!tieneNovedadAprobada && !permisoAprobadoHoy) {
            triggerNotification(
              `No puedes registrar la salida antes de tu hora de salida oficial (${maxHora}) a menos que tu novedad o permiso esté ACEPTADO por el rector.`,
              "error"
            );
            return;
          }

          // Verificar si hay clases afectadas en el permiso/novedad y si es la hora de salida
          let clasesAfectadasNovedad = [];
          if (novedadHoy && novedadHoy.estado === "APROBADO") {
            try {
              const desc = typeof novedadHoy.descripcion === "string" ? JSON.parse(novedadHoy.descripcion) : novedadHoy.descripcion;
              if (desc && Array.isArray(desc.clases_afectadas)) {
                clasesAfectadasNovedad = desc.clases_afectadas;
              }
            } catch (e) {}
          }

          let clasesAfectadasPermiso = [];
          if (permisoAprobadoHoy) {
            try {
              const desc = typeof permisoAprobadoHoy.descripcion === "string" ? JSON.parse(permisoAprobadoHoy.descripcion) : permisoAprobadoHoy.descripcion;
              if (desc && Array.isArray(desc.clases_afectadas)) {
                clasesAfectadasPermiso = desc.clases_afectadas;
              }
            } catch (e) {}
          }

          const todasClasesAfectadas = [...clasesAfectadasNovedad, ...clasesAfectadasPermiso];

          if (todasClasesAfectadas.length > 0) {
            let minHora = null;
            todasClasesAfectadas.forEach(c => {
              if (c.hora_inicio) {
                if (!minHora || c.hora_inicio < minHora) {
                  minHora = c.hora_inicio;
                }
              }
            });

            if (minHora) {
              const [h, m] = minHora.split(":").map(Number);
              const horaSalidaPedida = new Date();
              horaSalidaPedida.setHours(h, m, 0, 0);

              if (ahora < horaSalidaPedida) {
                triggerNotification(
                  `Aún no es la hora de tu salida pedida (${minHora}).`,
                  "error"
                );
                return;
              }
            }
          }
        }
      }
    }

    try {
      setLoading(true);
      await axios.post("/asistencia/salida", { id_usuario: id });
      await obtenerEstado(id);
      await obtenerHorasNoAsistidas(id, usuario?.fecha_creacion);
      await obtenerAsistenciasMes(id, selectedMonth);
      triggerNotification("Salida registrada correctamente.", "success");
    } catch (e) {
      triggerNotification(e.response?.data?.message || "Error al registrar salida.", "error");
    } finally { setLoading(false); }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const ahora = new Date();
  const horaStr = ahora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  const fechaStr = ahora.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const initiales = usuario
    ? `${usuario.nombre?.[0] || ""}${usuario.apellido?.[0] || ""}`.toUpperCase()
    : "??";

  const renderActiveContent = () => {
    if (activeNav === "home") {
      const getMidnightDate = (dateVal) => {
        if (!dateVal) return new Date(0);
        const d = new Date(dateVal);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      };
      const todayMidnight = getMidnightDate(new Date());

      const cobsHoy = coberturasDocente.filter(c => {
        const cobDate = new Date(c.fecha);
        const today = new Date();
        return cobDate.getFullYear() === today.getFullYear() &&
               cobDate.getMonth() === today.getMonth() &&
               cobDate.getDate() === today.getDate();
      });

      const clasesCoberturaHoy = cobsHoy.map(c => ({
        id_horario: `cob-${c.id_cobertura}`,
        nombre: c.horario.nombre,
        dia_semana: c.horario.dia_semana,
        hora_inicio: c.horario.hora_inicio,
        hora_fin: c.horario.hora_fin,
        bloque: c.horario.bloque,
        isCobertura: true,
        docente_ausente: c.docente_ausente
      }));

      const todasClasesHoy = [...horariosHoy, ...clasesCoberturaHoy].sort((a, b) => 
        a.hora_inicio.localeCompare(b.hora_inicio)
      );

      const unificadosProfesor = [
        ...novedades.map(nov => ({
          ...nov,
          esPermiso: false,
          uniqueKey: `nov-${nov.id_novedad}`,
          dateForSort: new Date(nov.fecha),
          tipoLabel: nov.tipo_novedad?.nombre || "Novedad",
          fechaLabel: new Date(nov.fecha).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })
        })),
        ...permisos.map(perm => ({
          ...perm,
          esPermiso: true,
          uniqueKey: `perm-${perm.id_permiso}`,
          dateForSort: new Date(perm.fecha_solicitud),
          tipoLabel: perm.tipo_permiso?.nombre || "Permiso",
          fechaLabel: `${new Date(perm.fecha_inicio).toLocaleDateString("es-CO")} - ${new Date(perm.fecha_fin).toLocaleDateString("es-CO")}`
        }))
      ].sort((a, b) => b.dateForSort - a.dateForSort);

      const unificadosProfesorFiltered = unificadosProfesor.filter(item => {
        if (item.estado === "APROBADO" || item.estado === "RECHAZADO") {
          if (item.esPermiso) {
            const endDate = getMidnightDate(item.fecha_fin);
            return todayMidnight <= endDate;
          } else {
            const novDate = getMidnightDate(item.fecha);
            return todayMidnight <= novDate;
          }
        }
        return true;
      });

      return (
        <>
          {cobsHoy.length > 0 && (
            <div style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderLeft: "5px solid #f97316",
              borderRadius: 12,
              padding: "14px 20px",
              marginBottom: 20,
              color: "#ea580c"
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#c2410c" }}>Cobertura Asignada Hoy</h3>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9a3412" }}>
                    Tienes asignada una cobertura para cubrir hoy al docente <strong>{cobsHoy[0].docente_ausente?.nombre} {cobsHoy[0].docente_ausente?.apellido}</strong> en el bloque <strong>{cobsHoy[0].horario?.bloque}</strong> ({cobsHoy[0].horario?.nombre}).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TOP GRID */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

            {/* Registro entrada/salida */}
            <div style={{ gridColumn: isMobile ? "span 1" : "span 2", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Estado actual</p>
                  <div style={{ marginTop: 8 }}>
                    <StatusBadge estado={estado} />
                  </div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: estado === "PRESENTE" ? "#dcfce7" : estado === "TARDANZA" ? "#ffedd5" : estado === "FINALIZADO" ? "#dbeafe" : estado === "SALIDA_TEMPRANA" ? "#f3e8ff" : "#fee2e2",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: estado === "PRESENTE" ? "#16a34a" : estado === "TARDANZA" ? "#ea580c" : estado === "FINALIZADO" ? "#2563eb" : estado === "SALIDA_TEMPRANA" ? "#7c3aed" : "#dc2626",
                  }} />
                </div>
              </div>

              {suspensionHoy && (
                <div style={{
                  background: "#fff7ed",
                  border: "1px solid #ffedd5",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 16,
                  color: "#c2410c",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}>
                  <span style={{ fontSize: 18 }}>🚫</span>
                  <div>
                    <strong style={{ color: "#ea580c" }}>Registro Inhabilitado ({suspensionHoy.tipo === "PARO" ? "Paro/No hay clases" : "Vacaciones"}):</strong>
                    <div style={{ fontSize: 12, fontWeight: 500, marginTop: 2, color: "#9a3412" }}>
                      {suspensionHoy.motivo || "No hay clases programadas por directriz del colegio."}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button
                  onClick={registrarEntrada}
                  disabled={loading || estado !== "NO_PRESENTE" || !!suspensionHoy}
                  style={{
                    padding: "14px", border: "none", borderRadius: 10,
                    background: (estado !== "NO_PRESENTE" || !!suspensionHoy) ? "var(--card-subbg)" : "#1F294D",
                    color: (estado !== "NO_PRESENTE" || !!suspensionHoy) ? "var(--text-muted)" : "#fff",
                    fontWeight: 700, fontSize: 14, cursor: (estado !== "NO_PRESENTE" || !!suspensionHoy) ? "not-allowed" : "pointer",
                    fontFamily: "Hanken Grotesk, sans-serif", transition: "all 0.15s",
                  }}
                >
                  {loading ? "Procesando..." : "Registrar Entrada"}
                </button>
                <button
                  onClick={registrarSalida}
                  disabled={loading || (estado !== "PRESENTE" && estado !== "TARDANZA") || !!suspensionHoy}
                  style={{
                    padding: "14px", border: `2px solid ${(estado === "PRESENTE" || estado === "TARDANZA") && !suspensionHoy ? "#1A994D" : "var(--card-border)"}`,
                    borderRadius: 10, background: "var(--card-bg)",
                    color: (estado === "PRESENTE" || estado === "TARDANZA") && !suspensionHoy ? "#1A994D" : "var(--text-muted)",
                    fontWeight: 700, fontSize: 14, cursor: (estado === "PRESENTE" || estado === "TARDANZA") && !suspensionHoy ? "pointer" : "not-allowed",
                    fontFamily: "Hanken Grotesk, sans-serif", transition: "all 0.15s",
                  }}
                >
                  Registrar Salida
                </button>
              </div>
            </div>


            {/* Stats column */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Coberturas</p>
                <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>{coberturasDocente.length}</p>
              </div>
            </div>
          </div>

          {/* CLASES DE HOY */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Clases de Hoy
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {todasClasesHoy.length} {todasClasesHoy.length === 1 ? "clase" : "clases"}
              </span>
            </div>

            {todasClasesHoy.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 14 }}>
                No tenés clases programadas para hoy.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {todasClasesHoy.map((clase) => {
                  const esAfectadaPorNovedad = () => {
                    if (clase.isCobertura) return false;
                    if (!novedadHoy || novedadHoy.estado !== "APROBADO") return false;
                    if (novedadHoy.id_tipo_novedad === 1) return true; // Ausencia total
                    try {
                      const desc = JSON.parse(novedadHoy.descripcion);
                      if (desc.clases_afectadas) {
                        return desc.clases_afectadas.some(c => c.id_horario === clase.id_horario);
                      }
                    } catch (e) {}
                    return false;
                  };
                  const esNovedadAprobada = esAfectadaPorNovedad();

                  if (clase.isCobertura) {
                    return (
                      <div key={clase.id_horario} style={{
                        borderLeft: "4px solid #f97316",
                        border: "2px solid #f97316",
                        background: "#fff7ed",
                        borderRadius: "0 10px 10px 0", padding: "14px 16px",
                        animation: "pulseOrange 1.8s infinite ease-in-out",
                        boxShadow: "0 0 14px rgba(249, 115, 22, 0.55)",
                      }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#ea580c", marginBottom: 4 }}>{clase.nombre}</div>
                        <div style={{ fontSize: 12, color: "#c2410c", marginBottom: 8 }}>Bloque {clase.bloque}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <svg width="12" height="12" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                          </svg>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#ea580c" }}>{clase.hora_inicio} – {clase.hora_fin}</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: "#ea580c", fontWeight: 800, marginTop: 8 }}>
                          🟠 COBERTURA - Cubriendo a {clase.docente_ausente?.nombre} {clase.docente_ausente?.apellido}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={clase.id_horario} style={{
                      borderLeft: suspensionHoy ? "4px solid #db2777" : (esNovedadAprobada ? "4px solid #2563eb" : "4px solid #1F294D"),
                      border: suspensionHoy ? "1px solid #fbcfe8" : (esNovedadAprobada ? "1px solid #2563eb" : "1px solid transparent"),
                      background: suspensionHoy ? "#fdf2f8" : (esNovedadAprobada ? "#eff6ff" : "#f8fafc"),
                      borderRadius: "0 10px 10px 0", padding: "14px 16px",
                    }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: suspensionHoy ? "#9d174d" : (esNovedadAprobada ? "#1d4ed8" : "#0f172a"), marginBottom: 4 }}>{clase.nombre}</div>
                      <div style={{ fontSize: 12, color: suspensionHoy ? "#be185d" : (esNovedadAprobada ? "#3b82f6" : "#64748b"), marginBottom: 8 }}>Bloque {clase.bloque}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <svg width="12" height="12" fill="none" stroke={suspensionHoy ? "#be185d" : (esNovedadAprobada ? "#3b82f6" : "#64748b")} strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        <span style={{ fontSize: 12, fontWeight: 600, color: suspensionHoy ? "#db2777" : (esNovedadAprobada ? "#2563eb" : "#475569") }}>{clase.hora_inicio} – {clase.hora_fin}</span>
                      </div>
                      {suspensionHoy && (
                        <div style={{ fontSize: 10.5, color: "#be185d", fontWeight: 800, marginTop: 8 }}>
                          🚫 Clase Suspendida ({suspensionHoy.tipo === "PARO" ? "Paro" : "Vacaciones"})
                        </div>
                      )}
                      {esNovedadAprobada && !suspensionHoy && (
                        <div style={{ fontSize: 10.5, color: "#1d4ed8", fontWeight: 700, marginTop: 8 }}>
                          ✓ Con Permiso Aprobado
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* NOVEDADES Y PERMISOS */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px", marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Novedades y Permisos
              </h2>
            </div>

            {/* Listado de novedades/permisos recientes */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
              {unificadosProfesorFiltered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#94a3b8", fontSize: 13.5 }}>
                  No tienes novedades o permisos registrados recientemente.
                </div>
              ) : (
                unificadosProfesorFiltered.slice(0, 5).map((nov) => {
                  let desc = {};
                  try {
                    desc = typeof nov.descripcion === "string" ? JSON.parse(nov.descripcion) : nov.descripcion;
                  } catch (e) {
                    desc = { descripcion_breve: nov.descripcion };
                  }

                  // Status config
                  const statusConf = {
                    PENDIENTE: { bg: "#fef3c7", color: "#d97706", label: "Pendiente", icon: "🕒" },
                    APROBADO: { bg: "#dcfce7", color: "#15803d", label: "Aceptado", icon: "✓" },
                    RECHAZADO: { bg: "#fee2e2", color: "#b91c1c", label: "Rechazado", icon: "✕" }
                  };
                  const s = statusConf[nov.estado] || { bg: "#f1f5f9", color: "#475569", label: nov.estado, icon: "•" };

                  return (
                    <div key={nov.uniqueKey} style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      background: s.bg + "20",
                      border: `1px solid ${s.bg === "#fef3c7" ? "#fde68a" : s.bg === "#dcfce7" ? "#bbf7d0" : "#fecaca"}`,
                      borderRadius: 10, padding: "12px 16px"
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: "50%",
                        background: s.color + "20", color: s.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13, flexShrink: 0
                      }}>
                        {s.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-title)" }}>
                            {nov.tipoLabel} ({s.label})
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "capitalize" }}>
                            {nov.fechaLabel}
                          </span>
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-main)", lineHeight: 1.4 }}>
                          {desc.descripcion_breve}
                        </p>
                        {(desc.causa || (desc.clases_afectadas && desc.clases_afectadas.length > 0) || nov.archivo) && (
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                            {desc.causa && (
                              <span style={{ fontSize: 10, background: "var(--card-subbg)", color: "var(--text-main)", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                                Causa: {desc.causa}
                              </span>
                            )}
                            {desc.clases_afectadas && desc.clases_afectadas.length > 0 && (
                              <span style={{ fontSize: 10, background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                                Clases: {desc.clases_afectadas.map(c => c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre).join(", ")}
                              </span>
                            )}
                            {nov.archivo && (
                              <a href={getUploadUrl(nov.archivo)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>
                                Ver soporte 📄
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Botón reportar novedad */}
            <button
              onClick={() => setShowModalNovedad(true)}
              style={{
                width: "100%", padding: "14px", background: "transparent",
                border: "1.5px dashed var(--card-border)", borderRadius: 10,
                color: "var(--text-main)", fontWeight: 600, fontSize: 13.5,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "Hanken Grotesk, sans-serif"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#112D55"; e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Reportar Novedad/Permiso
            </button>
          </div>
        </>
      );
    }

    if (activeNav === "permisos") {
      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Mis Solicitudes de Permisos
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte y realice el seguimiento de los permisos solicitados con anticipación.</p>
            </div>
            <button
              onClick={() => { setNovedadOPermiso("PERMISO"); setShowModalNovedad(true); }}
              style={{
                padding: "10px 16px", background: "#1F294D", color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "Hanken Grotesk, sans-serif"
              }}
            >
              + Nueva Solicitud
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {permisos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>
                No tienes solicitudes de permisos registradas.
              </div>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Tipo Permiso</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Fecha Inicio</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Fecha Fin</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Descripción</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Soporte</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permisos.map((p) => {
                      let desc = {};
                      try {
                        desc = typeof p.descripcion === "string" ? JSON.parse(p.descripcion) : p.descripcion;
                      } catch (e) {
                        desc = { descripcion_breve: p.descripcion, causa: "Otro" };
                      }

                      const fInicio = new Date(p.fecha_inicio).toLocaleDateString("es-CO");
                      const fFin = new Date(p.fecha_fin).toLocaleDateString("es-CO");

                      const statusConf = {
                        PENDIENTE: { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
                        APROBADO: { bg: "#dcfce7", color: "#15803d", label: "Aprobado" },
                        RECHAZADO: { bg: "#fee2e2", color: "#b91c1c", label: "Rechazado" }
                      };
                      const s = statusConf[p.estado] || { bg: "#f1f5f9", color: "#475569", label: p.estado };

                      return (
                        <tr key={p.id_permiso} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                            {p.tipo_permiso?.nombre || "Permiso"}
                            {p.cumple_regla === false && (
                              <div style={{ fontSize: 9.5, color: "#ef4444", fontWeight: 600, marginTop: 2 }}>
                                ⚠️ Fuera de tiempo (menos de 48h)
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center", color: "#334155" }}>{fInicio}</td>
                          <td style={{ padding: "12px 14px", textAlign: "center", color: "#334155" }}>{fFin}</td>
                          <td style={{ padding: "12px 14px", color: "#475569", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {desc.descripcion_breve}
                            {desc.clases_afectadas && desc.clases_afectadas.length > 0 && (
                              <div style={{ fontSize: 10, color: "#2563eb", marginTop: 2 }}>
                                Clases afectadas: {desc.clases_afectadas.map(c => c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre).join(", ")}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {p.archivo ? (
                              <a href={getUploadUrl(p.archivo)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "underline" }}>
                                Ver soporte 📄
                              </a>
                            ) : (
                              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Ninguno</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{
                              background: s.bg, color: s.color,
                              padding: "4px 10px", borderRadius: 20,
                              fontWeight: 700, fontSize: 11
                            }}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === "novedades") {
      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Historial de Novedades (Hoy)
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte y realice el seguimiento de las novedades reportadas para el día de hoy.</p>
            </div>
            <button
              onClick={() => { setNovedadOPermiso("NOVEDAD"); setShowModalNovedad(true); }}
              style={{
                padding: "10px 16px", background: "#1F294D", color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                fontFamily: "Hanken Grotesk, sans-serif"
              }}
            >
              + Reportar Novedad
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {novedades.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>
                No tienes novedades registradas.
              </div>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Tipo Novedad</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Fecha</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Causa</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Descripción / Clases</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Soporte</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {novedades.map((n) => {
                      let desc = {};
                      try {
                        desc = typeof n.descripcion === "string" ? JSON.parse(n.descripcion) : n.descripcion;
                      } catch (e) {
                        desc = { descripcion_breve: n.descripcion, causa: n.causa || "Otro" };
                      }

                      const fechaNov = new Date(n.fecha).toLocaleDateString("es-CO");

                      const statusConf = {
                        PENDIENTE: { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
                        APROBADO: { bg: "#dcfce7", color: "#15803d", label: "Aceptado" },
                        RECHAZADO: { bg: "#fee2e2", color: "#b91c1c", label: "Rechazado" }
                      };
                      const s = statusConf[n.estado] || { bg: "#f1f5f9", color: "#475569", label: n.estado };

                      return (
                        <tr key={n.id_novedad} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                            {n.tipo_novedad?.nombre || "Novedad"}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center", color: "#334155" }}>{fechaNov}</td>
                          <td style={{ padding: "12px 14px", color: "#475569" }}>
                            <span style={{ fontSize: 11, background: "var(--card-subbg)", color: "var(--text-main)", padding: "2px 8px", borderRadius: 4, fontWeight: 600 }}>
                              {desc.causa || n.causa || "Otro"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#475569", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span title={desc.descripcion_breve}>{desc.descripcion_breve}</span>
                            {desc.clases_afectadas && desc.clases_afectadas.length > 0 && (
                              <div style={{ fontSize: 10, color: "#2563eb", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={desc.clases_afectadas.map(c => c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre).join(", ")}>
                                Clases: {desc.clases_afectadas.map(c => c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre).join(", ")}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            {n.archivo ? (
                              <a href={getUploadUrl(n.archivo)} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "underline" }}>
                                Ver soporte 📄
                              </a>
                            ) : (
                              <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Ninguno</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 14px", textAlign: "center" }}>
                            <span style={{
                              background: s.bg, color: s.color,
                              padding: "4px 10px", borderRadius: 20,
                              fontWeight: 700, fontSize: 11
                            }}>
                              {s.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === "asistencia") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const mesesNombres = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      const diasSemanaNombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

      const formatNaturalTime = (timeVal) => {
        if (!timeVal) return "—";
        try {
          const date = new Date(timeVal);
          if (isNaN(date.getTime())) return timeVal;
          return date.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
        } catch (e) {
          return timeVal;
        }
      };

      const firstDay = new Date(year, month - 1, 1);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

      const calendarCells = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
      ];

      const getAsistenciaCellConfig = (dayNum) => {
        if (!dayNum) {
          return {
            bg: "transparent",
            color: "transparent",
            border: "1.5px solid transparent",
            label: "",
            tooltip: "",
            isEmpty: true
          };
        }

        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
        const item = asistenciasMes.find(a => a.fecha.split("T")[0] === dateStr);

        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const cellDate = new Date(year, month - 1, dayNum);

        if (cellDate > hoy) {
          return {
            bg: "transparent",
            color: "var(--text-muted)",
            border: "1px solid var(--card-border)",
            opacity: 0.35,
            label: `${dayNum}`,
            tooltip: `Día ${dayNum} - Futuro`
          };
        }

        if (!item) {
          return {
            bg: "var(--card-subbg)",
            color: "var(--text-muted)",
            border: "1px solid var(--card-border)",
            label: `${dayNum}`,
            tooltip: `Día ${dayNum} - Sin registro`
          };
        }

        if (item.isSuspension || item.estado === "PARO" || item.estado === "VACACIONES") {
          return {
            bg: "#fce7f3",
            color: "#9d174d",
            border: "1.5px solid #fbcfe8",
            label: `${dayNum}`,
            tooltip: `Día ${dayNum} (${item.estado === "PARO" ? "Paro" : "Vacaciones"}): ${item.observacion || "Día de suspensión de clases"}`
          };
        }

        switch (item.estado) {
          case "PRESENTE":
          case "FINALIZADO":
            return {
              bg: "#dcfce7",
              color: "#166534",
              border: "1.5px solid #86efac",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - Asistido. Entrada: ${item.hora_entrada || "—"} | Salida: ${item.hora_salida || "—"}`
            };
          case "TARDANZA":
          case "SALIDA_TEMPRANA":
            return {
              bg: "#ffedd5",
              color: "#c2410c",
              border: "1.5px solid #fed7aa",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - ${item.estado === "TARDANZA" ? "Entrada tarde" : "Salida temprana"}. Entrada: ${item.hora_entrada || "—"} | Salida: ${item.hora_salida || "—"}`
            };
          case "CON_PERMISO":
            return {
              bg: "#eff6ff",
              color: "#1d4ed8",
              border: "1.5px solid #bfdbfe",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - Justificado: ${item.observacion || "Ausente con novedad/permiso aprobado"}`
            };
          case "NO_PRESENTE":
            return {
              bg: "#fee2e2",
              color: "#991b1b",
              border: "1.5px solid #fecaca",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - Inasistencia: ${item.observacion || "No se registró asistencia"}`
            };
          case "NO_TIENE_CLASES":
            return {
              bg: "var(--card-subbg)",
              color: "var(--text-muted)",
              border: "1px solid var(--card-border)",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - Sin clases programadas en su horario`
            };
          case "PENDIENTE":
            return {
              bg: "var(--card-bg)",
              color: "var(--text-main)",
              border: "1.5px dashed var(--text-muted)",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum} - Hoy (Pendiente de registrar asistencia)`
            };
          default:
            return {
              bg: "var(--card-subbg)",
              color: "var(--text-main)",
              border: "1px solid var(--card-border)",
              label: `${dayNum}`,
              tooltip: `Día ${dayNum}: ${item.observacion || item.estado}`
            };
        }
      };

      const getTableStatusBadge = (estado) => {
        const config = {
          PRESENTE:        { label: "Presente",          bg: "#dcfce7", color: "#166534" },
          FINALIZADO:      { label: "Salida Registrada", bg: "#dbeafe", color: "#1e40af" },
          TARDANZA:        { label: "Entrada Tarde",     bg: "#ffedd5", color: "#c2410c" },
          SALIDA_TEMPRANA: { label: "Salida Temprana",   bg: "#f3e8ff", color: "#6b21a8" },
          NO_PRESENTE:     { label: "No Presente",        bg: "#fee2e2", color: "#991b1b" },
          CON_PERMISO:     { label: "Permiso/Novedad",   bg: "#eff6ff", color: "#1d4ed8" },
          PARO:            { label: "Paro",              bg: "#fce7f3", color: "#9d174d" },
          VACACIONES:      { label: "Vacaciones",        bg: "#fce7f3", color: "#9d174d" },
          NO_TIENE_CLASES: { label: "Sin Clases",        bg: "var(--card-subbg)", color: "var(--text-muted)" },
          PENDIENTE:       { label: "Pendiente",         bg: "var(--card-bg)", color: "var(--text-main)", border: "1.5px dashed var(--text-muted)" }
        };
        const c = config[estado] || { label: estado, bg: "#f1f5f9", color: "#475569" };
        return (
          <span style={{
            background: c.bg, color: c.color,
            border: c.border ? c.border : "none",
            padding: "4px 12px", borderRadius: 20,
            fontWeight: 700, fontSize: 11,
            fontFamily: "Hanken Grotesk, sans-serif",
            display: "inline-block"
          }}>{c.label}</span>
        );
      };

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* CALENDARIO DE ASISTENCIA */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                  Mi Registro Mensual de Asistencia
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Visualice de forma interactiva el cumplimiento de su asistencia diaria.</p>
              </div>
              
              {/* NAVEGADOR DE MESES */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-subbg)", padding: "4px 8px", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                <button 
                  onClick={handlePrevMonth}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-title)", fontSize: 16, fontWeight: 700, padding: "4px 8px" }}
                >
                  ◀
                </button>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-title)", minWidth: 120, textAlign: "center", textTransform: "capitalize" }}>
                  {mesesNombres[month - 1]} {year}
                </span>
                <button 
                  onClick={handleNextMonth}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-title)", fontSize: 16, fontWeight: 700, padding: "4px 8px" }}
                >
                  ▶
                </button>
              </div>
            </div>

            {loadingAsistencias ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 260, color: "var(--text-muted)", fontSize: 14 }}>
                Cargando calendario...
              </div>
            ) : (
              <>
                {/* GRILLA DEL CALENDARIO */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, maxWidth: 640, margin: "0 auto 20px" }}>
                  {/* Cabeceras de días */}
                  {diasSemanaNombres.map(d => (
                    <div key={d} style={{ textAlign: "center", fontWeight: 700, fontSize: 12, color: "var(--text-muted)", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                      {d}
                    </div>
                  ))}
                  
                  {/* Celdas de días */}
                  {calendarCells.map((dayNum, idx) => {
                    const config = getAsistenciaCellConfig(dayNum);
                    const isHovered = hoveredDay === idx;
                    
                    if (config.isEmpty) {
                      return <div key={`empty-${idx}`} />;
                    }

                    return (
                      <div
                        key={`day-${dayNum}`}
                        onMouseEnter={() => setHoveredDay(idx)}
                        onMouseLeave={() => setHoveredDay(null)}
                        title={config.tooltip}
                        style={{
                          aspectRatio: "1/1",
                          background: config.bg,
                          color: config.color,
                          border: config.border,
                          opacity: config.opacity || 1,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: config.isEmpty || config.opacity === 0.35 ? "default" : "pointer",
                          transform: isHovered && config.opacity !== 0.35 ? "scale(1.08)" : "scale(1)",
                          boxShadow: isHovered && config.opacity !== 0.35 ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
                          transition: "all 0.18s ease-in-out",
                          position: "relative"
                        }}
                      >
                        {config.label}
                      </div>
                    );
                  })}
                </div>

                {/* LEYENDA DEL CALENDARIO */}
                <div style={{ borderTop: "1px solid var(--card-border)", paddingTop: 16, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                  {[
                    { color: "#dcfce7", border: "#86efac", label: "Presente" },
                    { color: "#ffedd5", border: "#fed7aa", label: "Tarde/Salida Temp." },
                    { color: "#fce7f3", border: "#fbcfe8", label: "Paro/Vacaciones" },
                    { color: "#eff6ff", border: "#bfdbfe", label: "Novedad/Permiso" },
                    { color: "#fee2e2", border: "#fecaca", label: "Falta/Ausencia" },
                    { color: "var(--card-subbg)", border: "var(--card-border)", label: "Sin Clases" },
                    { color: "var(--card-bg)", border: "var(--text-muted)", label: "Hoy/Pendiente", dashed: true }
                  ].map(leg => (
                    <div key={leg.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 4,
                        background: leg.color,
                        border: leg.dashed ? `1.5px dashed ${leg.border}` : `1.5px solid ${leg.border}`
                      }} />
                      <span style={{ color: "var(--text-main)", fontWeight: 500 }}>{leg.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* HISTORIAL DETALLADO DE ASISTENCIAS */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
              Detalle del Historial
            </h3>

            {loadingAsistencias ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--text-muted)", fontSize: 14 }}>
                Cargando historial...
              </div>
            ) : asistenciasMes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#94a3b8", fontSize: 14 }}>
                No tienes registros de asistencia en el periodo seleccionado.
              </div>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Día / Fecha</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Hora Entrada</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Hora Salida</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Estado</th>
                      <th style={{ padding: "10px 14px", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistenciasMes.map((item) => (
                      <tr key={item.id_asistencia} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>
                          {getFechaLabelAsistencia(item.fecha)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#334155" }}>
                          {formatNaturalTime(item.hora_entrada)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "#334155" }}>
                          {formatNaturalTime(item.hora_salida)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          {getTableStatusBadge(item.estado)}
                        </td>
                        <td style={{ padding: "12px 14px", color: "#475569" }}>
                          {item.observacion || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeNav === "coberturas") {
      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
              Mis Coberturas Asignadas
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Lista completa de clases de reemplazo que te han sido asignadas.</p>
          </div>
          
          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>Fecha</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>Docente Ausente</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>Clase / Bloque</th>
                  <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>Horas</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", borderBottom: "1px solid var(--card-border)" }}>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {coberturasDocente.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No tienes coberturas asignadas.
                    </td>
                  </tr>
                ) : (
                  coberturasDocente.map((c) => (
                    <tr key={c.id_cobertura} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-main)" }}>
                        {new Date(c.fecha).toLocaleDateString("es-CO", { year: "numeric", month: "2-digit", day: "2-digit" })}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-main)" }}>
                        {c.docente_ausente ? `${c.docente_ausente.nombre} ${c.docente_ausente.apellido}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-main)" }}>
                        <div style={{ fontWeight: 600 }}>{c.horario?.nombre}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Bloque: {c.horario?.bloque} ({c.horario?.hora_inicio} – {c.horario?.hora_fin})</div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ background: "#fff7ed", color: "#ea580c", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                          {c.horas} {c.horas === 1 ? "hora" : "horas"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-main)" }}>
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
    }

    if (activeNav === "horario") {
      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Horario de la Semana Completa
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte la programación completa de sus clases asignadas de lunes a viernes.</p>
            </div>
          </div>
          <HorarioSemanaCalendario horarios={horarios} suspensiones={suspensiones} coberturas={coberturasDocente} />
        </div>
      );
    }

    if (activeNav === "configuration") {
      return <ConfigurationPanel usuario={usuario} onUsuarioUpdated={setUsuario} />;
    }

    // fallback para módulos no construidos
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 24 }}>
        <svg width="48" height="48" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24" style={{ marginBottom: 16 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#091437", fontFamily: "Hanken Grotesk, sans-serif" }}>Módulo en Construcción</h2>
        <p style={{ margin: "8px 0 0", fontSize: 14, color: "#64748b", textAlign: "center", maxWidth: 400 }}>
          El módulo de {NAV_ITEMS.find(n => n.key === activeNav)?.label} estará disponible en la próxima actualización académica. Por favor diríjase al apartado de <strong>Home</strong> o <strong>Mi Horario</strong>.
        </p>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "var(--bg-main)" }}>

      {/* TOAST */}
      <div style={{
        position: "fixed", top: 20, left: "50%", transform: `translateX(-50%) translateY(${notification.show ? 0 : -20}px)`,
        opacity: notification.show ? 1 : 0, pointerEvents: notification.show ? "auto" : "none",
        zIndex: 100, transition: "all 0.3s",
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 20px", borderRadius: 12,
        background: notification.type === "success" ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${notification.type === "success" ? "#86efac" : "#fecaca"}`,
        color: notification.type === "success" ? "#166534" : "#991b1b",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 14, fontWeight: 600,
      }}>
        {notification.type === "success" ? "✓" : "✕"} {notification.message}
      </div>

      {/* CABECERA TOP PARA CELULAR */}
      {isMobile && (
        <header style={{
          background: "#112D55", padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: "#fff", position: "sticky", top: 0, zIndex: 99,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
              <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>CHECKTIME</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ThemeToggle compact />
            <button
              onClick={handleSignOut}
              style={{ background: "rgba(239, 68, 68, 0.15)", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 6 }}
            >
              Salir
            </button>
          </div>
        </header>
      )}

      {/* SIDEBAR / BOTTOM BAR RESPONSIVO */}
      {isMobile ? (
        <aside style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: 62, background: "#112D55", zIndex: 1000,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "0 6px", borderTop: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 -3px 15px rgba(0,0,0,0.15)",
        }}>
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                style={{
                  background: "none", border: "none", color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", flex: 1, padding: "6px 0", gap: 3, outline: "none"
                }}
              >
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  {item.icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
                </svg>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: "-0.01em" }}>{item.label}</span>
              </button>
            );
          })}
        </aside>
      ) : (
        <aside style={{
          width: 216, flexShrink: 0, background: "#112D55",
          display: "flex", flexDirection: "column", padding: "20px 12px",
          position: "sticky", top: 0, height: "100vh",
        }}>
          {/* Brand */}
          <div style={{ padding: "6px 4px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
                <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif" }}>CHECKTIME</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 1 }}>Panel Docente</div>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", marginBottom: 8, background: "rgba(255,255,255,0.07)", borderRadius: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1F294D", border: "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
              {initiales}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "Hanken Grotesk, sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando..."}
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>Docente</div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <SidebarItem key={item.key} icon={item.icon} label={item.label}
                active={activeNav === item.key} onClick={() => setActiveNav(item.key)} />
            ))}
          </div>

          {/* Sign out & Theme Toggle */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Tema</span>
              <ThemeToggle compact />
            </div>
            <SidebarItem
              icon="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              label="Cerrar Sesión"
              active={false}
              danger={true}
              onClick={handleSignOut}
            />
          </div>
        </aside>
      )}

      {/* MAIN */}
      <main style={{
        flex: 1,
        padding: isMobile ? "18px 16px 84px" : "28px 32px",
        maxWidth: isMobile ? "100%" : "calc(100vw - 216px)",
        boxSizing: "border-box"
      }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif" }}>
              Bienvenido{usuario ? `, ${usuario.nombre}` : ""}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b", textTransform: "capitalize" }}>{fechaStr}</p>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ThemeToggle />
              <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 14px", fontSize: 22, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif", color: "var(--text-title)", letterSpacing: "-0.02em" }}>
                {horaStr}
              </div>
            </div>
          )}
        </div>

        {renderActiveContent()}

        <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
          CheckTime — Conectado como {usuario ? `${usuario.nombre} ${usuario.apellido}` : "..."}
        </p>
      </main>

      {/* VENTANA MODAL PARA REPORTAR NOVEDAD/PERMISO */}
      {showModalNovedad && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(9, 20, 55, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 16
        }}>
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, width: "100%", maxWidth: 600,
            maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex", flexDirection: "column", border: "1px solid var(--card-border)"
          }}>
            {/* Header */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Reportar Novedad o Permiso</h3>
              <button onClick={() => { setShowModalNovedad(false); setNovedadOPermiso(""); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
            </div>

            {novedadOPermiso === "" ? (
              <div style={{ padding: "30px 24px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", fontFamily: "Hanken Grotesk, sans-serif" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#475569", textAlign: "center" }}>
                  ¿Qué tipo de solicitud deseas registrar?
                </p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, width: "100%", marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setNovedadOPermiso("NOVEDAD")}
                    style={{
                      padding: "24px 16px", border: "2px solid #cbd5e1", borderRadius: 12,
                      background: "#f8fafc", cursor: "pointer", transition: "all 0.2s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      outline: "none"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span style={{ fontSize: 24 }}>⏰</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Reportar Novedad (Hoy)</span>
                    <span style={{ fontSize: 11.5, color: "#64748b", textAlign: "center", lineHeight: 1.4 }}>Registrar ausencias, tardanzas o salidas anticipadas para el día de hoy.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovedadOPermiso("PERMISO")}
                    style={{
                      padding: "24px 16px", border: "2px solid #cbd5e1", borderRadius: 12,
                      background: "#f8fafc", cursor: "pointer", transition: "all 0.2s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                      outline: "none"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
                  >
                    <span style={{ fontSize: 24 }}>📄</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>Solicitar Permiso</span>
                    <span style={{ fontSize: 11.5, color: "#64748b", textAlign: "center", lineHeight: 1.4 }}>Solicitar autorización anticipada para ausencias en próximas fechas.</span>
                  </button>
                </div>
              </div>
            ) : novedadOPermiso === "NOVEDAD" ? (
              <form onSubmit={registrarNovedad} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
                
                <button
                  type="button"
                  onClick={() => setNovedadOPermiso("")}
                  style={{
                    alignSelf: "flex-start", padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
                    background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 4
                  }}
                >
                  ← Volver a selección
                </button>

                {/* Helper Text */}
                <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.4, background: "#f8fafc", padding: "10px 14px", borderRadius: 8, borderLeft: "4px solid #112D55" }}>
                  Selecciona la novedad que mejor describe tu situación de hoy… este registro activa el seguimiento y, si aplica, la cobertura de clases. Si tienes duda… elige la opción que más afecte la jornada y explícalo en “Descripción breve”.
                </p>

                {/* Tipo Novedad */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                    Selecciona el tipo de novedad: <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { value: "1", label: "Ausencia total", desc: "No asistes a la institución durante la jornada o no puedes atender tus clases programadas." },
                      { value: "2", label: "Tardanza", desc: "Llegas después de la hora de inicio de tu jornada o después del inicio de tu primera clase." },
                      { value: "3", label: "Salida anticipada", desc: "Te retiras antes de la hora oficial de salida o antes de completar tus clases del día." },
                      { value: "4", label: "Permiso", desc: "Autorización para ausentarte parcial o totalmente por motivo personal o administrativo (con soporte y/o autorización)." },
                      { value: "5", label: "Comisión institucional", desc: "Actividad asignada por la institución o entidad oficial que te impide cumplir total o parcialmente tu horario (reunión, capacitación, citación, diligencia institucional)." }
                    ].map(opt => (
                      <label key={opt.value} style={{
                        display: "flex", gap: 10, padding: "10px 12px", border: "1px solid #e2e8f0",
                        borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                        background: tipoNovedad === opt.value ? "#f0f4ff" : "#fff",
                        borderColor: tipoNovedad === opt.value ? "#112D55" : "#e2e8f0"
                      }}>
                        <input type="radio" name="tipoNovedad" value={opt.value} checked={tipoNovedad === opt.value} onChange={(e) => setTipoNovedad(e.target.value)} style={{ marginTop: 2 }} />
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{opt.label}</span>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b", lineHeight: 1.3 }}>{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fecha */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Fecha de la novedad (Fecha) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input type="text" value={new Date().toLocaleDateString("es-CO", { year: 'numeric', month: '2-digit', day: '2-digit' })} disabled style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#f1f5f9", color: "#64748b", fontSize: 13.5, boxSizing: "border-box" }} />
                </div>

                {/* Clases Afectadas */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Clases afectadas hoy:
                  </label>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b" }}>
                    Indica los grupos que se verán afectados por la novedad… ejemplo: 3A, 3B, 7°2. Esto permite activar cobertura y evitar pérdida de clase.
                  </p>
                  {horariosHoy.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "#64748b", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                      No tienes clases programadas para hoy.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "4px 0" }}>
                      {horariosHoy.map(c => {
                        const isChecked = clasesAfectadas.includes(c.id_horario);
                        return (
                          <label key={c.id_horario} style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                            border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
                            background: isChecked ? "#f0fdf4" : "#fff",
                            borderColor: isChecked ? "#4ade80" : "#e2e8f0"
                          }}>
                            <input type="checkbox" checked={isChecked} onChange={() => {
                              if (isChecked) {
                                setClasesAfectadas(prev => prev.filter(id => id !== c.id_horario));
                              } else {
                                setClasesAfectadas(prev => [...prev, c.id_horario]);
                              }
                            }} />
                            <span style={{ fontSize: 12.5, color: "#0f172a" }}>{c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre} ({c.hora_inicio} - {c.hora_fin})</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Causa */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Causa (Desplegable) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                    Selecciona la causa principal… este campo se usa para análisis institucional de ausentismo y planes de mejora.
                  </p>
                  <select value={causa} onChange={(e) => setCausa(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, background: "#fff", boxSizing: "border-box" }}>
                    <option value="">-- Selecciona una causa --</option>
                    <option value="Salud">1. Salud</option>
                    <option value="Calamidad">2. Calamidad</option>
                    <option value="Trámite personal">3. Trámite personal</option>
                    <option value="Comisión / actividad institucional">4. Comisión / actividad institucional</option>
                    <option value="Transporte / movilidad">5. Transporte / movilidad</option>
                    <option value="Otro">6. Otro</option>
                  </select>
                </div>

                {/* Descripción Breve */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Descripción breve (Párrafo) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                    Explica en una o dos líneas la situación… sin detalles sensibles… y deja claro si requiere cobertura inmediata.
                  </p>
                  <textarea value={descripcionBreve} onChange={(e) => setDescripcionBreve(e.target.value)} required rows={3} placeholder="Escribe aquí la descripción de la novedad..." style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                {/* Soporte */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Soporte (si aplica) (Subir archivo)
                  </label>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                    Adjunta soporte cuando exista (incapacidad, citación, permiso, comisión, etc.)… formato PDF o imagen.
                  </p>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => setArchivoSoporte(e.target.files[0])} style={{ width: "100%", fontSize: 13 }} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <button type="button" onClick={() => { setShowModalNovedad(false); setNovedadOPermiso(""); }} disabled={modalLoading} style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", color: "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={modalLoading} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "#112D55", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {modalLoading ? "Guardando..." : "Enviar Novedad"}
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={registrarPermiso} style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
                
                <button
                  type="button"
                  onClick={() => setNovedadOPermiso("")}
                  style={{
                    alignSelf: "flex-start", padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: 6,
                    background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600, cursor: "pointer", marginBottom: 4
                  }}
                >
                  ← Volver a selección
                </button>

                {/* Helper Text */}
                <p style={{ margin: 0, fontSize: 12, color: "#475569", lineHeight: 1.4, background: "#f8fafc", padding: "10px 14px", borderRadius: 8, borderLeft: "4px solid #112D55" }}>
                  Completa tu solicitud de permiso con anticipación. Recuerda que los permisos deben solicitarse con al menos 48 horas de anticipación; de lo contrario, se notificará al rector con una advertencia de retraso.
                </p>

                {/* Tipo de Permiso */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                    Tipo de permiso: <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select value={tipoPermiso} onChange={(e) => setTipoPermiso(e.target.value)} required style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, background: "#fff", boxSizing: "border-box" }}>
                    <option value="">-- Selecciona el tipo de permiso --</option>
                    {tiposPermiso.map(t => (
                      <option key={t.id_tipo_permiso} value={t.id_tipo_permiso}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Fechas */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                      Fecha Inicio: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input type="date" value={fechaInicioPermiso} onChange={(e) => setFechaInicioPermiso(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                      Fecha Fin: <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input type="date" value={fechaFinPermiso} onChange={(e) => setFechaFinPermiso(e.target.value)} required style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, boxSizing: "border-box" }} />
                  </div>
                </div>

                {/* Conditional clases affected check */}
                {(() => {
                  if (!fechaInicioPermiso || fechaInicioPermiso !== fechaFinPermiso) return null;
                  const diasSemana = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];
                  const parts = fechaInicioPermiso.split("-");
                  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                  const weekday = diasSemana[dateObj.getDay()];
                  const clasesDia = horarios.filter(h => normalizar(h.dia_semana) === normalizar(weekday));

                  return (
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                        Clases afectadas en este día:
                      </label>
                      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#64748b" }}>
                        Selecciona las clases específicas afectadas para tu permiso de un solo día.
                      </p>
                      {clasesDia.length === 0 ? (
                        <div style={{ fontSize: 12.5, color: "#64748b", padding: "8px 12px", background: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
                          No tienes clases programadas para este día de la semana.
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "4px 0" }}>
                          {clasesDia.map(c => {
                            const isChecked = clasesAfectadasPermiso.includes(c.id_horario);
                            return (
                              <label key={c.id_horario} style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                                border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer",
                                background: isChecked ? "#f0fdf4" : "#fff",
                                borderColor: isChecked ? "#4ade80" : "#e2e8f0"
                              }}>
                                <input type="checkbox" checked={isChecked} onChange={() => {
                                  if (isChecked) {
                                    setClasesAfectadasPermiso(prev => prev.filter(id => id !== c.id_horario));
                                  } else {
                                    setClasesAfectadasPermiso(prev => [...prev, c.id_horario]);
                                  }
                                }} />
                                <span style={{ fontSize: 12.5, color: "#0f172a" }}>{c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre} ({c.hora_inicio} - {c.hora_fin})</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Motivo del Permiso */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Motivo de la ausencia: <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                    Escribe detalladamente la causa de la solicitud (se usará para la evaluación del Rector).
                  </p>
                  <input type="text" value={motivoPermiso} onChange={(e) => setMotivoPermiso(e.target.value)} required placeholder="Ej: Cita médica especialista, Defunción familiar, etc." style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, background: "#fff", boxSizing: "border-box" }} />
                </div>

                {/* Descripción Detallada */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Descripción breve: <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea value={descripcionPermiso} onChange={(e) => setDescripcionPermiso(e.target.value)} required rows={3} placeholder="Explica detalladamente la razón de la solicitud..." style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 13.5, fontFamily: "inherit", boxSizing: "border-box" }} />
                </div>

                {/* Soporte PDF */}
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    Documento de soporte (Subir PDF / Imagen):
                  </label>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#64748b" }}>
                    Adjunte la justificación correspondiente en formato PDF o imagen.
                  </p>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => setArchivoSoportePermiso(e.target.files[0])} style={{ width: "100%", fontSize: 13 }} />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
                  <button type="button" onClick={() => { setShowModalNovedad(false); setNovedadOPermiso(""); }} disabled={modalLoading} style={{ padding: "10px 16px", border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", color: "#334155", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={modalLoading} style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "#112D55", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {modalLoading ? "Enviando..." : "Enviar Solicitud"}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
