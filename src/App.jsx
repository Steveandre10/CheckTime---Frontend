import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardProfesor from "./pages/DashboardProfesor";
import DashboardCoordinador from "./pages/DashboardCoordinador";
import DashboardRector from "./pages/DashboardRector";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard/profesor" element={<DashboardProfesor />} />
          <Route path="/dashboard/coordinador" element={<DashboardCoordinador />} />
          <Route path="/dashboard/rector" element={<DashboardRector />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;