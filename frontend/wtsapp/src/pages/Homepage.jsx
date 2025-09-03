import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Componentes da HomePage
import Header from "../components/homePage/header/header";
import Hero from "../components/homePage/hero/hero";
import Produtos from "../components/homePage/produtos/produtos";
import Contatos from "../components/homePage/Contatos/contatos";
import Footer from "../components/homePage/footer/footer";

// Modais da HomePage
import LoginModal from "../components/homePage/LoginModal/loginModal.jsx";
import ServiceModal from "../components/homePage/ServiceModal/serviceModal.jsx";

const HomePage = () => {
  // O estado dos modais da HomePage continua aqui
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Consumindo o hook de autenticação e o de navegação
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 2. CRIAR A FUNÇÃO DE DECISÃO
  const handleUserIconClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };
  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsServiceModalOpen(false);
  };

  return (
    <>
      {/* 3. CONECTAR A NOVA FUNÇÃO AO HEADER */}
      <Header onUserIconClick={handleUserIconClick} />

      <main>
        <Hero />
        <Produtos onServiceClick={handleOpenServiceModal} />
        <Contatos />
      </main>
      <Footer />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={closeModals}
        serviceData={selectedService}
      />
    </>
  );
};

export default HomePage;
