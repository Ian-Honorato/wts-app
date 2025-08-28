import { useState } from "react";
import "./App.css";

//importações referentes aos componentes
import Header from "./components/homePage/header/header.jsx";
import Hero from "./components/homePage/hero/hero.jsx";
import Produtos from "./components/homePage/produtos/produtos.jsx";
import Contatos from "./components/homePage/Contatos/contatos.jsx";
import Footer from "./components/homePage/footer/footer.jsx";

//modais
import LoginModal from "./components/homePage/LoginModal/loginModal.jsx";
import ServiceModal from "./components/homePage/ServiceModal/serviceModal.jsx";
function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleOpenServiceModal = (service) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
    //console.log("clicou no modal service");
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsServiceModalOpen(false);
  };

  return (
    <>
      <Header onLoginClick={handleOpenLoginModal} />
      <Hero />
      <Produtos onServiceClick={handleOpenServiceModal} />
      <Contatos />
      <Footer />

      <LoginModal isOpen={isLoginModalOpen} onClose={closeModals} />
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={closeModals}
        serviceData={selectedService}
      />
    </>
  );
}

export default App;
