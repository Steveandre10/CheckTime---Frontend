import { useState, useEffect } from "react";
import axios from "../services/api";

export default function ConfigurationPanel({ usuario, onUsuarioUpdated }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setApellido(usuario.apellido || "");
      setCorreo(usuario.correo || "");
      setDocumento(usuario.documento || "");
      setTelefono(usuario.telefono || "");
    }
  }, [usuario]);

  const triggerAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "success" });
    }, 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !apellido.trim() || !correo.trim() || !documento.trim()) {
      triggerAlert("Por favor completa todos los campos obligatorios.", "error");
      return;
    }

    if (password) {
      if (password.length < 6) {
        triggerAlert("La nueva contraseña debe tener al menos 6 caracteres.", "error");
        return;
      }
      if (password !== confirmPassword) {
        triggerAlert("Las contraseñas ingresadas no coinciden.", "error");
        return;
      }
    }

    setLoading(true);
    try {
      const idUsuario = usuario.id_usuario || usuario.id;
      const data = {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        documento: documento.trim(),
        telefono: telefono.trim(),
      };

      if (password) {
        data.password = password;
      }

      const res = await axios.put(`/usuarios/${idUsuario}`, data);
      
      if (res.data && res.data.usuario) {
        const updatedUser = res.data.usuario;
        
        // Mantener el token actual y actualizar la info del usuario en localStorage
        localStorage.setItem("usuario", JSON.stringify(updatedUser));
        
        if (onUsuarioUpdated) {
          onUsuarioUpdated(updatedUser);
        }
        
        triggerAlert("Información actualizada exitosamente.", "success");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      triggerAlert(err.response?.data?.message || "Ocurrió un error al actualizar el perfil.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Iniciales del usuario para avatar
  const iniciales = `${nombre.charAt(0) || ""}${apellido.charAt(0) || ""}`.toUpperCase();

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Toast Alert */}
      {alert.show && (
        <div style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          padding: "12px 20px",
          borderRadius: 8,
          color: "#fff",
          fontWeight: 600,
          fontSize: 14,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: alert.type === "success" ? "#10B981" : "#EF4444"
        }}>
          {alert.type === "success" ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* HEADER CARD */}
      <div style={{
        background: "linear-gradient(135deg, #112D55 0%, #1F294D 100%)",
        borderRadius: 16,
        padding: "24px 32px",
        color: "#fff",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 20,
        boxShadow: "0 10px 25px -5px rgba(17,45,85,0.15)"
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 700,
          color: "#fff",
          border: "2px solid rgba(255,255,255,0.25)"
        }}>
          {iniciales || "U"}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "Hanken Grotesk, sans-serif" }}>
            {nombre} {apellido}
          </h2>
          <span style={{
            display: "inline-block",
            marginTop: 6,
            background: "rgba(255,255,255,0.12)",
            padding: "4px 12px",
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}>
            {usuario?.role?.nombre_rol || "Docente"}
          </span>
        </div>
      </div>

      {/* FORM CARD */}
      <form onSubmit={handleSubmit} style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 16,
        padding: "32px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 28
      }}>
        {/* SECCION 1: DATOS PERSONALES */}
        <div>
          <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "var(--text-title)", borderBottom: "1px solid var(--card-border)", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Datos Personales
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Nombre *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Apellido *
              </label>
              <input
                type="text"
                required
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Documento de Identidad *
              </label>
              <input
                type="text"
                required
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Ej. Cédula"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>

            <div style={{ gridColumn: "span 1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Teléfono / Celular
              </label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>
          </div>
        </div>

        {/* SECCION 2: SEGURIDAD */}
        <div>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "var(--text-title)", borderBottom: "1px solid var(--card-border)", paddingBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            Seguridad y Acceso
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "var(--text-muted)" }}>
            Completa estos campos únicamente si deseas actualizar tu contraseña de acceso.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--card-border)", borderRadius: 8, fontSize: 14, color: "var(--text-main)", background: "var(--card-bg)" }}
              />
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid var(--card-border)", paddingTop: 20 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              background: "#1F294D",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "Hanken Grotesk, sans-serif",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s"
            }}
          >
            {loading ? (
              <span>Guardando...</span>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
