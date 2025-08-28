import React from "react";
import styles from "./produtos.module.css";
//icones
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faListCheck,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";

// Dados dos serviços - Manter os dados separados facilita a manutenção
const servicesData = [
  {
    title: "Renovação de Certificados Digitais",
    description:
      "Garanta a continuidade e segurança das suas operações online com a renovação rápida e sem burocracia do seu e-CNPJ ou e-CPF.",
    icon: faCalendarCheck, // Usando emojis como ícones temporários
  },
  {
    title: "Abertura e Legalização de Empresas",
    description:
      "Inicie seu negócio com o pé direito. Cuidamos de todo o processo de abertura do seu CNPJ, da escolha do regime tributário à legalização.",
    icon: faListCheck,
  },
  {
    title: "Gestão Fiscal e Tributária",
    description:
      "Mantenha sua empresa em dia com todas as obrigações fiscais. Otimizamos sua carga tributária para você economizar de forma legal.",
    icon: faChartLine,
  },
];

// Subcomponente para o Card (definido no mesmo arquivo para simplicidade)
const ServiceCard = ({ service, onServiceClick }) => {
  const handleCardClick = (e) => {
    e.preventDefault();
    onServiceClick(service);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>
        <FontAwesomeIcon icon={service.icon} />
      </div>
      <h3 className={styles.cardTitle}>{service.title}</h3>
      <p className={styles.cardDescription}>{service.description}</p>

      <a href="#" className={styles.cardLink} onClick={handleCardClick}>
        Saiba Mais
      </a>
    </div>
  );
};

const Produtos = ({ onServiceClick }) => {
  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Nossos Serviços</h2>
      <div className={styles.servicesGrid}>
        {servicesData.map((service, index) => (
          <ServiceCard
            key={index}
            service={service}
            onServiceClick={onServiceClick}
          />
        ))}
      </div>
    </section>
  );
};

export default Produtos;
