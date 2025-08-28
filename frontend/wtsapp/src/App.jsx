import { Routes, Route } from "react-router-dom";
import "./App.css";

// Importe apenas as PÁGINAS completas
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Rota para o seu SPA de marketing/apresentação */}
      <Route path="/" element={<HomePage />} />

      {/* Rota para sua aplicação logada */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
