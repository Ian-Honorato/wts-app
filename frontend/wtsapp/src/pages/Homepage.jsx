import React, { useState } from "react";

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
  // O estado dos modais vive e morre com a HomePage
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenLoginModal = () => setIsLoginModalOpen(true);
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
      <Header onLoginClick={handleOpenLoginModal} />
      <main>
        <Hero />
        <Produtos onServiceClick={handleOpenServiceModal} />
        <Contatos />
      </main>
      <Footer />

      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={closeModals}
        serviceData={selectedService}
      />
    </>
  );
};

export default HomePage;
