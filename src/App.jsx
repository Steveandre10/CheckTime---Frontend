/**
 * @file App.jsx
 * @description Componente raíz de la aplicación.
 * Define la estructura del proveedor de tema global (ThemeProvider), el enrutador del lado del cliente (BrowserRouter) y las diferentes rutas públicas y privadas para cada uno de los dashboards según el rol.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardProfesor from "./pages/DashboardProfesor";
import DashboardCoordinador from "./pages/DashboardCoordinador";
import DashboardRector from "./pages/DashboardRector";

/**
 * Componente principal App que define la estructura y navegación general.
 * @component
 */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards de Roles */}
          <Route path="/dashboard/profesor" element={<DashboardProfesor />} />
          <Route path="/dashboard/coordinador" element={<DashboardCoordinador />} />
          <Route path="/dashboard/rector" element={<DashboardRector />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;