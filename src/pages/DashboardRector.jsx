/**
 * @file DashboardRector.jsx
 * @description Panel de control de Rectoría de CheckTime.
 * Ofrece la suite completa de administración del sistema escolar: gestión de horarios de docentes, aprobación/rechazo de solicitudes de permisos y novedades, visualización en tiempo real del estado de asistencia diaria, gestión del listado de personal (Staff - activar/desactivar cuentas), consulta de analíticas avanzadas de ausentismo con gráficas y reportes exportables en Excel y PDF, y un panel de control escolar para registrar suspensiones generales (vacaciones, paros).
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import logo from "../assets/logo.jpeg";
import ThemeToggle from "../components/ThemeToggle";
import ConfigurationPanel from "../components/ConfigurationPanel";

import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
const getUploadUrl = (archivo) => {
  const backendUrl = axios.defaults.baseURL ? axios.defaults.baseURL.replace("/api", "") : "http://localhost:3000";
  return `${backendUrl}/uploads/${archivo}`;
};
const getLocalTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "schedules", label: "Schedules", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "requests", label: "Permits / Novelties", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { key: "attendance", label: "Attendance", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
  { key: "staff", label: "Staff", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { key: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { key: "configuration", label: "Configuration", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

const PERIODS = [
  { id: "1ra", label: "1ra hora", inicio: "07:00", fin: "07:55" },
  { id: "2da", label: "2da hora", inicio: "07:55", fin: "08:50" },
  { id: "3ra", label: "3ra hora", inicio: "08:50", fin: "09:45" },
  { id: "DP", label: "D.P. (Descanso)", inicio: "09:45", fin: "10:05" },
  { id: "4ta", label: "4ta hora", inicio: "10:05", fin: "11:00" },
  { id: "5ta", label: "5ta hora", inicio: "11:00", fin: "11:55" },
  { id: "Alm", label: "Alm. (Almuerzo)", inicio: "11:55", fin: "12:25" },
  { id: "6ta", label: "6ta hora", inicio: "12:25", fin: "13:20" },
  { id: "7ma", label: "7ma hora", inicio: "13:20", fin: "14:15" },
];

function HorarioCalendario({ value, onChange, defaultNombre = "", defaultBloque = "" }) {
  const blocks = value || {};

  const handleToggle = (dia, periodId) => {
    const current = blocks[dia] || {};
    const updated = { ...current };
    const cell = current[periodId];
    if (!cell) {
      updated[periodId] = {
        nombre: defaultNombre || "Clase",
        bloque: defaultBloque || "",
        es_pedagogica: false
      };
    } else if (cell.nombre !== "HORA PEDAGOGICA" && !cell.es_pedagogica) {
      updated[periodId] = {
        nombre: "HORA PEDAGOGICA",
        bloque: "Pedagógica",
        es_pedagogica: true
      };
    } else {
      delete updated[periodId];
    }
    onChange({ ...blocks, [dia]: updated });
  };

  const handleUpdateDetails = (dia, periodId, field, val) => {
    const current = blocks[dia] || {};
    const updated = {
      ...current,
      [periodId]: {
        ...current[periodId],
        [field]: val
      }
    };
    onChange({ ...blocks, [dia]: updated });
  };

  return (
    <div style={{ userSelect: "none", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `130px repeat(${DIAS.length}, 1fr)`, minWidth: 620, gap: 6 }}>
        <div />
        {DIAS.map((d) => (
          <div key={d} style={{ textAlign: "center", padding: "8px 2px", fontSize: 13, fontWeight: 700, color: "#1F294D", fontFamily: "Hanken Grotesk, sans-serif" }}>
            {d}
          </div>
        ))}

        {PERIODS.map((period) => {
          const isBreak = period.id === "DP" || period.id === "Alm";
          return (
            <div key={period.id} style={{ display: "contents" }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#1F294D",
                  paddingRight: 8,
                  textAlign: "right",
                  alignSelf: "center",
                  fontWeight: 700,
                  fontFamily: "Hanken Grotesk, sans-serif",
                  lineHeight: "1.2"
                }}
              >
                <div>{period.label}</div>
                <div style={{ fontSize: 9, color: "#64748b", fontWeight: 500 }}>{period.inicio} – {period.fin}</div>
              </div>
              {DIAS.map((dia) => {
                const cellVal = blocks[dia]?.[period.id];
                const isSelected = !!cellVal;
                const isPed = cellVal?.nombre === "HORA PEDAGOGICA" || cellVal?.es_pedagogica;
                return (
                  <div
                    key={`${dia}-${period.id}`}
                    onClick={() => handleToggle(dia, period.id)}
                    style={{
                      height: 34,
                      borderRadius: 6,
                      background: isPed
                        ? "#f3e8ff"
                        : isSelected
                        ? "#3b82f6"
                        : isBreak
                        ? "var(--card-subbg)"
                        : "var(--card-bg)",
                      cursor: "pointer",
                      border: isPed
                        ? "2.5px solid #9333ea"
                        : isSelected
                        ? "2.5px solid #1d4ed8"
                        : isBreak
                        ? "1px dashed var(--card-border)"
                        : "1px solid var(--card-border)",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isPed
                        ? "#6b21a8"
                        : isSelected
                        ? "#fff"
                        : "var(--text-muted)",
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !isPed) {
                        e.currentTarget.style.background = isBreak ? "var(--card-border)" : "var(--bg-main)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !isPed) {
                        e.currentTarget.style.background = isBreak ? "var(--card-subbg)" : "var(--card-bg)";
                      }
                    }}
                  >
                    {isPed ? "Pedag." : isSelected ? "✓" : isBreak ? period.id : ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1F294D", fontFamily: "Hanken Grotesk, sans-serif" }}>Clases marcadas para esta semana (Configure asignatura y bloque):</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {DIAS.flatMap((dia) =>
            Object.entries(blocks[dia] || {}).map(([periodId, details]) => {
              const p = PERIODS.find((x) => x.id === periodId);
              if (!p) return null;
              return (
                <div
                  key={`${dia}-${periodId}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    background: "#f0f4ff",
                    border: "1px solid #c7d7f9",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 12,
                    color: "#1F294D",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#112D55" }}>{dia}: {p.label} ({p.inicio} – {p.fin})</span>
                    <button
                      onClick={() => handleToggle(dia, periodId)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, fontWeight: 700, padding: 0 }}
                    >
                      × Eliminar
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 3, fontWeight: 700 }}>Asignatura</label>
                      <input
                        type="text"
                        value={details.nombre || ""}
                        onChange={(e) => handleUpdateDetails(dia, periodId, "nombre", e.target.value)}
                        placeholder="Materia..."
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: "#475569", display: "block", marginBottom: 3, fontWeight: 700 }}>Bloque</label>
                      <input
                        type="text"
                        value={details.bloque || ""}
                        onChange={(e) => handleUpdateDetails(dia, periodId, "bloque", e.target.value)}
                        placeholder="Bloque..."
                        style={{ width: "100%", padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12, boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {Object.values(blocks).every((v) => !v || Object.keys(v).length === 0) && (
          <span style={{ fontSize: 12, color: "#94a3b8" }}>Haga clic sobre las celdas del calendario para seleccionar las horas de clase.</span>
        )}
      </div>
    </div>
  );
}

function ModalAgregarHorario({ onClose, profesores, onSave }) {
  const [form, setForm] = useState({ id_usuario: "", nombre: "", bloque: "" });
  const [bloques, setBloques] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const entradasValidas = Object.entries(bloques).flatMap(([dia, periodObj]) =>
      Object.entries(periodObj || {}).map(([pId, details]) => {
        const period = PERIODS.find((p) => p.id === pId);
        return {
          nombre: details.nombre || form.nombre || "Clase",
          dia_semana: dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(),
          hora_inicio: period.inicio,
          hora_fin: period.fin,
          bloque: details.bloque || form.bloque || "Salón",
          id_usuario: parseInt(form.id_usuario),
        };
      })
    );
    if (!entradasValidas.length || !form.id_usuario) {
      alert("Por favor selecciona un docente y marca al menos una hora en el calendario.");
      return;
    }
    try {
      setSaving(true);
      for (const entrada of entradasValidas) {
        await axios.post("/horario", entrada);
      }
      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error al guardar los horarios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(820px, 96vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Agregar Nuevo Horario</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Configure la asignación de docentes, materias y bloques para el período académico.</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", padding: 4 }}>×</button>
        </div>

        <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Docente</label>
            <select
              value={form.id_usuario}
              onChange={(e) => setForm((f) => ({ ...f, id_usuario: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
            >
              <option value="">Seleccionar docente...</option>
              {profesores.map((p) => (
                <option key={p.id_usuario} value={p.id_usuario}>{p.nombre} {p.apellido}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Materia por defecto</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej. Matemáticas, Física..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Bloque por defecto</label>
            <input
              value={form.bloque}
              onChange={(e) => setForm((f) => ({ ...f, bloque: e.target.value }))}
              placeholder="Ej. 402-B, Lab. Ciencias..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ padding: "0 28px 8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Configuración Semanal</label>
          </div>
          <div style={{ background: "var(--card-subbg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 16 }}>
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted)" }}>
              Haga clic sobre las celdas para marcar los bloques asignados de lunes a viernes.
            </p>
            <HorarioCalendario value={bloques} onChange={setBloques} defaultNombre={form.nombre} defaultBloque={form.bloque} />
          </div>
        </div>

        <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ padding: "10px 20px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || success}
            style={{
              padding: "10px 22px", border: "none", borderRadius: 8,
              background: success ? "#006d33" : "#1F294D",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s"
            }}
          >
            {success ? "✓ Guardado" : saving ? "Guardando..." : "Guardar Horario"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de edición semanal unificada por docente
function ModalEditarHorarioDocente({ onClose, docente, onSave }) {
  const [form, setForm] = useState({ nombre: "", bloque: "" });
  const [bloques, setBloques] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDocenteSchedules = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/horario/${docente.id_usuario}`);
        const currentSchedules = res.data || [];
        
        // Prefilar Asignatura y Bloque con el primer registro encontrado
        if (currentSchedules.length > 0) {
          setForm({
            nombre: currentSchedules[0].nombre,
            bloque: currentSchedules[0].bloque
          });
        }

        // Mapear registros horarios a la grilla bloques
        const bloquesIniciales = {};
        DIAS.forEach(d => { bloquesIniciales[d] = {}; });

        currentSchedules.forEach(c => {
          const matchedDia = DIAS.find(d => d.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() === c.dia_semana.toUpperCase());
          const matchedPeriod = PERIODS.find(p => matchTime(p.inicio, c.hora_inicio) && matchTime(p.fin, c.hora_fin));
          if (matchedDia && matchedPeriod) {
            bloquesIniciales[matchedDia][matchedPeriod.id] = {
              nombre: c.nombre,
              bloque: c.bloque
            };
          }
        });

        setBloques(bloquesIniciales);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDocenteSchedules();
  }, [docente]);

  const handleSubmit = async () => {
    const entradasValidas = Object.entries(bloques).flatMap(([dia, periodObj]) =>
      Object.entries(periodObj || {}).map(([pId, details]) => {
        const period = PERIODS.find((p) => p.id === pId);
        return {
          nombre: details.nombre || form.nombre || "Clase",
          dia_semana: dia.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(),
          hora_inicio: period.inicio,
          hora_fin: period.fin,
          bloque: details.bloque || form.bloque || "Salón",
        };
      })
    );

    try {
      setSaving(true);
      // Petición PUT atómica de horarios para el docente
      await axios.put(`/horario/docente/${docente.id_usuario}`, { clases: entradasValidas });
      setSuccess(true);
      setTimeout(() => {
        onSave();
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
      alert("Error al actualizar el horario del docente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(820px, 96vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "24px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Editar Horario Semanal</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>Modifique la asignación académica del docente: <strong>{docente.nombre} {docente.apellido}</strong></p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", padding: 4 }}>×</button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
            Cargando la configuración académica del docente...
          </div>
        ) : (
          <>
            <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Materia por defecto</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej. Matemáticas, Física..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Bloque por defecto</label>
                <input
                  value={form.bloque}
                  onChange={(e) => setForm((f) => ({ ...f, bloque: e.target.value }))}
                  placeholder="Ej. 402-B, Lab. Ciencias..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div style={{ padding: "0 28px 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Configuración Semanal del Horario</label>
              </div>
              <div style={{ background: "var(--card-subbg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--text-muted)" }}>
                  Haga clic sobre las celdas para marcar o desmarcar las horas asignadas de lunes a viernes.
                </p>
                <HorarioCalendario value={bloques} onChange={setBloques} defaultNombre={form.nombre} defaultBloque={form.bloque} />
              </div>
            </div>

            <div style={{ padding: "16px 28px 24px", display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                onClick={onClose}
                style={{ padding: "10px 20px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || success}
                style={{
                  padding: "10px 22px", border: "none", borderRadius: 8,
                  background: success ? "#006d33" : "#1F294D",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8, transition: "background 0.2s"
                }}
              >
                {success ? "✓ Guardado" : saving ? "Guardando..." : "Guardar Horario"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, width: "100%",
        padding: "11px 16px", border: "none", borderRadius: 8, cursor: "pointer",
        background: active ? "rgba(255,255,255,0.15)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.65)",
        fontFamily: "Hanken Grotesk, sans-serif",
        fontSize: 14, fontWeight: active ? 600 : 400,
        textAlign: "left", transition: "all 0.15s",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        {icon.split(" M").map((d, i) => <path key={i} d={i === 0 ? d : "M" + d} />)}
      </svg>
      {label}
    </button>
  );
}

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  return {
    h: parseInt(parts[0], 10),
    m: parseInt(parts[1], 10)
  };
};

const matchTime = (t1, t2) => {
  const p1 = parseTime(t1);
  const p2 = parseTime(t2);
  if (!p1 || !p2) return false;
  return p1.h === p2.h && p1.m === p2.m;
};

const isClaseActual = (horaInicio, horaFin) => {
  try {
    const ahora = new Date();
    const [hIni, mIni] = horaInicio.split(":").map(Number);
    const [hFin, mFin] = horaFin.split(":").map(Number);

    const timeIni = new Date(ahora);
    timeIni.setHours(hIni, mIni, 0, 0);

    const timeFin = new Date(ahora);
    timeFin.setHours(hFin, mFin, 0, 0);

    return ahora >= timeIni && ahora <= timeFin;
  } catch (e) {
    return false;
  }
};

export default function DashboardRector() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [profesores, setProfesores] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [signOutHovered, setSignOutHovered] = useState(false);
  const [coberturas, setCoberturas] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showAgregarUsuarioModal, setShowAgregarUsuarioModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchQueryStaff, setSearchQueryStaff] = useState("");

  // Estados para horarios
  const [horariosGlobales, setHorariosGlobales] = useState([]);
  const [todosHorarios, setTodosHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDocente, setEditingDocente] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para novedades
  const [novedades, setNovedades] = useState([]);
  const [filtroEstadoNovedad, setFiltroEstadoNovedad] = useState("TODOS");
  const [selectedNovedad, setSelectedNovedad] = useState(null);

  // Estados para permisos
  const [permisos, setPermisos] = useState([]);
  const [selectedPermiso, setSelectedPermiso] = useState(null);

  const handleActualizarEstado = async (id_novedad, nuevoEstado) => {
    try {
      await axios.put(`/novedades/${id_novedad}/estado`, { estado: nuevoEstado });
      await loadData();
      setSelectedNovedad(null);
    } catch (e) {
      console.error("Error al actualizar estado de novedad:", e);
      alert("Ocurrió un error al actualizar el estado de la novedad.");
    }
  };

  const handleActualizarEstadoPermiso = async (id_permiso, nuevoEstado) => {
    try {
      await axios.put(`/permisos/${id_permiso}/estado`, { estado: nuevoEstado });
      await loadData();
      setSelectedPermiso(null);
    } catch (e) {
      console.error("Error al actualizar estado de permiso:", e);
      alert("Ocurrió un error al actualizar el estado del permiso.");
    }
  };

  // Estados para Reporte de Asistencias
  const [reporteAsistencias, setReporteAsistencias] = useState([]);
  const [reporteLoading, setReporteLoading] = useState(false);

  // Estados para suspensiones/vacaciones
  const [suspensiones, setSuspensiones] = useState([]);
  const [suspensionHoy, setSuspensionHoy] = useState(null);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showVacacionesModal, setShowVacacionesModal] = useState(false);
  const [showSuspensionListModal, setShowSuspensionListModal] = useState(false);

  const [filtroDocente, setFiltroDocente] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("dia");

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMonthStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [filtroFecha, setFiltroFecha] = useState(getTodayStr());
  const [filtroMes, setFiltroMes] = useState(getMonthStr());
  const [filtroFechaInicio, setFiltroFechaInicio] = useState(getTodayStr());
  const [filtroFechaFin, setFiltroFechaFin] = useState(getTodayStr());

  const cargarReporteAsistencias = async () => {
    try {
      setReporteLoading(true);
      const params = {};
      if (filtroDocente) {
        params.id_usuario = filtroDocente;
      }

      if (filtroPeriodo === "dia") {
        params.fecha = filtroFecha;
      } else if (filtroPeriodo === "mes") {
        params.mes = filtroMes;
      } else if (filtroPeriodo === "rango") {
        params.fecha_inicio = filtroFechaInicio;
        params.fecha_fin = filtroFechaFin;
      }

      const res = await axios.get("/asistencia/reporte", { params });
      setReporteAsistencias(res.data || []);
    } catch (e) {
      console.error("Error al cargar reporte de asistencias:", e);
    } finally {
      setReporteLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "attendance") {
      cargarReporteAsistencias();
    }
  }, [activeNav]);

  const exportarAExcel = () => {
    if (reporteAsistencias.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const data = reporteAsistencias.map((r) => {
      const nombreDocente = r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : "Docente Desconocido";
      const docDocente = r.usuario ? r.usuario.documento : "-";
      const fecha = new Date(r.fecha).toLocaleDateString("es-CO");
      const entrada = r.hora_entrada ? new Date(r.hora_entrada).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "Ausente";
      const salida = r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "-";
      const tardanza = r.minutos_tardanza ? `${r.minutos_tardanza} min` : "-";
      const salidaAnticipada = r.minutos_salida_anticipada ? `${r.minutos_salida_anticipada} min` : "-";
      
      let estadoLabel = r.estado;
      if (r.estado === "PRESENTE") estadoLabel = "Presente";
      else if (r.estado === "TARDANZA") estadoLabel = "Entrada Tarde";
      else if (r.estado === "FINALIZADO") estadoLabel = "Salida Registrada";
      else if (r.estado === "SALIDA_TEMPRANA") estadoLabel = "Salida Temprana";
      else if (r.estado === "NO_PRESENTE") estadoLabel = "Ausente";
      else if (r.estado === "CON_PERMISO") estadoLabel = "Permiso/Novedad";
      else if (r.estado === "NO_TIENE_CLASES") estadoLabel = "Sin Clases";

      return {
        "Docente": nombreDocente,
        "Identificación": docDocente,
        "Fecha": fecha,
        "Hora Entrada": entrada,
        "Hora Salida": salida,
        "Minutos Tardanza": tardanza,
        "Minutos Salida Anticipada": salidaAnticipada,
        "Estado": estadoLabel
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias");
    
    // Auto-fit column widths
    const maxLens = {};
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        const val = String(row[key] || "");
        maxLens[key] = Math.max(maxLens[key] || 10, val.length + 3);
      });
    });
    worksheet["!cols"] = Object.keys(maxLens).map(key => ({ wch: maxLens[key] }));

    XLSX.writeFile(workbook, `Reporte_Asistencias_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportarAPDF = () => {
    if (reporteAsistencias.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const reporteFiltrado = reporteAsistencias.filter(r => r.estado !== "NO_TIENE_CLASES");

    if (reporteFiltrado.length === 0) {
      alert("No hay registros de asistencia, inasistencias o permisos para exportar en este período (excluyendo días sin clase).");
      return;
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Color Palette
    const primaryColor = [17, 45, 85]; // Dark Blue #112D55
    const secondaryColor = [71, 85, 105]; // Slate Gray #475569

    // Title & Header layout
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("CHECKTIME SYSTEM", 14, 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("REPORTE ACADÉMICO DE ASISTENCIA Y COBERTURAS", 14, 20);

    // Generation timestamp and meta
    doc.setFontSize(9);
    doc.text(`Generado: ${new Date().toLocaleString("es-CO")}`, 140, 14);
    
    let filtroText = "Filtro: ";
    if (filtroPeriodo === "dia") filtroText += `Día ${filtroFecha}`;
    else if (filtroPeriodo === "mes") filtroText += `Mes ${filtroMes}`;
    else if (filtroPeriodo === "rango") filtroText += `Rango ${filtroFechaInicio} al ${filtroFechaFin}`;
    
    if (filtroDocente) {
      const selectedProf = profesores.find(p => p.id_usuario === parseInt(filtroDocente));
      if (selectedProf) {
        filtroText += ` | Docente: ${selectedProf.nombre} ${selectedProf.apellido}`;
      }
    } else {
      filtroText += " | Todos los docentes";
    }
    const filtroLines = doc.splitTextToSize(filtroText, 60);
    doc.text(filtroLines, 140, 20);

    // Calculate summary statistics first
    const total = reporteFiltrado.length;
    const tardanzas = reporteFiltrado.filter(r => r.estado === "TARDANZA").length;
    const salidasTempranas = reporteFiltrado.filter(r => r.estado === "SALIDA_TEMPRANA").length;
    const ausentes = reporteFiltrado.filter(r => r.estado === "NO_PRESENTE").length;
    const permisosCount = reporteFiltrado.filter(r => r.estado === "CON_PERMISO").length;

    // Draw Summary Section (BEFORE THE TABLE)
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RESUMEN DE ASISTENCIA", 14, 42);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 47, 182, 20, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ESTADÍSTICAS GENERALES:", 18, 54);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(8.5);
    doc.text(`Total registros: ${total}`, 18, 61);
    doc.text(`Tardanzas: ${tardanzas}`, 58, 61);
    doc.text(`Salidas Tempranas: ${salidasTempranas}`, 93, 61);
    doc.text(`Ausentes: ${ausentes}`, 135, 61);
    doc.text(`Permisos: ${permisosCount}`, 168, 61);

    // Document Body Title for table
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("REGISTROS DE ASISTENCIA ENCONTRADOS", 14, 75);

    // Prepare table headers and body
    const headers = [["Docente", "Identificación", "Fecha", "Entrada", "Salida", "Tardanza", "S. Anticipada", "Estado"]];
    const body = reporteFiltrado.map((r) => {
      const fecha = new Date(r.fecha).toLocaleDateString("es-CO");
      if (r.isSuspension) {
        const nombreDocente = `DÍA SIN CLASE: ${r.observacion.replace("Día sin clases por: ", "")}`;
        const docDocente = "-";
        const entrada = "-";
        const salida = "-";
        const tardanza = "-";
        const salidaAnticipada = "-";
        const estadoLabel = r.estado === "PARO" ? "Paro" : "Vacaciones";
        return [nombreDocente, docDocente, fecha, entrada, salida, tardanza, salidaAnticipada, estadoLabel];
      }

      const nombreDocente = r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : "Docente Desconocido";
      const docDocente = r.usuario ? r.usuario.documento : "-";
      const entrada = r.hora_entrada ? new Date(r.hora_entrada).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "Ausente";
      const salida = r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "-";
      const tardanza = r.minutos_tardanza ? `+${r.minutos_tardanza}m` : "-";
      const salidaAnticipada = r.minutos_salida_anticipada ? `-${r.minutos_salida_anticipada}m` : "-";

      let estadoLabel = r.estado;
      if (r.estado === "PRESENTE") estadoLabel = "Presente";
      else if (r.estado === "TARDANZA") estadoLabel = "Entrada Tarde";
      else if (r.estado === "FINALIZADO") estadoLabel = "Salida Reg.";
      else if (r.estado === "SALIDA_TEMPRANA") estadoLabel = "Salida Temp.";
      else if (r.estado === "NO_PRESENTE") estadoLabel = "Ausente";
      else if (r.estado === "CON_PERMISO") estadoLabel = "Permiso/Novedad";
      else if (r.estado === "PARO") estadoLabel = "Paro";
      else if (r.estado === "VACACIONES") estadoLabel = "Vacaciones";

      return [nombreDocente, docDocente, fecha, entrada, salida, tardanza, salidaAnticipada, estadoLabel];
    });

    // Render table (AFTER THE SUMMARY)
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 85,
      theme: "striped",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: "bold",
        halign: "center"
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 24, halign: "center" },
        2: { cellWidth: 22, halign: "center" },
        3: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 18, halign: "center" },
        6: { cellWidth: 22, halign: "center" },
        7: { cellWidth: 22, halign: "center" }
      },
      margin: { top: 40, left: 14, right: 14 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.setTextColor(...secondaryColor);
        doc.text(`Página ${data.pageNumber}`, 14, 287);
        doc.text("CheckTime - Sistema de Reportes Académicos Oficiales", 130, 287);
      }
    });

    doc.save(`Reporte_Asistencias_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Responsividad celular
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("usuario");
      if (!stored) { navigate("/login"); return; }
      setUsuario(JSON.parse(stored));
    } catch { navigate("/login"); }
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resGlobal, resTodos, resProf, resNov, resPerm, resSusp, resCoberturas, resStaff] = await Promise.all([
        axios.get("/horario/global/hoy"),
        axios.get("/horario"),
        axios.get("/usuarios?role=DOCENTE"),
        axios.get("/novedades"),
        axios.get("/permisos"),
        axios.get("/suspension"),
        axios.get("/coberturas").catch(() => ({ data: [] })),
        axios.get("/usuarios")
      ]);
      setHorariosGlobales(resGlobal.data || []);
      setTodosHorarios(resTodos.data || []);
      setProfesores(resProf.data || []);
      setNovedades(resNov.data || []);
      setPermisos(resPerm.data || []);
      setCoberturas(resCoberturas?.data || []);
      setStaff(resStaff.data || []);
      
      const listSusp = resSusp.data || [];
      setSuspensiones(listSusp);
      
      const hoy = new Date();
      hoy.setHours(0,0,0,0);
      const hoyTime = hoy.getTime();
      
      const found = listSusp.find(s => {
        const start = new Date(s.fecha_inicio);
        start.setHours(0,0,0,0);
        const end = new Date(s.fecha_fin);
        end.setHours(23,59,59,999);
        return hoyTime >= start.getTime() && hoyTime <= end.getTime();
      });
      setSuspensionHoy(found || null);
    } catch (e) {
      console.error("Error al cargar datos:", e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const getClaseEnPeriodo = (clases, period) => {
    if (!clases) return null;
    return clases.find(
      (c) => c.hora_inicio === period.inicio && c.hora_fin === period.fin
    );
  };

  // Filtrado de la tabla de docentes y buscador
  const filteredProfesores = profesores.filter((p) => {
    const search = searchQuery.toLowerCase();
    const docName = `${p.nombre} ${p.apellido}`.toLowerCase();
    const docMail = (p.correo || "").toLowerCase();
    const docDoc = (p.documento || "").toLowerCase();
    return docName.includes(search) || docMail.includes(search) || docDoc.includes(search);
  });

  const getLocalTimeStr = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    } catch (e) {
      return "";
    }
  };

  // Estadísticas estimadas
  const totalInasistenciasHoy = horariosGlobales.filter(d => d.estado === "NO_PRESENTE" && d.clases.length > 0).length;
  const docentesConClaseHoy = horariosGlobales.filter(d => d.clases.length > 0).length;
  const docentesRegistradosHoy = horariosGlobales.filter(
    d => d.clases.length > 0 && 
    (d.estado === "PRESENTE" || d.estado === "TARDANZA" || d.estado === "FINALIZADO" || d.estado === "SALIDA_TEMPRANA")
  ).length;
  const salonesCubiertos = horariosGlobales.reduce((acc, d) => acc + d.clases.length, 0);

  const totalTardanzasHoy = horariosGlobales.filter(d => d.estado === "TARDANZA").length;
  const totalSalidasTempranasHoy = horariosGlobales.filter(d => d.estado === "SALIDA_TEMPRANA").length;

  // Coberturas activas en este preciso momento: clases que se están dictando ahora pero el profesor está ausente o salió temprano
  const coberturasActivasAhora = horariosGlobales.reduce((acc, docente) => {
    if (docente.estado === "NO_PRESENTE") {
      const clasesActivas = docente.clases.filter(c => isClaseActual(c.hora_inicio, c.hora_fin));
      return acc + clasesActivas.length;
    } else if (docente.estado === "SALIDA_TEMPRANA") {
      const horaSalidaStr = getLocalTimeStr(docente.hora_salida);
      const clasesActivas = docente.clases.filter(c => isClaseActual(c.hora_inicio, c.hora_fin) && c.hora_fin > horaSalidaStr);
      return acc + clasesActivas.length;
    }
    return acc;
  }, 0);

  // Obtener el conteo de horas académicas y asignaturas de cada docente en base a todosHorarios
  const getDocenteSummary = (docId) => {
    const teacherSchedules = todosHorarios.filter(h => h.id_usuario === docId);
    const totalHoras = teacherSchedules.length;
    const materiasSet = new Set(teacherSchedules.map(h => h.nombre));
    const materiasList = Array.from(materiasSet).join(", ") || "Sin materias";
    return { totalHoras, materiasList };
  };

  const isClaseConNovedadAprobada = (clase, novedadesHoy) => {
    if (!novedadesHoy || novedadesHoy.length === 0) return false;
    return novedadesHoy.some(nov => {
      if (nov.id_tipo_novedad === 1) return true; // Ausencia total
      try {
        const descObj = typeof nov.descripcion === 'string' ? JSON.parse(nov.descripcion) : nov.descripcion;
        if (descObj && Array.isArray(descObj.clases_afectadas)) {
          return descObj.clases_afectadas.some(ca => ca.id_horario === clase.id_horario);
        }
      } catch (e) {
        console.error(e);
      }
      return false;
    });
  };

  const isClaseConPermiso = (clase, permisosHoy) => {
    if (!permisosHoy || permisosHoy.length === 0) return false;
    return permisosHoy.some(perm => {
      try {
        const descObj = typeof perm.descripcion === 'string' ? JSON.parse(perm.descripcion) : perm.descripcion;
        if (descObj && Array.isArray(descObj.clases_afectadas)) {
          return descObj.clases_afectadas.some(ca => ca.id_horario === clase.id_horario);
        }
        return true;
      } catch (e) {
        return true;
      }
    });
  };

  const renderMainContent = () => {
    const getMidnightDate = (dateVal) => {
      if (!dateVal) return new Date(0);
      const d = new Date(dateVal);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    const todayMidnight = getMidnightDate(new Date());

    const pendingNovedadesFiltered = novedades.filter(nov => {
      if (nov.estado !== "PENDIENTE") return false;
      const novDate = getMidnightDate(nov.fecha);
      return todayMidnight <= novDate;
    });

    const pendingPermisosFiltered = permisos.filter(perm => {
      if (perm.estado !== "PENDIENTE") return false;
      const permDate = getMidnightDate(perm.fecha_inicio);
      return todayMidnight <= permDate;
    });

    const pendingUnificados = [
      ...pendingNovedadesFiltered.map(nov => ({
        ...nov,
        esPermiso: false,
        uniqueKey: `nov-${nov.id_novedad}`,
        dateForSort: new Date(nov.fecha),
        tipoLabel: nov.tipo_novedad?.nombre || "Novedad",
        fechaLabel: new Date(nov.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "short" })
      })),
      ...pendingPermisosFiltered.map(perm => ({
        ...perm,
        esPermiso: true,
        uniqueKey: `perm-${perm.id_permiso}`,
        dateForSort: new Date(perm.fecha_solicitud),
        tipoLabel: perm.tipo_permiso?.nombre || "Permiso",
        fechaLabel: `${new Date(perm.fecha_inicio).toLocaleDateString("es-CO", { day: "numeric", month: "short" })} - ${new Date(perm.fecha_fin).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}`
      }))
    ].sort((a, b) => b.dateForSort - a.dateForSort);

    if (activeNav === "attendance") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* FILTERS PANEL */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "20px 24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Filtros de Reporte</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Docente</label>
                <select
                  value={filtroDocente}
                  onChange={(e) => setFiltroDocente(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
                >
                  <option value="">Todos los docentes</option>
                  {profesores.map((p) => (
                    <option key={p.id_usuario} value={p.id_usuario}>{p.nombre} {p.apellido}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Periodo</label>
                <select
                  value={filtroPeriodo}
                  onChange={(e) => setFiltroPeriodo(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
                >
                  <option value="dia">Un solo día</option>
                  <option value="mes">Todo el mes</option>
                  <option value="rango">Rango de fechas</option>
                </select>
              </div>

              {filtroPeriodo === "dia" && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Fecha</label>
                  <input
                    type="date"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#0b1c30" }}
                  />
                </div>
              )}

              {filtroPeriodo === "mes" && (
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Mes</label>
                  <input
                    type="month"
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 14, color: "#0b1c30" }}
                  />
                </div>
              )}

              {filtroPeriodo === "rango" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Desde</label>
                    <input
                      type="date"
                      value={filtroFechaInicio}
                      onChange={(e) => setFiltroFechaInicio(e.target.value)}
                      style={{ width: "100%", padding: "8px 8px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 12, color: "#0b1c30" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 6 }}>Hasta</label>
                    <input
                      type="date"
                      value={filtroFechaFin}
                      onChange={(e) => setFiltroFechaFin(e.target.value)}
                      style={{ width: "100%", padding: "8px 8px", border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 12, color: "#0b1c30" }}
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  onClick={cargarReporteAsistencias}
                  disabled={reporteLoading}
                  style={{
                    width: "100%", padding: "11px 20px", border: "none", borderRadius: 8,
                    background: "#1F294D", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#112D55"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#1F294D"}
                >
                  {reporteLoading ? "Buscando..." : "Buscar Asistencias"}
                </button>
              </div>
            </div>

            {/* EXPORT BUTTONS */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20, borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
              <button
                onClick={exportarAExcel}
                disabled={reporteAsistencias.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", border: "1px solid #86efac", borderRadius: 8,
                  background: "#f0fdf4", color: "#166534", fontSize: 13, fontWeight: 700,
                  cursor: reporteAsistencias.length === 0 ? "not-allowed" : "pointer",
                  opacity: reporteAsistencias.length === 0 ? 0.6 : 1,
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { if (reporteAsistencias.length > 0) e.currentTarget.style.background = "#dcfce7"; }}
                onMouseLeave={(e) => { if (reporteAsistencias.length > 0) e.currentTarget.style.background = "#f0fdf4"; }}
              >
                📥 Exportar a Excel
              </button>
              <button
                onClick={exportarAPDF}
                disabled={reporteAsistencias.length === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", border: "1px solid #fca5a5", borderRadius: 8,
                  background: "#fef2f2", color: "#991b1b", fontSize: 13, fontWeight: 700,
                  cursor: reporteAsistencias.length === 0 ? "not-allowed" : "pointer",
                  opacity: reporteAsistencias.length === 0 ? 0.6 : 1,
                  transition: "all 0.15s"
                }}
                onMouseEnter={(e) => { if (reporteAsistencias.length > 0) e.currentTarget.style.background = "#fee2e2"; }}
                onMouseLeave={(e) => { if (reporteAsistencias.length > 0) e.currentTarget.style.background = "#fef2f2"; }}
              >
                📄 Exportar a PDF (Académico)
              </button>
            </div>
          </div>

          {/* RESULTS TABLE */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)" }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Registros de Asistencia</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Historial completo de asistencias, tardanzas, salidas tempranas e inasistencias.</p>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 800 }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg)" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Docente</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Identificación</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Fecha</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Hora Entrada</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Hora Salida</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Tardanza</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Salida Anticipada</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Horas Perdidas</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reporteLoading ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                        Cargando reporte de asistencia...
                      </td>
                    </tr>
                  ) : reporteAsistencias.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                        No se encontraron registros de asistencia con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    reporteAsistencias.map((r) => {
                      const nombreDocente = r.usuario ? `${r.usuario.nombre} ${r.usuario.apellido}` : "Docente Desconocido";
                      const docDocente = r.usuario ? r.usuario.documento : "-";
                      const fecha = new Date(r.fecha).toLocaleDateString("es-CO");
                      const entrada = r.hora_entrada ? new Date(r.hora_entrada).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "-";
                      const salida = r.hora_salida ? new Date(r.hora_salida).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "-";
                      const tardanza = r.minutos_tardanza ? `${r.minutos_tardanza}m` : "-";
                      const salidaAnticipada = r.minutos_salida_anticipada ? `${r.minutos_salida_anticipada}m` : "-";

                      if (r.isSuspension) {
                        return (
                          <tr key={r.id_asistencia} style={{ borderBottom: "1px solid #ffedd5", background: "#fffaf7" }}>
                            <td style={{ padding: "12px 16px", fontWeight: 700, color: "#ea580c" }}>
                              🏫 DÍA SIN CLASE: {r.observacion.replace("Día sin clases por: ", "")}
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8" }}>-</td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#475569" }}>{fecha}</td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8" }}>-</td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8" }}>-</td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8" }}>-</td>
                            <td style={{ padding: "12px 16px", textAlign: "center", color: "#94a3b8" }}>-</td>
                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                              <span style={{ background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", padding: "4px 10px", borderRadius: 6, fontWeight: 700, fontSize: 11 }}>
                                0 horas
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", textAlign: "center" }}>
                              <span
                                style={{
                                  background: r.estado === "PARO" ? "#ffedd5" : "#fce7f3",
                                  color: r.estado === "PARO" ? "#c2410c" : "#be185d",
                                  padding: "4px 12px",
                                  borderRadius: 20,
                                  fontWeight: 700,
                                  fontSize: 11,
                                  display: "inline-block",
                                  whiteSpace: "nowrap"
                                }}
                              >
                                {r.estado === "PARO" ? "🚫 PARO" : "🏖️ VACACIONES"}
                              </span>
                            </td>
                          </tr>
                        );
                      }


                      return (
                        <tr key={r.id_asistencia} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: "#0f172a" }}>{nombreDocente}</td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: "#475569" }}>{docDocente}</td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: "#475569" }}>{fecha}</td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: r.hora_entrada ? "#0f172a" : "#dc2626", fontWeight: r.hora_entrada ? 500 : 700 }}>
                            {r.hora_entrada ? entrada : "Ausente"}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: "#0f172a" }}>{salida}</td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: r.minutos_tardanza ? "#c2410c" : "#64748b", fontWeight: r.minutos_tardanza ? 700 : 400 }}>
                            {tardanza}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: r.minutos_salida_anticipada ? "#6b21a8" : "#64748b", fontWeight: r.minutos_salida_anticipada ? 700 : 400 }}>
                            {salidaAnticipada}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span style={{
                              background: "#f3e8ff",
                              color: "#7c3aed",
                              border: "1px solid #ebd5ff",
                              padding: "4px 10px",
                              borderRadius: 6,
                              fontWeight: 700,
                              fontSize: 11
                            }}>
                              {r.horas_perdidas || 0} {r.horas_perdidas === 1 ? "hora" : "horas"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span
                              style={{
                                background:
                                  r.estado === "PRESENTE"
                                    ? "#dcfce7"
                                    : r.estado === "TARDANZA"
                                    ? "#ffedd5"
                                    : r.estado === "FINALIZADO"
                                    ? "#dbeafe"
                                    : r.estado === "SALIDA_TEMPRANA"
                                    ? "#f3e8ff"
                                    : "#fee2e2",
                                color:
                                  r.estado === "PRESENTE"
                                    ? "#166534"
                                    : r.estado === "TARDANZA"
                                    ? "#c2410c"
                                    : r.estado === "FINALIZADO"
                                    ? "#1e40af"
                                    : r.estado === "SALIDA_TEMPRANA"
                                    ? "#6b21a8"
                                    : "#991b1b",
                                padding: "4px 12px",
                                borderRadius: 20,
                                fontWeight: 700,
                                fontSize: 11,
                                display: "inline-block",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {r.estado === "PRESENTE"
                                ? "✓ Presente"
                                : r.estado === "TARDANZA"
                                ? "⚠ Entrada Tarde"
                                : r.estado === "FINALIZADO"
                                ? "◉ Finalizado"
                                : r.estado === "SALIDA_TEMPRANA"
                                ? "◷ Salida Temprana"
                                : "Ausente"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === "schedules") {
      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Gestión de Horarios Registrados</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte y modifique el horario completo de cada docente usando la grilla interactiva semanal.</p>
            </div>
            <div>
              <input
                type="text"
                placeholder="Buscar docente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "8px 14px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, minWidth: 260, outline: "none", boxSizing: "border-box", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
            </div>
          </div>

          <div style={{ padding: "12px 20px", background: "#fff7ed", borderBottom: "1px solid #ffedd5", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#ea580c", display: "flex", alignItems: "center", gap: 6 }}>
              ⚙️ Control de Calendario:
            </span>
            <button
              onClick={() => setShowSuspensionModal(true)}
              style={{
                padding: "8px 14px", background: "#ea580c", color: "#fff", border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6, fontFamily: "Hanken Grotesk, sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#c2410c"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#ea580c"}
            >
              🚫 Suspender Día (No hay clase)
            </button>
            <button
              onClick={() => setShowVacacionesModal(true)}
              style={{
                padding: "8px 14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6, fontFamily: "Hanken Grotesk, sans-serif"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#ea580c"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f97316"}
            >
              🏖️ Registrar Vacaciones
            </button>
            <button
              onClick={() => setShowSuspensionListModal(true)}
              style={{
                padding: "8px 14px", background: "#475569", color: "#fff", border: "none", borderRadius: 6,
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6, fontFamily: "Hanken Grotesk, sans-serif",
                marginLeft: isMobile ? "0" : "auto"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#334155"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#475569"}
            >
              📋 Ver Suspensiones/Vacaciones
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase" }}>Docente</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#64748b", fontSize: 11, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase" }}>Materias Asignadas</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#64748b", fontSize: 11, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase" }}>Horas Registradas</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "#64748b", fontSize: 11, borderBottom: "1px solid #e2e8f0", textTransform: "uppercase" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                      Cargando listado de docentes...
                    </td>
                  </tr>
                ) : filteredProfesores.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: "30px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                      No se encontraron docentes en la base de datos.
                    </td>
                  </tr>
                ) : (
                  filteredProfesores.map((docente) => {
                    const { totalHoras, materiasList } = getDocenteSummary(docente.id_usuario);
                    return (
                      <tr key={docente.id_usuario} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>
                          {docente.nombre} {docente.apellido}
                          <div style={{ fontSize: 10, fontWeight: 400, color: "#64748b", marginTop: 2 }}>{docente.correo}</div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#334155" }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            {materiasList}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span style={{ background: totalHoras > 0 ? "#f0fdf4" : "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: totalHoras > 0 ? "#16a34a" : "#64748b" }}>
                            {totalHoras} {totalHoras === 1 ? "hora" : "horas"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <button
                            onClick={() => setEditingDocente(docente)}
                            style={{
                              background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#eff6ff"}
                          >
                            ✏️ Editar Horario
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeNav === "requests") {
      const unificados = [
        ...novedades.map(nov => ({
          ...nov,
          esPermiso: false,
          uniqueKey: `nov-${nov.id_novedad}`,
          dateForSort: new Date(nov.fecha),
          tipoLabel: nov.tipo_novedad?.nombre || "Novedad",
          fechaLabel: new Date(nov.fecha).toLocaleDateString("es-CO")
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

      const filteredRequests = unificados.filter((req) => {
        if (filtroEstadoNovedad === "TODOS") return true;
        return req.estado === filtroEstadoNovedad;
      });

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* FILTERS PANEL */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Filtros de Solicitudes</h2>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte e investigue todas las solicitudes de novedades y permisos del colegio.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>Estado:</label>
                <select
                  value={filtroEstadoNovedad}
                  onChange={(e) => setFiltroEstadoNovedad(e.target.value)}
                  style={{ padding: "8px 14px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, minWidth: 160, background: "var(--card-bg)", color: "var(--text-main)" }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="APROBADO">Aceptado</option>
                  <option value="RECHAZADO">Rechazado</option>
                </select>
              </div>
            </div>
          </div>

          {/* REQUESTS TABLE */}
          <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg)" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Docente</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Tipo</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Fecha</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Descripción</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Estado</th>
                    <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                        No hay solicitudes de novedades o permisos registradas con este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      let desc = {};
                      try {
                        desc = typeof req.descripcion === "string" ? JSON.parse(req.descripcion) : req.descripcion;
                      } catch (e) {
                        desc = { descripcion_breve: req.descripcion };
                      }

                      const statusConf = {
                        PENDIENTE: { bg: "#fef3c7", color: "#d97706", label: "Pendiente" },
                        APROBADO: { bg: "#dcfce7", color: "#15803d", label: "Aceptado" },
                        RECHAZADO: { bg: "#fee2e2", color: "#b91c1c", label: "Rechazado" }
                      };
                      const s = statusConf[req.estado] || { bg: "#f1f5f9", color: "#475569", label: req.estado };

                      return (
                        <tr key={req.uniqueKey} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>
                            {req.usuario ? `${req.usuario.nombre} ${req.usuario.apellido}` : "Docente"}
                            {req.esPermiso && req.cumple_regla === false && (
                              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700, marginTop: 3 }}>
                                ⚠️ No cumple anticipación
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#0f172a" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: req.esPermiso ? "#1d4ed8" : "#475569" }}>
                              {req.esPermiso ? "📄 " : "⏰ "}
                              {req.tipoLabel}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "center", color: "#475569" }}>
                            {req.fechaLabel}
                          </td>
                          <td style={{ padding: "14px 16px", color: "#475569", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {desc.descripcion_breve}
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "center" }}>
                            <span style={{
                              background: s.bg, color: s.color,
                              padding: "4px 10px", borderRadius: 20,
                              fontWeight: 700, fontSize: 11
                            }}>
                              {s.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", textAlign: "center" }}>
                            <button
                              onClick={() => {
                                if (req.esPermiso) {
                                  setSelectedPermiso(req);
                                } else {
                                  setSelectedNovedad(req);
                                }
                              }}
                              style={{
                                background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                                padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                                transition: "all 0.15s"
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#dbeafe"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "#eff6ff"}
                            >
                              Más detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === "staff") {
      const filteredStaff = staff.filter((s) => {
        const search = searchQueryStaff.toLowerCase();
        const staffName = `${s.nombre} ${s.apellido}`.toLowerCase();
        const staffMail = (s.correo || "").toLowerCase();
        const staffDoc = (s.documento || "").toLowerCase();
        return staffName.includes(search) || staffMail.includes(search) || staffDoc.includes(search);
      });

      return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Gestión de Personal (Staff)</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Consulte, registre y edite la información de todos los usuarios de la institución.</p>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder="Buscar personal..."
                value={searchQueryStaff}
                onChange={(e) => setSearchQueryStaff(e.target.value)}
                style={{ padding: "8px 14px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, minWidth: 240, outline: "none", boxSizing: "border-box", background: "var(--card-bg)", color: "var(--text-main)" }}
              />
              <button
                onClick={() => setShowAgregarUsuarioModal(true)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#1F294D", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                ➕ Registrar Usuario
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Nombre / Correo</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Identificación</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Teléfono</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Rol</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Estado</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Cargando personal...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No se encontraron usuarios en la base de datos.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staffMember) => {
                    const rolLabel = staffMember.role?.nombre_rol || "DOCENTE";
                    const isActivo = staffMember.estado;
                    return (
                      <tr key={staffMember.id_usuario} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--text-title)" }}>
                          {staffMember.nombre} {staffMember.apellido}
                          <div style={{ fontSize: 11, fontWeight: 400, color: "var(--text-muted)", marginTop: 2 }}>{staffMember.correo}</div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--text-main)" }}>
                          {staffMember.documento}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center", color: "var(--text-main)" }}>
                          {staffMember.telefono || "—"}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span style={{
                            background: rolLabel === "RECTOR" ? "#fce7f3" : rolLabel === "COORDINADOR" ? "#dbeafe" : rolLabel === "ADMIN" ? "#f3e8ff" : "#f1f5f9",
                            color: rolLabel === "RECTOR" ? "#be185d" : rolLabel === "COORDINADOR" ? "#1e40af" : rolLabel === "ADMIN" ? "#7c3aed" : "#475569",
                            padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700
                          }}>
                            {rolLabel}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <span style={{
                            background: isActivo ? "#dcfce7" : "#fee2e2",
                            color: isActivo ? "#15803d" : "#b91c1c",
                            padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700
                          }}>
                            {isActivo ? "✓ Activo" : "✕ Inactivo"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "center" }}>
                          <button
                            onClick={() => setEditingUsuario(staffMember)}
                            style={{
                              background: "var(--card-subbg)", border: "1px solid var(--card-border)", color: "var(--text-main)",
                              padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                              transition: "all 0.15s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--card-border)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "var(--card-subbg)"}
                          >
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeNav === "configuration") {
      return <ConfigurationPanel usuario={usuario} onUsuarioUpdated={setUsuario} />;
    }

    if (activeNav !== "home") {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 24 }}>
          <svg width="48" height="48" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24" style={{ marginBottom: 16 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Módulo en Construcción</h2>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--text-muted)", textAlign: "center", maxWidth: 400 }}>
            El módulo de {NAV_ITEMS.find(n => n.key === activeNav)?.label} estará disponible en la próxima actualización académica. Diríjase a <strong>Home</strong>.
          </p>
        </div>
      );
    }

    return (
      <>
        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Clases programadas hoy", value: salonesCubiertos.toString().padStart(2, "0"), sub: "Todas las horas académicas", color: "#1F294D" },
            { 
              label: "Docentes con clase hoy", 
              value: `${docentesRegistradosHoy.toString().padStart(2, "0")} / ${docentesConClaseHoy.toString().padStart(2, "0")}`, 
              sub: "Registrados / Programados hoy", 
              color: "#1A994D" 
            },
            { 
              label: "Coberturas activas ahora", 
              value: coberturasActivasAhora.toString().padStart(2, "0"), 
              sub: `Inasistencias hoy: ${totalInasistenciasHoy.toString().padStart(2, "0")}`, 
              color: "#dc2626", 
              urgent: coberturasActivasAhora > 0 
            },
            {
              label: "Total Coberturas",
              value: coberturas.length.toString().padStart(2, "0"),
              sub: "Total histórico de coberturas",
              color: "#f97316",
              info: true
            },
            { 
              label: "Tardanzas hoy", 
              value: totalTardanzasHoy.toString().padStart(2, "0"), 
              sub: "Docentes con llegada tarde", 
              color: "#c2410c", 
              warning: totalTardanzasHoy > 0 
            },
            { 
              label: "Salidas tempranas hoy", 
              value: totalSalidasTempranasHoy.toString().padStart(2, "0"), 
              sub: "Docentes retirados antes", 
              color: "#6b21a8", 
              info: totalSalidasTempranasHoy > 0 
            },
          ].map((c) => (
            <div key={c.label} style={{ 
              background: "var(--card-bg)", 
              border: c.urgent ? "2.5px solid #ef4444" : c.warning ? "2.5px solid #f97316" : c.info ? "2.5px solid #8b5cf6" : "1px solid var(--card-border)", 
              borderRadius: 12, 
              padding: "18px 20px", 
              position: "relative" 
            }}>
              {c.urgent && <span style={{ position: "absolute", top: 12, right: 12, background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.05em" }}>ALERTA</span>}
              {c.warning && <span style={{ position: "absolute", top: 12, right: 12, background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.05em" }}>TARDE</span>}
              {c.info && <span style={{ position: "absolute", top: 12, right: 12, background: "#f97316", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, letterSpacing: "0.05em" }}>COB</span>}
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</p>
              <p style={{ margin: "6px 0 4px", fontSize: 32, fontWeight: 700, color: c.color, fontFamily: "Hanken Grotesk, sans-serif", lineHeight: 1 }}>{c.value}</p>
              <p style={{ margin: 0, fontSize: 12, color: c.urgent ? "#b91c1c" : c.warning ? "#c2410c" : c.info ? "#6b21a8" : "var(--text-muted)", fontWeight: (c.urgent || c.warning || c.info) ? 600 : 400 }}>{c.sub}</p>
            </div>
          ))}
        </div>

        {/* SECTION PENDIENTES */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Solicitudes Pendientes
              </h2>
              {pendingUnificados.length > 0 && (
                <span style={{
                  background: "#dc2626", color: "#fff",
                  fontSize: 12, fontWeight: 700,
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {pendingUnificados.length}
                </span>
              )}
            </div>
          </div>

          {pendingUnificados.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#64748b", fontSize: 14, fontStyle: "italic" }}>
              No hay solicitudes pendientes de revisión.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 16 }}>
              {pendingUnificados.slice(0, 4).map((nov) => {
                let desc = {};
                try {
                  desc = typeof nov.descripcion === "string" ? JSON.parse(nov.descripcion) : nov.descripcion;
                } catch (e) {
                  desc = { descripcion_breve: nov.descripcion };
                }

                return (
                  <div key={nov.uniqueKey} style={{
                    background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 10,
                    padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12
                  }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                          {nov.usuario ? `${nov.usuario.nombre} ${nov.usuario.apellido}` : "Docente"}
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                          {nov.fechaLabel}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, display: "inline-block", background: "#eff6ff", color: "#1d4ed8", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                        {nov.tipoLabel}
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: 12, color: "#475569", lineHeight: 1.4, height: "36px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {desc.descripcion_breve || "Sin descripción."}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <button
                        onClick={() => nov.esPermiso ? handleActualizarEstadoPermiso(nov.id_permiso, "APROBADO") : handleActualizarEstado(nov.id_novedad, "APROBADO")}
                        style={{
                          flex: 1, padding: "6px 10px", border: "none", borderRadius: 6,
                          background: "#16a34a", color: "#fff", fontSize: 11.5, fontWeight: 700,
                          cursor: "pointer", transition: "background 0.15s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#15803d"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#16a34a"}
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => nov.esPermiso ? handleActualizarEstadoPermiso(nov.id_permiso, "RECHAZADO") : handleActualizarEstado(nov.id_novedad, "RECHAZADO")}
                        style={{
                          flex: 1, padding: "6px 10px", border: "1.5px solid #dc2626", borderRadius: 6,
                          background: "#fff", color: "#dc2626", fontSize: 11.5, fontWeight: 700,
                          cursor: "pointer", transition: "all 0.15s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
            <button
              onClick={() => setActiveNav("requests")}
              style={{
                background: "none", border: "none", color: "#2563eb",
                fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
            >
              Ver todas las solicitudes →
            </button>
          </div>
        </div>

        {/* HORARIO GLOBAL TABLE */}
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Horario Global de Docentes (Hoy)</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Docentes reales asignados hoy, sus respectivas horas y estado de asistencia hoy.</p>
            </div>
            <button 
              onClick={loadData}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--card-subbg)", border: "1px solid var(--card-border)", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600, color: "var(--text-main)" }}
            >
              🔄 Actualizar
            </button>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
              <thead>
                <tr style={{ background: "var(--table-header-bg)" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Docente</th>
                  {PERIODS.map((p) => (
                    <th key={p.id} style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>
                      {p.id}
                      <div style={{ fontSize: 9, fontWeight: 400, color: "var(--text-muted)", marginTop: 2 }}>{p.inicio}</div>
                    </th>
                  ))}
                  <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 700, color: "var(--text-muted)", fontSize: 11, borderBottom: "1px solid var(--card-border)", textTransform: "uppercase" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={PERIODS.length + 2} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                      Cargando horarios de docentes en tiempo real...
                    </td>
                  </tr>
                ) : horariosGlobales.length === 0 ? (
                  <tr>
                    <td colSpan={PERIODS.length + 2} style={{ padding: "40px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>
                      No hay docentes registrados en la base de datos.
                    </td>
                  </tr>
                ) : (
                  horariosGlobales.map((docente) => (
                    <tr key={docente.id_usuario} style={{ borderBottom: "1px solid var(--table-row-border)", background: suspensionHoy ? "#fdf2f8" : "transparent" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: suspensionHoy ? "#9d174d" : "var(--text-title)" }}>
                        {docente.nombre} {docente.apellido}
                      </td>
                      {PERIODS.map((period) => {
                        const clase = getClaseEnPeriodo(docente.clases, period);
                        const isBreak = period.id === "DP" || period.id === "Alm";
                        const horaSalidaStr = getLocalTimeStr(docente.hora_salida);
                        // Buscar si ya se registró una cobertura hoy para este horario puntual
                        const coberturaAsignada = clase && coberturas.find(c => {
                          const cobDateStr = c.fecha.split("T")[0];
                          return cobDateStr === getLocalTodayStr() && c.id_horario === clase.id_horario;
                        });

                        const isCoberturas = clase && clase.nombre !== "HORA PEDAGOGICA" && !coberturaAsignada && (
                          docente.estado === "NO_PRESENTE" ||
                          (docente.estado === "SALIDA_TEMPRANA" && clase.hora_fin > horaSalidaStr)
                        );
                        
                        const tieneNovedadAprobada = clase && !coberturaAsignada && isClaseConNovedadAprobada(clase, docente.novedadesHoy);
                        const tienePermisoAprobado = clase && !coberturaAsignada && isClaseConPermiso(clase, docente.permisosHoy);
                        const isPed = clase && clase.nombre === "HORA PEDAGOGICA";

                        const cellBg = suspensionHoy
                          ? "#fce7f3"
                          : (coberturaAsignada
                            ? "#ffedd5"
                            : tienePermisoAprobado
                            ? "#dcfce7"
                            : tieneNovedadAprobada
                            ? "#dbeafe"
                            : isPed
                            ? "#f3e8ff"
                            : isCoberturas
                            ? "#fee2e2"
                            : isBreak
                            ? "#fef3c7"
                            : "#e0f2fe");

                        const cellBorder = suspensionHoy
                          ? "1px solid #fbcfe8"
                          : (coberturaAsignada
                            ? "2px solid #f97316"
                            : tienePermisoAprobado
                            ? "2px solid #16a34a"
                            : tieneNovedadAprobada
                            ? "2px solid #1d4ed8"
                            : isPed
                            ? "1px solid #c084fc"
                            : isCoberturas
                            ? "2px solid #ef4444"
                            : `1px solid ${isBreak ? "#fbbf24" : "#38bdf8"}`);

                        const cellColor = suspensionHoy
                          ? "#9d174d"
                          : (coberturaAsignada
                            ? "#ea580c"
                            : tienePermisoAprobado
                            ? "#166534"
                            : tieneNovedadAprobada
                            ? "#1e40af"
                            : isPed
                            ? "#6b21a8"
                            : isCoberturas
                            ? "#991b1b"
                            : isBreak
                            ? "#92400e"
                            : "#0369a1");

                        return (
                          <td key={period.id} style={{ padding: "10px 8px", textAlign: "center" }}>
                            {clase ? (
                              <div
                                style={{
                                  background: cellBg,
                                  border: cellBorder,
                                  color: cellColor,
                                  padding: "4px 6px",
                                  borderRadius: 6,
                                  fontWeight: 800,
                                  fontSize: 11,
                                  whiteSpace: "nowrap",
                                  display: "inline-block",
                                  animation: (isCoberturas && !tieneNovedadAprobada && !tienePermisoAprobado && !suspensionHoy) ? "pulseRed 1.8s infinite ease-in-out" : "none",
                                  boxShadow: (isCoberturas && !tieneNovedadAprobada && !tienePermisoAprobado && !suspensionHoy) ? "0 0 12px rgba(239, 68, 68, 0.45)" : "none"
                                }}
                                title={coberturaAsignada ? `Cubierto por ${coberturaAsignada.docente_cobertura.nombre} ${coberturaAsignada.docente_cobertura.apellido}` : `${clase.nombre} (Bloque: ${clase.bloque})`}
                              >
                                {clase.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : clase.nombre}
                                <div style={{ fontSize: 9, opacity: 0.8, fontWeight: 600 }}>{clase.bloque}</div>
                                {isCoberturas && !suspensionHoy && !tieneNovedadAprobada && !tienePermisoAprobado && (
                                  <div 
                                     className="animate-blink-alert"
                                     style={{
                                       fontSize: 8,
                                       background: "#dc2626",
                                       color: "#fff",
                                       padding: "2px 4px",
                                       borderRadius: 3,
                                       marginTop: 4,
                                       fontWeight: 900,
                                       letterSpacing: "0.05em"
                                     }}
                                   >
                                     ⚠️ REQUIERE COBERTURA
                                   </div>
                                )}
                                {coberturaAsignada && !suspensionHoy && (
                                  <div
                                    style={{
                                      fontSize: 8,
                                      background: "#ea580c",
                                      color: "#fff",
                                      padding: "2px 4px",
                                      borderRadius: 3,
                                      marginTop: 4,
                                      fontWeight: 900,
                                      letterSpacing: "0.05em"
                                    }}
                                  >
                                    CUBIERTO: {coberturaAsignada.docente_cobertura.nombre.substring(0, 1)}. {coberturaAsignada.docente_cobertura.apellido}
                                  </div>
                                )}
                                {tieneNovedadAprobada && !suspensionHoy && !tienePermisoAprobado && (
                                  <div
                                    style={{
                                      fontSize: 8,
                                      background: "#1d4ed8",
                                      color: "#fff",
                                      padding: "2px 4px",
                                      borderRadius: 3,
                                      marginTop: 4,
                                      fontWeight: 900,
                                      letterSpacing: "0.05em"
                                    }}
                                  >
                                    NOVEDAD
                                  </div>
                                )}
                                {tienePermisoAprobado && !suspensionHoy && (
                                  <div
                                    style={{
                                      fontSize: 8,
                                      background: "#16a34a",
                                      color: "#fff",
                                      padding: "2px 4px",
                                      borderRadius: 3,
                                      marginTop: 4,
                                      fontWeight: 900,
                                      letterSpacing: "0.05em"
                                    }}
                                  >
                                    PERMISO
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: suspensionHoy ? "#f472b6" : (isBreak ? "#94a3b8" : "#e2e8f0"), fontSize: 11, fontStyle: isBreak ? "italic" : "normal", fontWeight: isBreak ? 600 : 400 }}>
                                {isBreak ? "DP" : "—"}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span
                          title={
                            suspensionHoy
                              ? `Día inhabilitado por ${suspensionHoy.tipo}: ${suspensionHoy.motivo || ""}`
                              : (docente.estado === "TARDANZA" && docente.minutos_tardanza
                                ? `Tardanza de ${docente.minutos_tardanza} minutos`
                                : docente.estado === "SALIDA_TEMPRANA" && docente.minutos_salida_anticipada
                                ? `Salida anticipada de ${docente.minutos_salida_anticipada} minutos`
                                : "")
                          }
                          style={{
                            background:
                              suspensionHoy
                                ? (suspensionHoy.tipo === "PARO" ? "#ffedd5" : "#fce7f3")
                                : (docente.estado === "PRESENTE"
                                  ? "#dcfce7"
                                  : docente.estado === "TARDANZA"
                                  ? "#ffedd5"
                                  : docente.estado === "FINALIZADO"
                                  ? "#dbeafe"
                                  : docente.estado === "SALIDA_TEMPRANA"
                                  ? "#f3e8ff"
                                  : "#fee2e2"),
                            color:
                              suspensionHoy
                                ? (suspensionHoy.tipo === "PARO" ? "#c2410c" : "#be185d")
                                : (docente.estado === "PRESENTE"
                                  ? "#166534"
                                  : docente.estado === "TARDANZA"
                                  ? "#c2410c"
                                  : docente.estado === "FINALIZADO"
                                  ? "#1e40af"
                                  : docente.estado === "SALIDA_TEMPRANA"
                                  ? "#6b21a8"
                                  : "#991b1b"),
                            padding: "4px 12px",
                            borderRadius: 20,
                            fontWeight: 700,
                            fontSize: 11,
                            display: "inline-block",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {suspensionHoy
                            ? (suspensionHoy.tipo === "PARO" ? "🚫 PARO" : "🏖️ VACACIONES")
                            : (docente.estado === "PRESENTE"
                              ? "✓ Presente"
                              : docente.estado === "TARDANZA"
                              ? `⚠ Entrada Tarde ${docente.minutos_tardanza ? `(+${docente.minutos_tardanza}m)` : ""}`
                              : docente.estado === "FINALIZADO"
                              ? "◉ Finalizado"
                              : docente.estado === "SALIDA_TEMPRANA"
                              ? `◷ Salida Temprana ${docente.minutos_salida_anticipada ? `(-${docente.minutos_salida_anticipada}m)` : ""}`
                              : "Ausente")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "var(--bg-main)" }}>
      <style>{`
        @keyframes pulseRed {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            background-color: #fee2e2;
          }
          70% {
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
            background-color: #fca5a5;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
            background-color: #fee2e2;
          }
        }
        @keyframes blinkAlert {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-blink-alert {
          animation: blinkAlert 1.2s infinite ease-in-out;
        }
      `}</style>

      {/* CABECERA TOP RESPONSIVA PARA MOVIL */}
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

      {/* SIDEBAR / BOTTOM MENU RESPONSIVO */}
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
          width: 220, flexShrink: 0, background: "#112D55",
          display: "flex", flexDirection: "column", padding: "20px 12px",
          position: "sticky", top: 0, height: "100vh"
        }}>
          <div style={{ padding: "8px 4px 24px", borderBottom: "1px solid rgba(255,255,255,0.12)", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", flexShrink: 0 }}>
                <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "Helvetica Bold, sans-serif", lineHeight: 1 }}>CHECKTIME</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>Rectoría</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={activeNav === item.key}
                onClick={() => setActiveNav(item.key)}
              />
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>Tema</span>
              <ThemeToggle compact />
            </div>
            <button
              onClick={() => {}}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: "#1A994D", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Hanken Grotesk, sans-serif" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              New Report
            </button>
            <button
              onClick={handleSignOut}
              onMouseEnter={() => setSignOutHovered(true)}
              onMouseLeave={() => setSignOutHovered(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 16px", background: signOutHovered ? "rgba(220,38,38,0.12)" : "transparent", border: "none", borderRadius: 8, color: signOutHovered ? "#ff6b6b" : "rgba(255,255,255,0.55)", fontWeight: 400, fontSize: 14, cursor: "pointer" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Cerrar Sesión
            </button>
          </div>
        </aside>
      )}

      {/* MAIN */}
      <main style={{
        flex: 1,
        padding: isMobile ? "18px 16px 84px" : "28px 32px",
        maxWidth: isMobile ? "100%" : "calc(100vw - 220px)",
        overflowY: "auto",
        boxSizing: "border-box"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif" }}>
              {activeNav === "home" ? "Gestión Académica" : NAV_ITEMS.find(n => n.key === activeNav)?.label}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
              Panel de Administración — {new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <ThemeToggle />
              {activeNav === "schedules" && (
                <button
                  onClick={() => setShowModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1F294D", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Agregar Horario
                </button>
              )}
              {activeNav === "staff" && (
                <button
                  onClick={() => setShowAgregarUsuarioModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1F294D", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                  Registrar Usuario
                </button>
              )}
            </div>
          )}
        </div>

        {renderMainContent()}

        <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 40 }}>
          Rector: {usuario ? `${usuario.nombre} ${usuario.apellido}` : "Cargando..."}
        </p>
      </main>

      {showModal && <ModalAgregarHorario onClose={() => setShowModal(false)} profesores={profesores} onSave={loadData} />}
      {editingDocente && <ModalEditarHorarioDocente onClose={() => setEditingDocente(null)} docente={editingDocente} onSave={loadData} />}
      {showSuspensionModal && <ModalSuspensionDia onClose={() => setShowSuspensionModal(false)} onSave={loadData} />}
      {showVacacionesModal && <ModalVacaciones onClose={() => setShowVacacionesModal(false)} onSave={loadData} />}
      {showSuspensionListModal && <ModalSuspensionList onClose={() => setShowSuspensionListModal(false)} suspensiones={suspensiones} onSave={loadData} />}
      {showAgregarUsuarioModal && <ModalAgregarUsuario onClose={() => setShowAgregarUsuarioModal(false)} onSave={loadData} />}
      {editingUsuario && <ModalEditarUsuario onClose={() => setEditingUsuario(null)} user={editingUsuario} onSave={loadData} />}

      {selectedNovedad && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => e.target === e.currentTarget && setSelectedNovedad(null)}
        >
          <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(9,20,55,0.18)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Detalles de la Solicitud</h3>
              <button onClick={() => setSelectedNovedad(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
              <div style={{ background: "var(--card-subbg)", padding: "14px", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Docente</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-title)" }}>
                  {selectedNovedad.usuario ? `${selectedNovedad.usuario.nombre} ${selectedNovedad.usuario.apellido}` : "Docente"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-main)", marginTop: 2 }}>
                  Documento: {selectedNovedad.usuario?.documento || "—"} | Correo: {selectedNovedad.usuario?.correo || "—"}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Tipo de novedad</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#112D55" }}>
                    {selectedNovedad.tipo_novedad?.nombre || "Novedad"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Fecha</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#112D55" }}>
                    {new Date(selectedNovedad.fecha).toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>
              {(() => {
                let desc = {};
                try {
                  desc = typeof selectedNovedad.descripcion === "string" ? JSON.parse(selectedNovedad.descripcion) : selectedNovedad.descripcion;
                } catch (e) {
                  desc = { descripcion_breve: selectedNovedad.descripcion };
                }
                return (
                  <>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Causa</div>
                      <div style={{ fontSize: 13.5, color: "#0f172a", background: "#f1f5f9", padding: "8px 12px", borderRadius: 6 }}>
                        {desc.causa || "No especificada"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Descripción breve</div>
                      <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5, background: "#f1f5f9", padding: "10px 12px", borderRadius: 6 }}>
                        {desc.descripcion_breve || "Sin descripción."}
                      </p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Clases Afectadas</div>
                      {desc.clases_afectadas && desc.clases_afectadas.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {desc.clases_afectadas.map((c, idx) => (
                            <div key={idx} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e40af" }}>{c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre}</span>
                              <span style={{ fontSize: 11.5, color: "#64748b" }}>Bloque: {c.bloque} ({c.hora_inicio} - {c.hora_fin})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic" }}>
                          No afecta clases específicas (Ausencia total u otro motivo de jornada general).
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Documento de Soporte</div>
                {selectedNovedad.archivo ? (
                  <a
                    href={getUploadUrl(selectedNovedad.archivo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#eff6ff", border: "1px solid #3b82f6", borderRadius: 8,
                      padding: "8px 14px", color: "#2563eb", fontSize: 13, fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    📄 Ver Documento de Soporte
                  </a>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic" }}>
                    No se cargó ningún documento de soporte.
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                {selectedNovedad.estado === "PENDIENTE" ? (
                  <>
                    <button
                      onClick={() => handleActualizarEstado(selectedNovedad.id_novedad, "APROBADO")}
                      style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Aprobar Solicitud
                    </button>
                    <button
                      onClick={() => handleActualizarEstado(selectedNovedad.id_novedad, "RECHAZADO")}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid #dc2626", borderRadius: 8, background: "#fff", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Rechazar Solicitud
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", background: selectedNovedad.estado === "APROBADO" ? "#dcfce7" : "#fee2e2", color: selectedNovedad.estado === "APROBADO" ? "#166534" : "#991b1b", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                    Esta solicitud ya ha sido {selectedNovedad.estado === "APROBADO" ? "APROBADA" : "RECHAZADA"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedPermiso && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={(e) => e.target === e.currentTarget && setSelectedPermiso(null)}
        >
          <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", border: "1px solid var(--card-border)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>Detalles del Permiso</h3>
              <button onClick={() => setSelectedPermiso(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
              <div style={{ background: "var(--card-subbg)", padding: "14px", borderRadius: 10, border: "1px solid var(--card-border)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Docente</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-title)" }}>
                  {selectedPermiso.usuario ? `${selectedPermiso.usuario.nombre} ${selectedPermiso.usuario.apellido}` : "Docente"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-main)", marginTop: 2 }}>
                  Documento: {selectedPermiso.usuario?.documento || "—"} | Correo: {selectedPermiso.usuario?.correo || "—"}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Tipo de permiso</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#112D55" }}>
                    {selectedPermiso.tipo_permiso?.nombre || "Permiso"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Fecha Solicitud</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#112D55" }}>
                    {new Date(selectedPermiso.fecha_solicitud).toLocaleDateString("es-CO")}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Fecha Inicio</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    {new Date(selectedPermiso.fecha_inicio).toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Fecha Fin</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    {new Date(selectedPermiso.fecha_fin).toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {selectedPermiso.cumple_regla === false && (
                <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "10px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>
                  ⚠️ Advertencia: Solicitud realizada con retraso. Se solicitó con {selectedPermiso.horas_anticipacion} horas de anticipación (requiere un mínimo de 48 horas).
                </div>
              )}

              {(() => {
                let desc = {};
                try {
                  desc = typeof selectedPermiso.descripcion === "string" ? JSON.parse(selectedPermiso.descripcion) : selectedPermiso.descripcion;
                } catch (e) {
                  desc = { descripcion_breve: selectedPermiso.descripcion, causa: "" };
                }
                return (
                  <>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Motivo de la ausencia</div>
                      <div style={{ fontSize: 13.5, color: "#0f172a", background: "#f1f5f9", padding: "8px 12px", borderRadius: 6 }}>
                        {desc.causa || "No especificado"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Descripción breve</div>
                      <p style={{ margin: 0, fontSize: 13.5, color: "#475569", lineHeight: 1.5, background: "#f1f5f9", padding: "10px 12px", borderRadius: 6 }}>
                        {desc.descripcion_breve || "Sin descripción."}
                      </p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Clases Afectadas (Si es un día)</div>
                      {desc.clases_afectadas && desc.clases_afectadas.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {desc.clases_afectadas.map((c, idx) => (
                            <div key={idx} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e40af" }}>{c.nombre === "HORA PEDAGOGICA" ? "Hora Pedagógica" : c.nombre}</span>
                              <span style={{ fontSize: 11.5, color: "#64748b" }}>Bloque: {c.bloque} ({c.hora_inicio} - {c.hora_fin})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic" }}>
                          No afecta clases específicas o afecta varios días completos.
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Documento de Soporte</div>
                {selectedPermiso.archivo ? (
                  <a
                    href={getUploadUrl(selectedPermiso.archivo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "#eff6ff", border: "1px solid #3b82f6", borderRadius: 8,
                      padding: "8px 14px", color: "#2563eb", fontSize: 13, fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    📄 Ver Documento de Soporte
                  </a>
                ) : (
                  <div style={{ fontSize: 12.5, color: "#64748b", fontStyle: "italic" }}>
                    No se cargó ningún documento de soporte.
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                {selectedPermiso.estado === "PENDIENTE" ? (
                  <>
                    <button
                      onClick={() => handleActualizarEstadoPermiso(selectedPermiso.id_permiso, "APROBADO")}
                      style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#16a34a", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Aprobar Permiso
                    </button>
                    <button
                      onClick={() => handleActualizarEstadoPermiso(selectedPermiso.id_permiso, "RECHAZADO")}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid #dc2626", borderRadius: 8, background: "#fff", color: "#dc2626", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                    >
                      Rechazar Permiso
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, textAlign: "center", padding: "6px", background: selectedPermiso.estado === "APROBADO" ? "#dcfce7" : "#fee2e2", color: selectedPermiso.estado === "APROBADO" ? "#166534" : "#991b1b", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>
                    Esta solicitud ya ha sido {selectedPermiso.estado === "APROBADO" ? "APROBADA" : "RECHAZADA"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalSuspensionDia({ onClose, onSave }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fecha) { alert("Por favor selecciona una fecha"); return; }
    try {
      setSaving(true);
      await axios.post("/suspension", {
        tipo: "PARO",
        fecha_inicio: fecha,
        fecha_fin: fecha,
        motivo: motivo || "Paro docente / Sin clases"
      });
      alert("Día de suspensión registrado correctamente.");
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Ocurrió un error al registrar la suspensión.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(480px, 96vw)", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", overflow: "hidden", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>🚫 Suspender Día (No hay clase)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Fecha de Suspensión</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Motivo / Descripción</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Paro de docentes, Día cívico, etc."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#ea580c", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {saving ? "Registrando..." : "Registrar Suspensión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalVacaciones({ onClose, onSave }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) { alert("Por favor selecciona ambas fechas"); return; }
    try {
      setSaving(true);
      await axios.post("/suspension", {
        tipo: "VACACIONES",
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        motivo: motivo || "Vacaciones / Receso Escolar"
      });
      alert("Periodo de vacaciones registrado correctamente.");
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Ocurrió un error al registrar las vacaciones.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(480px, 96vw)", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", overflow: "hidden", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>🏖️ Registrar Vacaciones</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, fontFamily: "Hanken Grotesk, sans-serif" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Motivo / Nombre del Receso</label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej. Vacaciones de mitad de año, Semana Santa, etc."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#f97316", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {saving ? "Registrando..." : "Registrar Vacaciones"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalSuspensionList({ onClose, suspensiones, onSave }) {
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este registro? Esto volverá a habilitar la asistencia para ese periodo.")) return;
    try {
      await axios.delete(`/suspension/${id}`);
      alert("Registro eliminado correctamente.");
      onSave();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al eliminar el registro.");
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(680px, 96vw)", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>📋 Listado de Suspensiones y Vacaciones</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        <div style={{ padding: 24, fontFamily: "Hanken Grotesk, sans-serif" }}>
          {suspensiones.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-muted)", fontStyle: "italic", margin: "20px 0" }}>No hay registros configurados en el sistema.</p>
          ) : (
            <div style={{ overflowX: "auto", border: "1px solid var(--card-border)", borderRadius: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--table-header-bg)" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-muted)" }}>Tipo</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-muted)" }}>Periodo</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-muted)" }}>Motivo</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", color: "var(--text-muted)" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {suspensiones.map((s) => {
                    const isSingle = new Date(s.fecha_inicio).toLocaleDateString() === new Date(s.fecha_fin).toLocaleDateString();
                    return (
                      <tr key={s.id_suspension} style={{ borderBottom: "1px solid var(--table-row-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text-main)" }}>
                          <span style={{
                            background: s.tipo === "PARO" ? "#ffedd5" : "#fce7f3",
                            color: s.tipo === "PARO" ? "#c2410c" : "#be185d",
                            padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 800
                          }}>
                            {s.tipo}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#334155" }}>
                          {isSingle 
                            ? new Date(s.fecha_inicio).toLocaleDateString("es-CO")
                            : `${new Date(s.fecha_inicio).toLocaleDateString("es-CO")} al ${new Date(s.fecha_fin).toLocaleDateString("es-CO")}`}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#475569" }}>{s.motivo || "—"}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDelete(s.id_suspension)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#dc2626" }}
                            title="Eliminar registro"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "10px", background: "#475569", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 16 }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalAgregarUsuario({ onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    documento: "",
    telefono: "",
    id_role: 4
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.correo || !form.password || !form.documento || !form.id_role) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }
    try {
      setSaving(true);
      await axios.post("/auth/register", form);
      alert("Usuario registrado correctamente.");
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Ocurrió un error al registrar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "id_role" ? parseInt(value, 10) : value
    }));
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(500px, 96vw)", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", overflow: "hidden", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>➕ Registrar Nuevo Usuario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, fontFamily: "Hanken Grotesk, sans-serif" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Correo Institucional *</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@institucion.edu"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Documento *</label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Identificación"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Rol Institucional *</label>
            <select
              name="id_role"
              value={form.id_role}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            >
              <option value={4}>Profesor</option>
              <option value={3}>Coordinador</option>
              <option value={2}>Rector</option>
              <option value={1}>Admin</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#1F294D", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {saving ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalEditarUsuario({ onClose, user, onSave }) {
  const [form, setForm] = useState({
    nombre: user.nombre || "",
    apellido: user.apellido || "",
    correo: user.correo || "",
    documento: user.documento || "",
    telefono: user.telefono || "",
    id_role: user.id_role || 4,
    estado: user.estado,
    password: ""
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.apellido || !form.correo || !form.documento || !form.id_role) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }
    try {
      setSaving(true);
      const updateData = { ...form };
      if (!updateData.password) {
        delete updateData.password;
      }
      await axios.put(`/usuarios/${user.id_usuario}`, updateData);
      alert("Usuario actualizado correctamente.");
      onSave();
      onClose();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Ocurrió un error al actualizar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : (name === "id_role" ? parseInt(value, 10) : value)
    }));
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(9,20,55,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--card-bg)", borderRadius: 16, width: "min(500px, 96vw)", boxShadow: "0 20px 60px rgba(9,20,55,0.18)", overflow: "hidden", border: "1px solid var(--card-border)" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "var(--text-title)", fontFamily: "Hanken Grotesk, sans-serif" }}>✏️ Editar Usuario</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8" }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, fontFamily: "Hanken Grotesk, sans-serif" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Apellido"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Correo Institucional *</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@institucion.edu"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Documento *</label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleChange}
                placeholder="Identificación"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Contraseña (dejar en blanco para conservar la actual)</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Rol Institucional *</label>
            <select
              name="id_role"
              value={form.id_role}
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)", boxSizing: "border-box" }}
              required
            >
              <option value={4}>Profesor</option>
              <option value={3}>Coordinador</option>
              <option value={2}>Rector</option>
              <option value={1}>Admin</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <input
              type="checkbox"
              id="estado"
              name="estado"
              checked={form.estado}
              onChange={handleChange}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="estado" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", cursor: "pointer", userSelect: "none" }}>Usuario Activo</label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: "10px", border: "1.5px solid var(--card-border)", borderRadius: 8, background: "var(--card-bg)", color: "var(--text-main)", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 1, padding: "10px", border: "none", borderRadius: 8, background: "#1F294D", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

