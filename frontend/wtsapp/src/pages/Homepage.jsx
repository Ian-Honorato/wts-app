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

//Efeito scroll
import FadeInOnScroll from "../components/homePage/FadeInOnScroll/FadeInOnScroll.jsx";

const HomePage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      <Header
        onUserIconClick={handleUserIconClick}
        onLoginClick={handleUserIconClick}
      />

      <main>
        <FadeInOnScroll>
          <Hero />
        </FadeInOnScroll>
        <FadeInOnScroll>
          <Produtos onServiceClick={handleOpenServiceModal} />
        </FadeInOnScroll>
        <FadeInOnScroll>
          <Contatos />
        </FadeInOnScroll>
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
